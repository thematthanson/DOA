// ================================
// RUMI MAIN APPLICATION CONTROLLER
// ================================

window.RumiApp = {
    // Application state
    initialized: false,
    currentSection: 'section-1',
    
    // ================================
    // INITIALIZATION
    // ================================
    
    async init() {
        console.log('🚀 RUMI: Initializing main application...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.startInitialization());
        } else {
            await this.startInitialization();
        }
    },
    
    async startInitialization() {
        try {
            // Initialize backend systems
            if (window.RumiBackend) {
                await window.RumiBackend.init();
            }
            
            if (window.RumiContent) {
                await window.RumiContent.init();
            }
            
            if (window.RumiState) {
                await window.RumiState.init();
            }
            
            // Initialize UI components
            this.initializeUI();
            this.setupEventListeners();
            this.showSection('section-1');
            
            this.initialized = true;
            console.log('✅ RUMI: Application initialized successfully');
            
        } catch (error) {
            console.error('❌ RUMI: Initialization failed:', error);
            // Even if initialization fails, we need to export global functions
            // so the UI buttons work
            this.exportGlobalFunctions();
            this.initializeUI();
            this.showSection('section-1');
            this.showErrorState(error.message);
        }
    },

    showErrorState(errorMessage) {
        // Hide all sections
        const sections = ['section-1', 'section-2a', 'section-2b', 'section-3a', 'section-3b', 'section-4a'];
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) section.style.display = 'none';
        });
        
        // Show error message
        const errorDiv = document.createElement('div');
        errorDiv.id = 'error-state';
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #1a1a1a;
            border: 2px solid #ff4444;
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            font-family: 'SF Mono', monospace;
            color: #fff;
            max-width: 500px;
            z-index: 10000;
        `;
        
        errorDiv.innerHTML = `
            <h2 style="color: #ff4444; margin-bottom: 20px;">🚨 System Error</h2>
            <p style="margin-bottom: 20px; line-height: 1.5;">${errorMessage}</p>
            <p style="color: #888; font-size: 14px;">Please ensure the CSV data file is available and try refreshing the page.</p>
            <button onclick="location.reload()" style="
                background: #333;
                border: 1px solid #555;
                color: #fff;
                padding: 10px 20px;
                border-radius: 6px;
                cursor: pointer;
                margin-top: 20px;
            ">Retry</button>
        `;
        
        document.body.appendChild(errorDiv);
    },

    // ================================
    // UI COMPONENTS
    // ================================

    showSection(sectionId) {
        console.log('🎯 MAIN: Showing section:', sectionId);
        
        // Hide all content areas first
        const homeContent = document.getElementById('home-content');
        const nokiaContent = document.getElementById('nokia-content');
        const extensionPopup = document.getElementById('extension-popup');
        const receiptView = document.getElementById('receipt-view');
        const mainView = document.getElementById('main-view');
        
        // Hide all sections first
        const sections = [
            'section-2a-content-detected',
            'section-2b-automode'
        ];
        
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) section.style.display = 'none';
        });
        
        // Show the appropriate content based on section
        switch(sectionId) {
            case 'section-1':
                // Section 1 (Entry Point Panel) is always visible - no changes needed
                // Just hide the extension popup if it's showing
                if (extensionPopup) extensionPopup.style.display = 'none';
                console.log('✅ MAIN: Section 1 - Entry point visible');
                break;
                
            case 'section-2a':
                if (extensionPopup) extensionPopup.style.display = 'block';
                if (receiptView) receiptView.style.display = 'none';
                if (mainView) mainView.style.display = 'block';
                if (homeContent) {
                    homeContent.style.display = 'block';
                    const section2a = document.getElementById('section-2a-content-detected');
                    if (section2a) section2a.style.display = 'block';
                }
                if (nokiaContent) nokiaContent.style.display = 'none';
                console.log('✅ MAIN: Section 2a - Content detected');
                break;
                
            case 'section-2b':
                if (extensionPopup) extensionPopup.style.display = 'block';
                if (receiptView) receiptView.style.display = 'none';
                if (mainView) mainView.style.display = 'block';
                if (homeContent) {
                    homeContent.style.display = 'block';
                    const section2b = document.getElementById('section-2b-automode');
                    if (section2b) section2b.style.display = 'block';
                }
                if (nokiaContent) nokiaContent.style.display = 'none';
                console.log('✅ MAIN: Section 2b - Automode');
                break;
                
            case 'section-3a':
                if (extensionPopup) extensionPopup.style.display = 'block';
                if (receiptView) receiptView.style.display = 'none';
                if (mainView) mainView.style.display = 'block';
                if (homeContent) homeContent.style.display = 'none';
                if (nokiaContent) {
                    nokiaContent.style.display = 'block';
                    // Show the holistic indexing panel
                    const holisticPanel = document.getElementById('holistic-indexing-panel');
                    if (holisticPanel) holisticPanel.style.display = 'block';
                }
                console.log('✅ MAIN: Section 3a - Active indexing');
                break;
                
            case 'section-3b':
                if (extensionPopup) extensionPopup.style.display = 'block';
                if (receiptView) receiptView.style.display = 'none';
                if (mainView) mainView.style.display = 'block';
                if (homeContent) homeContent.style.display = 'none';
                if (nokiaContent) {
                    nokiaContent.style.display = 'block';
                    // Show training progress dashboard
                    const trainingDashboard = document.getElementById('training-progress-dashboard');
                    if (trainingDashboard) trainingDashboard.style.display = 'block';
                }
                console.log('✅ MAIN: Section 3b - Training dashboard');
                break;
                
            case 'section-4a':
            case 'section-4b':
                if (extensionPopup) {
                    extensionPopup.style.display = 'block';
                    // Show receipt view
                    if (receiptView) receiptView.style.display = 'block';
                    if (mainView) mainView.style.display = 'none';
                }
                console.log('✅ MAIN: Section 4 - Receipt view');
                break;
        }
        
        this.currentSection = sectionId;
    },

    hideAllSections() {
        // Hide all main content areas
        const homeContent = document.getElementById('home-content');
        const nokiaContent = document.getElementById('nokia-content');
        const extensionPopup = document.getElementById('extension-popup');
        
        if (homeContent) homeContent.style.display = 'none';
        if (nokiaContent) nokiaContent.style.display = 'none';
        if (extensionPopup) extensionPopup.style.display = 'none';
        
        // Hide specific section elements
        const sections = [
            'section-2a-content-detected',
            'section-2b-automode'
        ];
        
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) section.style.display = 'none';
        });
        
        console.log('🎯 MAIN: All sections hidden');
    },

    initializeUI() {
        // Set up entry point event listeners
        this.setupEntryPointListeners();
        
        // Initialize ASCII display with default content
        this.initializeAsciiDisplay();
        
        // Populate stream detector entry point
        this.populateStreamDetector();
        
        console.log('🎯 MAIN: UI initialized');
    },

    populateStreamDetector() {
        const streamDetector = document.getElementById('stream-detector-entry');
        if (streamDetector) {
            streamDetector.innerHTML = `
                <div class="status">STREAM DETECTED!</div>
                <div class="subtext" style="margin-top: 10px; margin-bottom: 10px;">
                    Select detected show:
                </div>
                <select id="detection-show-select" class="show-select" onchange="changeDetectionShow(this.value)">
                    <option value="">Select a show...</option>
                    <option value="Breaking Bad S1E1">Breaking Bad S1E1 (2008) - Netflix</option>
                    <option value="The Office S2E1">The Office S2E1 (2005) - Peacock</option>
                    <option value="Stranger Things S1E1">Stranger Things S1E1 (2016) - Netflix</option>
                    <option value="The Walking Dead S1E1">The Walking Dead S1E1 (2010) - AMC</option>
                    <option value="Friends S1E1">Friends S1E1 (1994) - HBO Max</option>
                </select>
                <button class="primary-cta" onclick="launchWithDetection()" style="width:100%; padding: 10px 12px; font-size: 12px;">
                    Launch Rumi & Get Points
                </button>
            `;
        }
    },

    setupEntryPointListeners() {
        // Detection entry point
        const detectionButton = document.querySelector('.stream-detector');
        if (detectionButton) {
            detectionButton.onclick = () => this.launchWithDetection();
        }

        // Automode entry point
        const automodeButton = document.querySelector('.automode-button');
        if (automodeButton) {
            automodeButton.onclick = () => this.launchWithAutomode();
        }
        
        // Block progression events
        window.RumiEvents.on('blockProgressionStarted', (data) => {
            console.log('🎬 RUMI: Block progression started', data);
            this.updateBlockProgressionUI(data);
        });
        
        window.RumiEvents.on('blockProgressed', (data) => {
            console.log('🎬 RUMI: Block progressed', data);
            this.updateBlockProgressUI(data);
        });
        
        window.RumiEvents.on('blockIndexed', (data) => {
            console.log('✅ RUMI: Block indexed', data);
            this.updateBlockIndexedUI(data);
        });
        
        window.RumiEvents.on('blockProgressionCompleted', (data) => {
            console.log('🎉 RUMI: Block progression completed', data);
            this.handleProgressionComplete(data);
        });
        
        // Session management events
        window.RumiEvents.on('sessionStarted', () => {
            console.log('📋 RUMI: Session started');
        });
        
        window.RumiEvents.on('sessionEnded', (data) => {
            console.log('📋 RUMI: Session ended', data);
            this.showReceiptView();
        });
    },

    updateBlockProgressionUI(data) {
        // Update progress indicators
        const progressText = document.getElementById('automode-progress-text');
        if (progressText) {
            progressText.textContent = `Indexing block ${data.index + 1} of ${data.totalBlocks}...`;
        }
        
        // Update progress bar
        const progressBar = document.getElementById('automode-training-progress');
        if (progressBar) {
            const percentage = (data.progress || 0);
            progressBar.style.width = `${percentage}%`;
        }
    },

    updateBlockProgressUI(data) {
        // Update current block being indexed
        const progressText = document.getElementById('automode-progress-text');
        if (progressText) {
            progressText.textContent = `Indexing: ${data.content.title} (${data.progress.toFixed(1)}%)`;
        }
    },

    updateBlockIndexedUI(data) {
        // Update progress text when block is indexed
        const progressText = document.getElementById('automode-progress-text');
        if (progressText) {
            progressText.textContent = `Completed: ${data.content.title}`;
        }
    },

    handleProgressionComplete(data) {
        // Show completion message
        const progressText = document.getElementById('automode-progress-text');
        if (progressText) {
            progressText.textContent = `Indexing complete! ${data.totalIndexed} items processed`;
        }
        
        // Auto-show receipt after a delay
        setTimeout(() => {
            this.showReceiptView();
        }, 2000);
    },

    initializeAsciiDisplay() {
        // Initialize with default content
        const defaultContent = {
            title: 'RUMI EXTENSION',
            genre: 'system',
            duration: 0
        };

        window.RumiEvents.emit(window.RumiEventTypes.UI_ASCII_UPDATE, {
            content: defaultContent,
            meta: { elapsedTime: 0 },
            animate: true
        });
    },

    // ================================
    // EVENT HANDLERS
    // ================================

    handleSessionStart(data) {
        console.log('🎯 MAIN: Session started', data);
        // Update UI to show indexing sections
        this.showSection('section-3a');
    },

    handleSessionStop(data) {
        console.log('🎯 MAIN: Session stopped', data);
        // Show receipt section
        this.showSection('section-4a');
    },

    handleContentLoaded(content) {
        console.log('🎯 MAIN: Content loaded', content);
        // Update ASCII display
        window.RumiEvents.emit(window.RumiEventTypes.UI_ASCII_UPDATE, {
            content: content,
            meta: { duration: content.duration },
            animate: true
        });
    },

    handleContentProgress(data) {
        // Update progress displays
        if (data.progress !== undefined) {
            const progressElement = document.getElementById('indexing-progress');
            if (progressElement) {
                progressElement.style.width = `${data.progress}%`;
            }
        }
    },

    handleUIUpdate(data) {
        // Handle UI updates from other modules
        console.log('🎯 MAIN: UI update received', data);
    },

    // ================================
    // ENTRY POINT FUNCTIONS
    // ================================

    launchWithDetection() {
        console.log('🎯 RUMI: Launching with detection mode');
        
        const selectedShow = document.getElementById('detection-show-select').value;
        if (!selectedShow) {
            alert('Please select a show first');
            return;
        }
        
        // Update detected show info
        const showTitle = document.getElementById('detected-show-title-indexing');
        const showMeta = document.getElementById('detected-show-meta-indexing');
        
        if (showTitle) showTitle.textContent = selectedShow;
        if (showMeta) showMeta.textContent = 'Processing...';
        
        // Show detected show UI
        const detectedUI = document.getElementById('detected-show-ui-indexing');
        if (detectedUI) detectedUI.style.display = 'block';
        
        // Transition to Section 2a (Content Detected)
        this.showSection('section-2a');
        
        console.log('✅ RUMI: Detection mode launched - showing Section 2a');
    },

    launchWithAutomode() {
        console.log('🤖 RUMI: Launching with automode');
        
        const selectedBucket = document.getElementById('bucket-select').value;
        if (!selectedBucket) {
            alert('Please select a bucket first');
            return;
        }
        
        // Update bucket info
        const bucketText = document.getElementById('expand-automode-channel-text-indexing');
        if (bucketText) bucketText.textContent = `WHAT ARE WE LEARNING - ${selectedBucket}`;
        
        // Show automode channel section
        const automodeSection = document.getElementById('automode-channel-section-indexing');
        if (automodeSection) automodeSection.style.display = 'block';
        
        // Transition to Section 2b (Automode)
        this.showSection('section-2b');
        
        console.log('✅ RUMI: Automode launched - showing Section 2b');
    },

    // ================================
    // INDEXING FUNCTIONS
    // ================================

    startDetectionIndexing() {
        console.log('🎯 MAIN: Starting detection indexing');
        
        // Start backend session
        if (window.RumiBackend) {
            window.RumiBackend.startSession(0.1);
        }
        
        // Start content progression
        if (window.RumiState && window.RumiContent) {
            const detectedShow = window.RumiState.app.detectedShow;
            if (detectedShow) {
                window.RumiContent.startProgression(detectedShow);
            }
        }
        
        // Emit session start event
        if (window.RumiEvents) {
            window.RumiEvents.emit('sessionStart');
        }
    },

    startAutomodeIndexing() {
        console.log('🎯 MAIN: Starting automode indexing');
        
        if (window.RumiContent && window.RumiState) {
            // Get bucket content
            const bucket = window.RumiContent.getBucket(window.RumiState.app.currentBucket);
            window.RumiState.updateApp({
                automodeContentItems: bucket.content
            });
            
            // Start backend session with bucket rate
            if (window.RumiBackend) {
                window.RumiBackend.startSession(bucket.baseRate);
            }
            
            // Start content progression with first item
            if (bucket.content.length > 0) {
                window.RumiContent.startProgression(bucket.content[0]);
            }
        }
        
        // Emit session start event
        if (window.RumiEvents) {
            window.RumiEvents.emit('sessionStart');
        }
    },

    stopIndexing() {
        console.log('🎯 MAIN: Stopping indexing');
        
        // Stop content progression
        if (window.RumiContent) {
            window.RumiContent.stopProgression();
        }
        
        // Emit session stop event
        if (window.RumiEvents) {
            window.RumiEvents.emit('sessionStop');
        }
    },

    toggleIndexing() {
        if (window.RumiState && window.RumiState.app.isIndexing) {
            this.stopIndexing();
        } else {
            if (window.RumiState && window.RumiState.app.entryPoint === 'detection') {
                this.startDetectionIndexing();
            } else {
                this.startAutomodeIndexing();
            }
        }
    },

    // ================================
    // UTILITY FUNCTIONS
    // ================================

    returnToEntryPoint() {
        console.log('🎯 MAIN: Returning to entry point');
        
        // Reset state
        if (window.RumiState) {
            window.RumiState.reset();
        }
        
        // Show entry points
        const entryPointPanel = document.querySelector('.entry-point-panel');
        if (entryPointPanel) {
            entryPointPanel.style.display = 'flex';
        }
        
        // Hide extension popup
        const popup = document.querySelector('.extension-popup');
        if (popup) {
            popup.style.display = 'none';
        }
        
        // Reset ASCII display
        this.initializeAsciiDisplay();
    },

    // ================================
    // UI TOGGLE FUNCTIONS
    // ================================

    toggleLearningInsightsExpansion() {
        const container = document.getElementById('learning-insights-expanded-container');
        const icon = document.getElementById('expand-learning-insights-icon');
        if (container && icon) {
            const isExpanded = container.style.display !== 'none';
            container.style.display = isExpanded ? 'none' : 'block';
            icon.textContent = isExpanded ? '▼' : '▲';
        }
    },

    toggleLearningInsightsExpansionIndexing() {
        const container = document.getElementById('learning-insights-expanded-container-indexing');
        const icon = document.getElementById('expand-learning-insights-icon-indexing');
        if (container && icon) {
            const isExpanded = container.style.display !== 'none';
            container.style.display = isExpanded ? 'none' : 'block';
            icon.textContent = isExpanded ? '▼' : '▲';
        }
    },

    toggleDetectionChannelExpansion() {
        const container = document.getElementById('detection-channel-expanded-container');
        const icon = document.getElementById('expand-detection-channel-icon');
        if (container && icon) {
            const isExpanded = container.style.display !== 'none';
            container.style.display = isExpanded ? 'none' : 'block';
            icon.textContent = isExpanded ? '▼' : '▲';
        }
    },

    toggleChannelExpansion() {
        const container = document.getElementById('channel-expanded-container');
        const icon = document.getElementById('expand-channel-icon');
        if (container && icon) {
            const isExpanded = container.style.display !== 'none';
            container.style.display = isExpanded ? 'none' : 'block';
            icon.textContent = isExpanded ? '▼' : '▲';
        }
    },

    toggleRumiChannelExpansion() {
        const container = document.getElementById('rumi-channel-expanded-container');
        const icon = document.getElementById('expand-rumi-channel-icon');
        if (container && icon) {
            const isExpanded = container.style.display !== 'none';
            container.style.display = isExpanded ? 'none' : 'block';
            icon.textContent = isExpanded ? '▼' : '▲';
        }
    },

    toggleDetectionChannelExpansionIndexing() {
        const container = document.getElementById('detection-channel-expanded-container-indexing');
        const icon = document.getElementById('expand-detection-channel-icon-indexing');
        if (container && icon) {
            const isExpanded = container.style.display !== 'none';
            container.style.display = isExpanded ? 'none' : 'block';
            icon.textContent = isExpanded ? '▼' : '▲';
        }
    },

    toggleAutomodeChannelExpansion() {
        const container = document.getElementById('automode-channel-expanded-container');
        const icon = document.getElementById('expand-automode-channel-icon');
        if (container && icon) {
            const isExpanded = container.style.display !== 'none';
            container.style.display = isExpanded ? 'none' : 'block';
            icon.textContent = isExpanded ? '▼' : '▲';
        }
    },

    toggleAutomodeChannelExpansionIndexing() {
        const container = document.getElementById('automode-channel-expanded-container-indexing');
        const icon = document.getElementById('expand-automode-channel-icon-indexing');
        if (container && icon) {
            const isExpanded = container.style.display !== 'none';
            container.style.display = isExpanded ? 'none' : 'block';
            icon.textContent = isExpanded ? '▼' : '▲';
        }
    },

    toggleTrainingProgressExpansion() {
        const container = document.getElementById('training-progress-expanded-container');
        const icon = document.getElementById('expand-training-progress-icon');
        if (container && icon) {
            const isExpanded = container.style.display !== 'none';
            container.style.display = isExpanded ? 'none' : 'block';
            icon.textContent = isExpanded ? '▼' : '▲';
        }
    },

    dismissDetectedShow() {
        const ui = document.getElementById('detected-show-ui');
        if (ui) {
            ui.style.display = 'none';
        }
    },

    dismissDetectedShowIndexing() {
        const ui = document.getElementById('detected-show-ui-indexing');
        if (ui) {
            ui.style.display = 'none';
        }
    },

    changeDetectionShow(event) {
        // Handle both event objects and direct values
        const show = event && event.target ? event.target.value : event;
        console.log('🎯 MAIN: Detection show changed to:', show);
        
        if (show && window.RumiState) {
            window.RumiState.updateApp({
                pendingDetectedShow: show,
                detectedShow: show
            });
        }
    },

    changeBucket(event) {
        // Handle both event objects and direct values
        const selectedBucket = event && event.target ? event.target.value : event;
        console.log('🎯 MAIN: Bucket changed to:', selectedBucket);
        
        if (selectedBucket && window.RumiState) {
            window.RumiState.updateApp({
                currentBucket: selectedBucket,
                pendingBucket: selectedBucket
            });
        }
    },

    // ================================
    // SECTION 3A: INDEXING WITH GENRE CHANNEL
    // ================================

    showSection3a() {
        console.log('🎬 RUMI: Showing Section 3a - Indexing with Genre Channel');
        
        // Hide other sections
        this.hideAllSections();
        
        // Show Section 3a elements
        const nokiaContent = document.getElementById('nokia-content');
        const holisticPanel = document.getElementById('holistic-indexing-panel');
        const stopButton = document.getElementById('stop-indexing-button');
        
        if (nokiaContent) nokiaContent.style.display = 'block';
        if (holisticPanel) holisticPanel.style.display = 'block';
        if (stopButton) stopButton.style.display = 'block';
        
        // Start session tracking
        if (window.RumiContent) {
            window.RumiContent.startSession();
        }
        
        // Start block progression
        if (window.RumiBackend) {
            window.RumiBackend.startBlockProgression();
        }
        
        // Show genre channel in Section 3a
        this.showGenreChannelInSection3a();
        
        // Update current section
        this.currentSection = 'section-3a';
        
        console.log('✅ RUMI: Section 3a displayed with genre channel and block progression');
    },

    showGenreChannelInSection3a() {
        // Show detection channel section for Section 3a
        const detectionSection = document.getElementById('detection-channel-section-indexing');
        const expandHeader = document.getElementById('expand-detection-channel-header-indexing');
        const expandedContainer = document.getElementById('detection-channel-expanded-container-indexing');
        
        if (detectionSection) {
            detectionSection.style.display = 'block';
            
            // Auto-expand the channel
            if (expandedContainer) {
                expandedContainer.style.display = 'block';
            }
            
            // Update header text to show genre channel
            if (expandHeader) {
                const textElement = document.getElementById('expand-detection-channel-text-indexing');
                if (textElement) {
                    textElement.textContent = 'GENRE CHANNEL - WATCH PROGRESSION';
                }
            }
        }
        
        console.log('📺 RUMI: Genre channel displayed in Section 3a');
    },

    stopIndexing() {
        console.log('🛑 RUMI: Stopping indexing session');
        
        // Stop block progression
        if (window.RumiBackend) {
            window.RumiBackend.stopBlockProgression();
        }
        
        // Show receipt view
        this.showReceiptView();
    },

    showReceiptView() {
        console.log('📋 RUMI: Showing receipt view');
        
        // Hide main view
        const mainView = document.getElementById('main-view');
        const receiptView = document.getElementById('receipt-view');
        
        if (mainView) mainView.style.display = 'none';
        if (receiptView) receiptView.style.display = 'block';
        
        // Populate receipt with session data
        if (window.RumiContent) {
            window.RumiContent.populateReceipt();
        }
        
        // Update points display
        if (window.RumiState) {
            window.RumiState.updatePointsDisplay();
        }
        
        console.log('✅ RUMI: Receipt view displayed');
    },

    returnToEntryPoint() {
        console.log('🏠 RUMI: Returning to entry point');
        
        // Hide receipt view
        const mainView = document.getElementById('main-view');
        const receiptView = document.getElementById('receipt-view');
        
        if (mainView) mainView.style.display = 'block';
        if (receiptView) receiptView.style.display = 'none';
        
        // Show Section 1
        this.showSection('section-1');
        
        // Finalize pending points
        if (window.RumiState) {
            window.RumiState.finalizePendingPoints();
        }
        
        console.log('✅ RUMI: Returned to entry point');
    },

    // ================================
    // DEBUG FUNCTIONS
    // ================================

    testDetectionFlow() {
        console.log('🧪 DEBUG: Testing Detection Flow');
        
        // Set up detection show
        const showSelect = document.getElementById('detection-show-select');
        if (showSelect) {
            showSelect.value = 'Breaking Bad S1E1';
        }
        
        // Launch detection flow
        this.launchWithDetection();
        
        // Simulate progression to Section 3a after 2 seconds
        setTimeout(() => {
            console.log('🧪 DEBUG: Progressing to Section 3a');
            this.showSection('section-3a');
        }, 2000);
        
        // Simulate completion after 4 seconds
        setTimeout(() => {
            console.log('🧪 DEBUG: Showing receipt');
            this.showSection('section-4a');
        }, 4000);
    },

    testAutomodeFlow() {
        console.log('🧪 DEBUG: Testing Automode Flow');
        
        // Set up automode bucket
        const bucketSelect = document.getElementById('bucket-select');
        if (bucketSelect) {
            bucketSelect.value = 'Content Intelligence';
        }
        
        // Launch automode flow
        this.launchWithAutomode();
        
        // Simulate progression to Section 3b after 2 seconds
        setTimeout(() => {
            console.log('🧪 DEBUG: Progressing to Section 3b');
            this.showSection('section-3b');
        }, 2000);
        
        // Simulate completion after 4 seconds
        setTimeout(() => {
            console.log('🧪 DEBUG: Showing receipt');
            this.showSection('section-4b');
        }, 4000);
    },

    testSection3a() {
        console.log('🧪 DEBUG: Testing Section 3a');
        this.showSection('section-3a');
    },

    testSection3b() {
        console.log('🧪 DEBUG: Testing Section 3b');
        this.showSection('section-3b');
    },

    testReceipt() {
        console.log('🧪 DEBUG: Testing Receipt');
        this.showSection('section-4a');
    },

    testSettings() {
        console.log('⚙️ SETTINGS: Test settings clicked');
        // For now, just log the action
        alert('Settings panel would open here');
    },

    showChannelError() {
        console.log('❌ CHANNEL: Error loading channel');
        const loading = document.getElementById('channel-loading');
        if (loading) {
            loading.textContent = 'Error loading channel';
            loading.style.color = '#ff4444';
            loading.style.display = 'block';
        }
    },

    showRumiChannelError() {
        console.log('❌ RUMI CHANNEL: Error loading Rumi channel');
        const loading = document.getElementById('rumi-channel-loading');
        if (loading) {
            loading.textContent = 'Error loading Rumi channel';
            loading.style.color = '#ff4444';
            loading.style.display = 'block';
        }
    },

    showDetectionChannelErrorIndexing() {
        console.log('❌ DETECTION CHANNEL INDEXING: Error loading detection channel');
        const loading = document.getElementById('detection-channel-loading-indexing');
        if (loading) {
            loading.textContent = 'Error loading detection channel';
            loading.style.color = '#ff4444';
            loading.style.display = 'block';
        }
    },

    showAutomodeChannelErrorIndexing() {
        console.log('❌ AUTOMODE CHANNEL INDEXING: Error loading automode channel');
        const loading = document.getElementById('automode-channel-loading-indexing');
        if (loading) {
            loading.textContent = 'Error loading automode channel';
            loading.style.color = '#ff4444';
            loading.style.display = 'block';
        }
    },

    // ================================
    // GLOBAL FUNCTION EXPORTS
    // ================================

    // Export functions to global scope for HTML onclick handlers
    exportGlobalFunctions() {
        // Export all functions to global scope for HTML onclick handlers
        window.launchWithDetection = () => this.launchWithDetection();
        window.launchWithAutomode = () => this.launchWithAutomode();
        window.startDetectionIndexing = () => this.startDetectionIndexing();
        window.startAutomodeIndexing = () => this.startAutomodeIndexing();
        window.stopIndexing = () => this.stopIndexing();
        window.toggleIndexing = () => this.toggleIndexing();
        window.returnToEntryPoint = () => this.returnToEntryPoint();
        window.toggleLearningInsightsExpansion = () => this.toggleLearningInsightsExpansion();
        window.toggleLearningInsightsExpansionIndexing = () => this.toggleLearningInsightsExpansionIndexing();
        window.toggleDetectionChannelExpansion = () => this.toggleDetectionChannelExpansion();
        window.toggleChannelExpansion = () => this.toggleChannelExpansion();
        window.toggleRumiChannelExpansion = () => this.toggleRumiChannelExpansion();
        window.toggleDetectionChannelExpansionIndexing = () => this.toggleDetectionChannelExpansionIndexing();
        window.toggleAutomodeChannelExpansion = () => this.toggleAutomodeChannelExpansion();
        window.toggleAutomodeChannelExpansionIndexing = () => this.toggleAutomodeChannelExpansionIndexing();
        window.toggleTrainingProgressExpansion = () => this.toggleTrainingProgressExpansion();
        window.dismissDetectedShow = () => this.dismissDetectedShow();
        window.dismissDetectedShowIndexing = () => this.dismissDetectedShowIndexing();
        window.changeDetectionShow = (event) => this.changeDetectionShow(event);
        window.changeBucket = (event) => this.changeBucket(event);
        window.showSection3a = () => this.showSection3a();
        window.showGenreChannelInSection3a = () => this.showGenreChannelInSection3a();
        window.showReceiptView = () => this.showReceiptView();
        window.testDetectionFlow = () => this.testDetectionFlow();
        window.testAutomodeFlow = () => this.testAutomodeFlow();
        window.testSection3a = () => this.testSection3a();
        window.testSection3b = () => this.testSection3b();
        window.testReceipt = () => this.testReceipt();
        window.testSettings = () => this.testSettings();
        window.showChannelError = () => this.showChannelError();
        window.showRumiChannelError = () => this.showRumiChannelError();
        window.showDetectionChannelErrorIndexing = () => this.showDetectionChannelErrorIndexing();
        window.showAutomodeChannelErrorIndexing = () => this.showAutomodeChannelErrorIndexing();
        
        // Add missing functions
        window.simulateShowChange = () => this.simulateShowChange();
        window.toggleCacheControl = () => this.toggleCacheControl();
        
        console.log('🌐 MAIN: Global functions exported');
    },

    simulateShowChange() {
        console.log('🔄 SIMULATION: User changes content');
        // Simulate user changing content during indexing
        const detectedShowUI = document.getElementById('detected-show-ui-indexing');
        if (detectedShowUI) {
            detectedShowUI.style.display = 'block';
            const titleElement = document.getElementById('detected-show-title-indexing');
            if (titleElement) {
                titleElement.textContent = 'Breaking Bad S2E1';
            }
            const metaElement = document.getElementById('detected-show-meta-indexing');
            if (metaElement) {
                metaElement.textContent = 'Season 2, Episode 1 | 47m';
            }
        }
    },

    toggleCacheControl() {
        console.log('🗂️ CACHE: Toggle cache control');
        const toggle = document.getElementById('cache-control-toggle');
        const button = document.getElementById('cache-control-btn');
        
        if (toggle && button) {
            const isEnabled = toggle.checked;
            if (isEnabled) {
                button.textContent = '🗂️ Enable Cache';
                button.style.background = '#1a1a1a';
                button.style.borderColor = '#666';
                button.style.color = '#ccc';
            } else {
                button.textContent = '🗂️ Disable Cache';
                button.style.background = '#2a2a2a';
                button.style.borderColor = '#00ff41';
                button.style.color = '#00ff41';
            }
        }
    },

    // ================================
    // INITIALIZATION COMPLETION
    // ================================

    // Complete initialization by exporting global functions
    completeInit() {
        // Always export global functions first
        this.exportGlobalFunctions();
        
        // Initialize points display
        if (window.RumiState) {
            window.RumiState.updatePointsDisplay();
        }
        
        // Initialize ASCII display
        this.initializeAsciiDisplay();
        
        // Show initial section
        this.showSection('section-1');
        
        console.log('✅ RUMI: Initialization complete');
    }
};

// Initialize and export global functions when ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.RumiApp) {
            window.RumiApp.completeInit();
        }
    }, 200);
}); 