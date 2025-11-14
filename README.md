# Ashen Harbor Hotel - First-Person Detective Horror Game

**A fully-functional browser-based horror immersive sim with procedural audio, raycasting rendering, and dynamic threat system.**

You are a detective investigating the abandoned Ashen Harbor Hotel—a coastal establishment where guests and staff have vanished without explanation. Navigate the corridors in first-person, collect spectral evidence, manage your mounting fear, and survive encounters with the apparition that haunts these halls.

## 🎮 Quick Start

1. **Requirements**: Modern desktop browser (Chrome, Firefox, Edge, Safari). Mobile not supported.
2. **Launch**: Open `index.html` directly in your browser (double-click or drag into browser tab).
3. **No setup required** – no build tools, no network, no external libraries. Everything runs locally.

## 📋 Game Objective

- Collect all **4 clues** hidden throughout the hotel
- Manage your **fear meter** (increases when near the ghost, decreases near lights)
- Use **E key to steady your breathing** when fear gets too high
- Reach the **service elevator** after collecting all evidence
- Escape before the apparition catches you

## 🎮 Controls

| Action | Key(s) |
|--------|--------|
| Move Forward | W / ↑ |
| Move Backward | S / ↓ |
| Strafe Left | A |
| Strafe Right | D |
| Run | Shift (hold) |
| Look Around | Mouse (requires pointer lock) |
| Steady Breathing | E |
| Escape | Esc (releases cursor) |
| Click Canvas | Re-engage pointer lock |

## ✨ Features

### Core Gameplay
- **Raycasting Engine**: Custom WebGL-free 2.5D raycaster rendered entirely on HTML5 Canvas
- **First-Person Movement**: Full pointer-lock controls with smooth collision detection
- **Fear Mechanics**: Dynamic fear system that affects ghost behavior and audio
- **Procedural Audio**: Web Audio API synthesis creates ambient atmosphere and reactive sound effects

### Audio System
- **Ambient Drones**: Continuous atmospheric background tones
- **Footsteps**: Dynamic footstep sounds based on movement speed
- **Heartbeat**: Increases in tempo as fear rises
- **Ghost Whispers**: Eerie vocalizations when apparition detects you
- **Clue Pickup**: Ascending tone scale when collecting evidence
- **Elevator Dinging**: Harmonic alert when all clues found

### Enemy AI
- **Patrolling Ghost**: Routes through predefined waypoints when idle
- **Dynamic Chase**: Switches to pursuit mode with line-of-sight detection
- **Fear Scaling**: Ghost movement speed increases with player fear level
- **Proximity Pressure**: Proximity alone increases fear without line-of-sight
- **Contact Fail State**: Immediate game over if ghost touches player

### Environmental Design
- **Procedural Lighting**: Light sources reduce fear when nearby
- **Clue Pulsing**: Clues emit visual pulses to guide discovery
- **Depth Rendering**: Proper occlusion and distance shading for 3D effect
- **State Transitions**: Open elevator door texture changes after winning

### UI/UX
- **Case File Aesthetic**: Retro detective report styling with panels
- **Live Clue Log**: Real-time tracking of collected evidence
- **Fear Gauge**: Visual representation with color gradient
- **Ambient Narration**: Context-aware text describing the investigation
- **Idle Whispers**: Randomized atmospheric horror dialogue
- **Responsive Design**: UI scales for various screen sizes

## 📁 Project Structure

```
├── index.html          # Main page, UI elements, styles
├── game.js            # Game engine, all logic (900+ lines)
├── README.md          # This file
└── .git/              # Version control
```

### Key Classes (in game.js)

**AudioManager**: Handles Web Audio API synthesis
- `init()` - Initialize audio context on user interaction
- `playFootstep()` - Dynamic footstep sound
- `playHeartbeat(fear)` - Fear-responsive heartbeat
- `playGhostWhisper()` - Apparition detection sound
- `playCluePickup()` - Evidence collection jingle
- `playWinSound()` / `playFailSound()` - End states

**ParticleSystem**: Visual effects (not used in base but available for expansion)
- `emit(x, y, count, color)` - Create particles at position
- `update(delta)` - Simulate physics
- `draw()` - Render to screen

**HorrorGame**: Main game controller
- `_updatePlayer(delta)` - Player input & movement
- `_updateGhost(delta)` - Enemy AI logic
- `_updateClues(delta)` - Evidence collection detection
- `_regulateFear(delta)` - Fear system updates
- `_castRay()` - Raycasting for rendering
- `_renderScene()` - Full frame render

## 🔧 Configuration

Edit these constants in `game.js` to tune gameplay:

```javascript
const CONFIG = {
  PLAYER_SPEED: 2.7,           // Walking speed
  PLAYER_RUN_SPEED: 3.9,       // Sprint speed
  GHOST_PATROL_SPEED: 1.2,     // When patrolling
  GHOST_CHASE_SPEED_BASE: 2.2, // When chasing (+ fear multiplier)
  GHOST_DETECTION_RANGE: 8.5,  // When ghost can see you
  FEAR_INCREASE_PER_FRAME: 0.0009,
  FEAR_LIGHT_DECREASE: 0.0024, // Bonus near lamps
  // ... and more
};
```

## 🎨 Art Direction

- **Color Palette**: Low-contrast grays with red accents for danger
- **Aesthetic**: Brutal minimalism mixed with decay
- **Audio Style**: Unsettling drones and harsh synthesized effects
- **Typography**: Monospace uppercase for forensic authenticity

## 🐛 Technical Details

### Rendering Pipeline
1. Raycasting per column (fast 2.5D rendering)
2. Sprite rendering with depth buffering
3. Dynamic light shading based on wall side
4. Particle system overlay

### Physics
- Tile-based collision detection
- Smooth movement interpolation
- Line-of-sight trace checking (enemy AI)
- Distance-based fear scaling

### Audio Synthesis
- Oscillator-based tone generation
- Envelope ADSR for dynamic response
- Master gain control for volume
- LFO modulation for evolving tones

## 🎯 Clues Location Map

| # | Name | Location | Detail |
|---|------|----------|--------|
| 1 | Room 305 Ledger | (3.5, 1.5) | Missing detective reports |
| 2 | Maintenance Recorder | (12.5, 7.5) | Elevator malfunction audio |
| 3 | Bloodied Keycard | (4.5, 11.5) | Wrenched from service door |
| 4 | Polaroid In Static | (14.5, 15.5) | Apparition guidance photo |

## 🔮 Future Expansion Ideas

- [ ] Multiple ghost types with different AI patterns
- [ ] Inventory system for collected items
- [ ] Environmental puzzles to unlock areas
- [ ] Multiple endings based on dialogue choices
- [ ] Procedurally generated hotel layouts
- [ ] Difficulty modifiers (hardcore mode, permadeath)
- [ ] Checkpoint saves
- [ ] Multiplayer co-op investigation
- [ ] VR headset support (with pointer lock)
- [ ] Custom mapmaker tools

## 🛠️ Browser Compatibility

| Browser | Status | Notes |
|---------|--------|-------|
| Chrome 90+ | ✅ Full support | Best performance |
| Firefox 88+ | ✅ Full support | Excellent audio |
| Edge 90+ | ✅ Full support | Chromium-based |
| Safari 14+ | ✅ Full support | Works well |
| Mobile | ❌ Not supported | No pointer lock |

## 📝 License & Credits

**Concept**: First-person detective horror in a minimalist coastal hotel  
**Engine**: Custom Canvas raycaster (inspired by classic Wolfenstein 3D techniques)  
**Audio**: Web Audio API procedural synthesis  
**Design**: Immersive sim mechanics with psychological horror focus

---

**Enjoy your investigation. The hotel is waiting.**
