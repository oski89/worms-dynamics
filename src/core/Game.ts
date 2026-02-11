import { GAME_CONFIG, type Phase } from './Config';
import { RNG } from './RNG';
import { StateMachine } from './StateMachine';
import { TurnManager } from './TurnManager';
import { InputRouter } from './InputRouter';
import { GameLoop } from './GameLoop';
import { Camera } from './Camera';
import { Renderer } from '../render/Renderer';
import { generateTerrain } from '../terrain/TerrainGenerator';
import { TerrainRenderer } from '../terrain/TerrainRenderer';
import { resolveCircleTerrainCollision } from '../terrain/TerrainCollision';
import type { Worm } from '../entities/Worm';
import type { Team } from '../entities/Team';
import type { Projectile } from '../entities/Projectile';
import { tickParticles, type Particle } from '../entities/Particles';
import { tickStatuses } from '../entities/StatusEffects';
import { WeaponRegistry } from '../weapons/registry';
import { loadWeapons } from '../weapons/loader';
import type { WeaponConfig } from '../weapons/schema';
import { spawnProjectiles } from '../weapons/executorProjectile';
import { executeMelee } from '../weapons/executorMelee';
import { executeCone } from '../weapons/executorCone';
import { integrateBody } from '../physics/Integrator';
import { testProjectileCollision } from '../physics/CollisionWorld';
import { applyExplosion } from '../physics/Explosion';
import { HUD } from '../ui/HUD';
import { Announcer } from '../ui/Announcer';
import { COMEDY_LINES, BLEH_LINES } from '../weapons/comedy';
import { WeaponMenu } from '../ui/WeaponMenu';
import { PauseMenu } from '../ui/PauseMenu';
import { MobileControls } from '../ui/MobileControls';
import { ScreenShake } from '../ui/ScreenShake';
import { TextSfx } from '../audio/TextSfx';
import { decideTurnRecovery } from './TurnRecovery';
import { stepCharge } from './ChargeLogic';
import { countdownSecondsForPhase, shouldAdvanceActionPhase, shouldAdvanceMovePhase, tickPhaseTimer } from './PhaseLogic';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private loop = new GameLoop();
  private camera = new Camera();
  private renderer: Renderer;
  private terrain = generateTerrain(GAME_CONFIG.worldWidth, GAME_CONFIG.worldHeight);
  private terrainRenderer = new TerrainRenderer(this.terrain);
  private rng = new RNG(2026);
  private teams: Team[] = [];
  private worms: Worm[] = [];
  private projectiles: Projectile[] = [];
  private particles: Particle[] = [];
  private stains: Array<{ x: number; y: number; untilMs: number }> = [];
  private turnManager = new TurnManager();
  private state = new StateMachine();
  private input: InputRouter;
  private hud = new HUD();
  private weaponMenu = new WeaponMenu((id) => {
    this.selectedWeaponId = id;
    this.weaponMenu.setActive(id);
  });
  private pauseMenu = new PauseMenu((enabled) => {
    this.ridiculousnessOn = enabled;
  });
  private mobileControls = new MobileControls();
  private announcer = new Announcer();
  private shake = new ScreenShake();
  private textSfx = new TextSfx();
  private dpr = 1;
  private weapons = new WeaponRegistry();
  private selectedWeaponId = 'at4';
  private nowMs = 0;
  private turnCount = 0;
  private activeWorm: Worm | null = null;
  private paused = false;
  private winner: string | null = null;
  private charge01 = 0;
  private charging = false;
  private chargingFromMobile = false;
  private actionTriggerLatch = false;
  private phaseTimeLeftMs = 0;
  private resolveTimerMs = 0;
  private ridiculousnessOn = true;

  constructor(private root: HTMLElement) {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'game-canvas';
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('2D canvas not available');
    this.ctx = ctx;
    this.renderer = new Renderer(this.ctx);
    this.input = new InputRouter(this.canvas);

    this.root.append(this.canvas, this.hud.root, this.weaponMenu.root, this.pauseMenu.root);
    if (window.matchMedia('(pointer: coarse)').matches) this.root.append(this.mobileControls.root);

    window.addEventListener('resize', () => this.resize());
    window.addEventListener('keydown', (e) => this.onGlobalKeyDown(e));
    this.resize();
  }

  async init(): Promise<void> {
    const loadedWeapons = await loadWeapons();
    this.weapons.load(loadedWeapons);
    this.weaponMenu.setWeapons(this.weapons.all());
    if (this.weapons.all()[0]) this.selectedWeaponId = this.weapons.all()[0].id;
    this.weaponMenu.setActive(this.selectedWeaponId);

    this.startMatch();
    this.loop.start((dt) => this.tick(dt));
  }

  private startMatch(): void {
    this.terrain = generateTerrain(GAME_CONFIG.worldWidth, GAME_CONFIG.worldHeight);
    this.terrainRenderer = new TerrainRenderer(this.terrain);
    this.teams = [
      { id: 0, name: 'Team Cactus', color: GAME_CONFIG.teamColors[0] },
      { id: 1, name: 'Team Pigeon', color: GAME_CONFIG.teamColors[1] }
    ];

    this.worms = [];
    for (let team = 0; team < this.teams.length; team += 1) {
      for (let i = 0; i < GAME_CONFIG.wormsPerTeam; i += 1) {
        const x = (GAME_CONFIG.worldWidth / (GAME_CONFIG.wormsPerTeam + 1)) * (i + 1) + team * 300 + 80;
        const y = this.findSpawnY(x);
        this.worms.push({
          id: `w-${team}-${i}`,
          teamId: team,
          x,
          y,
          vx: 0,
          vy: 0,
          radius: GAME_CONFIG.wormRadius,
          hp: GAME_CONFIG.maxWormHp,
          alive: true,
          facing: team === 0 ? 1 : -1,
          aimAngleDeg: 35,
          grounded: false,
          moveBudgetMs: GAME_CONFIG.maxMoveSeconds * 1000,
          hasActed: false,
          stunUntilMs: 0,
          slipFactor: 1,
          statuses: [],
          squashX: 1,
          squashY: 1
        });
      }
    }

    this.turnManager.setWorms(this.worms);
    this.transitionPhase('move');
    this.turnCount = 1;
    this.projectiles = [];
    this.particles = [];
    this.stains = [];
    this.winner = null;
    this.resolveTimerMs = 0;
    this.activeWorm = this.turnManager.nextLiving() ?? null;
    if (this.activeWorm) {
      this.activeWorm.moveBudgetMs = GAME_CONFIG.maxMoveSeconds * 1000;
      this.activeWorm.hasActed = false;
    }
  }

  private findSpawnY(x: number): number {
    for (let y = 0; y < GAME_CONFIG.worldHeight - 1; y += 1) {
      if (this.terrain.isSolid(x, y + GAME_CONFIG.wormRadius + 1)) {
        return y;
      }
    }
    return 200;
  }

  private onGlobalKeyDown(e: KeyboardEvent): void {
    if (e.key.toLowerCase() === 'r') this.startMatch();
    if (e.key === 'Escape') {
      this.paused = !this.paused;
      this.pauseMenu.setPaused(this.paused);
    }
    if (['1', '2', '3', '4'].includes(e.key)) {
      const idx = Number(e.key) - 1;
      const weapon = this.weapons.all()[idx];
      if (weapon) {
        this.selectedWeaponId = weapon.id;
        this.weaponMenu.setActive(weapon.id);
      }
    }
  }

  private tick(dt: number): void {
    if (this.paused) return;
    this.nowMs += dt * 1000;
    const mobile = this.mobileControls.consumeState();

    this.stains = this.stains.filter((s) => s.untilMs > this.nowMs);

    this.worms.forEach((worm) => {
      if (!worm.alive) return;
      tickStatuses(
        worm,
        this.nowMs,
        (amount) => {
          worm.hp -= amount;
          worm.squashX = 1.2;
          worm.squashY = 0.8;
        },
        () => {
          if (this.rng.chance(0.45)) {
            worm.bubbleText = BLEH_LINES[this.rng.nextInt(BLEH_LINES.length)];
            worm.bubbleUntilMs = this.nowMs + 850;
          }
        }
      );
      if (worm.hp <= 0) worm.alive = false;
      worm.squashX += (1 - worm.squashX) * 0.15;
      worm.squashY += (1 - worm.squashY) * 0.15;
    });

    this.handleTurnFlow(dt, mobile);
    this.updateProjectiles(dt);
    this.updateWormPhysics(dt);
    this.checkWin();
    this.recoverTurnIfNeeded();

    if (this.activeWorm && this.activeWorm.alive) {
      this.camera.follow(
        this.activeWorm.x,
        this.activeWorm.y,
        GAME_CONFIG.worldWidth,
        GAME_CONFIG.worldHeight,
        this.canvas.width / this.dpr,
        this.canvas.height / this.dpr,
        GAME_CONFIG.cameraLerp
      );
    }

    tickParticles(this.particles, dt);
    const shake = this.shake.tick(dt * 1000, () => this.rng.nextFloat());

    this.renderer.render({
      camera: this.camera,
      viewWidth: this.canvas.width / this.dpr,
      viewHeight: this.canvas.height / this.dpr,
      terrainRenderer: this.terrainRenderer,
      worms: this.worms,
      teams: this.teams,
      projectiles: this.projectiles,
      particles: this.particles,
      stains: this.stains,
      nowMs: this.nowMs,
      shake,
      winner: this.winner ?? undefined,
      activeWormId: this.activeWorm?.id,
      projectileLabel: this.textSfx.currentText(this.nowMs)
    });

    const phase = this.state.getPhase();
    this.hud.update(
      this.turnCount,
      phase,
      this.activeWorm,
      this.charge01,
      this.phaseTimeLeftMs / 1000,
      countdownSecondsForPhase(phase, this.phaseTimeLeftMs),
      this.announcer.getMessage(this.nowMs)
    );
  }

  private handleTurnFlow(dt: number, mobile: ReturnType<MobileControls['consumeState']>): void {
    if (!this.activeWorm || !this.activeWorm.alive || this.winner) return;
    const worm = this.activeWorm;
    const phase = this.state.getPhase();
    const dtMs = dt * 1000;
    const spacePressed = this.input.consumePressed(' ');
    const spaceReleased = this.input.consumeReleased(' ');

    if (phase === 'move') {
      this.phaseTimeLeftMs = tickPhaseTimer(this.phaseTimeLeftMs, dtMs);
      this.applyMovementInput(worm, dt, mobile);

      if (shouldAdvanceMovePhase(this.phaseTimeLeftMs, spacePressed || mobile.endTurnPressed)) {
        this.transitionPhase('action');
      }
      return;
    }

    if (phase === 'action') {
      this.phaseTimeLeftMs = tickPhaseTimer(this.phaseTimeLeftMs, dtMs);
      this.applyAimInput(worm, dt, mobile);
      const weapon = this.weapons.get(this.selectedWeaponId);

      if (worm.stunUntilMs > this.nowMs) {
        worm.hasActed = true;
      } else {
        this.handleActionInput(worm, weapon, mobile, dt, spacePressed, spaceReleased);

        const skipAction =
          !this.charging &&
          (mobile.endTurnPressed || (spacePressed && weapon.type !== 'projectile'));
        if (skipAction) {
          this.announcer.say('Action skipped.', this.nowMs, 900);
          worm.hasActed = true;
        }

        if (shouldAdvanceActionPhase(this.phaseTimeLeftMs, false, this.charging)) {
          if (weapon.type === 'projectile' && this.charging) {
            this.fireProjectileWeapon(worm, weapon, Math.max(GAME_CONFIG.minPower, this.charge01));
          }
          this.charging = false;
          this.chargingFromMobile = false;
          this.charge01 = 0;
          worm.hasActed = true;
        }
      }

      if (worm.hasActed) {
        this.transitionPhase('resolve');
      }
      return;
    }

    if (phase === 'resolve') {
      this.resolveTimerMs += dtMs;
      const noProjectiles = this.projectiles.every((p) => !p.active);
      const settled = this.worms
        .filter((w) => w.alive)
        .every((w) => w.grounded && Math.abs(w.vx) < 18 && Math.abs(w.vy) < 18);
      if (
        (noProjectiles && settled && this.resolveTimerMs > GAME_CONFIG.resolveMinMs) ||
        this.resolveTimerMs > GAME_CONFIG.resolveMaxMs
      ) {
        this.nextTurn();
      }
    }
  }

  private applyMovementInput(worm: Worm, dt: number, mobile: ReturnType<MobileControls['consumeState']>): void {
    if (worm.stunUntilMs > this.nowMs) return;
    let axis = 0;
    if (this.input.isDown('a') || this.input.isDown('arrowleft')) axis -= 1;
    if (this.input.isDown('d') || this.input.isDown('arrowright')) axis += 1;
    axis += mobile.moveX;
    axis = Math.max(-1, Math.min(1, axis));
    if (axis !== 0) worm.facing = axis > 0 ? 1 : -1;
    const targetVx = axis * GAME_CONFIG.moveSpeed * worm.slipFactor;
    worm.vx += (targetVx - worm.vx) * Math.min(1, dt * 14);

    if ((this.input.isDown('w') || this.input.isDown('arrowup')) && worm.grounded) {
      worm.vy = -GAME_CONFIG.jumpImpulse;
      worm.grounded = false;
    }
  }

  private applyAimInput(worm: Worm, dt: number, mobile: ReturnType<MobileControls['consumeState']>): void {
    let aimInput = 0;
    if (this.input.isDown('w') || this.input.isDown('arrowup')) aimInput += 1;
    if (this.input.isDown('s') || this.input.isDown('arrowdown')) aimInput -= 1;
    worm.aimAngleDeg += aimInput * dt * 120;
    worm.aimAngleDeg += mobile.aimDeltaY * 0.14;
    worm.aimAngleDeg = Math.max(5, Math.min(85, worm.aimAngleDeg));
  }

  private handleActionInput(
    worm: Worm,
    weapon: WeaponConfig,
    mobile: ReturnType<MobileControls['consumeState']>,
    dt: number,
    spacePressed: boolean,
    spaceReleased: boolean
  ): void {
    const pointerHeld = this.input.isPointerHeld();

    if (weapon.type === 'projectile') {
      const startPressed = spacePressed || mobile.firePressed;
      if (startPressed && !this.charging) {
        this.chargingFromMobile = mobile.firePressed && !spacePressed;
      }

      const chargeStep = stepCharge(
        { charging: this.charging, power: this.charge01 },
        {
          startPressed,
          held: this.input.isChargeHeld() || mobile.fireHeld,
          released: spaceReleased || mobile.fireReleased,
          dtMs: dt * 1000
        },
        {
          chargeRate: GAME_CONFIG.chargeRate,
          minPower: GAME_CONFIG.minPower,
          maxPower: GAME_CONFIG.maxPower
        }
      );

      this.charging = chargeStep.state.charging;
      this.charge01 = chargeStep.state.power;

      if (chargeStep.firePower !== null) {
        const blockedTap =
          this.chargingFromMobile &&
          mobile.fireReleased &&
          mobile.fireHoldMs < GAME_CONFIG.mobileProjectileHoldGuardMs;

        if (!blockedTap) {
          this.fireProjectileWeapon(worm, weapon, chargeStep.firePower);
          worm.hasActed = true;
        } else {
          this.announcer.say('Tap was too short. Hold Fire a bit longer.', this.nowMs, 1000);
        }

        this.charging = false;
        this.chargingFromMobile = false;
        this.charge01 = 0;
      }
      return;
    }

    const triggerHeld = pointerHeld || mobile.fireHeld;
    const triggerPressed = mobile.firePressed || (triggerHeld && !this.actionTriggerLatch);

    if (triggerPressed) {
      if (weapon.type === 'melee') {
        const result = executeMelee(
          weapon,
          worm,
          this.worms,
          this.nowMs,
          this.ridiculousnessOn ? GAME_CONFIG.ridiculousKnockbackScaleOn : GAME_CONFIG.ridiculousKnockbackScaleOff
        );
        if (!result.hit) {
          this.announcer.say('Whiff! Self-dizzy achieved.', this.nowMs);
        } else if (result.didYeet) {
          this.textSfx.trigger('YEET', this.nowMs, 1000);
          this.announcer.say('YEET-certified slap.', this.nowMs);
        }
        this.shake.kick(4 * this.shakeScale(), 220);
        this.spawnBurst(worm.x, worm.y - 10, 'star', 12);
      } else {
        const result = executeCone(
          weapon,
          worm,
          this.worms,
          this.nowMs,
          this.ridiculousnessOn ? GAME_CONFIG.ridiculousKnockbackScaleOn : GAME_CONFIG.ridiculousKnockbackScaleOff,
          this.rng
        );
        this.stains.push(...result.missedStains);
        this.announcer.say(result.hitCount > 0 ? 'Magic Puke delivers consequences.' : 'Puke splatter everywhere.', this.nowMs);
        this.spawnBurst(worm.x + worm.facing * 24, worm.y - 10, 'droplet', 16);
      }
      worm.hasActed = true;
    }

    this.actionTriggerLatch = triggerHeld;
  }

  private fireProjectileWeapon(worm: Worm, weapon: WeaponConfig, power01Override?: number): void {
    const power01 = Math.max(GAME_CONFIG.minPower, Math.min(GAME_CONFIG.maxPower, power01Override ?? this.charge01));
    const spawns = spawnProjectiles(
      weapon,
      worm,
      power01,
      this.nowMs,
      this.rng,
      this.ridiculousnessOn
    );
    this.projectiles.push(...spawns);
    if (this.ridiculousnessOn && this.rng.chance(GAME_CONFIG.announcerChance)) {
      this.announcer.say(COMEDY_LINES[this.rng.nextInt(COMEDY_LINES.length)], this.nowMs);
    }
    if (weapon.id === 'slingshot' && spawns.some((s) => s.transformedChicken)) {
      this.textSfx.trigger('rubber chicken acquired', this.nowMs, 1400);
      this.announcer.say('The projectile has become a chicken. Nobody knows why.', this.nowMs, 2600);
    }
  }

  private updateProjectiles(dt: number): void {
    for (const p of this.projectiles) {
      if (!p.active) continue;

      const weapon = this.weapons.get(p.weaponId);
      integrateBody(p, dt, GAME_CONFIG.gravity * p.gravityScale);

      if (
        p.kind === 'at4' &&
        this.ridiculousnessOn &&
        this.nowMs - p.bornAtMs > (weapon.comedy?.wobbleAfterMs ?? 1500)
      ) {
        p.vx += (this.rng.nextFloat() * 2 - 1) * 12;
        p.vy += (this.rng.nextFloat() * 2 - 1) * 8;
      }

      this.worms.forEach((worm) => {
        if (!worm.alive || worm.id === p.ownerWormId) return;
        const d = Math.hypot(worm.x - p.x, worm.y - p.y);
        if (d <= worm.radius + p.radius) {
          if (p.weaponId === 'slingshot') {
            worm.vx += p.vx * 0.4;
            worm.vy += p.vy * 0.2 - 120;
            worm.squashX = 1.25;
            worm.squashY = 0.75;
          }
          this.detonateProjectile(p, p.x, p.y, true);
        }
      });

      const collision = testProjectileCollision(p, this.terrain);
      if (collision.hit) {
        const speed = Math.hypot(p.vx, p.vy);
        if (
          p.weaponId === 'slingshot' &&
          p.canBounceOnce &&
          !p.bounced &&
          speed < 220 &&
          weapon.comedy?.bounceAtLowSpeed
        ) {
          p.bounced = true;
          p.vy = -Math.abs(p.vy) * (weapon.bounciness || 0.5);
          p.vx *= 0.85;
          p.y -= 3;
        } else {
          this.detonateProjectile(p, collision.x, collision.y, false);
        }
      }

      if (p.fuseTimeMs > 0 && this.nowMs - p.bornAtMs > p.fuseTimeMs) {
        this.detonateProjectile(p, p.x, p.y, false);
      }

      if (p.x < -30 || p.x > GAME_CONFIG.worldWidth + 30 || p.y > GAME_CONFIG.worldHeight + 30) {
        p.active = false;
      }

      if (p.kind === 'at4') {
        this.spawnBurst(p.x, p.y, 'smoke', 1);
      }
    }

    this.projectiles = this.projectiles.filter((p) => p.active);
  }

  private detonateProjectile(projectile: Projectile, x: number, y: number, directHit: boolean): void {
    projectile.active = false;
    const weapon = this.weapons.get(projectile.weaponId);
    const knockbackScale = this.ridiculousnessOn
      ? GAME_CONFIG.ridiculousKnockbackScaleOn
      : GAME_CONFIG.ridiculousKnockbackScaleOff;
    const boost = directHit && projectile.weaponId === 'slingshot' ? 1.3 : 1;

    applyExplosion(
      this.terrain,
      this.worms,
      x,
      y,
      weapon.explosionRadius,
      weapon.baseDamage,
      weapon.terrainCarveRadius,
      weapon.knockback * boost,
      knockbackScale
    );
    this.terrainRenderer.markDirty();

    if (projectile.weaponId === 'slingshot' && projectile.transformedChicken) {
      this.textSfx.trigger('HONK', this.nowMs, 1000);
    }

    this.shake.kick((weapon.id === 'at4' ? 11 : 6) * this.shakeScale(), 260);
    this.spawnBurst(x, y, weapon.id === 'at4' ? 'confetti' : 'star', weapon.id === 'at4' ? 28 : 14);
  }

  private updateWormPhysics(dt: number): void {
    for (const worm of this.worms) {
      if (!worm.alive) continue;
      const wasGrounded = worm.grounded;
      integrateBody(worm, dt, GAME_CONFIG.gravity);
      worm.vx = Math.max(-GAME_CONFIG.wormMaxVx, Math.min(GAME_CONFIG.wormMaxVx, worm.vx));
      worm.vy = Math.max(-GAME_CONFIG.wormMaxVy, Math.min(GAME_CONFIG.wormMaxVy, worm.vy));

      const impactVy = worm.vy;
      const collision = resolveCircleTerrainCollision(this.terrain, worm.x, worm.y, worm.radius);
      if (collision.collided) {
        worm.y = collision.correctedY;
      }

      worm.grounded = collision.grounded;
      if (worm.grounded && worm.vy > 0) {
        worm.vy = 0;
      }

      if (worm.grounded) worm.vx *= 0.86;
      else worm.vx *= 0.995;

      if (!wasGrounded && worm.grounded) {
        if (impactVy > 120) {
          worm.squashX = 1.28;
          worm.squashY = 0.72;
          this.spawnBurst(worm.x, worm.y + worm.radius, 'star', 5);
        }
        worm.squashX = Math.max(worm.squashX, 1.15);
        worm.squashY = Math.min(worm.squashY, 0.85);
      }

      if (
        worm.x < -GAME_CONFIG.outOfBoundsMargin ||
        worm.x > GAME_CONFIG.worldWidth + GAME_CONFIG.outOfBoundsMargin ||
        worm.y > GAME_CONFIG.worldHeight + GAME_CONFIG.outOfBoundsMargin
      ) {
        worm.alive = false;
      }
    }
  }

  private spawnBurst(x: number, y: number, kind: Particle['kind'], count: number): void {
    const paletteByKind: Record<Particle['kind'], string[]> = {
      star: ['#ffe36f', '#ffb65e'],
      confetti: ['#6effb3', '#ff7bd6', '#67d9ff'],
      droplet: ['#7fe066', '#7bd06c'],
      smoke: ['#d6d6d6', '#b8b8b8']
    };
    for (let i = 0; i < count; i += 1) {
      const speed = 20 + this.rng.nextFloat() * 180;
      const angle = this.rng.nextFloat() * Math.PI * 2;
      const colors = paletteByKind[kind];
      this.particles.push({
        kind,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 40,
        lifeMs: 450 + this.rng.nextFloat() * 450,
        ageMs: 0,
        color: colors[this.rng.nextInt(colors.length)],
        size: kind === 'smoke' ? 5 + this.rng.nextFloat() * 6 : 2 + this.rng.nextFloat() * 4
      });
    }
  }

  private transitionPhase(phase: Phase): void {
    this.state.setPhase(phase);
    if (phase === 'move') {
      this.phaseTimeLeftMs = GAME_CONFIG.maxMoveSeconds * 1000;
      return;
    }
    if (phase === 'action') {
      this.phaseTimeLeftMs = GAME_CONFIG.maxActionSeconds * 1000;
      return;
    }
    if (phase === 'resolve') {
      this.resolveTimerMs = 0;
    }
  }

  private nextTurn(): void {
    this.resolveTimerMs = 0;
    this.transitionPhase('move');
    this.turnCount += 1;
    this.activeWorm = this.turnManager.nextLiving() ?? null;
    if (!this.activeWorm) return;
    this.activeWorm.moveBudgetMs = GAME_CONFIG.maxMoveSeconds * 1000;
    this.activeWorm.hasActed = false;
    this.charge01 = 0;
    this.charging = false;
    this.chargingFromMobile = false;
    this.actionTriggerLatch = false;
    this.announcer.say(`${this.teamName(this.activeWorm.teamId)}'s turn.`, this.nowMs, 1300);
  }


  private recoverTurnIfNeeded(): void {
    const decision = decideTurnRecovery({
      hasWinner: this.winner !== null,
      hasActiveWorm: this.activeWorm !== null,
      activeWormAlive: this.activeWorm?.alive ?? false,
      hasActiveProjectiles: this.projectiles.some((p) => p.active)
    });

    if (decision === 'resolve') {
      this.transitionPhase('resolve');
      return;
    }

    if (decision === 'nextTurn') {
      this.nextTurn();
    }
  }
  private checkWin(): void {
    if (this.winner) return;
    const aliveTeams = new Set(this.worms.filter((w) => w.alive).map((w) => w.teamId));
    if (aliveTeams.size <= 1) {
      const id = [...aliveTeams][0];
      this.winner = id === undefined ? 'Nobody' : this.teamName(id);
    }
  }

  private teamName(teamId: number): string {
    return this.teams.find((t) => t.id === teamId)?.name ?? `Team ${teamId}`;
  }

  private shakeScale(): number {
    return this.ridiculousnessOn ? GAME_CONFIG.shakeScaleOn : GAME_CONFIG.shakeScaleOff;
  }

  private resize(): void {
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    this.dpr = dpr;
    const width = this.root.clientWidth;
    const height = this.root.clientHeight;
    this.canvas.width = Math.floor(width * dpr);
    this.canvas.height = Math.floor(height * dpr);
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
}
