# 🎯 RUMI Diagram 1: Dashboard Cycling System

Create a professional flowchart diagram titled "Dashboard Cycling System" for the RUMI Extension Beta Proto V1.0.

## 📋 HTML Reference
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

## 🎨 Diagram Requirements

**Create a flowchart showing:**

1. **Four Dashboard Boxes** arranged in a cycle:
   - Pattern Recognition (Learning Stage 1)
   - Classification (Learning Stage 2) 
   - Behavior Analysis (Learning Stage 3)
   - Optimization (Learning Stage 4)

2. **Active State Indicators:**
   - Only ONE box highlighted as "ACTIVE" at a time
   - Pulsing animation effect on active item
   - Clear visual distinction between active/inactive states

3. **Two Trigger Paths** with different colors:
   - **Automode Path** (Yellow theme #ffff00):
     * Content Item Transition → Dashboard Cycle
     * Triggered by `moveToNextContentItem()` function
   - **Detection Mode Path** (Green theme #00ff41):
     * Show Transition → Dashboard Cycle  
     * Triggered by `handleShowTransition()` function

4. **Cycling Sequence:**
   - Show the cycle: 1→2→3→4→1 (continuous loop)
   - Arrows indicating the progression direction
   - Clear transition triggers for each mode

5. **Visual Elements:**
   - Use actual dashboard grid layout from HTML
   - Include dashboard titles and subtitles
   - Show status indicators ("Active"/"Inactive")
   - Use theme colors: Yellow (#ffff00) for automode, Green (#00ff41) for detection

**Style Guidelines:**
- Modern, clean, professional appearance
- Clear typography and visual hierarchy
- Use actual color codes from the HTML
- Include relevant icons and visual elements
- Show both desktop and mobile considerations

**Technical Accuracy:**
- Use exact HTML structure from snippet
- Include actual CSS class names and IDs
- Show real JavaScript function names
- Maintain accurate color codes

**Placement:** Add to the "Dashboard Cycling & Theme Verification" test flow section in the testing guide. 