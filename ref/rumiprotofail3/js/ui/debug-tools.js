// ================================
// RUMI DEBUG TOOLS
// Debug panel and testing utilities
// ================================

class RumiDebugTools {
    constructor() {
        this.state = {
            isVisible: false,
            activeSection: null,
            collapsedSections: new Set()
        };
        
        // Initialize keyboard shortcuts
        this.initializeKeyboardShortcuts();
    }
    
    // ================================
    // INITIALIZATION
    // ================================
    
    initializeKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            if (event.ctrlKey && event.shiftKey && event.key === 'D') {
                event.preventDefault();
                this.togglePanel();
            }
        });
    }
    
    // ================================
    // PANEL MANAGEMENT
    // ================================
    
    togglePanel() {
        const panel = document.getElementById('debug-panel');
        const trigger = document.querySelector('.debug-trigger');
        const content = document.getElementById('debug-panel-content');
        const toggle = document.getElementById('debug-panel-toggle');
        
        if (panel.classList.contains('visible')) {
            // Hide the panel
            panel.classList.remove('visible');
            trigger.style.display = 'block';
        } else {
            // Show the panel
            panel.classList.add('visible');
            trigger.style.display = 'none';
            
            // Expand the content when showing
            content.classList.remove('collapsed');
            toggle.textContent = '▼';
            toggle.classList.remove('collapsed');
            
            // Expand error testing section by default (most commonly used)
            const errorTestingContent = document.getElementById('error-testing-content');
            const errorTestingToggle = document.getElementById('error-testing-toggle');
            if (errorTestingContent && errorTestingToggle) {
                errorTestingContent.classList.remove('collapsed');
                errorTestingToggle.textContent = '▼';
                errorTestingToggle.classList.remove('collapsed');
            }
        }
    }
    
    toggleSection(sectionId) {
        const content = document.getElementById(sectionId + '-content');
        const toggle = document.getElementById(sectionId + '-toggle');
        
        if (content.classList.contains('collapsed')) {
            content.classList.remove('collapsed');
            toggle.textContent = '▼';
            toggle.classList.remove('collapsed');
        } else {
            content.classList.add('collapsed');
            toggle.textContent = '▶';
            toggle.classList.add('collapsed');
        }
    }
    
    // ================================
    // TESTING FUNCTIONS
    // ================================
    
    testVolumeError() {
        window.RumiState.setState('errorState', {
            type: 'volume',
            message: 'Volume too low',
            details: 'Please increase volume to at least 50%'
        });
    }
    
    testSpeedError() {
        window.RumiState.setState('errorState', {
            type: 'speed',
            message: 'Playback speed changed',
            details: 'Please set playback speed to 1x'
        });
    }
    
    testSystemError() {
        window.RumiState.setState('errorState', {
            type: 'system',
            message: 'System error',
            details: 'An unexpected error occurred'
        });
    }
    
    testShowInterrupt() {
        window.RumiState.setState('errorState', {
            type: 'interrupt',
            message: 'Show interrupted',
            details: 'Content changed unexpectedly'
        });
    }
    
    toggleTurboMode() {
        const turboBtn = document.getElementById('debug-turbo-btn');
        const isActive = turboBtn.classList.contains('active');
        
        if (isActive) {
            turboBtn.classList.remove('active');
            turboBtn.textContent = '⚡ TURBO (30×)';
            window.RumiState.setState('turboMode', false);
        } else {
            turboBtn.classList.add('active');
            turboBtn.textContent = '⚡ TURBO (ON)';
            window.RumiState.setState('turboMode', true);
        }
    }
    
    setViewportHeight(height) {
        document.body.style.height = `${height}px`;
        document.getElementById('current-viewport-height').textContent = height;
        
        // Update breakpoint indicator
        let breakpoint = '';
        if (height <= 400) breakpoint = 'Very Short';
        else if (height <= 600) breakpoint = 'Short';
        else if (height <= 800) breakpoint = 'Standard';
        else breakpoint = 'Tall';
        
        document.getElementById('current-breakpoint').textContent = breakpoint;
    }
    
    resetViewportHeight() {
        document.body.style.height = '';
        const naturalHeight = window.innerHeight;
        document.getElementById('current-viewport-height').textContent = naturalHeight;
        
        // Update breakpoint indicator
        let breakpoint = '';
        if (naturalHeight <= 400) breakpoint = 'Very Short';
        else if (naturalHeight <= 600) breakpoint = 'Short';
        else if (naturalHeight <= 800) breakpoint = 'Standard';
        else breakpoint = 'Tall';
        
        document.getElementById('current-breakpoint').textContent = breakpoint;
    }
}

// Create global instance
window.RumiDebug = new RumiDebugTools(); 