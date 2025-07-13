# Rumi Extension - Final Production

A production-ready content indexing extension with timer-based block progression, fast mode, and accurate points/receipts system.

## 🚀 Features

### Core Functionality
- **Timer-based block progression** - Content blocks advance automatically based on real time
- **Fast mode support** - Speed up to 100x with turbo controls
- **Time skipping** - Jump forward 30s, 1m, 5m, or 10m increments
- **Backend integration** - Robust points calculation and session management
- **Accurate receipts** - Detailed session summaries with content breakdown

### Entry Points
- **Detection Mode** - Index detected content (0.1 pts/s base rate)
- **Automode** - Automatic content indexing (0.25 pts/s base rate)

### Multiplier System
- **0-30min**: 1.0x (base rate)
- **30-60min**: 1.1x
- **60-90min**: 1.2x
- **90-120min**: 1.4x
- **120-180min**: 1.6x
- **180min+**: 1.8x

### UI Components
- **Nokia-style ASCII display** - Dynamic content visualization
- **Points tracking** - Real-time points and pending earnings
- **Channel integration** - Content progression visualization
- **Debug panel** - Development and testing tools
- **Message system** - User feedback and status updates

## 📁 Project Structure

```
rumi-final/
├── index.html              # Main application
├── channel.html            # Channel iframe
├── favicon.svg             # Project icon
├── README.md               # This file
└── js/
    ├── backend-engine.js   # Points calculation engine
    ├── backend-integration.js # Frontend-backend hooks
    ├── ascii-display.js    # Nokia-style display
    └── main.js             # Main application logic
```

## 🛠️ Technical Architecture

### Backend Engine (`backend-engine.js`)
- **Segmented points calculation** - Accurate multiplier application
- **Session management** - Content tracking and state persistence
- **Content library** - Sample content with metadata
- **Receipt generation** - Detailed session summaries

### Integration Layer (`backend-integration.js`)
- **Function hooks** - Seamless frontend-backend integration
- **Fast mode management** - Speed acceleration handling
- **Message passing** - Channel iframe communication
- **State synchronization** - UI-backend data consistency

### ASCII Display (`ascii-display.js`)
- **Dynamic patterns** - Genre-specific ASCII art
- **Scrolling metadata** - Content information display
- **Animation system** - Smooth transitions and effects
- **Fast mode support** - Accelerated animations

### Main Application (`main.js`)
- **Timer-based progression** - Real-time content advancement
- **UI state management** - View transitions and updates
- **User interaction** - Entry points, controls, and feedback
- **Debug tools** - Development and testing utilities

## 🎮 Usage

### Getting Started
1. Open `index.html` in a modern browser
2. Select an entry point (Detection or Automode)
3. Click "START INDEXING" to begin
4. Use turbo controls to adjust speed (1x-100x)
5. Use skip buttons to jump forward in time
6. View detailed receipts when sessions complete

### Controls
- **Primary CTA**: Start/Stop indexing
- **Turbo Buttons**: 1x, 5x, 10x, 50x, 100x speed
- **Skip Buttons**: +30s, +1m, +5m, +10m
- **Channel Toggle**: Expand/collapse content view
- **Debug Panel**: Development tools (bottom-left)

### Debug Features
- **Show State**: Display current app state
- **Reset Session**: Clear all session data
- **Toggle Pause**: Pause/resume indexing
- **Load Content**: Reload content library
- **Simulate Error**: Test error handling
- **Crash**: Test crash recovery

## 🔧 Development

### Adding Content
Content is managed in `backend-engine.js`:

```javascript
this.contentLibrary = [
    { 
        title: 'Show Title S1E1', 
        genre: 'drama', 
        duration: 47, 
        service: 'Netflix', 
        year: 2008 
    }
];
```

### Modifying Multipliers
Multiplier thresholds are in `backend-engine.js`:

```javascript
const milestones = [
    { time: 0, multiplier: 1.0 },
    { time: 30, multiplier: 1.1 },
    // ... more milestones
];
```

### Customizing ASCII Art
Patterns are defined in `ascii-display.js`:

```javascript
const templates = {
    'drama': [
        // ASCII patterns for drama genre
    ]
};
```

## 🎯 Key Features Explained

### Timer-Based Progression
- Content blocks advance based on real elapsed time
- Fast mode accelerates progression proportionally
- Skip buttons advance time instantly
- Backend tracks cumulative session time

### Backend Integration
- All points calculations use backend engine
- Session data persists across interactions
- Receipts show accurate backend data
- Channel iframe receives real-time updates

### Fast Mode
- Speed multipliers affect progression rate
- ASCII animations accelerate accordingly
- Points calculation remains accurate
- UI updates reflect current speed

### Receipt System
- Shows total points earned
- Lists all indexed content
- Displays multiplier bonuses
- Tracks session duration

## 🚀 Production Ready

This project includes:
- ✅ Robust error handling
- ✅ Comprehensive logging
- ✅ Debug tools for development
- ✅ Modular architecture
- ✅ Clean separation of concerns
- ✅ Responsive UI design
- ✅ Cross-browser compatibility

## 📝 License

This project is part of the Rumi Extension development.

---

**Ready to index content and earn points! 🎯** 