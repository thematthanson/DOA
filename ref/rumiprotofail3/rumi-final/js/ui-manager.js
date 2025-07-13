// ================================
// RUMI UI MANAGER
// Consolidated UI management and component system
// ================================

window.RumiUI = {
    // UI state
    state: {
        currentSection: null,
        sections: {},
        components: {},
        animations: {},
        debug: {
            enabled: false,
            panel: null
        }
    },

    // Component registry
    components: {},

    // Animation registry
    animations: {},

    // ================================
    // INITIALIZATION
    // ================================

    init() {
        console.log('🎨 UI: Initializing UI manager...');
        
        this.setupEventListeners();
        this.initializeComponents();
        this.setupDebugPanel();
        
        console.log('🎨 UI: UI manager initialized');
    },

    setupEventListeners() {
        // Listen for UI updates
        window.RumiEvents.on(window.RumiEventTypes.UI_UPDATE, (data) => {
            this.updateUI(data);
        });

        // Listen for section changes
        window.RumiEvents.on(window.RumiEventTypes.UI_SECTION_CHANGE, (section) => {
            this.showSection(section);
        });

        // Listen for ASCII updates
        window.RumiEvents.on(window.RumiEventTypes.UI_ASCII_UPDATE, (data) => {
            this.updateAsciiDisplay(data);
        });

        // Listen for backend data updates
        window.RumiEvents.on(window.RumiEventTypes.BACKEND_DATA_UPDATE, (data) => {
            this.updateBackendDisplay(data);
        });
    },

    initializeComponents() {
        // Initialize all UI components
        this.components = {
            sections: this.initializeSections(),
            ascii: this.initializeAsciiDisplay(),
            channel: this.initializeChannel(),
            debug: this.initializeDebugPanel()
        };
    },

    // ================================
    // SECTION MANAGEMENT
    // ================================

    initializeSections() {
        const sections = {
            'section-1': {
                element: document.getElementById('section-1'),
                visible: false,
                active: false
            },
            'section-2a': {
                element: document.getElementById('section-2a-content-detected'),
                visible: false,
                active: false
            },
            'section-2b': {
                element: document.getElementById('section-2b-automode'),
                visible: false,
                active: false
            },
            'section-3a': {
                element: document.getElementById('section-3a-indexing'),
                visible: false,
                active: false
            },
            'section-3b': {
                element: document.getElementById('section-3b-automode-indexing'),
                visible: false,
                active: false
            },
            'section-4a': {
                element: document.getElementById('section-4a-receipt'),
                visible: false,
                active: false
            }
        };

        return sections;
    },

    showSection(sectionId) {
        console.log(`🎨 UI: Showing section ${sectionId}`);
        
        // Safety check for components
        if (!this.components || !this.components.sections) {
            console.error('🎨 UI: Components not initialized properly');
            return;
        }
        
        // Hide all sections
        Object.keys(this.components.sections).forEach(key => {
            const section = this.components.sections[key];
            if (section && section.element) {
                section.element.style.display = 'none';
                section.visible = false;
                section.active = false;
            }
        });

        // Show target section
        const targetSection = this.components.sections[sectionId];
        if (targetSection && targetSection.element) {
            targetSection.element.style.display = 'block';
            targetSection.visible = true;
            targetSection.active = true;
            this.state.currentSection = sectionId;
            
            // Trigger section-specific animations
            this.animateSectionTransition(sectionId);
        } else {
            console.warn(`🎨 UI: Section ${sectionId} not found`);
        }

        // Update state
        this.updateSectionState();
    },

    animateSectionTransition(sectionId) {
        const section = this.components.sections[sectionId];
        if (!section || !section.element) return;

        // Add transition animation
        section.element.style.opacity = '0';
        section.element.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            section.element.style.transition = 'all 0.3s ease';
            section.element.style.opacity = '1';
            section.element.style.transform = 'translateY(0)';
        }, 50);
    },

    updateSectionState() {
        // Update global state
        if (window.RumiState) {
            window.RumiState.ui.currentSection = this.state.currentSection;
            Object.keys(this.components.sections).forEach(key => {
                const section = this.components.sections[key];
                if (window.RumiState.ui.sections[key]) {
                    window.RumiState.ui.sections[key].visible = section.visible;
                    window.RumiState.ui.sections[key].active = section.active;
                }
            });
        }
    },

    // ================================
    // ASCII DISPLAY MANAGEMENT
    // ================================

    initializeAsciiDisplay() {
        const asciiElement = document.getElementById('ascii-display');
        if (!asciiElement) {
            console.warn('🎨 UI: ASCII display element not found');
            return null;
        }

        return {
            element: asciiElement,
            currentContent: null,
            animationActive: false,
            lastUpdate: null
        };
    },

    updateAsciiDisplay(data) {
        const ascii = this.components.ascii;
        if (!ascii || !ascii.element) return;

        // Update content
        ascii.currentContent = data.content;
        ascii.lastUpdate = Date.now();

        // Generate ASCII art
        this.generateAsciiArt(data.content, data.meta).then(asciiArt => {
            ascii.element.innerHTML = asciiArt;
            
            // Start animation if needed
            if (data.animate) {
                this.startAsciiAnimation(ascii.element, data.content, data.meta);
            }
        });
    },

    async generateAsciiArt(content, meta = {}) {
        // Try enhanced ASCII first
        if (window.EnhancedRumiASCII && window.EnhancedRumiASCII.generate) {
            try {
                return await window.EnhancedRumiASCII.generate(content.title, meta);
            } catch (error) {
                console.warn('🎨 UI: Enhanced ASCII failed, falling back to simple', error);
            }
        }

        // Fallback to simple ASCII
        if (window.RumiASCII && window.RumiASCII.generate) {
            try {
                return await window.RumiASCII.generate(content.title, meta);
            } catch (error) {
                console.warn('🎨 UI: Simple ASCII failed, using fallback', error);
            }
        }

        // Ultimate fallback
        return this.generateFallbackAscii(content, meta);
    },

    generateFallbackAscii(content, meta = {}) {
        const title = content.title || 'Unknown';
        const genre = content.genre || 'general';
        const duration = meta.duration || content.duration || '';
        
        return `
╔════════════════════════════════════════════════════╗
║                    ${title.padEnd(40)} ║
║                    GENRE: ${genre.toUpperCase().padEnd(30)} ║
║                    DURATION: ${duration}m${' '.repeat(30)} ║
╚════════════════════════════════════════════════════╝
        `;
    },

    startAsciiAnimation(element, content, meta) {
        const ascii = this.components.ascii;
        if (!ascii) return;

        ascii.animationActive = true;
        
        // Start animation loop
        const animationInterval = setInterval(() => {
            if (!ascii.animationActive) {
                clearInterval(animationInterval);
                return;
            }

            // Update meta with elapsed time
            const elapsedTime = Math.floor((Date.now() - (ascii.lastUpdate || Date.now())) / 1000);
            const updatedMeta = { ...meta, elapsedTime };

            // Regenerate ASCII art
            this.generateAsciiArt(content, updatedMeta).then(asciiArt => {
                element.innerHTML = asciiArt;
            });
        }, 2000); // Update every 2 seconds

        // Store interval for cleanup
        ascii.animationInterval = animationInterval;
    },

    stopAsciiAnimation() {
        const ascii = this.components.ascii;
        if (!ascii) return;

        ascii.animationActive = false;
        if (ascii.animationInterval) {
            clearInterval(ascii.animationInterval);
            ascii.animationInterval = null;
        }
    },

    // ================================
    // CHANNEL MANAGEMENT
    // ================================

    initializeChannel() {
        const channelFrame = document.getElementById('channel-frame');
        if (!channelFrame) {
            console.warn('🎨 UI: Channel frame not found');
            return null;
        }

        return {
            element: channelFrame,
            mode: 'detection',
            content: [],
            expanded: false
        };
    },

    initializeDebugPanel() {
        return {
            element: null,
            visible: false,
            sections: {
                state: { visible: false },
                content: { visible: false },
                ui: { visible: false }
            }
        };
    },

    updateChannel(data) {
        const channel = this.components.channel;
        if (!channel || !channel.element) return;

        // Update channel mode
        if (data.mode) {
            channel.mode = data.mode;
            this.setChannelMode(data.mode);
        }

        // Update channel content
        if (data.content) {
            channel.content = data.content;
            this.updateChannelContent(data.content);
        }

        // Update expansion state
        if (data.expanded !== undefined) {
            channel.expanded = data.expanded;
            this.toggleChannelExpansion(data.expanded);
        }
    },

    setChannelMode(mode) {
        const channel = this.components.channel;
        if (!channel || !channel.element) return;

        // Set channel source based on mode
        if (mode === 'detection') {
            channel.element.src = 'genre-channel-optimized.html';
        } else if (mode === 'automode') {
            channel.element.src = 'channel.html?mode=automode';
        }

        // Send message to channel
        setTimeout(() => {
            channel.element.contentWindow.postMessage({
                type: 'setMode',
                mode: mode
            }, '*');
        }, 100);
    },

    updateChannelContent(content) {
        const channel = this.components.channel;
        if (!channel || !channel.element) return;

        // Send content to channel
        setTimeout(() => {
            channel.element.contentWindow.postMessage({
                type: 'updateContent',
                content: content
            }, '*');
        }, 100);
    },

    toggleChannelExpansion(expanded) {
        const channel = this.components.channel;
        if (!channel || !channel.element) return;

        const container = channel.element.parentElement;
        if (!container) return;

        if (expanded) {
            container.style.height = '400px';
            container.style.transition = 'height 0.3s ease';
        } else {
            container.style.height = '280px';
            container.style.transition = 'height 0.3s ease';
        }
    },

    // ================================
    // DEBUG PANEL
    // ================================

    setupDebugPanel() {
        // Create debug trigger
        const debugTrigger = document.createElement('div');
        debugTrigger.className = 'debug-trigger';
        debugTrigger.textContent = 'DEBUG';
        debugTrigger.onclick = () => this.toggleDebugPanel();
        document.body.appendChild(debugTrigger);

        // Create debug panel
        const debugPanel = document.createElement('div');
        debugPanel.className = 'debug-panel';
        debugPanel.innerHTML = this.createDebugPanelHTML();
        document.body.appendChild(debugPanel);

        this.state.debug.panel = debugPanel;
    },

    createDebugPanelHTML() {
        return `
            <div class="debug-panel-header" onclick="window.RumiUI.toggleDebugSection('state')">
                DEBUG PANEL <span class="toggle">▼</span>
            </div>
            <div class="debug-section">
                <div class="debug-section-header" onclick="window.RumiUI.toggleDebugSection('state')">
                    STATE <span class="toggle">▼</span>
                </div>
                <div class="debug-section-content" id="debug-state">
                    <div class="debug-button" onclick="window.RumiUI.debugShowState()">Show App State</div>
                    <div class="debug-button" onclick="window.RumiUI.debugShowBackendState()">Show Backend State</div>
                    <div class="debug-button" onclick="window.RumiUI.debugResetState()">Reset State</div>
                </div>
            </div>
            <div class="debug-section">
                <div class="debug-section-header" onclick="window.RumiUI.toggleDebugSection('content')">
                    CONTENT <span class="toggle">▼</span>
                </div>
                <div class="debug-section-content collapsed" id="debug-content">
                    <div class="debug-button" onclick="window.RumiUI.debugLoadContent()">Load Test Content</div>
                    <div class="debug-button" onclick="window.RumiUI.debugShowContent()">Show Content</div>
                </div>
            </div>
            <div class="debug-section">
                <div class="debug-section-header" onclick="window.RumiUI.toggleDebugSection('ui')">
                    UI <span class="toggle">▼</span>
                </div>
                <div class="debug-section-content collapsed" id="debug-ui">
                    <div class="debug-button" onclick="window.RumiUI.debugShowSection('section-2a')">Show Section 2a</div>
                    <div class="debug-button" onclick="window.RumiUI.debugShowSection('section-2b')">Show Section 2b</div>
                    <div class="debug-button" onclick="window.RumiUI.debugShowSection('section-3a')">Show Section 3a</div>
                </div>
            </div>
        `;
    },

    toggleDebugPanel() {
        const panel = this.state.debug.panel;
        if (!panel) return;

        panel.classList.toggle('visible');
    },

    toggleDebugSection(sectionId) {
        const content = document.getElementById(`debug-${sectionId}`);
        if (!content) return;

        content.classList.toggle('collapsed');
        
        const header = content.previousElementSibling;
        const toggle = header.querySelector('.toggle');
        if (toggle) {
            toggle.textContent = content.classList.contains('collapsed') ? '▼' : '▲';
        }
    },

    // ================================
    // DEBUG FUNCTIONS
    // ================================

    debugShowState() {
        if (window.RumiState) {
            console.log('🎨 UI: App State:', window.RumiState.getState());
        }
    },

    debugShowBackendState() {
        if (window.RumiBackend) {
            console.log('🎨 UI: Backend State:', window.RumiBackend.getSessionForUI());
        }
    },

    debugResetState() {
        if (window.RumiState) {
            window.RumiState.reset();
            console.log('🎨 UI: State reset complete');
        }
    },

    debugLoadContent() {
        if (window.RumiContent) {
            const testContent = window.RumiContent.getRandomContent(3);
            console.log('🎨 UI: Loaded test content:', testContent);
        }
    },

    debugShowContent() {
        if (window.RumiContent) {
            console.log('🎨 UI: Current content:', window.RumiContent.getCurrentContent());
            console.log('🎨 UI: Session content:', window.RumiContent.getSessionContent());
        }
    },

    debugShowSection(sectionId) {
        this.showSection(sectionId);
    },

    // ================================
    // UTILITY FUNCTIONS
    // ================================

    updateUI(data) {
        // Update sections
        if (data.sections) {
            Object.keys(data.sections).forEach(sectionId => {
                const sectionData = data.sections[sectionId];
                if (sectionData.visible && !this.components.sections[sectionId]?.visible) {
                    this.showSection(sectionId);
                }
            });
        }

        // Update ASCII display
        if (data.asciiDisplay) {
            this.updateAsciiDisplay(data.asciiDisplay);
        }

        // Update channel
        if (data.channel) {
            this.updateChannel(data.channel);
        }
    },

    updateBackendDisplay(data) {
        // Update points display
        if (data.totalPoints !== undefined) {
            const pointsElement = document.getElementById('total-points');
            if (pointsElement) {
                pointsElement.textContent = data.totalPoints.toFixed(1);
            }
        }

        // Update multiplier display
        if (data.currentMultiplier !== undefined) {
            const multiplierElement = document.getElementById('current-multiplier');
            if (multiplierElement) {
                multiplierElement.textContent = `${data.currentMultiplier.toFixed(1)}x`;
            }
        }

        // Update session time
        if (data.sessionTime !== undefined) {
            const timeElement = document.getElementById('session-time');
            if (timeElement) {
                timeElement.textContent = this.formatTime(data.sessionTime);
            }
        }
    },

    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${secs.toString().padStart(2, '0')}`;
        }
    }
};

// Initialize UI manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.RumiUI.init();
}); 