# Worms Dynamics

> Why HTML5 Canvas (not Phaser): Canvas keeps this prototype lightweight and gives direct pixel-level control for destructible terrain masks, while staying easy to tune across desktop and mobile.

A small, playable, turn-based 2D artillery game with a cartoon/comedy vibe, dramatic knockback, and intentionally unreasonable weapon behavior.

## Features

- Turn-based flow: `Move -> Action -> Resolve`
- 2 teams, configurable worms per team
- Destructible bitmap terrain (explosions carve holes)
- Data-driven weapon loading from JSON
- Custom weapons:
  - AT4
  - Slingshot
  - Bitch Slap
  - Magic Puke
- Comedy systems:
  - Dramatic knockback
  - Comedic shockwave boing
  - Announcer one-liners
  - Squash/stretch + particles + screen shake
- Desktop + mobile touch controls
- Deterministic RNG wrapper for reproducible behavior
- Vitest coverage for loader/terrain/collision basics

## Quick Start

```bash
npm install
npm run dev
```

Open the local URL shown by Vite (usually `http://localhost:5173`).

Other commands:

```bash
npm run build
npm run test
```

## Controls

### Desktop

- `A/D` or `Left/Right`: move
- `W/S` or `Up/Down`: adjust aim angle
- Hold `Space` (or mouse/touch hold on canvas): charge projectile power
- Release `Space`/pointer: fire projectile
- `1-4`: select weapon
- `R`: restart match
- `Esc`: pause/menu

### Mobile

- Left pad: move
- Right pad: drag aim
- `Fire`: hold/release to charge projectile shots, tap for melee/cone weapons
- Weapon buttons: bottom weapon list
- `End Turn`: skip remaining move phase time

## Weapon Data Format

Weapon data lives in `src/weapons/data/weapons.json`.

Base schema fields:

- `id: string`
- `displayName: string`
- `type: "melee" | "cone" | "projectile"`
- `range: number`
- `arcDeg: number`
- `projectileCount: number`
- `spreadDeg: number`
- `muzzleVelocity: number`
- `gravityScale: number`
- `fuseTimeMs: number`
- `bounciness: number`
- `explosionRadius: number`
- `baseDamage: number`
- `terrainCarveRadius: number`
- `knockback: number`
- `statusEffect?: { kind: "poison" | "stun", durationMs: number, dps?: number }`
- `sfx?: string`
- `vfx?: string`

Comedy extension:

- `comedy?: { rareChance?: number, selfStunMs?: number, extraKnockbackOnKill?: number, wobbleAfterMs?: number, bounceAtLowSpeed?: boolean }`

Validation behavior:

- Missing optional fields receive defaults.
- Unknown fields emit `console.warn`.
- Invalid critical entries are skipped with warning.

## Built-in Weapons

- `AT4`: bazooka-style rocket with strong carve and shake; can panic-wobble after long flight.
- `Slingshot`: higher arc, low-speed single bounce, rare rubber-chicken transformation.
- `Bitch Slap`: short range, high knockback, self-stun if it whiffs.
- `Magic Puke`: close cone that applies poison + temporary slip.

## Adding a Weapon

1. Add a new object in `src/weapons/data/weapons.json`.
2. Keep `id` unique and `type` in `melee | cone | projectile`.
3. Define only what you need and rely on defaults where appropriate.
4. Run the game/tests and check console warnings for schema issues.
5. If behavior is type-specific, update:
   - `src/weapons/executorProjectile.ts`
   - `src/weapons/executorMelee.ts`
   - `src/weapons/executorCone.ts`

## Project Structure

```text
src/
  core/
  physics/
  terrain/
  entities/
  weapons/
  ui/
  render/
  audio/
  tests/
```

## Current Limitations

- No multiplayer/networking
- No AI turns yet
- No wind system yet
- Placeholder art/audio (shape/text-based feedback)

## Next Improvements

- Wind + trajectory preview
- AI-controlled worms
- More terrain generation variants
- Replay capture from deterministic seeds
