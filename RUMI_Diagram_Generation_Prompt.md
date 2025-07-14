# 🎨 RUMI Extension Beta Proto V1.0 - Complete Diagram Generation Prompt

Create a comprehensive set of 5 professional diagrams for the RUMI Extension Beta Proto V1.0. Use these HTML snippets as reference for accurate representation:

## 📋 HTML Reference Snippets

### 1. Dashboard Structure
```html
<!-- Learning Progress Dashboard (Section 3b) -->
<div class="learning-progress-dashboard">
    <div class="dashboard-grid">
        <div id="pattern-recognition-item" class="dashboard-item">
            <div class="dashboard-title">Pattern Recognition</div>
            <div class="dashboard-subtitle">Learning Stage 1</div>
            <div class="dashboard-status">Active</div>
        </div>
        <div id="classification-item" class="dashboard-item">
            <div class="dashboard-title">Classification</div>
            <div class="dashboard-subtitle">Learning Stage 2</div>
            <div class="dashboard-status">Inactive</div>
        </div>
        <div id="behavior-analysis-item" class="dashboard-item">
            <div class="dashboard-title">Behavior Analysis</div>
            <div class="dashboard-subtitle">Learning Stage 3</div>
            <div class="dashboard-status">Inactive</div>
        </div>
        <div id="optimization-item" class="dashboard-item">
            <div class="dashboard-title">Optimization</div>
            <div class="dashboard-subtitle">Learning Stage 4</div>
            <div class="dashboard-status">Inactive</div>
        </div>
    </div>
</div>
```

### 2. Theme Color System
```html
<!-- Automode (Yellow Theme) -->
<div class="automode">
    <div class="insights-banner" style="background-color: #333300; color: #ffff00;">
        <span>🎯 Learning Insights</span>
    </div>
    <div class="stats-grid">
        <div class="stat-box">
            <div class="stat-title" style="color: #ffff00;">Pattern Recognition</div>
            <div class="stat-value" style="color: #ffff00;">87%</div>
        </div>
    </div>
    <div class="dashboard-item" style="background-color: rgba(255, 255, 0, 0.05); border-left: 3px solid #ffff00;">
        <div class="dashboard-title" style="color: #ffff00;">Active Item</div>
    </div>
</div>

<!-- Detection Mode (Green Theme) -->
<div class="detection-mode">
    <div class="insights-banner" style="background-color: #003300; color: #00ff41;">
        <span>🎯 Learning Insights</span>
    </div>
    <div class="stats-grid">
        <div class="stat-box">
            <div class="stat-title" style="color: #00ff41;">Pattern Recognition</div>
            <div class="stat-value" style="color: #00ff41;">87%</div>
        </div>
    </div>
    <div class="dashboard-item" style="background-color: rgba(0, 255, 65, 0.05); border-left: 3px solid #00ff41;">
        <div class="dashboard-title" style="color: #00ff41;">Active Item</div>
    </div>
</div>
```

### 3. Activation Gate System
```html
<!-- Disabled State (Before Activation) -->
<div class="main-view section-disabled">
    <div class="activation-overlay">
        <div class="activation-message">Activation Required</div>
        <div class="activation-description">Complete extension activation to access features</div>
    </div>
    <div class="content-area disabled">
        <!-- All UI elements are greyed out -->
    </div>
</div>

<!-- Enabled State (After Activation) -->
<div class="main-view section-enabled">
    <div class="content-area enabled">
        <!-- All UI elements are active -->
    </div>
</div>
```

### 4. Content Transition Triggers
```javascript
// Automode: Content item transitions
function moveToNextContentItem() {
    // ... content transition logic ...
    if (appState.entryPoint === 'automode') {
        cycleDashboardSection(); // Triggers dashboard cycling
    }
}

// Detection Mode: Show transitions  
function handleShowTransition(newShow) {
    // ... show transition logic ...
    if (appState.entryPoint === 'detection') {
        cycleDashboardSection(); // Triggers dashboard cycling
    }
}
```

### 5. Dashboard Cycling Function
```javascript
function cycleDashboardSection() {
    const dashboardItems = [
        'pattern-recognition-item',
        'classification-item', 
        'behavior-analysis-item',
        'optimization-item'
    ];
    
    // Find current active item
    let currentActiveIndex = dashboardItems.findIndex(id => 
        document.getElementById(id).classList.contains('active')
    );
    
    // Deactivate current, activate next
    const nextIndex = (currentActiveIndex + 1) % dashboardItems.length;
    
    // Apply theme colors
    if (appState.entryPoint === 'automode') {
        // Yellow theme
        nextItem.style.backgroundColor = 'rgba(255, 255, 0, 0.05)';
        nextItem.style.borderLeft = '3px solid #ffff00';
    } else {
        // Green theme  
        nextItem.style.backgroundColor = 'rgba(0, 255, 65, 0.05)';
        nextItem.style.borderLeft = '3px solid #00ff41';
    }
}
```

---

## 🎯 Generate These 5 Diagrams

### **DIAGRAM 1: Dashboard Cycling System**
Create a flowchart titled "Dashboard Cycling System" showing:
- Four dashboard boxes arranged in a cycle: Pattern Recognition → Classification → Behavior Analysis → Optimization
- Only one box highlighted as "ACTIVE" at a time with pulsing animation effect
- Two trigger paths with different colors:
  * Automode path: Content Item Transition → Dashboard Cycle (yellow theme #ffff00)
  * Detection Mode path: Show Transition → Dashboard Cycle (green theme #00ff41)
- Visual indicators showing active states, inactive states, and transition arrows
- Include the dashboard grid layout from the HTML snippet
- Show the cycling sequence: 1→2→3→4→1 (continuous loop)

### **DIAGRAM 2: Theme Color System**
Create a side-by-side comparison titled "RUMI Theme Color System" showing:
- Left side: Detection Mode (Green theme #00ff41)
  * Progress bars, buttons, dashboard items, status indicators
  * Insights banner with green background
  * Active dashboard item with green border
- Right side: Automode (Yellow theme #ffff00)
  * Same elements but with yellow colors
  * Insights banner with yellow background
  * Active dashboard item with yellow border
- Include color codes and visual hierarchy
- Show before/after activation states

### **DIAGRAM 3: Activation Gate Flow**
Create a state diagram titled "Activation Gate System" showing:
- Initial state: "Extension Not Activated" (greyed out UI)
- Activation trigger: User clicks activation button
- Transition to: "Extension Activated" (enabled UI)
- Show the activation overlay disappearing
- Include the HTML structure from the activation gate snippet
- Show section 2a/2b being enabled based on entry point

### **DIAGRAM 4: Content Transition Architecture**
Create a system diagram titled "Content Transition Architecture" showing:
- Content library (CSV data source)
- Content queue management system
- Two transition paths:
  * Automode: Individual content items → Dashboard cycling
  * Detection Mode: Show transitions → Dashboard cycling
- Include the JavaScript trigger functions
- Show data flow and state management
- Include the transition detection logic

### **DIAGRAM 5: User Experience Flow**
Create a user journey diagram titled "RUMI User Experience Flow" showing:
- Entry point selection (Detection Mode vs Automode)
- Activation process and gate system
- Content consumption with points earning
- Dashboard cycling during content transitions
- Theme color consistency throughout the experience
- Include all major UI sections (1a, 1b, 2a, 2b, 3a, 3b, 4a, 4b)
- Show the complete user flow from start to finish

---

## 🎨 Design Requirements

**Style Guidelines:**
- Modern, clean, professional appearance
- Consistent color scheme matching the HTML themes
- Clear typography and visual hierarchy
- Use actual color codes from the HTML snippets
- Include relevant icons and visual elements
- Show both desktop and mobile considerations where applicable

**Technical Accuracy:**
- Use exact HTML structure from snippets
- Include actual CSS class names and IDs
- Show real JavaScript function names
- Maintain accurate color codes (#ffff00, #00ff41, etc.)
- Reflect actual UI behavior and interactions

**Layout Considerations:**
- Each diagram should be self-contained but related
- Show progression from technical implementation to user experience
- Include both code-level and user-level perspectives
- Demonstrate the relationship between different system components

Generate all 5 diagrams in sequence, maintaining consistency across the set while ensuring each diagram serves its specific purpose in explaining the RUMI system.

---

## 📍 Diagram Placement Instructions

**Where to place the generated diagrams:**

### **DIAGRAM 1: Dashboard Cycling System**
- **Placement**: Add to the "Dashboard Cycling & Theme Verification" test flow section
- **Purpose**: Visual explanation of the dashboard cycling behavior
- **Context**: Helps users understand what to watch for during testing

### **DIAGRAM 2: Theme Color System**
- **Placement**: Add to the "Visual Design & Theme Consistency" section
- **Purpose**: Reference for theme color verification
- **Context**: Shows expected colors for both automode and detection mode

### **DIAGRAM 3: Activation Gate Flow**
- **Placement**: Add to the "Extension Activation Flow" section
- **Purpose**: Visual guide for activation testing
- **Context**: Shows the before/after states users should expect

### **DIAGRAM 4: Content Transition Architecture**
- **Placement**: Add to the "Technical Architecture" documentation
- **Purpose**: System overview for developers and testers
- **Context**: Explains the data flow and trigger mechanisms

### **DIAGRAM 5: User Experience Flow**
- **Placement**: Add to the main testing guide introduction
- **Purpose**: Complete user journey overview
- **Context**: Helps testers understand the full experience flow

**File Integration:**
- Save diagrams as PNG/SVG files in a `/diagrams/` folder
- Reference them in the testing guide with descriptive alt text
- Use consistent naming: `rumi-diagram-1-dashboard-cycling.png`, etc.
- Include diagrams inline with relevant test sections for easy reference 