# Quick Reference Card

## 🎮 Controls

| Key | Action |
|-----|--------|
| **W/↑** | Move forward |
| **S/↓** | Move backward |
| **A** | Strafe left |
| **D** | Strafe right |
| **Shift** | Run (hold) |
| **Mouse** | Look around (requires pointer lock) |
| **E** | Steady breathing (-25% fear, 3.5s cooldown) |
| **Click** | Engage pointer lock / start game |
| **Esc** | Release pointer lock |

## 📊 Game Systems at a Glance

### Fear Meter
```
Safe       Caution    Warning    Danger     Critical
0% ─────── 25% ─────── 50% ─────── 75% ─────── 100%
     [====================================]
     
- Increases: 0.09%/sec in darkness, when ghost chases
- Decreases: 0.24%/sec near lights, E key (-25%)
- Danger: > 88% warns you, 100% = game over
- Ghost speeds up with your fear: 2.2 + fear*0.8
```

### Ghost States
```
PATROL                          CHASE
├─ Follows waypoints            ├─ Targets player
├─ Speed: 1.2                   ├─ Speed: 2.2 + fear*0.8
├─ Triggered by: Line of sight  ├─ Duration: 5 seconds
│  + range (8.5 units)          ├─ Exits by: pursueTimer
└─ Audio: None                  └─ Audio: Whisper + heartbeat
```

### Fear Events
| Event | Fear Change | Duration |
|-------|-------------|----------|
| Collect clue | None (narrative) | - |
| Near light | -0.24%/sec | Continuous |
| In darkness | +0.09%/sec | Continuous |
| Ghost approaching | +0.022/sec | Per unit distance |
| Ghost chasing | Affects speed | See above |
| E key (breathe) | -25% | Instant |
| Fear 100% | FAIL | Immediate |

## 🗺️ Map Layout (Simplified)

```
# = wall, . = floor, L = light, E = exit, P = player start, G = ghost

###################
#....#.....L.....#
#.##.#.######.#..#
#.#..#....#..#..L#
#.#..####.#.#.####
#.#......#.#.#...#
#.#.####.#.#.#.#.#   Clue 2 (center-east)
#...#..L.#.#...#.#
###.#.##.#.#.#.#.#
#...#....#.#.#.#.#   Clue 4 (southeast)
#.#######.#.#.#E##   Exit (locked until all clues)
#....L....#.#.#..#   Clue 3 (center-south)
####.#####.#.#.#.#
#..L.....#.#.#.#.#   Clue 1 (northwest)
#.######.#.#.#.#.#
#.#....#.#.#...#.#   
#....L#...#....L.#   Player start (P)
###################
```

## 🎯 Clue Collection Order (Recommended)

```
1. Room 305 Ledger (3.5, 1.5)
   └─ Well-lit, easy to reach
   └─ "Every detective assigned to room 305 vanished before signing out."

2. Maintenance Recorder (12.5, 7.5)
   └─ Central location, medium difficulty
   └─ "The recorder loops: Amber elevator keeps opening..."

3. Bloodied Keycard (4.5, 11.5)
   └─ Near ghost patrol route, risky
   └─ "The keycard teeth are bent outward, like it was wrenched..."

4. Polaroid In Static (14.5, 15.5)
   └─ Near starting position, safest to grab last
   └─ "The photo shows the apparition guiding someone toward..."

THEN: Reach exit (marked E at 10.5, 10.5)
```

## 🔊 Audio Cues

| Sound | Frequency | Meaning |
|-------|-----------|---------|
| 55 Hz Drone | Continuous | Ambient atmosphere |
| 120 Hz Tone | Continuous | Mid-frequency ambient |
| Footstep | 150-250 Hz | You moving |
| Heartbeat | 80-100 bpm+ | Danger near |
| Whisper | 180-250 Hz | Ghost detected |
| Clue Chime | 262-659 Hz | Evidence found |
| Elevator Ding | 523 Hz | Exit unlocked |
| Victory | Scale up | Case closed! |
| Failure | Scale down | Investigation failed |

## 💾 Game State

### Win Condition
```
- All 4 clues collected ✓
- Player at exit location ✓
- Distance < 1.1 units ✓
→ VICTORY
→ Audio: Ascending tones
→ Text: "Case closed..."
```

### Fail Condition
```
- Ghost touches player: Distance < 1.05 units
  OR
- Fear meter reaches 100%
→ FAILURE
→ Audio: Descending tones
→ Text: Contextual death message
```

### Reset
- Click "Reopen the case" button
- Player position: Back to start
- Ghost: Reset to patrol route
- Clues: Un-collected
- Fear: 20% baseline

## ⚙️ Performance Targets

- **Frame rate**: 60 FPS (target)
- **Raycasting**: 1 per pixel column per frame
- **Total sprites**: 4-6 per frame (clues, ghost, exit)
- **Audio oscillators**: 2-8 simultaneous
- **Memory**: < 10 MB total
- **Load time**: < 500 ms

## 🎮 Game Loop Sequence

```
┌─ requestAnimationFrame() calls _loop(timestamp)
│
├─ Calculate delta time (ms since last frame)
├─ Update player movement based on keys
├─ Update ghost AI (patrol/chase logic)
├─ Check clue collection (4/4?)
├─ Update fear levels
├─ Play audio feedback
├─ Render entire scene via raycasting
├─ Draw sprites (clues, ghost, exit)
│
├─ Victory? → Exit loop, show button
├─ Failure? → Exit loop, show button
│
└─ If still running: queue next frame
   Repeat ~60 times per second
```

## 🛠️ Configuration Quick Edit

**In game.js, line ~24:**
```javascript
const CONFIG = {
  PLAYER_SPEED: 2.7,              // Increase = faster walking
  PLAYER_RUN_SPEED: 3.9,          // Increase = faster sprinting
  GHOST_PATROL_SPEED: 1.2,        // Increase = ghost faster
  GHOST_CHASE_SPEED_BASE: 2.2,    // Increase = more dangerous
  GHOST_DETECTION_RANGE: 8.5,     // Increase = detects from farther
  FEAR_INCREASE_PER_FRAME: 0.0009,// Decrease = harder to panic
  FEAR_LIGHT_DECREASE: 0.0024,    // Increase = lights help more
  FEAR_BREATH_REDUCTION: 0.25,    // Increase = breathing helps more
};
```

## 📚 Documentation Files

| File | Purpose | For Whom |
|------|---------|----------|
| `index.html` | Game UI & styles | Frontend devs |
| `game.js` | Complete engine | Game devs |
| `README.md` | User guide & features | Everyone |
| `DEVELOPER_GUIDE.md` | Technical reference | Modders |
| `GAMEPLAY_GUIDE.md` | Strategies & tips | Players |
| `PROJECT_SUMMARY.md` | Build overview | Project managers |
| `QUICK_REFERENCE.md` | This file | Quick lookup |

## 🔍 Debugging Checklist

Experiencing issues? Check:

- [ ] **Black screen?** Check browser console for errors
- [ ] **No audio?** Click game first (browser requires interaction)
- [ ] **Pointer lock not working?** Requires HTTPS or localhost
- [ ] **Ghost won't move?** Check patrol waypoints in code
- [ ] **Fear not decreasing?** Check if near light source
- [ ] **Performance issues?** Try reducing window size

## 🚀 Quick Deploy

**To run locally:**
```bash
# Simply open index.html in browser
# No server needed!
```

**To deploy online:**
```bash
# Upload these 3 files to any web host:
1. index.html
2. game.js
3. (optional) README.md, guides

# Done! No build step, no dependencies
```

## 📱 Browser Support Matrix

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 90+ | ✅ Full |
| Firefox | 88+ | ✅ Full |
| Edge | 90+ | ✅ Full |
| Safari | 14+ | ✅ Full |
| Mobile | Any | ❌ No pointer lock |

---

**Happy investigating, Detective! 👻**