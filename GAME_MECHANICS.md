# 🎮 Ashen Harbor Hotel - Complete Game Mechanics Guide

## ✅ FULLY FUNCTIONAL MECHANICS

### 🚶 **1. Player Movement System**
**Status: ✅ WORKING**
- **WASD Keys**: Move forward, back, strafe left/right
- **Shift**: Sprint (increases speed from 2.7 to 3.9 units/sec)
- **Mouse Look**: Rotate camera (requires clicking canvas for pointer lock)
- **Collision Detection**: Can't walk through walls (#), doors (D), or locked exit (E)
- **Smooth Movement**: Frame-independent delta time for consistent speed

### 👁️ **2. 3D Raycasting Engine**
**Status: ✅ WORKING**
- **Real-time 3D rendering**: Wolfenstein-style raycasting
- **Different wall types**: Walls (#), Doors (D), Windows (W), Mirrors (M)
- **Distance shading**: Walls get darker with distance
- **Side shading**: Different brightness for N/S vs E/W walls
- **Texture variation**: Procedural noise for wall detail
- **Depth buffer**: Proper sprite occlusion behind walls

### 🗺️ **3. Navigation & Orientation**
**Status: ✅ WORKING**
- **Real-time Minimap**: Top-right corner shows hotel layout
- **Player Indicator**: Green dot with direction arrow
- **Ghost Tracking**: Red dot shows ghost location
- **Clue Markers**: Golden dots for undiscovered clues
- **Exit Marker**: Green marker appears when all clues found
- **Environmental Storytelling**: Area descriptions when entering new zones

### 😱 **4. Fear System**
**Status: ✅ WORKING**
- **Visual Meter**: Top-right panel shows current fear level
- **Passive Increase**: Fear slowly rises over time (0.0009/frame)
- **Light Comfort**: Standing near lights (L) reduces fear (-0.0024/frame)
- **Ghost Proximity**: Fear increases rapidly when ghost is near
- **Ghost Speed**: Ghost moves faster as your fear increases
- **Visual Effects**: Screen flashes red when fear is high
- **Breath Mechanic**: Press E to reduce fear by 25% (3.5s cooldown)
- **Critical Threshold**: Warning narration at 88% fear

### 👻 **5. Ghost AI System**
**Status: ✅ WORKING**
- **Two AI States**: Patrol and Chase
- **Patrol Behavior**: 
  - Follows 8-point path through hotel
  - Speed: 1.2 units/sec (increases with your fear)
  - Visits: Lobby, East Wing, West Wing, Central Hall
- **Chase Behavior**:
  - Activates when ghost sees you within 8.5 units
  - Speed: 2.2 + (fear × 1.2) units/sec
  - Predicts your movement direction
  - Pursues for 8 seconds after losing sight
  - Can occasionally phase through walls (10% chance)
- **Detection**: Line-of-sight checking (can't see through walls)
- **Proximity Effects**:
  - Distance < 6 units: Increases fear, screen flash, heartbeat
  - Distance < 4 units: Ghost whispers random scary messages
  - Distance < 1.05 units: **INSTANT DEATH**
- **Visual**: Bright red glowing sprite with pulsing animation

### 🔍 **6. Clue Collection System**
**Status: ✅ WORKING**
- **6 Total Clues** scattered throughout hotel:
  1. **Reception Logbook** (9.5, 13.5) - Room 237 haunting
  2. **Security Camera Footage** (31.5, 25.5) - Time paradox evidence
  3. **Housekeeping Notes** (7.5, 35.5) - Progressive horror
  4. **Guest Registry 1987** (20.5, 40.5) - Final tragic entries
  5. **Maintenance Report** (15.5, 17.5) - HVAC anomalies
  6. **Polaroid Photograph** (25.5, 32.5) - Detective time loop
- **Visual Indicators**: Golden glowing sprites with pulsing animation
- **Collection**: Walk within 1 unit to auto-collect
- **Feedback**: 
  - Audio sting plays
  - Clue appears in UI panel
  - Counter updates (X/6)
  - Narration displays clue details
- **Minimap**: Shows undiscovered clue locations

### 🚪 **7. Win Condition**
**Status: ✅ WORKING**
- **Objective**: Collect all 6 clues then reach the exit
- **Exit Location**: Position 38, 44 (marked with 'E')
- **Exit Unlocking**: 
  - Exit blocked until all clues collected
  - Green glowing sprite appears when exit is available
  - Warning narration at 4 units distance
  - Walk within 1.1 units to trigger
- **Victory Sequence**:
  - Game stops
  - Win sound plays
  - Victory narration displays
  - "Reopen the case" button appears
  - Can restart investigation

### ☠️ **8. Lose Condition**
**Status: ✅ WORKING**
- **Ghost Contact**: Death if ghost gets within 1.05 units
- **Failure Sequence**:
  - Game stops
  - Fail sound plays
  - Death narration displays
  - "Restart investigation" button appears
  - Can retry from beginning

### 🔊 **9. Procedural Audio System**
**Status: ✅ WORKING**
- **Web Audio API**: Real-time sound synthesis
- **Sound Effects**:
  - Footsteps (quieter when walking, louder when running)
  - Heartbeat (intensity increases with fear)
  - Ghost whispers (when ghost is near)
  - Breath sounds (when using E ability)
  - Elevator ding (when approaching exit)
  - Clue pickup (collection feedback)
  - Win sound (victory)
  - Fail sound (death)
- **Dynamic Volume**: Based on fear level and proximity
- **Ambient Atmosphere**: Continuous low-frequency drone

### 📖 **10. Dynamic Narration System**
**Status: ✅ WORKING**
- **Story Moments**: Context-aware messages
- **Event Triggers**:
  - Game start
  - Clue collection (unique message per clue)
  - Ghost detection
  - Ghost proximity warnings
  - Area transitions (entering different hotel zones)
  - High fear warnings
  - Idle timeout (15 seconds)
  - Exit approach
  - Victory/defeat
- **Timed Display**: Auto-clears after set duration
- **Baseline Text**: Returns to ambient description when idle

### 🌟 **11. Lighting System**
**Status: ✅ WORKING**
- **Light Sources**: Marked with 'L' in map (12+ locations)
- **Proximity Detection**: Automatic within radius
- **Fear Reduction**: Passive fear decrease when near lights
- **Visual Effect**: Subtle warm glow in rendering
- **Tactical Gameplay**: Encourages moving between safe light areas

### 🎨 **12. Visual Effects**
**Status: ✅ WORKING**
- **Sprite System**: 
  - Clues (golden glow)
  - Ghost (red menacing)
  - Exit (green indicator)
- **Depth Sorting**: Sprites render in correct order
- **Distance Culling**: Don't render off-screen sprites
- **Screen Flash**: Red vignette when threatened
- **Particle System**: Atmospheric particles (dust motes)
- **Atmospheric Fog**: Distance-based fog with fear intensity
- **Color Grading**: Dynamic based on fear level

### 🎯 **13. UI/HUD System**
**Status: ✅ WORKING**
- **Case File Panel**: Story context and narration
- **Clues Panel**: List of collected evidence (checkmarks)
- **Fear Meter**: Visual bar with percentage
- **Instructions**: Control scheme reference
- **Debug Info**: Shows key states, position, running status
- **Minimap**: Real-time tactical overview
- **Reticle**: Center crosshair for orientation

### 🏨 **14. Hotel Environment**
**Status: ✅ WORKING**
- **Size**: 40×47 grid (1,880 cells)
- **Areas**:
  - Reception Desk (entrance)
  - Kitchen Complex (multiple rooms)
  - East Wing (guest corridors)
  - West Wing (guest corridors)
  - Central Hallway (main connection)
  - Bathrooms (B markers)
  - Staircase areas (S markers)
  - Exit/Elevator (E marker)
- **Collision**: All walls, doors, furniture block movement
- **Windows & Mirrors**: Special visual treatment

### ♻️ **15. Game State Management**
**Status: ✅ WORKING**
- **Start**: Click button to begin
- **Pause/Resume**: ESC or lose pointer lock (now disabled for better UX)
- **Reset**: Restart button after win/lose
- **Persistent State**: Game loop, variables, positions
- **Error Recovery**: Try/catch in game loop prevents crashes

---

## 🎲 GAME PARAMETERS (Tunable in CONFIG)

```javascript
FOV: π/3 (60°)                    // Field of view
PLAYER_SPEED: 2.7                 // Walk speed
PLAYER_RUN_SPEED: 3.9             // Sprint speed
GHOST_PATROL_SPEED: 1.2           // Ghost patrol speed
GHOST_CHASE_SPEED_BASE: 2.2       // Ghost chase speed
GHOST_DETECTION_RANGE: 8.5        // Ghost sight distance
GHOST_CONTACT_RANGE: 1.05         // Death distance
GHOST_PROXIMITY_RANGE: 6          // Fear effect distance
BREATH_COOLDOWN: 3.5              // Seconds between breath uses
FEAR_INCREASE_PER_FRAME: 0.0009   // Passive fear gain
FEAR_LIGHT_DECREASE: 0.0024       // Fear reduction near lights
FEAR_BREATH_REDUCTION: 0.25       // Fear removed by breath (25%)
FEAR_BREATH_ALERT_THRESHOLD: 0.88 // Warning at 88% fear
IDLE_NARRATION_THRESHOLD: 15      // Idle message after 15s
```

---

## 🎯 HOW TO PLAY

### **Objective**
Collect all 6 pieces of evidence about the haunted hotel, then escape through the elevator.

### **Controls**
- **W/A/S/D** or **Arrow Keys**: Move
- **Shift**: Sprint
- **Mouse**: Look around (click canvas first)
- **E**: Steady breath to reduce fear (3.5s cooldown)
- **ESC**: Release mouse (game continues)

### **Strategy**
1. **Stay near lights** - Reduces fear
2. **Use the minimap** - Track ghost location (red dot)
3. **Collect clues efficiently** - Plan route using minimap
4. **Manage fear** - Use breath ability before it gets too high
5. **Avoid the ghost** - Keep distance >6 units
6. **Sprint wisely** - Faster but increases fear
7. **Learn ghost patterns** - Predict patrol route
8. **Head to exit** - Only accessible after all clues found

### **Win/Lose Conditions**
- **WIN**: Collect all 6 clues + reach exit elevator
- **LOSE**: Ghost catches you (distance < 1.05 units)

---

## 🔧 TECHNICAL IMPLEMENTATION

### **Architecture**
- Pure JavaScript (no frameworks)
- Object-oriented design
- Raycasting engine from scratch
- Web Audio API for sound
- Canvas 2D for rendering
- Event-driven input system

### **Performance**
- 60 FPS target
- Delta time for frame independence
- Depth buffer for occlusion
- Efficient sprite culling
- Try/catch error recovery

### **Browser Compatibility**
- Modern browsers (Chrome, Firefox, Edge, Safari)
- Requires JavaScript enabled
- Requires Canvas 2D support
- Requires Web Audio API
- Requires Pointer Lock API (optional)

---

## ✅ VERIFICATION STATUS

All 15 major game mechanics are **100% FUNCTIONAL** and tested:
- ✅ Movement & Controls
- ✅ 3D Rendering
- ✅ Navigation
- ✅ Fear System
- ✅ Ghost AI
- ✅ Clue Collection
- ✅ Win Condition
- ✅ Lose Condition
- ✅ Audio System
- ✅ Narration
- ✅ Lighting
- ✅ Visual Effects
- ✅ UI/HUD
- ✅ Environment
- ✅ State Management

**The game is complete and playable from start to finish!** 🎉