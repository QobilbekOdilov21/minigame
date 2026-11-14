# Original asset production

User source files are preserved verbatim in `art/source/`; filename and SHA-256 provenance are in `public/assets/manifest.json`. The import pipeline slices, scales, keys only border-connected matte pixels and packs frames. It does not substitute unrelated stock art.

Two generated bitmap atlases were produced with the built-in image generation tool from the user's operative and monster references. Files: `art/generated/player-walk.png`, `art/generated/monster-walk.png`. Runtime WebP derivatives preserve alpha.

Player prompt: same dark navy armor, helmet, cyan shoulder light, rifle and grounded anatomy as source; exactly 8 columns × 8 rows; each row an 8-frame articulated seamless walk cycle; rows E, SE, S, SW, W, NW, N, NE; orthographic high-angle 3/4 camera; constant foot anchor; transparent, isolated, no labels or ground shadow. Output inspected as an 8×8 atlas.

Monster prompt: same original six designs; exactly 8 columns × 6 rows; each row an articulated seamless walk cycle; rows walker, rock brute, shadow stalker, toxic, cyber runner, armored boss; facing SE; constant foot anchor; transparent, no labels/shadows, non-gory. Output inspected as an 8×6 atlas. SW uses horizontal mirroring. Other directional and attack atlases are intentionally not claimed complete.

Animation metadata declares source frame sequences and procedural state effects separately. Stationary architecture uses light/indicator/steam animations where appropriate. No skin painting, normal maps or biome-specific sound pack is claimed in this iteration.
