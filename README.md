# Worms Dynamics

> Why HTML5 Canvas (not Phaser): Canvas keeps the prototype lightweight and gives direct pixel-level control for destructible terrain masks, while remaining easy to tune for desktop and mobile touch.

A silly, turn-based 2D artillery prototype inspired by Worms, with exaggerated physics and comedy weapon quirks.

## Setup

```bash
npm install
npm run dev
npm run build
npm run test
```

## Controls

Desktop:
- `A/D` or `Left/Right`: move
- `W/S` or `Up/Down`: aim angle
- Hold `Space` or mouse press: charge projectile power
- Release `Space`/mouse: fire projectile
- `1-4`: select weapon
- `R`: restart match
- `Esc`: pause/menu

Mobile:
- Left pad: movement joystick
- Right pad: drag aim
- `Fire` button: hold/release charge for projectile, tap for melee/cone
- Weapon buttons: bottom list
- `End Turn`: manual phase skip from move phase

## Weapon JSON format

File: `/Users/oski/Documents/codex/test-project/worms-dynamics/src/weapons/data/weapons.json`

Each entry supports:
- `id`, `displayName`, `type`
- `range`, `arcDeg`, `projectileCount`, `spreadDeg`, `muzzleVelocity`, `gravityScale`, `fuseTimeMs`, `bounciness`, `explosionRadius`, `baseDamage`, `terrainCarveRadius`, `knockback`
- `statusEffect?: { kind: "poison" | "stun", durationMs: number, dps?: number }`
- `sfx?`, `vfx?`
- `comedy?: { rareChance?, selfStunMs?, extraKnockbackOnKill?, wobbleAfterMs?, bounceAtLowSpeed? }`

Validation behavior:
- Missing optional fields are defaulted.
- Unknown fields log `console.warn`.
- Invalid critical fields skip weapon entry with warning.

## Built-in weapons

- `AT4`: bazooka-style rocket with big carve/shake and panic wobble after long flight.
- `Slingshot`: arcing shot, low-speed bounce once, rare rubber chicken transform.
- `Bitch Slap`: short-range melee, huge knockback, miss causes self-stun.
- `Magic Puke`: front cone multi-hit with poison and slip effect.

## Adding a new weapon

1. Add a new object in `src/weapons/data/weapons.json`.
2. Keep `id` unique and `type` in `melee|cone|projectile`.
3. Start from defaults by defining only fields you need.
4. Reload dev server; loader validates and warns on schema issues.
5. If special behavior is needed, extend type executor in:
   - `/Users/oski/Documents/codex/test-project/worms-dynamics/src/weapons/executorProjectile.ts`
   - `/Users/oski/Documents/codex/test-project/worms-dynamics/src/weapons/executorMelee.ts`
   - `/Users/oski/Documents/codex/test-project/worms-dynamics/src/weapons/executorCone.ts`

## Known limitations

- No network multiplayer.
- No wind simulation yet.
- Primitive placeholder graphics/sfx text (no external audio assets).
- Physics is intentionally arcadey and not physically realistic.

## Next steps

- Add wind and trajectory preview.
- Add AI-controlled worms.
- Add richer terrain generation themes.
- Add replay recording via deterministic seed.
