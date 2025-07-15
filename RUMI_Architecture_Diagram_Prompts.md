# 🏗️ RUMI Architecture & System Diagram Prompts

## 📋 **Overview**
This document contains a series of prompts designed to generate comprehensive architecture and system diagrams for the RUMI (Rewards for User Media Indexing) project. Use these prompts with Claude to create visual representations that provide deep understanding of the system's architecture, data flow, and component interactions.

---

## 🎯 **Prompt Series 1: High-Level System Architecture**

### **Prompt 1.1: Overall System Architecture**
```
Create a high-level system architecture diagram for the RUMI (Rewards for User Media Indexing) browser extension system. 

Key Components to Include:
- Browser Extension Interface
- Content Detection Engine
- Points Calculation System
- Intelligence Bucket System
- Dashboard Cycling System
- Error Handling & Recovery
- Debug & Testing Tools
- Data Storage & Validation

The diagram should show:
1. Main user entry points (Detection Mode vs Automode)
2. Core system components and their relationships
3. Data flow between components
4. External interfaces (browser APIs, content sources)
5. State management and persistence

Use a clean, professional style with clear component boundaries and flow arrows. Include a legend explaining the different types of connections and components.

Reference these key code structures:

**Main Entry Point:**
```html
<div class="activation-container" id="activation-circle" onclick="activateExtension()">
    <div class="activation-circle"></div>
    <div class="activation-text">Activate Extension</div>
</div>
```

**Dual Mode Selection:**
```html
<!-- Detection Mode -->
<div style="background: linear-gradient(135deg, #00ff41, #00cc33);">
    <select id="detection-mode-dropdown">
        <option value="">Select Show/Movie...</option>
    </select>
    <button id="stream-detected-button" onclick="launchWithDetection()">
        Select Show to Launch
    </button>
</div>

<!-- Automode -->
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
```

### **Prompt 1.2: Dual-Mode System Architecture**
```
Create a detailed diagram showing the dual-mode architecture of the RUMI system, specifically highlighting the differences between Detection Mode and Automode.

Include:
1. **Detection Mode Flow:**
   - Passive content detection
   - Green theme (#00ff41)
   - Automatic content processing
   - Show-based transitions

2. **Automode Flow:**
   - Active intelligence bucket selection
   - Yellow theme (#ffff00)
   - Manual content transitions
   - Item-based transitions

3. **Shared Components:**
   - Points calculation system
   - Progress bar with diamond milestones
   - Dashboard cycling (4 learning stages)
   - Error handling and recovery

4. **Mode-Specific Features:**
   - Detection: Genre channel management
   - Automode: Intelligence bucket system
   - Different validation requirements
   - Enhanced point rates for automode

Show how users can switch between modes and how the system adapts its behavior accordingly.
```

---

## 🎯 **Prompt Series 2: User Interface & Experience Flow**

### **Prompt 2.1: User Journey & Interface States**
```
Create a user journey diagram showing the complete flow through the RUMI interface, from initial activation to session completion.

Include these key states and transitions:

1. **Activation Gate State:**
   - Overlay blocking interaction
   - "Activate Extension" button
   - Disabled UI elements

2. **Entry Point Selection:**
   - Detection Mode (green section)
   - Automode Campaign (purple section)
   - Dropdown selections and validation

3. **Section Navigation:**
   - Section 1a/1b: Confirmation screens
   - Section 2a/2b: Channel management
   - Section 3a/3b: Active indexing with dashboard
   - Section 4a/4b: Receipt and completion

4. **Key UI Elements:**
   - Progress bar with diamond milestones
   - Points display (pending/validated)
   - Dashboard cycling through 4 learning stages
   - Debug and Tests panels (white buttons with white borders)

5. **Theme Consistency:**
   - Green theme for detection mode
   - Yellow theme for automode
   - Consistent color application across all elements

Show the decision points, validation requirements, and how the interface adapts to different modes.

Reference these key code structures:

**Activation Gate CSS:**
```css
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
```

**Debug/Tests Button Styling:**
```css
.debug-trigger, .tests-trigger {
    background: rgba(0,0,0,0.8);
    border: 2px solid #fff;
    color: #fff;
    padding: 6px 12px;
    font-size: 16px;
    font-weight: 600;
}
```

**Section Navigation Logic:**
```javascript
function showSection2a() {
    // Detection mode channel management
    document.getElementById('section-2a').style.display = 'block';
    document.getElementById('section-2b').style.display = 'none';
}

function showSection2b() {
    // Automode channel management
    document.getElementById('section-2a').style.display = 'none';
    document.getElementById('section-2b').style.display = 'block';
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
```

### **Prompt 2.2: Dashboard Cycling & Learning Stages**
```
Create a detailed diagram of the dashboard cycling system that shows how the learning progress dashboard cycles through 4 learning stages.

Include:

1. **Dashboard Structure:**
   - 4 learning stage items
   - Only one active at a time
   - Visual theme indicators (green/yellow)
   - Progress indicators

2. **Cycling Triggers:**
   - Detection Mode: Show transitions
   - Automode: Item transitions
   - Manual triggers via debug panel

3. **Learning Stages:**
   - Stage 1: Content Discovery
   - Stage 2: Pattern Recognition
   - Stage 3: Intelligence Processing
   - Stage 4: Knowledge Integration

4. **Visual Feedback:**
   - Active stage highlighting
   - Inactive stage styling
   - Smooth transitions between stages
   - Theme color consistency

5. **Integration Points:**
   - Content transition detection
   - Points calculation system
   - Error handling integration
   - Debug panel controls

Show the timing, triggers, and visual feedback for each stage transition.
```

---

## 🎯 **Prompt Series 3: Data Flow & State Management**

### **Prompt 3.1: Points Calculation & Validation System**
```
Create a data flow diagram for the RUMI points calculation and validation system.

Include:

1. **Point Sources:**
   - Base rates (detection: 0.1 pts/5s, automode: 0.12 pts/5s)
   - Multiplier effects (1.0x → 1.5x → 2.0x → 2.5x → 3.0x → 3.5x+)
   - Milestone bonuses
   - Session completion bonuses

2. **Calculation Engine:**
   - Real-time point accumulation
   - Multiplier calculation based on elapsed time
   - Progress bar diamond milestone system
   - Session state tracking

3. **Validation Pipeline:**
   - Pending points (immediate)
   - 24-hour validation period
   - Backend validation simulation
   - Lifetime points (validated)

4. **State Management:**
   - Session state persistence
   - Point history tracking
   - Validation status monitoring
   - Receipt generation

5. **Integration Points:**
   - UI updates (real-time display)
   - Receipt generation
   - Debug panel controls
   - Error handling

Show the complete flow from point generation to final validation, including all intermediate states and calculations.

Reference these key code structures:

**Points Calculation Engine:**
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
```

**Real-time Point Accumulation:**
```javascript
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

**Progress Bar Diamond System:**
```javascript
function updateProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    const diamonds = document.querySelectorAll('.progress-diamond');
    
    diamonds.forEach((diamond, index) => {
        const milestone = milestones[index];
        if (elapsedTime >= milestone.time) {
            diamond.classList.add('completed');
            diamond.style.backgroundColor = milestone.color;
        }
    });
}
```

**Validation Pipeline:**
```javascript
const validationPipeline = {
    pending: 0,
    lifetime: 0,
    
    addPending(points) {
        this.pending += points;
        updatePointsDisplay();
    },
    
    validate() {
        this.lifetime += this.pending;
        this.pending = 0;
        updatePointsDisplay();
    }
};
```
```

### **Prompt 3.2: Content Management & Metadata System**
```
Create a diagram showing the content management and metadata processing system in RUMI.

Include:

1. **Content Sources:**
   - CSV-based content library
   - Genre categorization
   - Metadata extraction
   - Content validation

2. **Content Processing:**
   - Detection mode: Passive content processing
   - Automode: Active content selection
   - Metadata flag processing
   - Classification systems

3. **Channel Management:**
   - Genre-based filtering
   - Content addition/removal
   - Timeline management
   - Session persistence

4. **Metadata System:**
   - Content intelligence buckets
   - Learning category classification
   - Point potential calculation
   - Multiplier information

5. **Integration Points:**
   - Dashboard cycling triggers
   - Points calculation influence
   - Error handling for misclassified content
   - Debug panel content tracking

Show how content flows through the system, how metadata affects behavior, and how the system handles different content types.
```

---

## 🎯 **Prompt Series 4: Technical Implementation & Components**

### **Prompt 4.1: Component Architecture & Dependencies**
```
Create a detailed component architecture diagram for the RUMI system showing all major components and their dependencies.

Include:

1. **Core Components:**
   - Activation Gate System
   - Points Calculation Engine
   - Progress Bar System
   - Dashboard Cycling Engine
   - Error Handling System
   - Debug Panel System
   - Tests Panel System

2. **Data Components:**
   - Content Library Manager
   - State Management System
   - Session Persistence
   - Validation Pipeline

3. **UI Components:**
   - Entry Point Selection
   - Channel Management Interface
   - Progress Visualization
   - Receipt Generation
   - Error Display System

4. **External Dependencies:**
   - Browser Extension APIs
   - CSV Data Sources
   - Local Storage
   - Animation Systems

5. **Component Interactions:**
   - Event handling between components
   - Data flow patterns
   - State synchronization
   - Error propagation

Show the relationships, dependencies, and communication patterns between all major components.

Reference these key code structures:

**Component Event System:**
```javascript
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

const eventBus = new EventBus();
```

**State Management System:**
```javascript
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
    
    subscribe(listener) {
        this.listeners.push(listener);
    }
    
    notifyListeners() {
        this.listeners.forEach(listener => listener(this.state));
    }
}
```

**Component Communication:**
```javascript
// Points Engine communicates with UI
eventBus.on('pointsUpdated', (points) => {
    updatePointsDisplay(points);
    updateProgressBar(points);
});

// Error Handler communicates with UI
eventBus.on('errorOccurred', (error) => {
    showErrorMessage(error);
    pauseIndexing();
});

// Debug Panel communicates with components
eventBus.on('debugCommand', (command) => {
    switch(command.type) {
        case 'skipTime':
            skipTime(command.seconds);
            break;
        case 'simulateError':
            simulateError(command.errorType);
            break;
    }
});
```

**Component Dependencies:**
```javascript
// Points Calculation Engine depends on:
// - State Manager (for current state)
// - Event Bus (for notifications)
// - UI Components (for display updates)

// Dashboard Cycling Engine depends on:
// - Content Manager (for transition detection)
// - State Manager (for current mode)
// - UI Components (for visual updates)

// Error Handling System depends on:
// - All other components (for error detection)
// - State Manager (for error state)
// - UI Components (for error display)
```
```

### **Prompt 4.2: Error Handling & Recovery System**
```
Create a comprehensive diagram of the RUMI error handling and recovery system.

Include:

1. **Error Types:**
   - Volume Error (playback issues)
   - Speed Error (playback speed problems)
   - Language Error (audio language issues)
   - System Error (general system problems)
   - Network Error (connection issues)
   - Browser Error (browser-specific issues)

2. **Error Detection:**
   - Real-time monitoring
   - Error state detection
   - Severity classification
   - Recovery possibility assessment

3. **Error Response:**
   - UI state changes (graying out)
   - Animation/counter pausing
   - Error message display
   - User notification system

4. **Recovery Mechanisms:**
   - Automatic recovery for non-fatal errors
   - Manual recovery options
   - Session state preservation
   - Graceful degradation

5. **Integration Points:**
   - Debug panel error simulation
   - Error message area display
   - Session continuation after errors
   - Receipt generation for partial sessions

Show the complete error lifecycle from detection to resolution, including all possible paths and outcomes.
```

---

## 🎯 **Prompt Series 5: Testing & Debug Systems**

### **Prompt 5.1: Debug Panel & Testing Tools Architecture**
```
Create a diagram showing the debug panel and testing tools architecture in RUMI.

Include:

1. **Debug Panel Structure:**
   - Basic Testing section
   - Error Testing section
   - Session Management section
   - Vertical Breakpoints section

2. **Debug Functions:**
   - Show Tracker (analytics data)
   - Show State (application state)
   - Error simulation buttons
   - Time skipping controls
   - Session management tools

3. **Tests Panel Structure:**
   - Core System Tests section
   - Intelligence & Learning Tests section
   - User Interface Tests section
   - Additional Resources section

4. **Test Links:**
   - ASCII Shapes Test
   - CSV Processing Test
   - Iframe Communication Test
   - Intelligence Buckets Test
   - Multiplier Calculation Test
   - Points Calculation Test
   - Popup System Test
   - Progress Diamonds Test
   - Section Transitions Test

5. **Integration Points:**
   - Keyboard shortcuts (Ctrl+Shift+D, Ctrl+Shift+T)
   - Panel state management
   - External test file linking
   - Debug function execution

Show how the debug and testing tools integrate with the main system and provide development/testing capabilities.

Reference these key code structures:

**Debug Panel HTML Structure:**
```html
<div class="debug-panel" id="debug-panel">
    <div class="debug-panel-header">
        <span>Rumi Debug</span>
        <button class="debug-panel-toggle">▼</button>
    </div>
    <div class="debug-panel-content">
        <!-- Basic Testing Section -->
        <div class="debug-section">
            <div class="debug-section-header">
                <span>Basic Testing</span>
            </div>
            <div class="debug-section-content">
                <button onclick="Tracker.showDebugOverlay()">Show Tracker</button>
                <button onclick="showState()">Show State</button>
            </div>
        </div>
        
        <!-- Error Testing Section -->
        <div class="debug-section">
            <div class="debug-section-header">
                <span>Error Testing</span>
            </div>
            <div class="debug-section-content">
                <button onclick="testVolumeError()">Volume Error</button>
                <button onclick="testSystemError()">System Error</button>
            </div>
        </div>
    </div>
</div>
```

**Tests Panel HTML Structure:**
```html
<div class="tests-panel" id="tests-panel">
    <div class="tests-panel-header">
        <span>Rumi Tests</span>
        <button class="tests-panel-toggle">▼</button>
    </div>
    <div class="tests-panel-content">
        <!-- Core System Tests -->
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

function toggleTestsPanel() {
    const panel = document.getElementById('tests-panel');
    const trigger = document.querySelector('.tests-trigger');
    
    if (panel.classList.contains('visible')) {
        panel.classList.remove('visible');
        trigger.style.display = 'block';
    } else {
        panel.classList.add('visible');
        trigger.style.display = 'none';
    }
}
```

**Keyboard Shortcuts:**
```javascript
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

**Debug Function Examples:**
```javascript
function testVolumeError() {
    eventBus.emit('errorOccurred', {
        type: 'volume',
        message: 'Volume control not available',
        severity: 'warning'
    });
}

function skipTime(seconds) {
    const currentTime = Date.now();
    appState.indexingStartTime = currentTime - (seconds * 1000);
    updatePoints();
}
```
```

### **Prompt 5.2: Microtests Suite Architecture**
```
Create a diagram showing the microtests suite architecture and how individual tests relate to the main RUMI system.

Include:

1. **Test Categories:**
   - Core System Tests (ASCII, CSV, Iframe)
   - Intelligence & Learning Tests (Buckets, Multiplier, Points)
   - User Interface Tests (Popup, Progress, Transitions)
   - Additional Resources (Microtests Suite, Puzzle System)

2. **Test Isolation:**
   - Standalone test environments
   - Independent component testing
   - Isolated functionality verification
   - Cross-browser compatibility

3. **Test Integration:**
   - Links from main interface
   - New tab opening behavior
   - Test result reporting
   - Debug information display

4. **Test Functions:**
   - Visual component testing
   - Data processing verification
   - System logic validation
   - Communication testing
   - UI state management

5. **Development Workflow:**
   - Test-driven development
   - Component isolation
   - Bug reproduction
   - Feature verification

Show how the microtests provide isolated testing environments for individual components while maintaining connection to the main system.
```

---

## 🎯 **Prompt Series 6: Performance & Responsive Design**

### **Prompt 6.1: Performance Architecture & Optimization**
```
Create a diagram showing the performance architecture and optimization strategies in RUMI.

Include:

1. **Performance Components:**
   - 60fps animation loop
   - Real-time point calculation
   - Smooth progress bar updates
   - Responsive UI updates
   - Memory management

2. **Optimization Strategies:**
   - Efficient state management
   - Minimal DOM updates
   - Optimized calculations
   - Cached data structures
   - Lazy loading where appropriate

3. **Performance Monitoring:**
   - Frame rate monitoring
   - Memory usage tracking
   - Calculation efficiency
   - UI responsiveness
   - Error rate monitoring

4. **Mobile Optimization:**
   - Responsive design breakpoints
   - Touch interaction optimization
   - Mobile-specific UI adjustments
   - Performance considerations for mobile devices

5. **Integration Points:**
   - Debug panel performance tools
   - Real-time performance monitoring
   - Error handling for performance issues
   - Graceful degradation strategies

Show how the system maintains performance across different devices and usage patterns.

Reference these key code structures:

**Responsive CSS Breakpoints:**
```css
/* Mobile-first approach */
.container {
    width: 100%;
    padding: 10px;
}

/* Tablet breakpoint */
@media (min-width: 768px) {
    .container {
        width: 90%;
        max-width: 1200px;
        margin: 0 auto;
    }
}

/* Desktop breakpoint */
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
```

**Performance-Optimized Point Calculation:**
```javascript
// Debounced point updates to prevent excessive calculations
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

// Efficient dashboard cycling
let dashboardCycleInterval;
function startDashboardCycling() {
    dashboardCycleInterval = setInterval(() => {
        cycleDashboardItems();
    }, 3000); // 3-second intervals
}

function stopDashboardCycling() {
    if (dashboardCycleInterval) {
        clearInterval(dashboardCycleInterval);
    }
}
```

**Memory Management:**
```javascript
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
    
    startCleanup() {
        setInterval(() => {
            this.cleanupOldData();
        }, this.cleanupInterval);
    }
}
```

**Touch-Friendly Interface:**
```css
/* Touch targets minimum 44px */
.debug-trigger, .tests-trigger, .activation-circle {
    min-height: 44px;
    min-width: 44px;
    touch-action: manipulation;
}

/* Prevent zoom on input focus */
input, select, textarea {
    font-size: 16px; /* Prevents iOS zoom */
    touch-action: manipulation;
}

/* Smooth scrolling for mobile */
html {
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
}
```

**Performance Monitoring:**
```javascript
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
    
    logPerformance() {
        console.log('Performance Metrics:', this.metrics);
    }
}
```

**Cross-Platform Feature Detection:**
```javascript
class FeatureDetector {
    static checkTouchSupport() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
    
    static checkLocalStorage() {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return true;
        } catch (e) {
            return false;
        }
    }
    
    static checkAnimationSupport() {
        return 'requestAnimationFrame' in window;
    }
    
    static applyPolyfills() {
        if (!this.checkAnimationSupport()) {
            window.requestAnimationFrame = (callback) => {
                setTimeout(callback, 16);
            };
        }
    }
}
```
```

### **Prompt 6.2: Responsive Design & Mobile Architecture**
```
Create a diagram showing the responsive design and mobile architecture of RUMI.

Include:

1. **Breakpoint System:**
   - Very Short (400px)
   - Short (600px)
   - Standard (800px)
   - Tall (1100px)
   - Natural (auto)

2. **Mobile Adaptations:**
   - Button sizing and positioning
   - Panel layout adjustments
   - Touch interaction optimization
   - Font size scaling
   - Spacing adjustments

3. **UI Component Responsiveness:**
   - Debug panel mobile layout
   - Tests panel mobile layout
   - Progress bar scaling
   - Dashboard cycling mobile view
   - Error message display

4. **Mobile-Specific Features:**
   - Touch-friendly button sizes
   - Swipe gesture support
   - Mobile-optimized panels
   - Responsive text sizing
   - Mobile navigation patterns

5. **Testing & Validation:**
   - Mobile device simulation
   - Touch interaction testing
   - Performance on mobile devices
   - Cross-device compatibility

Show how the interface adapts to different screen sizes and input methods while maintaining functionality.
```

---

## 🎯 **Usage Instructions**

### **How to Use These Prompts:**

1. **Start with High-Level:** Begin with Prompt Series 1 to understand the overall system architecture
2. **Progress to Details:** Move through the series to build deeper understanding
3. **Focus on Areas of Interest:** Use specific prompts for areas you want to explore further
4. **Combine Prompts:** Use multiple prompts together for comprehensive diagrams
5. **Iterate and Refine:** Use the generated diagrams as starting points for more detailed exploration

### **Prompt Customization Tips:**

- **Add Context:** Include specific details about your implementation
- **Specify Style:** Request particular diagram styles (UML, flowchart, etc.)
- **Include Examples:** Reference specific code snippets or UI elements
- **Request Annotations:** Ask for detailed explanations of connections and flows
- **Focus on Integration:** Emphasize how components work together

### **Expected Outcomes:**

- **Clear Visual Understanding:** Diagrams that show system relationships
- **Implementation Guidance:** Visual blueprints for development
- **Troubleshooting Aids:** Diagrams that help identify issues
- **Documentation Support:** Visual supplements to written documentation
- **Communication Tools:** Diagrams for explaining the system to others

---

## 📊 **Diagram Types to Request**

### **Architecture Diagrams:**
- System architecture overview
- Component interaction diagrams
- Data flow diagrams
- State transition diagrams

### **User Experience Diagrams:**
- User journey maps
- Interface state diagrams
- Navigation flow charts
- Error handling flows

### **Technical Diagrams:**
- Class diagrams
- Sequence diagrams
- Activity diagrams
- Deployment diagrams

### **Process Diagrams:**
- Points calculation flows
- Content processing pipelines
- Error recovery processes
- Testing workflows

---

*Use these prompts systematically to build a comprehensive understanding of the RUMI system architecture and create valuable visual documentation for development and communication.* 