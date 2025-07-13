// ================================
// RUMI BACKEND ENGINE v1.0
// Proven systems extracted from comprehensive test
// Zero UI dependencies - pure calculation engine
// ================================

window.RumiBackend = {
    // Session state management
    sessionData: { 
        processedContent: [], 
        totalPoints: 0, 
        startTime: null, 
        cumulativeTime: 0,
        blockStates: new Map()
    },

    // Content library (populated from CSV)
    contentLibrary: [],

    // ================================
    // CORE MULTIPLIER SYSTEM (PROVEN)
    // ================================
    
    calculateSegmentedPoints(contentDuration, startTime = null) {
        // Define proven multiplier milestones
        const milestones = [
            { time: 0, multiplier: 1.0 },    // 0-30min: Base rate
            { time: 30, multiplier: 1.1 },   // 30-60min: 1.1x
            { time: 60, multiplier: 1.2 },   // 60-90min: 1.2x  
            { time: 90, multiplier: 1.4 },   // 90-120min: 1.4x
            { time: 120, multiplier: 1.6 },  // 120-180min: 1.6x
            { time: 180, multiplier: 1.8 }   // 180min+: 1.8x
        ];
        
        // Use provided startTime or session cumulative time
        const sessionStartTime = startTime !== null ? startTime : (this.sessionData.cumulativeTime || 0);
        const endTime = sessionStartTime + contentDuration;
        
        const segments = [];
        let totalPoints = 0;
        
        console.log(`🎯 BACKEND: Calculating segmented points for ${contentDuration}min from ${sessionStartTime}min to ${endTime}min`);
        
        // Calculate points for each overlapping segment
        for (let i = 0; i < milestones.length; i++) {
            const currentMilestone = milestones[i];
            const nextMilestone = milestones[i + 1];
            
            const segmentStart = currentMilestone.time;
            const segmentEnd = nextMilestone ? nextMilestone.time : Infinity;
            
            // Check if content overlaps with this segment
            if (sessionStartTime < segmentEnd && endTime > segmentStart) {
                const overlapStart = Math.max(sessionStartTime, segmentStart);
                const overlapEnd = Math.min(endTime, segmentEnd);
                const overlapDuration = overlapEnd - overlapStart;
                
                if (overlapDuration > 0) {
                    const baseRate = 0.1; // 0.1 points per minute base rate
                    const segmentPoints = overlapDuration * baseRate * currentMilestone.multiplier;
                    
                    segments.push({
                        startTime: overlapStart,
                        endTime: overlapEnd,
                        duration: overlapDuration,
                        multiplier: currentMilestone.multiplier,
                        points: segmentPoints
                    });
                    
                    totalPoints += segmentPoints;
                    
                    console.log(`   Segment ${overlapStart}-${overlapEnd}min: ${overlapDuration}min × ${currentMilestone.multiplier}x = ${segmentPoints.toFixed(1)} pts`);
                }
            }
        }
        
        return {
            totalPoints: totalPoints,
            segments: segments,
            averageMultiplier: totalPoints / (contentDuration * 0.1) // For UI display
        };
    },

    // ================================
    // CURRENT MULTIPLIER CALCULATION
    // ================================
    
    getCurrentMultiplier(sessionTime = null) {
        const currentTime = sessionTime !== null ? sessionTime : (this.sessionData.cumulativeTime || 0);
        
        // Find current active multiplier based on session time
        const milestones = [
            { time: 0, multiplier: 1.0 },
            { time: 30, multiplier: 1.1 },
            { time: 60, multiplier: 1.2 },
            { time: 90, multiplier: 1.4 },
            { time: 120, multiplier: 1.6 },
            { time: 180, multiplier: 1.8 }
        ];
        
        let activeMultiplier = 1.0;
        for (let i = milestones.length - 1; i >= 0; i--) {
            if (currentTime >= milestones[i].time) {
                activeMultiplier = milestones[i].multiplier;
                break;
            }
        }
        
        return activeMultiplier;
    },

    // Alias for test compatibility
    getProgressiveMultiplier(sessionTime = null) {
        return this.getCurrentMultiplier(sessionTime);
    },

    // ================================
    // SERVICE FILTERING SYSTEM
    // ================================
    
    filterContentByServices(selectedServices) {
        if (!selectedServices || selectedServices.length === 0) {
            return this.contentLibrary;
        }
        
        return this.contentLibrary.filter(content => 
            selectedServices.includes(content.service?.toLowerCase())
        );
    },

    // ================================
    // GENRE FILTERING SYSTEM
    // ================================
    
    filterContentByGenre(genre) {
        if (!genre) {
            return this.contentLibrary;
        }
        
        // Normalize genre for case-insensitive matching
        const normalizedGenre = genre.toLowerCase();
        
        return this.contentLibrary.filter(content => 
            content.genre && content.genre.toLowerCase() === normalizedGenre
        );
    },

    // ================================
    // SMART CONTENT SELECTION
    // ================================
    
    createSmartSession(targetDuration = 240, availableServices = null) {
        console.log(`🎯 BACKEND: Creating smart session targeting ${targetDuration} minutes`);
        
        let workingContent = this.contentLibrary;
        
        // Apply service filter if provided
        if (availableServices && availableServices.length > 0) {
            workingContent = this.filterContentByServices(availableServices);
            console.log(`📺 Filtered to services: ${availableServices.join(', ')}`);
        }
        
        if (workingContent.length === 0) {
            console.warn('❌ No content available for smart session creation');
            return { content: [], totalDuration: 0, serviceDistribution: {} };
        }
        
        const selectedContent = [];
        const usedShows = new Set();
        let totalDuration = 0;
        const maxBlocks = 12;
        
        // Group content by service
        const contentByService = {};
        const services = [...new Set(workingContent.map(c => c.service))];
        services.forEach(service => {
            contentByService[service] = workingContent.filter(c => c.service === service);
        });
        
        // Smart selection with service distribution
        let serviceIndex = 0;
        while (selectedContent.length < maxBlocks && totalDuration < targetDuration + 40) {
            let foundContent = false;
            
            for (let attempts = 0; attempts < services.length && !foundContent; attempts++) {
                const currentService = services[serviceIndex % services.length];
                const serviceContent = contentByService[currentService];
                
                if (serviceContent && serviceContent.length > 0) {
                    const randomIndex = Math.floor(Math.random() * serviceContent.length);
                    const selected = serviceContent[randomIndex];
                    
                    selectedContent.push(selected);
                    totalDuration += selected.duration;
                    
                    // Remove to avoid duplicates
                    contentByService[currentService].splice(randomIndex, 1);
                    
                    console.log(`📺 Block ${selectedContent.length}: ${selected.title} (${currentService}) - Total: ${totalDuration}min`);
                    foundContent = true;
                    
                    if (totalDuration >= targetDuration) {
                        console.log(`🎯 Target ${targetDuration}min reached at ${totalDuration}min`);
                        break;
                    }
                }
                serviceIndex++;
            }
            
            if (!foundContent) break;
        }
        
        // Calculate service distribution
        const serviceDistribution = {};
        services.forEach(service => serviceDistribution[service] = 0);
        selectedContent.forEach(content => {
            if (serviceDistribution[content.service] !== undefined) {
                serviceDistribution[content.service]++;
            }
        });
        
        return {
            content: selectedContent,
            totalDuration: totalDuration,
            serviceDistribution: serviceDistribution
        };
    },

    // ================================
    // SMART CONTENT SELECTION BY GENRE
    // ================================
    
    createGenreSession(targetDuration = 240, genre = null) {
        console.log(`🎯 BACKEND: Creating genre session targeting ${targetDuration} minutes for genre: ${genre}`);
        
        let workingContent = this.contentLibrary;
        
        // Apply genre filter if provided
        if (genre) {
            workingContent = this.filterContentByGenre(genre);
            console.log(`🎭 Filtered to genre: ${genre} (${workingContent.length} items found)`);
        }
        
        if (workingContent.length === 0) {
            console.warn('❌ No content available for genre session creation');
            return { content: [], totalDuration: 0, genre: genre };
        }
        
        const selectedContent = [];
        let totalDuration = 0;
        const maxBlocks = 12;
        
        // Shuffle content for variety
        const shuffledContent = [...workingContent].sort(() => Math.random() - 0.5);
        
        // Select content up to target duration
        for (const content of shuffledContent) {
            if (selectedContent.length >= maxBlocks || totalDuration >= targetDuration + 40) {
                break;
            }
            
            selectedContent.push(content);
            totalDuration += content.duration;
            
            console.log(`🎭 Block ${selectedContent.length}: ${content.title} (${content.genre}) - Total: ${totalDuration}min`);
        }
        
        return {
            content: selectedContent,
            totalDuration: totalDuration,
            genre: genre
        };
    },

    // ================================
    // SESSION MANAGEMENT
    // ================================
    
    startSession(contentList = null) {
        console.log('🚀 BACKEND: Starting new session');
        
        this.sessionData = {
            processedContent: [],
            totalPoints: 0,
            startTime: Date.now(),
            cumulativeTime: 0,
            blockStates: new Map()
        };
        
        // If content provided, pre-populate session
        if (contentList && contentList.length > 0) {
            contentList.forEach((content, index) => {
                this.sessionData.blockStates.set(index, {
                    ...content,
                    state: 'pending',
                    index: index
                });
            });
        }
        
        return this.sessionData;
    },
    
    addContentToSession(content) {
        console.log(`📺 BACKEND: Adding content to session: ${content.title} (${content.duration}min)`);
        
        // Calculate segmented points
        const pointsData = this.calculateSegmentedPoints(content.duration);
        
        // Add to session
        const sessionItem = {
            ...content,
            points: pointsData.totalPoints,
            segments: pointsData.segments,
            sessionStartTime: this.sessionData.cumulativeTime,
            sessionEndTime: this.sessionData.cumulativeTime + content.duration
        };
        
        this.sessionData.processedContent.push(sessionItem);
        this.sessionData.totalPoints += pointsData.totalPoints;
        this.sessionData.cumulativeTime += content.duration;
        
        console.log(`💰 Points earned: ${pointsData.totalPoints.toFixed(1)} (Total: ${this.sessionData.totalPoints.toFixed(1)})`);
        
        return sessionItem;
    },

    // ================================
    // CSV DATA INTEGRATION
    // ================================
    
    async loadContentLibrary(csvUrl = 'content-library-expanded.csv') {
        const maxRetries = 3;
        let lastError;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`📊 BACKEND: Loading content library from ${csvUrl} (attempt ${attempt}/${maxRetries})`);
                
                const response = await fetch(csvUrl);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const csvText = await response.text();
                
                // Parse CSV with proper quote handling
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
                        
                        // Convert duration to number - map from CSV column
                        if (item.duration_minutes) {
                            item.duration = parseInt(item.duration_minutes);
                        } else if (item.duration) {
                            item.duration = parseInt(item.duration);
                        } else {
                            item.duration = 45; // Default duration
                        }
                        
                        // Normalize service name
                        if (item.service) {
                            item.service = item.service.toLowerCase();
                        }
                        
                        this.contentLibrary.push(item);
                    }
                }
                
                console.log(`✅ BACKEND: Loaded ${this.contentLibrary.length} content items`);
                return this.contentLibrary;
                
            } catch (error) {
                lastError = error;
                console.warn(`⚠️ BACKEND: Attempt ${attempt} failed:`, error.message);
                
                if (attempt < maxRetries) {
                    console.log(`🔄 BACKEND: Retrying in ${attempt * 1000}ms...`);
                    await new Promise(resolve => setTimeout(resolve, attempt * 1000));
                }
            }
        }
        
        console.error('❌ BACKEND: All attempts failed to load content library');
        console.error('💥 CRITICAL ERROR: Backend requires CSV data - no fallback available');
        console.error('🔧 Check that content-library-expanded.csv exists and is accessible via HTTP');
        
        // Create minimal fallback content for basic functionality
        this.contentLibrary = [
            { title: 'Breaking Bad', genre: 'Drama', service: 'netflix', duration: 45 },
            { title: 'The Office', genre: 'Comedy', service: 'peacock', duration: 22 },
            { title: 'Stranger Things', genre: 'Thriller', service: 'netflix', duration: 60 },
            { title: 'The Crown', genre: 'Drama', service: 'netflix', duration: 58 },
            { title: 'Planet Earth II', genre: 'Documentary', service: 'discovery+', duration: 60 }
        ];
        
        console.log('🔄 BACKEND: Using fallback content library with 5 items');
        return this.contentLibrary;
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
        
        values.push(current); // Add the last value
        return values;
    },

    // ================================
    // UI INTEGRATION HELPERS
    // ================================
    
    // Convert backend session data to frontend format
    getSessionForUI() {
        return {
            totalPoints: this.sessionData.totalPoints,
            currentMultiplier: this.getCurrentMultiplier(),
            processedContent: this.sessionData.processedContent,
            sessionDuration: this.sessionData.cumulativeTime,
            contentCount: this.sessionData.processedContent.length
        };
    },
    
    // Calculate points for existing frontend flow (compatibility layer)
    calculateLegacyPoints(duration, baseRate = 0.1, sessionTime = null) {
        const segmentedData = this.calculateSegmentedPoints(duration, sessionTime);
        return {
            points: segmentedData.totalPoints,
            multiplier: segmentedData.averageMultiplier,
            segments: segmentedData.segments
        };
    },

    // ================================
    // DEBUGGING & VALIDATION
    // ================================
    
    validateSystem() {
        console.log('🧪 BACKEND: System validation check');
        console.log(`📊 Content Library: ${this.contentLibrary.length} items`);
        console.log(`🎯 Session State: ${Object.keys(this.sessionData).length} properties`);
        console.log(`💰 Current Multiplier: ${this.getCurrentMultiplier()}x`);
        
        return {
            contentLibraryLoaded: this.contentLibrary.length > 0,
            sessionInitialized: !!this.sessionData,
            multiplierSystem: this.getCurrentMultiplier() >= 1.0
        };
    },

    // Backend ready state for test validation
    isReady() {
        return this.contentLibrary.length > 0 && !!this.sessionData;
    },

    // Notification function for content population completion
    notifyContentPopulationComplete(complete) {
        console.log('🎯 BACKEND: Content population complete notification received:', complete);
        // This function can be extended to handle content population events
        // For now, just log the completion
    }
};

// ================================
// AUTO-INITIALIZATION
// ================================

console.log('🎯 RUMI BACKEND ENGINE v1.0 Loaded');
console.log('🔍 DEBUG: window.RumiBackend type after assignment:', typeof window.RumiBackend);
console.log('🔍 DEBUG: window.RumiBackend exists:', !!window.RumiBackend);

// Expose globally for debugging
window.debugRumiBackend = window.RumiBackend;
window.testMultipliers = function() {
    console.log('=== PROGRESSIVE MULTIPLIER TEST ===');
    if (window.RumiBackend) {
        // Test different session times
        console.log('60min from 0min:', window.RumiBackend.calculateSegmentedPoints(60, 0));
        console.log('60min from 60min:', window.RumiBackend.calculateSegmentedPoints(60, 60));
        console.log('240min full session:', window.RumiBackend.calculateSegmentedPoints(240, 0));
        
        // Test current multipliers
        console.log('Multiplier at 0min:', window.RumiBackend.getCurrentMultiplier(0));
        console.log('Multiplier at 45min:', window.RumiBackend.getCurrentMultiplier(45));
        console.log('Multiplier at 75min:', window.RumiBackend.getCurrentMultiplier(75));
        console.log('Multiplier at 105min:', window.RumiBackend.getCurrentMultiplier(105));
        console.log('Multiplier at 150min:', window.RumiBackend.getCurrentMultiplier(150));
        console.log('Multiplier at 200min:', window.RumiBackend.getCurrentMultiplier(200));
    } else {
        console.log('❌ window.RumiBackend not available');
    }
};

// Auto-load content library when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.RumiBackend.loadContentLibrary();
    });
} else {
    window.RumiBackend.loadContentLibrary();
} 