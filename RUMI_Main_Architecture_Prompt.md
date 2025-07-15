# 🏗️ RUMI Main Architecture Diagram Prompt

## 📋 **Comprehensive System Architecture Diagram Request**

Create a complete set of architecture diagrams for the RUMI (Rewards for User Media Indexing) browser extension system. Generate the following 6 diagrams with detailed implementation accuracy:

---

## 🎯 **Diagram 1: System Architecture Overview**
**High-level component diagram showing the complete RUMI system architecture**

**Include:**
- Browser Extension Interface
- Content Detection Engine  
- Points Calculation System
- Intelligence Bucket System
- Dashboard Cycling System
- Error Handling & Recovery
- Debug & Testing Tools
- Data Storage & Validation

**Key Components:**
```html
<!-- Main Entry Point -->
<div class="activation-container" id="activation-circle" onclick="activateExtension()">
    <div class="activation-circle"></div>
    <div class="activation-text">Activate Extension</div>
</div>

<!-- Dual Mode Selection -->
<div style="background: linear-gradient(135deg, #00ff41, #00cc33);">
    <select id="detection-mode-dropdown">
        <option value="">Select Show/Movie...</option>
    </select>
    <button id="stream-detected-button" onclick="launchWithDetection()">
        Select Show to Launch
    </button>
</div>

<div style="background: linear-gradient(135deg, #6b46c1, #553c9a);">
    <select id="automode-dropdown">
        <option value="">Select Intelligence Bucket...</option>
    </select>
    <button id="automode-button" onclick="launchWithAutomode()">
        Select Intelligence Bucket to Launch
    </button>
</div>
```

**State Management:**
```javascript
const appState = {
    isIndexing: false,
    currentMultiplier: 1.0,
    sessionEarnings: 0,
    indexedContent: [],
    entryPoint: null
};
```

---

## 🎯 **Diagram 2: User Journey Flow**
**Complete user experience from activation to completion**

**Include:**
- Activation Gate State (overlay blocking interaction)
- Entry Point Selection (Detection Mode vs Automode)
- Section Navigation (1a/1b → 2a/2b → 3a/3b → 4a/4b)
- Progress Bar with Diamond Milestones
- Points Display (pending/validated)
- Dashboard Cycling (4 learning stages)
- Debug and Tests Panels

**Key Code Structures:**
```css
/* Activation Gate */
.activation-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
    z-index: 10000;
    display: flex;
    justify-content: center;
    align-items: center;
}

/* Debug/Tests Buttons */
.debug-trigger, .tests-trigger {
    background: rgba(0,0,0,0.8);
    border: 2px solid #fff;
    color: #fff;
    padding: 6px 12px;
    font-size: 16px;
    font-weight: 600;
}
```

**Theme Application:**
```javascript
function applyTheme(mode) {
    if (mode === 'detection') {
        document.documentElement.style.setProperty('--theme-color', '#00ff41');
    } else if (mode === 'automode') {
        document.documentElement.style.setProperty('--theme-color', '#ffff00');
    }
}
```

---

## 🎯 **Diagram 3: Points Calculation System**
**Data flow for points calculation and validation**

**Include:**
- Point Sources (base rates, multipliers, bonuses)
- Calculation Engine (real-time accumulation)
- Validation Pipeline (pending → 24hr → lifetime)
- Progress Bar Diamond System
- Session State Tracking

**Key Code Structures:**
```javascript
function calculatePoints(elapsedTime, mode) {
    const baseRate = mode === 'automode' ? 0.12 : 0.1;
    const multiplier = calculateMultiplier(elapsedTime);
    return (baseRate * multiplier * elapsedTime) / 5;
}

function calculateMultiplier(elapsedTime) {
    const milestones = [
        { time: 300, multiplier: 1.5 },   // 5 minutes
        { time: 600, multiplier: 2.0 },   // 10 minutes
        { time: 900, multiplier: 2.5 },   // 15 minutes
        { time: 1200, multiplier: 3.0 },  // 20 minutes
        { time: 1500, multiplier: 3.5 }   // 25 minutes
    ];
    
    for (let milestone of milestones.reverse()) {
        if (elapsedTime >= milestone.time) {
            return milestone.multiplier;
        }
    }
    return 1.0;
}

// Real-time updates
function updatePoints() {
    if (appState.isIndexing) {
        const elapsed = (Date.now() - appState.indexingStartTime) / 1000;
        const newPoints = calculatePoints(elapsed, appState.entryPoint);
        appState.sessionEarnings = newPoints;
        updatePointsDisplay();
    }
}

setInterval(updatePoints, 5000); // Update every 5 seconds
```

---

## 🎯 **Diagram 4: Component Dependencies**
**Detailed component relationships and communication**

**Include:**
- Core Components (Activation, Points, Progress, Dashboard, Error Handling)
- Data Components (Content Library, State Management, Session Persistence)
- UI Components (Entry Selection, Channel Management, Progress Visualization)
- External Dependencies (Browser APIs, CSV Data, Local Storage)

**Key Code Structures:**
```javascript
// Event Bus System
class EventBus {
    constructor() {
        this.events = {};
    }
    
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }
    
    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(data));
        }
    }
}

// State Management
class StateManager {
    constructor() {
        this.state = {
            isIndexing: false,
            currentMultiplier: 1.0,
            sessionEarnings: 0,
            indexedContent: [],
            entryPoint: null,
            errorState: null
        };
        this.listeners = [];
    }
    
    update(newState) {
        this.state = { ...this.state, ...newState };
        this.notifyListeners();
    }
}

// Component Communication
eventBus.on('pointsUpdated', (points) => {
    updatePointsDisplay(points);
    updateProgressBar(points);
});

eventBus.on('errorOccurred', (error) => {
    showErrorMessage(error);
    pauseIndexing();
});
```

---

## 🎯 **Diagram 5: Debug & Testing Architecture**
**Development tools and testing infrastructure**

**Include:**
- Debug Panel Structure (Basic Testing, Error Testing, Session Management)
- Tests Panel Structure (Core System, Intelligence & Learning, UI Tests)
- Keyboard Shortcuts (Ctrl+Shift+D, Ctrl+Shift+T)
- External Test Links (ASCII, CSV, Iframe, etc.)

**Key Code Structures:**
```html
<!-- Debug Panel -->
<div class="debug-panel" id="debug-panel">
    <div class="debug-panel-header">
        <span>Rumi Debug</span>
        <button class="debug-panel-toggle">▼</button>
    </div>
    <div class="debug-panel-content">
        <div class="debug-section">
            <div class="debug-section-header">
                <span>Basic Testing</span>
            </div>
            <div class="debug-section-content">
                <button onclick="Tracker.showDebugOverlay()">Show Tracker</button>
                <button onclick="showState()">Show State</button>
            </div>
        </div>
    </div>
</div>

<!-- Tests Panel -->
<div class="tests-panel" id="tests-panel">
    <div class="tests-panel-header">
        <span>Rumi Tests</span>
        <button class="tests-panel-toggle">▼</button>
    </div>
    <div class="tests-panel-content">
        <div class="tests-section">
            <div class="tests-section-header">
                <span>Core System Tests</span>
            </div>
            <div class="tests-section-content">
                <a href="asciiartstuff/ascii-shapes-standalone.html" target="_blank" class="test-button">
                    🎨 ASCII Shapes Test
                </a>
                <a href="microtests/csv-processing-standalone.html" target="_blank" class="test-button">
                    📊 CSV Processing Test
                </a>
            </div>
        </div>
    </div>
</div>
```

**Panel Toggle Functions:**
```javascript
function toggleDebugPanel() {
    const panel = document.getElementById('debug-panel');
    const trigger = document.querySelector('.debug-trigger');
    
    if (panel.classList.contains('visible')) {
        panel.classList.remove('visible');
        trigger.style.display = 'block';
    } else {
        panel.classList.add('visible');
        trigger.style.display = 'none';
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        toggleDebugPanel();
    }
    if (event.ctrlKey && event.shiftKey && event.key === 'T') {
        event.preventDefault();
        toggleTestsPanel();
    }
});
```

---

## 🎯 **Diagram 6: Performance & Responsive Design**
**Optimization strategies and mobile architecture**

**Include:**
- Performance Components (60fps animations, real-time calculations)
- Responsive Design System (mobile-first CSS, breakpoints)
- Mobile-Specific Features (touch interactions, screen adaptations)
- Cross-Platform Compatibility (browser APIs, polyfills)

**Key Code Structures:**
```css
/* Responsive Breakpoints */
.container {
    width: 100%;
    padding: 10px;
}

@media (min-width: 768px) {
    .container {
        width: 90%;
        max-width: 1200px;
        margin: 0 auto;
    }
}

@media (min-width: 1024px) {
    .container {
        width: 80%;
        padding: 20px;
    }
}

/* Mobile-specific adjustments */
@media (max-width: 767px) {
    .debug-trigger, .tests-trigger {
        font-size: 14px;
        padding: 8px 16px;
    }
    
    .activation-circle {
        width: 120px;
        height: 120px;
    }
}

/* Touch-friendly interface */
.debug-trigger, .tests-trigger, .activation-circle {
    min-height: 44px;
    min-width: 44px;
    touch-action: manipulation;
}

input, select, textarea {
    font-size: 16px; /* Prevents iOS zoom */
    touch-action: manipulation;
}
```

**Performance Optimization:**
```javascript
// Debounced updates
let updateTimeout;
function debouncedUpdatePoints() {
    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(() => {
        if (appState.isIndexing) {
            updatePoints();
            updateProgressBar();
        }
    }, 100); // 100ms debounce
}

// Memory management
class MemoryManager {
    constructor() {
        this.maxHistorySize = 1000;
        this.cleanupInterval = 60000; // 1 minute
    }
    
    cleanupOldData() {
        if (appState.indexedContent.length > this.maxHistorySize) {
            appState.indexedContent = appState.indexedContent.slice(-this.maxHistorySize);
        }
    }
}

// Performance monitoring
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            frameRate: 0,
            memoryUsage: 0,
            responseTime: 0
        };
    }
    
    measureFrameRate() {
        let frameCount = 0;
        let lastTime = performance.now();
        
        const measure = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                this.metrics.frameRate = frameCount;
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(measure);
        };
        
        requestAnimationFrame(measure);
    }
}
```

---

## 🎨 **Visual Style Requirements**

**For All Diagrams:**
- Use consistent, professional styling
- Include clear component boundaries
- Show flow arrows with direction
- Add detailed legends explaining connections
- Use color coding:
  - **Green (#00ff41)** for Detection Mode
  - **Yellow (#ffff00)** for Automode
  - **Purple (#6b46c1)** for Automode selection
  - **White** for debug/test buttons
- Include code excerpts where relevant for implementation accuracy
- Show data flow patterns and state management
- Display error handling and recovery systems
- Illustrate mobile responsiveness considerations

**Diagram Types:**
- System architecture overview
- User journey flow charts
- Data flow diagrams
- Component dependency maps
- Technical implementation blueprints
- Performance optimization strategies

---

## 📋 **Expected Deliverables**

Generate 6 comprehensive diagrams that provide:
1. **Clear Visual Understanding** of system relationships
2. **Implementation Guidance** for development
3. **Troubleshooting Aids** for issue identification
4. **Documentation Support** for system explanation
5. **Communication Tools** for stakeholder presentations

Each diagram should be self-contained yet interconnected, showing how the RUMI system maintains performance across different devices and usage patterns while providing a consistent user experience. 