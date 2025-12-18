/**
 * Ashen Harbor Hotel - First-Person Detective Horror Game
 * A browser-based immersive sim with raycasting, procedural atmosphere, and dynamic threats
 */

(function () {
  'use strict';

  // ============================================================================
  // CONFIG & CONSTANTS
  // ============================================================================

  const CONFIG = {
    FOV: Math.PI / 3,
    PLAYER_SPEED: 2.7,
    PLAYER_RUN_SPEED: 3.9,
    GHOST_PATROL_SPEED: 1.2,
    GHOST_CHASE_SPEED_BASE: 2.2,
    GHOST_DETECTION_RANGE: 8.5,
    GHOST_CONTACT_RANGE: 1.05,
    GHOST_PROXIMITY_RANGE: 6,
    BREATH_COOLDOWN: 3.5,
    FEAR_INCREASE_PER_FRAME: 0.0009,
    FEAR_LIGHT_DECREASE: 0.0024,
    FEAR_BREATH_REDUCTION: 0.25,
    FEAR_BREATH_ALERT_THRESHOLD: 0.88,
    IDLE_NARRATION_THRESHOLD: 15,
    IDLE_NARRATION_COOLDOWN: 5,
    NARRATION_DEFAULT_DURATION: 6,
    NARRATION_BASELINE: 'Rain shivers through the cracked skylights as the lobby swallows the storm.'
  };

  // Enhanced Hotel Map - Grand Crescent Hotel
  // Legend: # = wall, . = floor, L = light, E = elevator/exit, 
  //         R = reception, D = door, S = staircase, B = bathroom, K = kitchen
  //         C = clue location, G = ghost spawn, M = mirror, W = window
  const MAP = [
    '########################################',
    '#......................................#',
    '#.RRRR.............W..................W#',
    '#.RRRR.....########################....#',
    '#......D...#K.K.K.#....B..#....B...#...#',
    '#..........#......#......D#.......D#...#',
    '#..........#......#.......#........#...#',
    '#....L.....#......D.......#........#...#',
    '#..........#......#.......#........#...#',
    '#....C.....#.L....#...L...##D#######...#',
    '#..........########################....#',
    '#......................................#',
    '###D###############################D####',
    '#.....C................................#',
    '#......................................#',
    '#..........L.......M.......L...........#',
    '#......................................#',
    '#.C....................................#',
    '#......................................#',
    '########D###################D###########',
    '#........#G................#...........#',
    '#........#.................#...........#',
    '#....L...#.................#...L.......#',
    '#........#.................#...........#',
    '#........#.................#...........#',
    '#....C...D.................D...C.......#',
    '#........#.................#...........#',
    '#........#.................#...........#',
    '#........#..........L......#...........#',
    '#........#.................#...........#',
    '########D###################D###########',
    '#......................................#',
    '#......................................#',
    '#..........L.......M.......L...........#',
    '#......................................#',
    '#..C...................................#',
    '#......................................#',
    '###D###############################D####',
    '#.....C................................#',
    '#......................................#',
    '#..........L.......S.......L...........#',
    '#......................................#',
    '#......................................#',
    '###D###############################D####',
    '#.....................................E#',
    '#.....................................##',
    '########################################'
  ];

  // Wall types and textures - Brighter colors
  const WALL_TYPES = {
    '#': { color: '#8d6944', texture: 'brick', height: 1 },      // Brighter brown walls
    'D': { color: '#a57341', texture: 'door', height: 0.8 },      // Brighter door
    'W': { color: '#b0d4eb', texture: 'window', height: 0.6 },    // Brighter window
    'M': { color: '#e0e0e0', texture: 'mirror', height: 1 }       // Brighter mirror
  };

  // ============================================================================
  // AUDIO SYSTEM (Web Audio API)
  // ============================================================================

  class AudioManager {
    constructor() {
      this.audioContext = null;
      this.masterGain = null;
      this.initialized = false;
      this.ambientOscillators = [];
      this.soundEffects = {
        footstep: [],
        breath: null,
        heartbeat: null,
        ghostWhisper: [],
        elevatorDing: null,
        cluePickup: null,
        win: null,
        fail: null
      };
    }

    init() {
      if (this.initialized) return;
      try {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = 0.3;
        this.masterGain.connect(this.audioContext.destination);
        
        // Resume audio context if suspended (browser autoplay policy)
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume();
        }
        
        this._createAmbientSounds();
        this.initialized = true;
      } catch (e) {
        console.warn('Audio initialization failed:', e);
        this.initialized = false;
      }
    }

    _createAmbientSounds() {
      if (this.ambientOscillators.length === 0) {
        // Deep ambient drone
        const osc1 = this.audioContext.createOscillator();
        osc1.frequency.value = 55;
        osc1.type = 'sine';
        const gain1 = this.audioContext.createGain();
        gain1.gain.value = 0.08;
        osc1.connect(gain1);
        gain1.connect(this.masterGain);
        osc1.start();
        this.ambientOscillators.push(osc1);

        // Fluctuating mid tone
        const osc2 = this.audioContext.createOscillator();
        osc2.frequency.value = 120;
        osc2.type = 'sine';
        const gain2 = this.audioContext.createGain();
        gain2.gain.value = 0.06;
        osc2.connect(gain2);
        gain2.connect(this.masterGain);
        osc2.start();
        this.ambientOscillators.push(osc2);

        // LFO modulation
        const lfo = this.audioContext.createOscillator();
        lfo.frequency.value = 0.3;
        const lfoGain = this.audioContext.createGain();
        lfoGain.gain.value = 30;
        lfo.connect(lfoGain);
        lfoGain.connect(osc2.frequency);
        lfo.start();
      }
    }

    playFootstep(volume = 0.15) {
      if (!this.initialized || !this.audioContext || this.audioContext.state === 'closed') return;
      try {
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        osc.frequency.setValueAtTime(150 + Math.random() * 100, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.15);
      } catch (e) {
        console.warn('Footstep audio failed:', e);
      }
    }

    playBreathingSound(fear) {
      if (!this.initialized || this.audioContext.state === 'closed') return;
      try {
        const now = this.audioContext.currentTime;
        const volume = 0.1 + fear * 0.2;
        const osc = this.audioContext.createOscillator();
        osc.frequency.value = 80 + fear * 60;
        osc.type = 'sine';
        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(volume, now + 0.3);
        gain.gain.linearRampToValueAtTime(0, now + 0.8);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.8);
      } catch (e) {
        // Silently fail
      }
    }

    playHeartbeat(fear) {
      if (!this.initialized || this.audioContext.state === 'closed') return;
      try {
        const now = this.audioContext.currentTime;
        const bpm = 60 + fear * 120;
        const beatDuration = 60 / bpm;
        const volume = 0.2 + fear * 0.3;

        for (let i = 0; i < 2; i++) {
          const osc = this.audioContext.createOscillator();
          osc.frequency.setValueAtTime(80, now + i * beatDuration * 0.5);
          osc.frequency.exponentialRampToValueAtTime(40, now + i * beatDuration * 0.5 + 0.05);
          const gain = this.audioContext.createGain();
          gain.gain.setValueAtTime(volume, now + i * beatDuration * 0.5);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * beatDuration * 0.5 + 0.12);
          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now + i * beatDuration * 0.5);
          osc.stop(now + i * beatDuration * 0.5 + 0.12);
        }
      } catch (e) {
        // Silently fail
      }
    }

    playGhostWhisper() {
      if (!this.initialized || this.audioContext.state === 'closed') return;
      try {
        const now = this.audioContext.currentTime;
        const whisperFreqs = [200, 250, 180, 220];
        whisperFreqs.forEach((freq, idx) => {
          const osc = this.audioContext.createOscillator();
          osc.frequency.value = freq;
          osc.type = 'sine';
          const gain = this.audioContext.createGain();
          gain.gain.setValueAtTime(0.08, now + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.3);
          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.3);
        });
      } catch (e) {
        // Silently fail
      }
    }

    playCluePickup() {
      if (!this.initialized || this.audioContext.state === 'closed') return;
      try {
        const now = this.audioContext.currentTime;
        const frequencies = [262, 330, 392, 523];
        frequencies.forEach((freq, idx) => {
          const osc = this.audioContext.createOscillator();
          osc.frequency.value = freq;
          osc.type = 'sine';
          const gain = this.audioContext.createGain();
          gain.gain.setValueAtTime(0.1, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.15);
          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.15);
        });
      } catch (e) {
        // Silently fail
      }
    }

    playElevatorDing() {
      if (!this.initialized || this.audioContext.state === 'closed') return;
      try {
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        osc.frequency.value = 523;
        osc.type = 'sine';
        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.5);
      } catch (e) {
        // Silently fail
      }
    }

    playWinSound() {
      if (!this.initialized || this.audioContext.state === 'closed') return;
      try {
        const now = this.audioContext.currentTime;
        const frequencies = [262, 330, 392, 523, 659];
        frequencies.forEach((freq, idx) => {
          const osc = this.audioContext.createOscillator();
          osc.frequency.value = freq;
          osc.type = 'sine';
          const gain = this.audioContext.createGain();
          gain.gain.setValueAtTime(0.1, now + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.12 + 0.3);
          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.3);
        });
      } catch (e) {
        // Silently fail
      }
    }

    playFailSound() {
      if (!this.initialized || this.audioContext.state === 'closed') return;
      try {
        const now = this.audioContext.currentTime;
        for (let i = 0; i < 3; i++) {
          const osc = this.audioContext.createOscillator();
          osc.frequency.setValueAtTime(200 - i * 50, now + i * 0.1);
          osc.frequency.exponentialRampToValueAtTime(80, now + i * 0.1 + 0.3);
          const gain = this.audioContext.createGain();
          gain.gain.setValueAtTime(0.12, now + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.4);
          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now + i * 0.1);
          osc.stop(now + i * 0.1 + 0.4);
        }
      } catch (e) {
        // Silently fail
      }
    }
  }

  // ============================================================================
  // PARTICLE SYSTEM
  // ============================================================================

  class ParticleSystem {
    constructor() {
      this.particles = [];
    }

    emit(x, y, count = 5, color = 'rgba(200, 44, 44, 0.6)') {
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          life: 1,
          color
        });
      }
    }

    update(delta) {
      this.particles = this.particles.filter(p => {
        p.x += p.vx * delta;
        p.y += p.vy * delta;
        p.life -= delta * 0.8;
        p.vy += 1.5 * delta; // gravity
        return p.life > 0;
      });
    }

    draw(ctx, viewWidth, viewHeight, player, viewDistance, FOV) {
      this.particles.forEach(p => {
        const dx = p.x - player.x;
        const dy = p.y - player.y;
        const distance = Math.hypot(dx, dy);
        const angleToParticle = Math.atan2(dy, dx) - player.angle;
        const normalized = Math.atan2(Math.sin(angleToParticle), Math.cos(angleToParticle));

        if (Math.abs(normalized) > FOV / 2 + 0.2 || distance <= 0.05) return;

        const spriteDistance = Math.cos(normalized) * distance;
        const spriteHeight = (viewDistance * 0.2) / spriteDistance;
        const centerX = (normalized + FOV / 2) / FOV * viewWidth;
        const top = viewHeight / 2 - spriteHeight / 2;

        ctx.globalAlpha = p.life * 0.7;
        ctx.fillStyle = p.color;
        ctx.fillRect(Math.floor(centerX), Math.floor(top), 2, spriteHeight);
        ctx.globalAlpha = 1;
      });
    }
  }

  // ============================================================================
  // MAIN GAME ENGINE
  // ============================================================================

  class HorrorGame {
    constructor() {
      // Check for touch device
      this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // DOM Elements
      this.canvas = document.getElementById('view');
      this.ctx = this.canvas.getContext('2d');
      this.startButton = document.getElementById('startButton');
      this.narrationEl = document.getElementById('narration');
      this.clueStatusEl = document.getElementById('clueStatus');
      this.clueLogEl = document.getElementById('clueLog');
      this.fearFillEl = document.getElementById('fearFill');
      this.threatFlash = document.getElementById('threatFlash');
      
      // Minimap elements
      this.minimapCanvas = document.getElementById('minimapCanvas');
      this.minimapCtx = this.minimapCanvas.getContext('2d');
      
      // Debug element
      this.debugEl = document.getElementById('debug');

      // Validate required DOM elements
      if (!this.canvas || !this.ctx || !this.startButton) {
        console.error('Required DOM elements not found');
        return;
      }

      // Canvas setup
      this.viewWidth = window.innerWidth;
      this.viewHeight = window.innerHeight;
      this.viewDistance = (this.viewWidth / 2) / Math.tan(CONFIG.FOV / 2);
      this.depthBuffer = new Array(Math.max(1, this.viewWidth));

      // Game state
      this.mapData = MAP;
      this.mapHeight = this.mapData.length;
      this.mapWidth = this.mapData[0].length;

      // Player - start in the main lobby area where there's open space
      this.playerStart = { x: 20.5, y: 40.5, angle: 0 }; // Start in central lobby
      this.player = { ...this.playerStart };
      this.keys = {
        forward: false,
        back: false,
        left: false,
        right: false,
        run: false
      };

      // Ghost entity - enhanced for larger map
      this.ghost = {
        x: 10.5,  // Start in the left wing
        y: 21.5,
        path: [
          { x: 10.5, y: 21.5 }, // Left wing patrol
          { x: 10.5, y: 29.5 },
          { x: 30.5, y: 29.5 }, // Cross to right wing
          { x: 30.5, y: 21.5 },
          { x: 20.5, y: 15.5 }, // Central area
          { x: 20.5, y: 35.5 }, // Lobby area
          { x: 15.5, y: 35.5 },
          { x: 8.5, y: 25.5 }   // Back to start area
        ],
        pathIndex: 1,
        state: 'patrol',
        speed: 1.3,
        pursueTimer: 0,
        phase: 0,
        lastSeenAngle: 0,
        visible: true,        // Make sure ghost is visible
        transparency: 0.7,    // Semi-transparent for spooky effect
        glowIntensity: 0.5   // Eerie glow effect
      };

      // Lights and clues
      this.lights = [];
      this.clues = [];
      this.exitPosition = { x: 0, y: 0 };
      this._initializeLightsAndClues();

      // Game state variables
      this.cluesFound = 0;
      this.fear = 0.2;
      this.caseClosed = false;
      this.failState = false;
      this.running = false;
      this.idleTimer = 0;
      this.breathCooldown = 0;
      this.exitPrompted = false;
      this.lastFrame = performance.now();
      this.narrationTimeout = null;
      this.flashTimeout = null;

      // Audio
      this.audio = new AudioManager();
      this.particles = new ParticleSystem();

      // Event listeners
      this._setupEventListeners();

      // Initial UI
      this._updateClueUI();
      this._adjustFear(this.fear);
      this._setNarration(CONFIG.NARRATION_BASELINE, 0);
    }

    _initializeLightsAndClues() {
      this.mapData.forEach((row, y) => {
        for (let x = 0; x < this.mapWidth; x++) {
          const cell = row[x];
          if (cell === 'L') {
            this.lights.push({ x: x + 0.5, y: y + 0.5, radius: 6.5 }); // Larger light radius for bigger map
          } else if (cell === 'E') {
            this.exitPosition = { x: x + 0.5, y: y + 0.5 };
          }
        }
      });

      // Enhanced clues positioned throughout the larger hotel
      this.clues = [
        {
          x: 9.5,
          y: 13.5,
          title: 'Reception Logbook',
          detail: 'Entry 127: "Guest in room 237 reported seeing a figure in the hallway. Room 237 has been empty for 15 years." The next entries are illegible, written in what looks like ash.'
        },
        {
          x: 31.5,
          y: 25.5,
          title: 'Security Camera Footage',
          detail: 'The tape shows a figure walking through walls in the east wing. The timestamp keeps jumping backwards. Frame 15:47 shows you standing in this exact spot, but you haven\'t been here before.'
        },
        {
          x: 7.5,
          y: 35.5,
          title: 'Housekeeping Notes',
          detail: 'Week 3: "Room 108 cleaned daily but always dirty again. Bloody handprints on walls." Week 4: "Can\'t enter room anymore. Door won\'t open." Week 5: "The door opened by itself today."'
        },
        {
          x: 20.5,
          y: 40.5,
          title: 'Guest Registry - 1987',
          detail: 'Final entry: "The elevator music won\'t stop. Guests are checking out through the windows now. The staff are gone. I can hear footsteps above me, but there is no floor above." Signed in trembling handwriting.'
        },
        {
          x: 15.5,
          y: 17.5,
          title: 'Maintenance Report',
          detail: 'Central HVAC system producing sounds resembling human voices. Technician reported "the vents are whispering names of people who died here." System cannot be shut down.'
        },
        {
          x: 25.5,
          y: 32.5,
          title: 'Polaroid Photograph',
          detail: "The photo shows you investigating this hotel, but it's dated 1987. You weren't born until 1990. On the back, someone wrote 'They always send detectives. They never leave.'"
        }
      ];

      this.clues.forEach((clue, idx) => {
        const entry = document.createElement('li');
        entry.textContent = clue.title;
        this.clueLogEl.appendChild(entry);
        clue.entry = entry;
        clue.pulse = 1 + Math.random() * 0.5; // Random starting pulse for variety
        clue.found = false;
      });
    }

    _setupEventListeners() {
      this.resizeHandler = () => this._resizeCanvas();
      this.startClickHandler = () => this._handleStartClick();
      this.canvasClickHandler = () => {
        this.canvas.focus(); // Ensure canvas has focus for keyboard events
        if (!document.pointerLockElement) {
          this.canvas.requestPointerLock();
        }
      };
      this.pointerlockHandler = () => this._handlePointerLockChange();
      this.mousemoveHandler = (e) => this._handleMouseMove(e);
      
      const preventKeys = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space']);
      this.keydownHandler = (e) => {
        if (preventKeys.has(e.code)) e.preventDefault();
        if (!e.repeat) this._handleKeyDown(e);
      };
      this.keyupHandler = (e) => this._handleKeyUp(e);

      window.addEventListener('resize', this.resizeHandler);
      this.startButton.addEventListener('click', this.startClickHandler);
      this.canvas.addEventListener('click', this.canvasClickHandler);
      document.addEventListener('pointerlockchange', this.pointerlockHandler);
      document.addEventListener('mousemove', this.mousemoveHandler);
      window.addEventListener('keydown', this.keydownHandler);
      window.addEventListener('keyup', this.keyupHandler);
    }

    _resizeCanvas() {
      this.viewWidth = window.innerWidth;
      this.viewHeight = window.innerHeight;
      const ratio = window.devicePixelRatio || 1;
      
      // Ensure minimum dimensions
      this.viewWidth = Math.max(320, this.viewWidth);
      this.viewHeight = Math.max(240, this.viewHeight);
      
      this.canvas.width = this.viewWidth * ratio;
      this.canvas.height = this.viewHeight * ratio;
      this.canvas.style.width = this.viewWidth + 'px';
      this.canvas.style.height = this.viewHeight + 'px';
      this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      this.viewDistance = (this.viewWidth / 2) / Math.tan(CONFIG.FOV / 2);
      this.depthBuffer.length = this.viewWidth;
    }

    _setNarration(text, seconds = CONFIG.NARRATION_DEFAULT_DURATION) {
      this.idleTimer = 0;
      clearTimeout(this.narrationTimeout);
      this.narrationEl.textContent = text;
      if (seconds > 0) {
        this.narrationTimeout = setTimeout(() => {
          this.narrationEl.textContent = CONFIG.NARRATION_BASELINE;
        }, seconds * 1000);
      }
    }

    _updateClueUI() {
      this.clueStatusEl.textContent = this.cluesFound + ' / ' + this.clues.length;
    }

    _adjustFear(value) {
      this.fear = Math.min(1, Math.max(0, value || 0));
      this.fearFillEl.style.width = Math.round(this.fear * 100) + '%';
      if (this.fear >= 1) {
        this._failInvestigation('The panic roars loud enough to drown the waves.');
      }
    }

    _handleStartClick() {
      if (this.startButton.dataset.state === 'restart') {
        this._resetGame();
      }
      this._engageInvestigation();
    }

    _handlePointerLockChange() {
      const locked = document.pointerLockElement === this.canvas;
      // Don't pause the game when pointer lock is lost - just disable mouse look
      // This allows WASD movement to always work
      if (locked && !this.running && !this.caseClosed && !this.failState) {
        // Only restart if game was paused
        this.running = true;
        this.lastFrame = performance.now();
        this.startButton.classList.add('hidden');
        requestAnimationFrame((ts) => this._loop(ts));
      }
    }

    _handleMouseMove(event) {
      if (document.pointerLockElement !== this.canvas) return;
      this.player.angle += event.movementX * 0.0022;
    }

    _handleKeyDown(event) {
      // Always handle movement keys regardless of pointer lock status
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.keys.forward = true;
          event.preventDefault();
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.keys.back = true;
          event.preventDefault();
          break;
        case 'KeyA':
          this.keys.left = true;
          event.preventDefault();
          break;
        case 'KeyD':
          this.keys.right = true;
          event.preventDefault();
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this.keys.run = true;
          if (this.audio && this.audio.initialized) {
            this.audio.playFootstep(0.2);
          }
          event.preventDefault();
          break;
        case 'KeyE':
          this._steadyBreath();
          event.preventDefault();
          break;
        default:
          // Don't prevent default for other keys
          return;
      }
    }

    _handleKeyUp(event) {
      // Always handle movement keys regardless of pointer lock status
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.keys.forward = false;
          event.preventDefault();
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.keys.back = false;
          event.preventDefault();
          break;
        case 'KeyA':
          this.keys.left = false;
          event.preventDefault();
          break;
        case 'KeyD':
          this.keys.right = false;
          event.preventDefault();
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this.keys.run = false;
          event.preventDefault();
          break;
        default:
          // Don't prevent default for other keys
          return;
      }
    }

    _steadyBreath() {
      if (!this.running || this.breathCooldown > 0 || this.caseClosed || this.failState) return;
      this.breathCooldown = CONFIG.BREATH_COOLDOWN;
      this._adjustFear(this.fear - CONFIG.FEAR_BREATH_REDUCTION);
      this.audio.playBreathingSound(this.fear);
      this._setNarration('You slow your breathing until the static drifts back into the wallpaper.', 4);
    }

    _flashThreat(amount) {
      this.threatFlash.style.opacity = Math.min(1, amount).toFixed(2);
      clearTimeout(this.flashTimeout);
      this.flashTimeout = setTimeout(() => {
        this.threatFlash.style.opacity = '0';
      }, 160);
    }

    _tileAt(x, y) {
      const xi = Math.floor(x);
      const yi = Math.floor(y);
      if (xi < 0 || yi < 0 || xi >= this.mapWidth || yi >= this.mapHeight) return '#';
      return this.mapData[yi][xi];
    }

    _isSolid(x, y) {
      const tile = this._tileAt(x, y);
      if (tile === '#') return true;
      if (tile === 'E' && !this.caseClosed) return true;
      return false;
    }

    _attemptMove(dx, dy) {
      const nextX = this.player.x + dx;
      const nextY = this.player.y + dy;
      if (!this._isSolid(nextX, this.player.y)) {
        this.player.x = nextX;
      }
      if (!this._isSolid(this.player.x, nextY)) {
        this.player.y = nextY;
      }
    }

    _lineOfSight(ax, ay, bx, by) {
      const dx = bx - ax;
      const dy = by - ay;
      const steps = Math.ceil(Math.hypot(dx, dy) * 10);
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const sx = ax + dx * t;
        const sy = ay + dy * t;
        if (this._tileAt(sx, sy) === '#') return false;
      }
      return true;
    }

    _updatePlayer(delta) {
      let moveX = 0;
      let moveY = 0;
      const forwardX = Math.cos(this.player.angle);
      const forwardY = Math.sin(this.player.angle);
      const strafeX = Math.cos(this.player.angle - Math.PI / 2);
      const strafeY = Math.sin(this.player.angle - Math.PI / 2);

      // Update debug display
      if (this.debugEl) {
        this.debugEl.textContent = `Keys: W:${this.keys.forward} S:${this.keys.back} A:${this.keys.left} D:${this.keys.right} | Running: ${this.running} | Pos: ${this.player.x.toFixed(1)},${this.player.y.toFixed(1)}`;
      }

      if (this.keys.forward) {
        moveX += forwardX;
        moveY += forwardY;
      }
      if (this.keys.back) {
        moveX -= forwardX;
        moveY -= forwardY;
      }
      if (this.keys.left) {
        moveX += strafeX;
        moveY += strafeY;
      }
      if (this.keys.right) {
        moveX -= strafeX;
        moveY -= strafeY;
      }

      const len = Math.hypot(moveX, moveY);
      if (len > 0) {
        moveX /= len;
        moveY /= len;
        const speed = this.keys.run ? CONFIG.PLAYER_RUN_SPEED : CONFIG.PLAYER_SPEED;
        const oldX = this.player.x;
        const oldY = this.player.y;
        this._attemptMove(moveX * speed * delta, moveY * speed * delta);
        
        // Check if player entered a new area for environmental storytelling
        this._checkAreaTransition(oldX, oldY, this.player.x, this.player.y);
        
        this.audio.playFootstep(this.keys.run ? 0.25 : 0.15);
        this.idleTimer = 0;
      } else {
        this.idleTimer += delta;
      }
    }

    _checkAreaTransition(oldX, oldY, newX, newY) {
      // Define hotel areas for environmental storytelling
      const areas = [
        { name: 'lobby', minX: 15, maxX: 35, minY: 32, maxY: 45, 
          desc: 'The lobby stretches before you, marble floors reflecting dim emergency lighting. Dust motes dance in the stale air.' },
        { name: 'reception', minX: 2, maxX: 6, minY: 2, maxY: 5,
          desc: 'Behind the reception desk, guest files scatter across the floor. The register book lies open to October 31st, 1987.' },
        { name: 'kitchen', minX: 6, maxX: 12, minY: 4, maxY: 8,
          desc: 'Industrial kitchen equipment rusts in silence. The scent of old grease mingles with something metallic and wrong.' },
        { name: 'east_wing', minX: 20, maxX: 38, minY: 20, maxY: 32,
          desc: 'The east wing halls stretch endlessly. Room doors hang ajar, revealing glimpses of lives interrupted mid-sentence.' },
        { name: 'west_wing', minX: 2, maxX: 18, minY: 20, maxY: 32,
          desc: 'West wing corridors echo with phantom footsteps. The carpet shows wear patterns from decades of restless pacing.' },
        { name: 'central_hall', minX: 15, maxX: 25, minY: 12, maxY: 20,
          desc: 'The central hallway connects all wings. Mirrors along the walls reflect more than they should.' }
      ];
      
      const oldArea = this._getPlayerArea(oldX, oldY, areas);
      const newArea = this._getPlayerArea(newX, newY, areas);
      
      if (newArea && newArea !== oldArea && Math.random() < 0.3) {
        this._setNarration(newArea.desc, 5);
      }
    }

    _getPlayerArea(x, y, areas) {
      return areas.find(area => 
        x >= area.minX && x <= area.maxX && 
        y >= area.minY && y <= area.maxY
      );
    }

    _updateGhost(delta) {
      const dx = this.player.x - this.ghost.x;
      const dy = this.player.y - this.ghost.y;
      const distance = Math.hypot(dx, dy);

      // Enhanced ghost behavior - more aggressive
      if (this.ghost.state === 'chase') {
        this.ghost.pursueTimer -= delta;
        if (this.ghost.pursueTimer <= 0) {
          this.ghost.state = 'patrol';
          this._setNarration('The shadows reclaim the apparition.', 3);
        }
      } else if (distance < CONFIG.GHOST_DETECTION_RANGE && this._lineOfSight(this.ghost.x, this.ghost.y, this.player.x, this.player.y)) {
        this.ghost.state = 'chase';
        this.ghost.pursueTimer = 8; // Longer chase time
        this.audio.playGhostWhisper();
        this._setNarration('The apparition snaps toward you, glass eyes wide.', 4);
        this._flashThreat(0.4); // More visible threat flash
      }

      // Enhanced movement with better AI
      let targetX, targetY;
      if (this.ghost.state === 'chase') {
        // Smarter chasing - predict player movement
        const playerVelX = Math.cos(this.player.angle) * 0.5;
        const playerVelY = Math.sin(this.player.angle) * 0.5;
        targetX = this.player.x + playerVelX;
        targetY = this.player.y + playerVelY;
        this.ghost.speed = CONFIG.GHOST_CHASE_SPEED_BASE + this.fear * 1.2; // Faster based on fear
      } else {
        const target = this.ghost.path[this.ghost.pathIndex];
        targetX = target.x;
        targetY = target.y;
        this.ghost.speed = CONFIG.GHOST_PATROL_SPEED * (1 + this.fear * 0.3); // Fear affects patrol speed
        if (Math.hypot(targetX - this.ghost.x, targetY - this.ghost.y) < 0.2) {
          this.ghost.pathIndex = (this.ghost.pathIndex + 1) % this.ghost.path.length;
        }
      }

      const angle = Math.atan2(targetY - this.ghost.y, targetX - this.ghost.x);
      const step = this.ghost.speed * delta;
      const testX = this.ghost.x + Math.cos(angle) * step;
      const testY = this.ghost.y + Math.sin(angle) * step;

      if (!this._isSolid(testX, testY)) {
        this.ghost.x = testX;
        this.ghost.y = testY;
      } else {
        // Ghost can phase through walls occasionally when chasing
        if (this.ghost.state === 'chase' && Math.random() < 0.1) {
          this.ghost.x = testX;
          this.ghost.y = testY;
          this._setNarration('The entity passes through matter as if it were mist.', 3);
        }
      }

      // More dramatic phase animation
      this.ghost.phase = (this.ghost.phase + delta * 4) % (Math.PI * 2);

      // Enhanced proximity effects
      if (!this.caseClosed && distance < CONFIG.GHOST_PROXIMITY_RANGE) {
        const proximityFactor = (CONFIG.GHOST_PROXIMITY_RANGE - distance) / CONFIG.GHOST_PROXIMITY_RANGE;
        this._adjustFear(this.fear + proximityFactor * 0.035 * delta * 60);
        this._flashThreat(0.2 + proximityFactor * 0.15);
        this.audio.playHeartbeat(this.fear);
        
        // More frequent whispers when close
        if (distance < 4 && Math.random() < 0.02) {
          this.audio.playGhostWhisper();
          const whispers = [
            'A whisper leaks through the vents: "You were expected."',
            'The air grows cold. Something speaks: "Join us."',
            'A voice like breaking glass: "Detective... we remember you."',
            'The shadows murmur: "This hotel never lets go."'
          ];
          this._setNarration(whispers[Math.floor(Math.random() * whispers.length)], 4);
        }
      }

      // Critical contact distance
      if (distance < CONFIG.GHOST_CONTACT_RANGE) {
        this._failInvestigation('The apparition presses a frostbitten hand against your throat.');
      }
    }

    _updateClues(delta) {
      this.clues.forEach((clue, index) => {
        clue.pulse = 0.85 + Math.sin(performance.now() * 0.003 + index) * 0.15;
        if (!clue.found && Math.hypot(this.player.x - clue.x, this.player.y - clue.y) < 1) {
          clue.found = true;
          clue.entry.classList.add('found');
          this.cluesFound += 1;
          this.audio.playCluePickup();
          this._setNarration(clue.detail, 6);
          this._updateClueUI();
          if (this.cluesFound === this.clues.length) {
            this.audio.playElevatorDing();
            this._setNarration('All evidence logged. The service elevator door should finally obey you.', 6);
          }
        }
      });

      if (this.cluesFound === this.clues.length && !this.caseClosed) {
        const dist = Math.hypot(this.player.x - this.exitPosition.x, this.player.y - this.exitPosition.y);
        if (dist < 4 && !this.exitPrompted) {
          this.exitPrompted = true;
          this.audio.playElevatorDing();
          this._setNarration('The mural concealing the elevator vibrates with heat. Step closer.', 5);
        }
        if (dist < 1.1) {
          this._concludeInvestigation();
        }
      }
    }

    _regulateFear(delta) {
      if (!this.running || this.caseClosed || this.failState) return;
      let drift = CONFIG.FEAR_INCREASE_PER_FRAME * delta * 60;
      const nearLamp = this.lights.some((light) => Math.hypot(this.player.x - light.x, this.player.y - light.y) < light.radius);
      if (nearLamp) {
        drift -= CONFIG.FEAR_LIGHT_DECREASE * delta * 60;
      }
      this._adjustFear(this.fear + drift);
      if (this.fear > CONFIG.FEAR_BREATH_ALERT_THRESHOLD) {
        this._setNarration('Your pulse spikes. Press E to steady your breathing.', 3);
      }
    }

    _handleIdle(delta) {
      if (!this.running || this.caseClosed || this.failState) return;
      this.idleTimer += delta;
      if (this.idleTimer > CONFIG.IDLE_NARRATION_THRESHOLD) {
        this.idleTimer = CONFIG.IDLE_NARRATION_COOLDOWN;
        const whispers = [
          'The chandeliers tinkle as though they are underwater.',
          'Every elevator light flickers a six that is not on the panel.',
          'Footsteps circle overhead despite the dust remaining untouched.',
          'Salt wind pours from the vents, smelling like midnight tide.',
          'Wallpaper bubbles in and out with the rhythm of lungs.',
          'Something wet drips from the ceiling, but the floor remains dry.',
          'The mirrors reflect a lobby you don\'t recognize.'
        ];
        const line = whispers[Math.floor(Math.random() * whispers.length)];
        this._setNarration(line, 5);
      }
    }

    _failInvestigation(reason) {
      if (this.failState) return;
      this.failState = true;
      this.running = false;
      this.audio.playFailSound();
      document.exitPointerLock();
      this.startButton.dataset.state = 'restart';
      this.startButton.textContent = 'Reopen the case';
      this.startButton.classList.remove('hidden');
      this._setNarration(reason, 0);
    }

    _concludeInvestigation() {
      if (this.caseClosed) return;
      this.caseClosed = true;
      this.running = false;
      this.audio.playWinSound();
      document.exitPointerLock();
      this.startButton.dataset.state = 'restart';
      this.startButton.textContent = 'Reopen the case';
      this.startButton.classList.remove('hidden');
      this._setNarration('You transmit the full report before the hotel can turn you into the next exhibit. The case is closed. For now.', 0);
    }

    _resetGame() {
      this.player = { ...this.playerStart };
      this.ghost = {
        x: 13.5,
        y: 4.5,
        path: this.ghost.path,
        pathIndex: 1,
        state: 'patrol',
        speed: 1.3,
        pursueTimer: 0,
        phase: 0
      };
      this.cluesFound = 0;
      this.exitPrompted = false;
      this.failState = false;
      this.caseClosed = false;
      this.fear = 0.2;
      this.breathCooldown = 0;
      this.idleTimer = 0;
      this._adjustFear(this.fear);
      this.clues.forEach((clue) => {
        clue.found = false;
        clue.entry.classList.remove('found');
      });
      this._updateClueUI();
      this.threatFlash.style.opacity = '0';
      this.particles.particles = [];
      this._setNarration('The lobby lights buzz to life as you breach the caution tape again.', 5);
    }

    _castRay(angle) {
      const sin = Math.sin(angle);
      const cos = Math.cos(angle);
      let mapX = Math.floor(this.player.x);
      let mapY = Math.floor(this.player.y);
      const deltaDistX = Math.abs(1 / (cos || 0.0001));
      const deltaDistY = Math.abs(1 / (sin || 0.0001));
      let stepX, stepY, sideDistX, sideDistY;

      if (cos < 0) {
        stepX = -1;
        sideDistX = (this.player.x - mapX) * deltaDistX;
      } else {
        stepX = 1;
        sideDistX = (mapX + 1 - this.player.x) * deltaDistX;
      }

      if (sin < 0) {
        stepY = -1;
        sideDistY = (this.player.y - mapY) * deltaDistY;
      } else {
        stepY = 1;
        sideDistY = (mapY + 1 - this.player.y) * deltaDistY;
      }

      let hitTile = ' ';
      let hitSide = 0;

      while (true) {
        if (sideDistX < sideDistY) {
          sideDistX += deltaDistX;
          mapX += stepX;
          hitSide = 0;
        } else {
          sideDistY += deltaDistY;
          mapY += stepY;
          hitSide = 1;
        }
        hitTile = this._tileAt(mapX, mapY);
        if (hitTile === '#' || hitTile === 'E') break;
      }

      const distance = hitSide === 0 ? sideDistX - deltaDistX : sideDistY - deltaDistY;
      return { distance, tile: hitTile, side: hitSide };
    }

    _shadeColor(tile, distance, side) {
      // Brighter material system with different colors for different wall types
      let base;
      
      if (WALL_TYPES[tile]) {
        // Use wall type definitions
        const color = WALL_TYPES[tile].color;
        const rgb = this._hexToRgb(color);
        base = [rgb.r, rgb.g, rgb.b];
      } else {
        // Brighter fallback colors based on tile type
        switch(tile) {
          case 'E': base = this.caseClosed ? [80, 180, 140] : [200, 120, 80]; break;
          case 'L': base = [255, 255, 220]; break;  // Light sources
          case 'C': base = [200, 150, 255]; break; // Clue areas  
          case 'R': base = [150, 100, 60]; break;    // Reception desk
          case 'K': base = [120, 120, 150]; break;    // Kitchen
          case 'B': base = [150, 150, 170]; break;   // Bathroom
          case 'S': base = [160, 140, 100]; break;   // Stairs
          case 'G': base = [100, 100, 130]; break;    // Ghost areas
          default: base = [120, 100, 80]; break;     // Brighter default hotel walls
        }
      }
      
      // Brighter lighting with less distance falloff
      const shade = 1 / (1 + distance * 0.06); // Less aggressive falloff
      const sideFactor = side === 1 ? 0.85 : 1; // Less dramatic side shading
      
      // Add subtle texture variation
      const textureNoise = (Math.sin(distance * 10) * 0.05 + 1);
      
      // Boost overall brightness
      const brightnessFactor = 1.5;
      
      const r = Math.min(255, base[0] * shade * sideFactor * textureNoise * brightnessFactor);
      const g = Math.min(255, base[1] * shade * sideFactor * textureNoise * brightnessFactor);
      const b = Math.min(255, base[2] * shade * sideFactor * textureNoise * brightnessFactor);
      
      return `rgb(${r.toFixed(0)},${g.toFixed(0)},${b.toFixed(0)})`;
    }

    _hexToRgb(hex) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 45, g: 35, b: 25 };
    }

    _drawSprite(entity) {
      const dx = entity.x - this.player.x;
      const dy = entity.y - this.player.y;
      const distance = Math.hypot(dx, dy);
      const angleToSprite = Math.atan2(dy, dx) - this.player.angle;
      const normalized = Math.atan2(Math.sin(angleToSprite), Math.cos(angleToSprite));

      if (Math.abs(normalized) > CONFIG.FOV / 2 + 0.2 || distance <= 0.05) return;

      const spriteDistance = Math.cos(normalized) * distance;
      if (spriteDistance <= 0) return;

      const spriteHeight = (this.viewDistance * (entity.scale || 0.5)) / spriteDistance;
      const spriteWidth = spriteHeight * (entity.aspect || 0.7);
      const centerX = (normalized + CONFIG.FOV / 2) / CONFIG.FOV * this.viewWidth;
      const startX = Math.floor(centerX - spriteWidth / 2);
      const endX = Math.floor(centerX + spriteWidth / 2);
      const top = Math.floor(this.viewHeight / 2 - spriteHeight);

      this.ctx.globalAlpha = entity.alpha || 0.8;
      for (let x = startX; x < endX; x++) {
        if (x < 0 || x >= this.viewWidth || this.depthBuffer[x] < spriteDistance) continue;
        this.ctx.fillStyle = entity.color;
        this.ctx.fillRect(x, top, 1, spriteHeight);
      }
      this.ctx.globalAlpha = 1;
    }

    _drawSprites() {
      const sprites = [];

      // Enhanced clue rendering with better visibility
      this.clues.forEach((clue) => {
        if (!clue.found) {
          sprites.push({
            x: clue.x,
            y: clue.y,
            color: `rgba(255, 215, 0, ${0.8 + Math.sin(clue.pulse * 3) * 0.2})`, // Golden glow
            scale: 0.5 + Math.sin(clue.pulse * 2) * 0.1,
            alpha: 0.9,
            type: 'clue'
          });
        }
      });

      // Enhanced ghost rendering - much more visible and intimidating
      const ghostDistance = Math.hypot(this.ghost.x - this.player.x, this.ghost.y - this.player.y);
      const ghostThreat = Math.max(0.3, 1 - (ghostDistance / 15)); // Visibility based on distance
      
      sprites.push({
        x: this.ghost.x,
        y: this.ghost.y,
        color: `rgba(255, 100, 100, ${0.6 + Math.sin(this.ghost.phase * 2) * 0.3})`, // Red menacing glow
        scale: 1.2 + Math.sin(this.ghost.phase * 1.5) * 0.2, // Larger and more animated
        alpha: 0.8 * ghostThreat,
        type: 'ghost',
        glow: true
      });

      // Exit indicator when all clues found
      if (this.cluesFound === this.clues.length && !this.caseClosed) {
        sprites.push({
          x: this.exitPosition.x,
          y: this.exitPosition.y,
          color: 'rgba(0, 255, 100, 0.8)', // Bright green exit
          scale: 0.6 + Math.sin(Date.now() * 0.005) * 0.1,
          alpha: 0.9,
          type: 'exit'
        });
      }

      sprites
        .map((sprite) => {
          sprite.distance = Math.hypot(sprite.x - this.player.x, sprite.y - this.player.y);
          return sprite;
        })
        .sort((a, b) => b.distance - a.distance)
        .forEach((sprite) => this._drawSprite(sprite));
    }

    _renderScene() {
      // Brighter atmosphere - more visible environment
      this.ctx.fillStyle = '#2a2a35'; // Lighter ceiling
      this.ctx.fillRect(0, 0, this.viewWidth, this.viewHeight / 2);
      this.ctx.fillStyle = '#3a2a1a'; // Lighter floor
      this.ctx.fillRect(0, this.viewHeight / 2, this.viewWidth, this.viewHeight / 2);

      // Reduced fog for better visibility
      const fearFactor = this.fear * 0.1; // Less fog intensity
      
      for (let column = 0; column < this.viewWidth; column++) {
        const rayAngle = this.player.angle - CONFIG.FOV / 2 + (column / this.viewWidth) * CONFIG.FOV;
        const hit = this._castRay(rayAngle);
        const corrected = hit.distance * Math.cos(rayAngle - this.player.angle);
        this.depthBuffer[column] = corrected;
        const wallHeight = Math.min(this.viewHeight, this.viewDistance / Math.max(0.0001, corrected));
        const top = (this.viewHeight - wallHeight) / 2;
        
        // Brighter wall rendering
        this.ctx.fillStyle = this._shadeColor(hit.tile, corrected, hit.side);
        this.ctx.fillRect(column, top, 1, wallHeight);
        
        // Much lighter fog for better visibility
        const fogIntensity = Math.min(0.2, (corrected / 25) + fearFactor); // Reduced fog
        this.ctx.fillStyle = `rgba(20, 20, 30, ${fogIntensity})`; // Lighter fog color
        this.ctx.fillRect(column, 0, 1, this.viewHeight);
      }

      this._drawSprites();
      this._drawMinimap();
      
      // Add dynamic lighting effects
      this._renderLightingEffects();
      
      this.particles.draw(this.ctx, this.viewWidth, this.viewHeight, this.player, this.viewDistance, CONFIG.FOV);
    }

    _renderLightingEffects() {
      // Create subtle lighting variations based on proximity to light sources
      this.lights.forEach(light => {
        const dx = light.x - this.player.x;
        const dy = light.y - this.player.y;
        const distance = Math.hypot(dx, dy);
        
        if (distance < light.radius) {
          const intensity = (light.radius - distance) / light.radius;
          const lightAngle = Math.atan2(dy, dx);
          const angleDiff = Math.abs(lightAngle - this.player.angle);
          const normalizedAngle = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
          
          if (Math.abs(normalizedAngle) < CONFIG.FOV) {
            // Add warm light glow
            const gradient = this.ctx.createRadialGradient(
              this.viewWidth / 2, this.viewHeight / 2, 0,
              this.viewWidth / 2, this.viewHeight / 2, this.viewWidth * 0.7
            );
            gradient.addColorStop(0, `rgba(255, 200, 100, ${intensity * 0.1})`);
            gradient.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.viewWidth, this.viewHeight);
          }
        }
      });

      this._drawSprites();
      this._drawMinimap();
      this.particles.draw(this.ctx, this.viewWidth, this.viewHeight, this.player, this.viewDistance, CONFIG.FOV);
    }

    _drawMinimap() {
      if (!this.minimapCtx) return;
      
      const scale = 4; // Scale factor for minimap
      const mapW = this.mapWidth;
      const mapH = this.mapHeight;
      
      // Clear minimap
      this.minimapCtx.fillStyle = '#000';
      this.minimapCtx.fillRect(0, 0, 160, 190);
      
      // Draw map
      for (let y = 0; y < mapH; y++) {
        for (let x = 0; x < mapW; x++) {
          const cell = this.mapData[y][x];
          
          // Color based on cell type
          if (cell === '#' || cell === 'D' || cell === 'W' || cell === 'M') {
            this.minimapCtx.fillStyle = '#444'; // Walls
          } else if (cell === 'L') {
            this.minimapCtx.fillStyle = '#ff8'; // Lights
          } else if (cell === 'E') {
            this.minimapCtx.fillStyle = '#0f8'; // Exit
          } else if (cell === 'C') {
            this.minimapCtx.fillStyle = '#f80'; // Clue markers
          } else {
            this.minimapCtx.fillStyle = '#222'; // Floors
          }
          
          this.minimapCtx.fillRect(x * scale, y * scale, scale, scale);
        }
      }
      
      // Draw clues
      this.clues.forEach(clue => {
        if (!clue.found) {
          this.minimapCtx.fillStyle = '#ffd700';
          this.minimapCtx.fillRect(
            (clue.x - 0.2) * scale, 
            (clue.y - 0.2) * scale, 
            scale * 0.4, 
            scale * 0.4
          );
        }
      });
      
      // Draw ghost
      this.minimapCtx.fillStyle = '#f44';
      this.minimapCtx.fillRect(
        (this.ghost.x - 0.3) * scale,
        (this.ghost.y - 0.3) * scale,
        scale * 0.6,
        scale * 0.6
      );
      
      // Draw player
      this.minimapCtx.fillStyle = '#4f8';
      this.minimapCtx.fillRect(
        (this.player.x - 0.2) * scale,
        (this.player.y - 0.2) * scale,
        scale * 0.4,
        scale * 0.4
      );
      
      // Draw player direction
      const dirX = Math.cos(this.player.angle);
      const dirY = Math.sin(this.player.angle);
      this.minimapCtx.strokeStyle = '#4f8';
      this.minimapCtx.lineWidth = 1;
      this.minimapCtx.beginPath();
      this.minimapCtx.moveTo(this.player.x * scale, this.player.y * scale);
      this.minimapCtx.lineTo(
        (this.player.x + dirX * 1.5) * scale,
        (this.player.y + dirY * 1.5) * scale
      );
      this.minimapCtx.stroke();
    }

    _loop(timestamp) {
      if (!this.running) return;

      try {
        const delta = Math.min(0.05, (timestamp - this.lastFrame) / 1000);
        this.lastFrame = timestamp;

        this.breathCooldown = Math.max(0, this.breathCooldown - delta);

        this._updatePlayer(delta);
        this._updateGhost(delta);
        this._updateClues(delta);
        this._regulateFear(delta);
        this._handleIdle(delta);
        this.particles.update(delta);

        this._renderScene();

        if (!this.failState && !this.caseClosed) {
          requestAnimationFrame((ts) => this._loop(ts));
        }
      } catch (error) {
        console.error('Game loop error:', error);
        // Attempt to continue after a brief delay
        setTimeout(() => {
          if (!this.failState && !this.caseClosed) {
            requestAnimationFrame((ts) => this._loop(ts));
          }
        }, 100);
      }
    }

    _engageInvestigation() {
      if (this.failState || this.caseClosed) return;
      this.startButton.classList.add('hidden');
      this.running = true; // Start the game immediately
      this.lastFrame = performance.now();
      this.audio.init(); // Initialize audio on user interaction
      this.canvas.focus(); // Ensure canvas has focus for keyboard events
      
      // Try to get pointer lock for mouse look, but don't block game from running
      this.canvas.requestPointerLock();
      
      // Start the game loop immediately
      requestAnimationFrame((ts) => this._loop(ts));
      this._setNarration('The magnetic lock claps shut behind you. The hotel approves.', 4);
    }

    start() {
      this._resizeCanvas();
    }

    cleanup() {
      // Remove event listeners to prevent memory leaks
      if (this.resizeHandler) window.removeEventListener('resize', this.resizeHandler);
      if (this.keydownHandler) window.removeEventListener('keydown', this.keydownHandler);
      if (this.keyupHandler) window.removeEventListener('keyup', this.keyupHandler);
      if (this.mousemoveHandler) document.removeEventListener('mousemove', this.mousemoveHandler);
      if (this.pointerlockHandler) document.removeEventListener('pointerlockchange', this.pointerlockHandler);
      
      // Exit pointer lock
      if (document.pointerLockElement === this.canvas) {
        document.exitPointerLock();
      }
      
      // Stop audio context
      if (this.audio && this.audio.audioContext) {
        this.audio.audioContext.close();
      }
    }
  }

  // Initialize game when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const game = new HorrorGame();
      game.start();
    });
  } else {
    const game = new HorrorGame();
    game.start();
  }
})();
