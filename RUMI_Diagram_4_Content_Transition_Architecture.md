# 🔄 RUMI Diagram 4: Content Transition Architecture

Create a professional system diagram titled "Content Transition Architecture" for the RUMI Extension Beta Proto V1.0.

## 📋 JavaScript Reference
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

// Dashboard cycling function
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

## 🎨 Diagram Requirements

**Create a system diagram showing:**

### **Data Sources:**
1. **Content Library (CSV):**
   - `content-library-expanded_LUDICROUS_WORKING.csv`
   - `full-length-content-library.csv`
   - Content metadata and categorization

2. **Content Queue Management:**
   - Dynamic content loading system
   - Content indexing and organization
   - Queue management for different content types

### **Two Transition Paths:**

#### **Path 1: Automode (Yellow Theme)**
1. **Content Item Transitions:**
   - Individual content items cycle through queue
   - `moveToNextContentItem()` function triggered
   - Content display updates automatically
   - Dashboard cycling triggered on each transition

2. **Dashboard Integration:**
   - `cycleDashboardSection()` called
   - Yellow theme applied (#ffff00)
   - Learning stages progress: Pattern → Classification → Behavior → Optimization

#### **Path 2: Detection Mode (Green Theme)**
1. **Show Transitions:**
   - Show-level content changes
   - `handleShowTransition()` function triggered
   - Show metadata and content updates
   - Dashboard cycling triggered on show changes

2. **Dashboard Integration:**
   - `cycleDashboardSection()` called
   - Green theme applied (#00ff41)
   - Same learning stages progression

### **System Components:**
1. **State Management:**
   - `appState.entryPoint` (detection vs automode)
   - `appState.currentContentIndex`
   - `appState.isIndexing`

2. **Transition Detection:**
   - Content completion triggers
   - Show change detection
   - User interaction monitoring

3. **Dashboard Cycling:**
   - Four dashboard items array
   - Active state management
   - Theme color application
   - Visual feedback system

### **Data Flow:**
- **CSV Data** → **Content Queue** → **Transition Triggers** → **Dashboard Updates**
- **User Interaction** → **Content Changes** → **Function Calls** → **Visual Updates**
- **State Changes** → **Theme Application** → **UI Updates**

**Style Guidelines:**
- Modern, clean, professional appearance
- Clear data flow arrows and connections
- Use actual function names from JavaScript
- Show both technical and user-level perspectives
- Include color coding for themes

**Technical Accuracy:**
- Use exact function names from JavaScript snippets
- Include actual file names and data sources
- Show real state management variables
- Maintain accurate data flow representation

**Placement:** Add to the "Technical Architecture" documentation section. 