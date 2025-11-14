# Developer Guide - Ashen Harbor Hotel

Complete technical reference for modifying and extending the game.

## Architecture Overview

The game is built with a modular class-based structure:

```
index.html (UI & styles)
    ↓
game.js (executable)
    ├── AudioManager (procedural sound synthesis)
    ├── ParticleSystem (visual effects)
    └── HorrorGame (main controller)
```

## Understanding the Game Loop

```javascript
// Core update sequence every frame:
_loop(timestamp) {
  delta = time since last frame
  
  // Physics & input
  _updatePlayer(delta)        // Handle WASD/mouse input
  _updateGhost(delta)         // Enemy AI & movement
  _updateClues(delta)         // Check collection & win conditions
  _regulateFear(delta)        // Fear accumulation
  _handleIdle(delta)          // Narration timing
  particles.update(delta)     // Visual effects
  
  // Rendering
  _renderScene()              // Raycasting render pass
  
  // Queue next frame
  requestAnimationFrame(_loop)
}
```

## Key Game Systems

### 1. Raycasting Renderer

The `_castRay(angle)` function implements a DDA (Digital Differential Analyzer) raycaster:

```javascript
_castRay(angle) {
  // Convert angle to direction vector
  sin = sin(angle)
  cos = cos(angle)
  
  // Grid traversal using DDA
  while (not_at_wall) {
    // Step through grid based on smaller distance
    if (sideDistX < sideDistY) {
      advance X
    } else {
      advance Y
    }
    
    // Check tile at position
    if (tile is solid or exit)
      break
  }
  
  return { distance, tile, side }
}
```

**Performance tip**: Raycasting one column per pixel = O(N) per frame. Very fast.

### 2. Fear System

Fear naturally increases over time, but is affected by multiple factors:

```javascript
// Each frame:
drift = BASE_INCREASE * delta * 60  // +0.0009
if (near_light) 
  drift -= LIGHT_DECREASE * delta * 60  // -0.0024

fear = clamp(fear + drift, 0, 1)

if (fear >= 1)
  failInvestigation()
```

**Stress Events**: 
- Ghost approaching: +0.022 per unit distance per frame
- Ghost chasing: +0.8 speed multiplier
- Collecting clue: -0 (narrative only)
- E key pressed: -0.25 instant

### 3. Ghost AI

Two-state machine: PATROL or CHASE

**Patrol Mode**:
```javascript
pathIndex cycles through waypoints
ghost.speed = PATROL_SPEED (1.2)
// If detects player (line of sight + range):
  switch to CHASE
  pursueTimer = 5 seconds
```

**Chase Mode**:
```javascript
target = player position
ghost.speed = BASE_SPEED + fear * 0.8  // Speeds up as you panic
pursueTimer -= delta
if (pursueTimer <= 0)
  switch back to PATROL
```

**Line of Sight**: Traces 10 samples per unit distance along ray from ghost to player. Walls block detection.

### 4. Procedural Audio Synthesis

All sounds generated using Web Audio API oscillators:

```javascript
// Example: Ghost Whisper
ctx = new AudioContext()
for each frequency in [200, 250, 180, 220]:
  osc = ctx.createOscillator()
  osc.frequency = freq
  gain = ctx.createGain()
  gain.setValueAtTime(0.08, time)
  gain.exponentialRampToValueAtTime(0.01, time + 0.3)
  osc → gain → masterGain → output
  osc.start(time)
  osc.stop(time + 0.3)
```

**Key oscillator types**:
- `sine` - Smooth, pure tones (drones)
- LFO modulation - Frequency variation for evolving tones

## Modifying the Game

### Adding a New Enemy Type

1. Create new entity in `_resetGame()`:
```javascript
this.spectre = {
  x: 5,
  y: 5,
  speed: 1.5,
  // ... custom properties
};
```

2. Create update function:
```javascript
_updateSpectre(delta) {
  // Similar to _updateGhost but with different AI
}
```

3. Call in game loop:
```javascript
this._updateSpectre(delta);
```

4. Render with sprite system:
```javascript
sprites.push({
  x: this.spectre.x,
  y: this.spectre.y,
  color: 'rgba(...)',
  scale: 0.8,
  alpha: 0.6
});
```

### Adding New Clues

1. Add to clues array in `_initializeLightsAndClues()`:
```javascript
this.clues.push({
  x: 7.5,
  y: 8.5,
  title: 'Torn Photograph',
  detail: 'Shows a figure that doesn\'t belong in 1992...',
  found: false,
  pulse: 1
});
```

2. UI updates automatically via `_updateClues()`

### Creating a New Room

1. Edit `MAP` array:
```javascript
const MAP = [
  '###################',      // Add column for width
  '#.....X.....X.....#',      // L=light, E=exit, .=floor, #=wall
  // ... new layout
];
```

2. Lights and exit parsed automatically on init

3. Reposition waypoints in ghost.path if needed

### Changing the Aesthetic

**Colors**: Edit CSS variables in index.html:
```css
:root {
  --ink: #f7f2e6;     /* UI text color */
  --accent: #c9433b;  /* Highlight color */
  --panel: rgba(5, 5, 5, 0.72); /* UI background */
}
```

**Wall colors**: Edit `_shadeColor()`:
```javascript
const base = [33, 33, 46];  // [R, G, B]
// Changes to darker red: [80, 30, 30]
```

**Audio synthesis**: Modify oscillator frequencies:
```javascript
osc.frequency.value = 100;  // Lower pitch
```

## Performance Optimization

### Current Performance
- **60 FPS target** on modern desktop
- ~1000-2000 raycasts per frame (one per pixel column)
- ~4 sprites per frame average

### If you get lag:

1. **Reduce ray precision**:
```javascript
for (let column = 0; column < viewWidth; column += 2) {
  // Render every 2nd column, duplicate pixels
}
```

2. **Cap DDA steps**:
```javascript
let steps = 0;
while (steps < 200) {  // Add max iteration limit
  steps++;
  // ...
}
```

3. **Disable audio**:
```javascript
this.audio = null;  // Skip audio calls
```

4. **Simplify particles**:
```javascript
this.particles.particles = [];  // Disable effects
```

## Debugging Tips

### Check collision bugs:
```javascript
// In _updatePlayer, log movements:
console.log(`Player: (${this.player.x.toFixed(2)}, ${this.player.y.toFixed(2)})`);
```

### Verify ghost pathfinding:
```javascript
// In _updateGhost, add:
console.log(`Ghost: ${this.ghost.state} -> ${this.ghost.pathIndex}`);
```

### Inspect audio context:
```javascript
console.log(this.audio.audioContext.state);  // 'running' or 'suspended'
```

### Performance profiling:
```javascript
const t0 = performance.now();
// ... function call
const t1 = performance.now();
console.log(`Took ${(t1-t0).toFixed(2)}ms`);
```

## Memory Considerations

- **Map data**: ~324 bytes (18x18 grid of chars)
- **Depth buffer**: ~4KB per frame (1920 floats)
- **Particles**: Dynamic (10-100 per effect)
- **Audio oscillators**: ~8 running simultaneously max

**Total memory**: <10 MB for the entire game

## Browser APIs Used

```javascript
Canvas 2D          // Rendering
Pointer Lock API   // Mouse capture
Web Audio API      // Sound synthesis
requestAnimationFrame // Game loop timing
```

All are standard in modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+).

## Testing Checklist

- [ ] Game starts on button click
- [ ] Player moves with WASD
- [ ] Mouse look works (pointer lock)
- [ ] Ghost patrols and chases
- [ ] Clues found update UI
- [ ] Fear meter increases/decreases
- [ ] E key reduces fear
- [ ] Win condition triggers
- [ ] Fail condition triggers
- [ ] Game resets properly
- [ ] Audio plays (heartbeat, whispers)
- [ ] Works at 1920x1080 resolution
- [ ] Works at 1024x768 resolution
- [ ] Mobile fallback (shows message)

## Common Issues & Fixes

**Q: Raycasting shows black screen**
A: Check `_shadeColor()` base RGB values. Ensure wall colors are not too dark.

**Q: Ghost is too fast/slow**
A: Adjust `GHOST_PATROL_SPEED` and `GHOST_CHASE_SPEED_BASE` in CONFIG.

**Q: Audio context won't start**
A: Audio must initialize on user interaction. Check button click handler.

**Q: Pointer lock not working**
A: Some browsers require HTTPS for pointer lock. Test on live server or localhost.

**Q: Frame rate drops with particles**
A: Particle system can emit lots of objects. Reduce count in `particles.emit()` calls.

## Useful Resources

- **Raycasting tutorial**: Lodev.org - Raycasting in Python
- **Web Audio**: MDN Web Audio API Documentation
- **Game loop pattern**: GafferOnGames.com - Fix Your Timestep
- **Collision detection**: Red Blob Games - 2D Visibility

---

**Happy haunting!** 👻