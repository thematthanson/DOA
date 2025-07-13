// ================================
// RUMI CONTENT MANAGER
// Consolidated content management and progression system
// ================================

window.RumiContent = {
    // Content library
    contentLibrary: [],
    
    // Current session content
    sessionContent: [],
    currentIndex: 0,
    
    // Content progression state
    progression: {
        isActive: false,
        startTime: null,
        currentItem: null,
        elapsedTime: 0,
        totalDuration: 0,
        progressInterval: null
    },

    // Content types and buckets (generated from CSV)
    buckets: {},

    // Receipt and session tracking
    currentSession: {
        startTime: null,
        endTime: null,
        indexedContent: [],
        totalPoints: 0,
        multiplier: 1.0,
        baseRate: 0.5,
        bonus: 'None'
    },

    // ================================
    // INITIALIZATION
    // ================================

    async init() {
        console.log('📚 CONTENT: Initializing content manager...');
        
        await this.loadContentLibrary();
        this.generateBucketsFromCSV();
        this.setupEventListeners();
        this.generateBucketContent();
        
        console.log('📚 CONTENT: Content manager initialized');
    },

    async loadContentLibrary() {
        // Load from CSV - no fallback content
        try {
            console.log('📚 CONTENT: Loading from CSV...');
            const response = await fetch('data/content-library-expanded.csv');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const csvText = await response.text();
            const lines = csvText.split('\n').filter(line => line.trim());
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            
            this.contentLibrary = [];
            
            for (let i = 1; i < lines.length; i++) {
                const values = this.parseCSVLine(lines[i]);
                if (values.length >= headers.length) {
                    const item = {};
                    
                    headers.forEach((header, index) => {
                        item[header.toLowerCase()] = values[index] ? values[index].trim().replace(/"/g, '') : '';
                    });
                    
                    // Convert duration to number
                    if (item.duration_minutes) {
                        item.duration = parseInt(item.duration_minutes);
                    } else if (item.duration) {
                        item.duration = parseInt(item.duration);
                    } else {
                        item.duration = 45;
                    }
                    
                    this.contentLibrary.push(item);
                }
            }
            
            console.log(`📚 CONTENT: Loaded ${this.contentLibrary.length} items from CSV`);
            
        } catch (error) {
            console.error('❌ CONTENT: CSV loading failed:', error.message);
            console.error('💥 CRITICAL ERROR: Content manager requires CSV data - no fallback available');
            this.contentLibrary = [];
            throw new Error('Content library CSV could not be loaded - system cannot function without data');
        }
    },

    generateBucketsFromCSV() {
        // Extract unique intelligence buckets from CSV data
        const bucketNames = [...new Set(this.contentLibrary
            .filter(item => item.intelligence_bucket)
            .map(item => item.intelligence_bucket))];
        
        // Generate bucket definitions dynamically
        this.buckets = {};
        
        bucketNames.forEach(bucketName => {
            const bucketContent = this.contentLibrary.filter(item => 
                item.intelligence_bucket === bucketName
            );
            
            this.buckets[bucketName] = {
                name: bucketName,
                description: `Content analysis and processing for ${bucketName}`,
                baseRate: this.calculateBucketBaseRate(bucketName),
                content: bucketContent,
                count: bucketContent.length
            };
        });
        
        console.log(`📚 CONTENT: Generated ${Object.keys(this.buckets).length} buckets from CSV data`);
    },

    calculateBucketBaseRate(bucketName) {
        // Calculate base rate based on bucket content characteristics
        const bucketContent = this.contentLibrary.filter(item => 
            item.intelligence_bucket === bucketName
        );
        
        if (bucketContent.length === 0) return 0.1;
        
        // Calculate average duration and adjust base rate
        const avgDuration = bucketContent.reduce((sum, item) => sum + (item.duration || 45), 0) / bucketContent.length;
        
        // Higher duration content gets higher base rate
        if (avgDuration > 60) return 0.3;
        if (avgDuration > 45) return 0.25;
        if (avgDuration > 30) return 0.2;
        return 0.15;
    },

    // Helper method for parsing CSV lines with quotes
    parseCSVLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        values.push(current);
        return values;
    },

    setupEventListeners() {
        // Listen for session start
        window.RumiEvents.on(window.RumiEventTypes.SESSION_START, (data) => {
            this.resetSession();
        });

        // Listen for content progression
        window.RumiEvents.on(window.RumiEventTypes.CONTENT_PROGRESS, (data) => {
            this.updateProgression(data);
        });
    },

    generateBucketContent() {
        // Generate automode content for each bucket from actual CSV data
        Object.keys(this.buckets).forEach(bucketKey => {
            const bucket = this.buckets[bucketKey];
            bucket.automodeContent = this.generateAutomodeContent(bucket.name);
        });
    },

    generateAutomodeContent(bucketName) {
        // Get actual content from this bucket
        const bucketContent = this.contentLibrary.filter(item => 
            item.intelligence_bucket === bucketName
        );
        
        if (bucketContent.length === 0) {
            return [{
                title: 'No Content Available',
                duration: 15,
                description: 'No content found for this bucket',
                status: 'Inactive'
            }];
        }
        
        // Generate automode items from actual content
        return bucketContent.slice(0, 5).map((item, index) => ({
            title: `${item.title} Analysis`,
            duration: Math.max(10, Math.floor(item.duration * 0.3)), // 30% of original duration
            description: `Processing ${item.title} for ${bucketName}`,
            status: ['Active', 'Processing', 'Queued', 'Pending', 'Training'][index % 5],
            originalContent: item.title,
            genre: item.genre,
            service: item.service
        }));
    },

    // ================================
    // CONTENT PROGRESSION
    // ================================

    startProgression(content, mode = 'normal') {
        console.log(`📚 CONTENT: Starting progression for "${content.title}"`);
        
        this.progression.isActive = true;
        this.progression.startTime = Date.now();
        this.progression.currentItem = content;
        this.progression.elapsedTime = 0;
        this.progression.totalDuration = content.duration * 60; // Convert to seconds
        
        // Start progress interval
        this.progression.progressInterval = setInterval(() => {
            this.updateProgression();
        }, 1000);
        
        // Emit content loaded event
        window.RumiEvents.emit(window.RumiEventTypes.CONTENT_LOADED, content);
        
        return this.progression;
    },

    updateProgression(data = null) {
        if (!this.progression.isActive) return;
        
        const now = Date.now();
        this.progression.elapsedTime = Math.floor((now - this.progression.startTime) / 1000);
        
        // Check if content is complete
        if (this.progression.elapsedTime >= this.progression.totalDuration) {
            this.completeCurrentContent();
        } else {
            // Emit progress update
            window.RumiEvents.emit(window.RumiEventTypes.CONTENT_PROGRESS, {
                current: this.progression.currentItem,
                elapsed: this.progression.elapsedTime,
                total: this.progression.totalDuration,
                progress: (this.progression.elapsedTime / this.progression.totalDuration) * 100
            });
        }
    },

    completeCurrentContent() {
        if (!this.progression.currentItem) return;
        
        console.log(`📚 CONTENT: Completed "${this.progression.currentItem.title}"`);
        
        // Add to session content
        this.sessionContent.push({
            ...this.progression.currentItem,
            completedAt: Date.now(),
            duration: this.progression.currentItem.duration
        });
        
        // Stop progression
        this.stopProgression();
        
        // Move to next content
        this.moveToNextContent();
        
        // Emit completion event
        window.RumiEvents.emit(window.RumiEventTypes.CONTENT_COMPLETE, this.progression.currentItem);
    },

    stopProgression() {
        if (this.progression.progressInterval) {
            clearInterval(this.progression.progressInterval);
            this.progression.progressInterval = null;
        }
        
        this.progression.isActive = false;
        this.progression.currentItem = null;
    },

    moveToNextContent() {
        this.currentIndex++;
        
        if (this.currentIndex < this.sessionContent.length) {
            const nextContent = this.sessionContent[this.currentIndex];
            this.startProgression(nextContent);
        } else {
            console.log('📚 CONTENT: All content completed');
            window.RumiEvents.emit(window.RumiEventTypes.SESSION_STOP);
        }
    },

    // ================================
    // CONTENT QUERYING
    // ================================

    getContentByGenre(genre) {
        return this.contentLibrary.filter(item => 
            item.genre && item.genre.toLowerCase() === genre.toLowerCase()
        );
    },

    getContentByService(service) {
        return this.contentLibrary.filter(item => 
            item.service && item.service.toLowerCase() === service.toLowerCase()
        );
    },

    getContentByYear(year) {
        return this.contentLibrary.filter(item => 
            item.year && item.year.toString() === year.toString()
        );
    },

    searchContent(query) {
        const searchTerm = query.toLowerCase();
        return this.contentLibrary.filter(item => 
            item.title.toLowerCase().includes(searchTerm) ||
            (item.description && item.description.toLowerCase().includes(searchTerm)) ||
            (item.genre && item.genre.toLowerCase().includes(searchTerm))
        );
    },

    // ================================
    // SESSION MANAGEMENT
    // ================================

    resetSession() {
        this.sessionContent = [];
        this.currentIndex = 0;
        this.stopProgression();
        console.log('📚 CONTENT: Session reset');
    },

    getSessionContent() {
        return this.sessionContent;
    },

    getCurrentContent() {
        return this.progression.currentItem;
    },

    getProgressionState() {
        return this.progression;
    },

    // ================================
    // BUCKET MANAGEMENT
    // ================================

    getBucket(bucketName) {
        return this.buckets[bucketName] || this.buckets['Content Intelligence'];
    },

    getAllBuckets() {
        return Object.keys(this.buckets).map(key => ({
            key: key,
            ...this.buckets[key]
        }));
    },

    setBucketContent(bucketName, content) {
        if (this.buckets[bucketName]) {
            this.buckets[bucketName].content = content;
        }
    },

    // ================================
    // RECEIPT MANAGEMENT
    // ================================

    startSession() {
        // Get base rate from backend engine if available
        const baseRate = window.RumiBackend && window.RumiBackend.sessionData ? 
            window.RumiBackend.sessionData.baseRate : 0.1;
        
        this.currentSession = {
            startTime: Date.now(),
            endTime: null,
            indexedContent: [],
            totalPoints: 0,
            multiplier: 1.0,
            baseRate: baseRate,
            bonus: 'None'
        };
        
        // Start backend session if available
        if (window.RumiBackend) {
            window.RumiBackend.startSession(baseRate);
        }
        
        console.log('📋 CONTENT: Session started with base rate', baseRate);
    },

    addIndexedContent(content) {
        this.currentSession.indexedContent.push({
            title: content.title,
            duration: content.duration,
            service: content.service || 'Unknown',
            genre: content.genre || 'Unknown',
            timestamp: Date.now()
        });
        console.log('📋 CONTENT: Added indexed content:', content.title);
    },

    calculateSessionPoints() {
        let totalDuration = 0;
        let totalPoints = 0;
        
        // Calculate points using progressive multipliers from backend
        this.currentSession.indexedContent.forEach((item, index) => {
            totalDuration += item.duration;
            
            // Use backend engine's progressive multiplier system
            if (window.RumiBackend) {
                const sessionTime = totalDuration - item.duration; // Time before this item
                const pointsData = window.RumiBackend.calculateSegmentedPoints(item.duration, sessionTime);
                totalPoints += pointsData.totalPoints;
                
                console.log(`📊 ${item.title}: ${item.duration}min at avg ${pointsData.averageMultiplier.toFixed(2)}x = ${pointsData.totalPoints.toFixed(2)} pts`);
            } else {
                // Fallback to simple calculation
                const points = (item.duration / 5) * this.currentSession.baseRate * this.currentSession.multiplier;
                totalPoints += points;
            }
        });
        
        this.currentSession.totalPoints = Math.round(totalPoints * 100) / 100; // Round to 2 decimal places
        
        // Update session multiplier to reflect the average
        if (totalDuration > 0) {
            const expectedBasePoints = totalDuration * 60 * this.currentSession.baseRate;
            this.currentSession.multiplier = expectedBasePoints > 0 ? totalPoints / expectedBasePoints : 1.0;
        }
        
        console.log(`💰 Total session: ${totalDuration}min, ${totalPoints.toFixed(2)} points, avg ${this.currentSession.multiplier.toFixed(2)}x multiplier`);
        
        return this.currentSession.totalPoints;
    },

    endSession() {
        this.currentSession.endTime = Date.now();
        const points = this.calculateSessionPoints();
        
        // Add points to state manager
        if (window.RumiState) {
            window.RumiState.addPoints(points, 'pending');
        }
        
        console.log('📋 CONTENT: Session ended with', points, 'points');
        return this.currentSession;
    },

    populateReceipt() {
        const session = this.currentSession;
        const duration = session.endTime ? Math.floor((session.endTime - session.startTime) / 1000 / 60) : 0;
        
        // Update receipt elements
        const elements = {
            'receipt-total-points': `+${session.totalPoints.toFixed(2)}`,
            'receipt-total-pending': `+${session.totalPoints.toFixed(2)}`,
            'receipt-duration': `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`,
            'receipt-multiplier': `${session.multiplier}x`,
            'receipt-bonus': session.bonus
        };
        
        // Update each element
        Object.keys(elements).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = elements[id];
            }
        });
        
        // Populate indexed content list
        const contentList = document.getElementById('receipt-content-list');
        if (contentList) {
            contentList.innerHTML = '';
            session.indexedContent.forEach((item, index) => {
                const contentItem = document.createElement('div');
                contentItem.style.cssText = 'margin-bottom: 8px; padding: 6px; background: #1a1a1a; border-radius: 4px;';
                contentItem.innerHTML = `
                    <div style="color: #00ff41; font-weight: 600;">${index + 1}. ${item.title}</div>
                    <div style="color: #888; font-size: 9px;">
                        ${item.service} • ${item.duration}min • ${item.genre}
                    </div>
                `;
                contentList.appendChild(contentItem);
            });
        }
        
        console.log('📋 CONTENT: Receipt populated with session data');
    }
};

// Initialize content manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.RumiContent.init();
}); 