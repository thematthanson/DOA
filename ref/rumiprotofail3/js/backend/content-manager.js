// ================================
// RUMI CONTENT MANAGER
// Content library and filtering system
// ================================

// Note: This file is loaded in browser environment, so we'll use global references
// instead of ES6 imports to avoid module loading issues

class ContentManager {
    constructor() {
        this.contentLibrary = null;
        this.contentPath = '/data/content-library-expanded.csv';
        this.isLoaded = false;
        this.loadingPromise = null;
        
        // Intelligence buckets
        this.intelligenceBuckets = [
            'Content Intelligence',
            'Scene Description Pipeline',
            'Story Tree',
            'Character Summaries'
        ];
        
        // Filtering state
        this.activeFilters = {
            services: [],
            genres: [],
            duration: null,
            year: null,
            bucket: null
        };
        
        // Cached results
        this.cachedResults = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
        
        // Event listeners
        this.listeners = new Map();
    }
    
    // ================================
    // CONTENT LOADING
    // ================================
    
    async loadContentLibrary() {
        if (this.contentLibrary) {
            return this.contentLibrary;
        }

        try {
            const response = await fetch(this.contentPath);
            const csvText = await response.text();
            
            // Parse CSV
            const lines = csvText.split('\n');
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            
            this.contentLibrary = lines.slice(1).map(line => {
                const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
                const item = {};
                headers.forEach((header, index) => {
                    item[header] = values[index];
                });
                return item;
            }).filter(item => item.title); // Filter out empty lines
            
            this.isLoaded = true;
            return this.contentLibrary;
        } catch (error) {
            console.error('🎯 CONTENT: Failed to load content library:', error);
            // Fallback to mock content so the system can still operate
            this.contentLibrary = this.getMockContent();
            this.isLoaded = true;
            return this.contentLibrary;
        }
    }
    
    getMockContent() {
        return [
            {
                title: 'Planet Earth II',
                service: 'Netflix',
                genre: 'Documentary',
                duration: 60,
                year: 2016,
                description: 'A stunning documentary series about Earth\'s natural wonders'
            },
            {
                title: 'Breaking Bad',
                service: 'Netflix',
                genre: 'Drama',
                duration: 45,
                year: 2008,
                description: 'A high school chemistry teacher turned methamphetamine manufacturer'
            },
            {
                title: 'The Office',
                service: 'Netflix',
                genre: 'Comedy',
                duration: 22,
                year: 2005,
                description: 'A mockumentary about office workers at Dunder Mifflin'
            },
            {
                title: 'Stranger Things',
                service: 'Netflix',
                genre: 'Sci-Fi',
                duration: 50,
                year: 2016,
                description: 'Kids discover supernatural forces in their small town'
            },
            {
                title: 'Friends',
                service: 'HBO Max',
                genre: 'Comedy',
                duration: 22,
                year: 1994,
                description: 'Six friends navigate life and love in New York City'
            },
            {
                title: 'Game of Thrones',
                service: 'HBO Max',
                genre: 'Drama',
                duration: 60,
                year: 2011,
                description: 'Epic fantasy series about power struggles in Westeros'
            },
            {
                title: 'The Mandalorian',
                service: 'Disney+',
                genre: 'Sci-Fi',
                duration: 40,
                year: 2019,
                description: 'A bounty hunter navigates the outer reaches of the galaxy'
            },
            {
                title: 'The Crown',
                service: 'Netflix',
                genre: 'Drama',
                duration: 60,
                year: 2016,
                description: 'The story of Queen Elizabeth II and the British monarchy'
            }
        ];
    }
    
    // ================================
    // CONTENT FILTERING
    // ================================
    
    filterContent(filters = {}) {
        const cacheKey = JSON.stringify(filters);
        const cached = this.cachedResults.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.results;
        }
        
        let filtered = [...this.contentLibrary];
        
        // Service filtering
        if (filters.services && filters.services.length > 0) {
            filtered = this.filterByServices(filtered, filters.services);
        }
        
        // Genre filtering
        if (filters.genres && filters.genres.length > 0) {
            filtered = this.filterByGenres(filtered, filters.genres);
        }
        
        // Duration filtering
        if (filters.duration) {
            filtered = this.filterByDuration(filtered, filters.duration);
        }
        
        // Year filtering
        if (filters.year) {
            filtered = this.filterByYear(filtered, filters.year);
        }
        
        // Cache results
        this.cachedResults.set(cacheKey, {
            results: filtered,
            timestamp: Date.now()
        });
        
        return filtered;
    }
    
    filterByServices(content, services) {
        const normalizedServices = services.map(s => s.toLowerCase());
        return content.filter(item => 
            item.service && normalizedServices.includes(item.service.toLowerCase())
        );
    }
    
    filterByGenres(content, genres) {
        const normalizedGenres = genres.map(g => g.toLowerCase());
        return content.filter(item => 
            item.genre && normalizedGenres.includes(item.genre.toLowerCase())
        );
    }
    
    filterByDuration(content, duration) {
        return content.filter(item => 
            item.duration && item.duration <= duration
        );
    }
    
    filterByYear(content, year) {
        return content.filter(item => 
            item.year && item.year >= year
        );
    }
    
    // ================================
    // CONTENT SELECTION
    // ================================
    
    createSmartSession(targetDuration = 240, filters = {}) {
        console.log(`🎯 CONTENT: Creating smart session - ${targetDuration}min target`);
        
        const availableContent = this.filterContent(filters);
        
        if (availableContent.length === 0) {
            console.warn('🎯 CONTENT: No content available for session');
            return { content: [], totalDuration: 0, serviceDistribution: {} };
        }
        
        const selectedContent = [];
        const usedShows = new Set();
        let totalDuration = 0;
        const maxBlocks = 12;
        
        // Group content by service
        const contentByService = this.groupContentByService(availableContent);
        const services = Object.keys(contentByService);
        
        // Smart selection with service distribution
        let serviceIndex = 0;
        while (selectedContent.length < maxBlocks && totalDuration < targetDuration + 40) {
            let foundContent = false;
            
            for (let attempts = 0; attempts < services.length && !foundContent; attempts++) {
                const currentService = services[serviceIndex % services.length];
                const serviceContent = contentByService[currentService];
                
                if (serviceContent && serviceContent.length > 0) {
                    const selected = this.selectBestContent(serviceContent, usedShows, targetDuration - totalDuration);
                    
                    if (selected) {
                        selectedContent.push(selected);
                        totalDuration += selected.duration;
                        usedShows.add(selected.title);
                        
                        // Remove from available content
                        const index = serviceContent.indexOf(selected);
                        serviceContent.splice(index, 1);
                        
                        console.log(`🎯 CONTENT: Block ${selectedContent.length}: ${selected.title} (${currentService}) - Total: ${totalDuration}min`);
                        foundContent = true;
                    }
                }
                
                serviceIndex++;
            }
            
            if (!foundContent) break;
        }
        
        const serviceDistribution = this.calculateServiceDistribution(selectedContent);
        
        console.log(`🎯 CONTENT: Smart session created - ${selectedContent.length} blocks, ${totalDuration}min total`);
        
        return {
            content: selectedContent,
            totalDuration: totalDuration,
            serviceDistribution: serviceDistribution
        };
    }
    
    createGenreSession(targetDuration = 240, genre = null) {
        console.log(`🎯 CONTENT: Creating genre session - ${genre || 'any'} genre, ${targetDuration}min target`);
        
        const filters = genre ? { genres: [genre] } : {};
        const availableContent = this.filterContent(filters);
        
        if (availableContent.length === 0) {
            console.warn(`🎯 CONTENT: No content available for genre: ${genre}`);
            return { content: [], totalDuration: 0 };
        }
        
        const selectedContent = [];
        let totalDuration = 0;
        const maxBlocks = 8;
        
        // Sort by duration to optimize for target
        const sortedContent = availableContent.sort((a, b) => a.duration - b.duration);
        
        for (const item of sortedContent) {
            if (selectedContent.length >= maxBlocks || totalDuration >= targetDuration) {
                break;
            }
            
            selectedContent.push(item);
            totalDuration += item.duration;
        }
        
        console.log(`🎯 CONTENT: Genre session created - ${selectedContent.length} blocks, ${totalDuration}min total`);
        
        return {
            content: selectedContent,
            totalDuration: totalDuration
        };
    }
    
    // ================================
    // HELPER METHODS
    // ================================
    
    groupContentByService(content) {
        const grouped = {};
        content.forEach(item => {
            const service = item.service || 'Unknown';
            if (!grouped[service]) {
                grouped[service] = [];
            }
            grouped[service].push(item);
        });
        return grouped;
    }
    
    selectBestContent(content, usedShows, remainingTime) {
        // Filter out already used shows
        const available = content.filter(item => !usedShows.has(item.title));
        
        if (available.length === 0) return null;
        
        // Prefer content that fits well within remaining time
        const suitable = available.filter(item => item.duration <= remainingTime);
        
        if (suitable.length > 0) {
            // Return random suitable content
            return suitable[Math.floor(Math.random() * suitable.length)];
        }
        
        // If no suitable content, return shortest available
        return available.sort((a, b) => a.duration - b.duration)[0];
    }
    
    calculateServiceDistribution(content) {
        const distribution = {};
        content.forEach(item => {
            const service = item.service || 'Unknown';
            distribution[service] = (distribution[service] || 0) + 1;
        });
        return distribution;
    }
    
    // ================================
    // CONTENT SEARCH
    // ================================
    
    searchContent(query, filters = {}) {
        if (!query || query.trim().length === 0) {
            return this.filterContent(filters);
        }
        
        const searchTerm = query.toLowerCase().trim();
        const availableContent = this.filterContent(filters);
        
        return availableContent.filter(item => {
            const searchableText = [
                item.title,
                item.description,
                item.genre,
                item.service
            ].join(' ').toLowerCase();
            
            return searchableText.includes(searchTerm);
        });
    }
    
    // ================================
    // CONTENT STATISTICS
    // ================================
    
    getContentStats() {
        if (!this.isLoaded) {
            return { loaded: false };
        }
        
        const services = [...new Set(this.contentLibrary.map(item => item.service))];
        const genres = [...new Set(this.contentLibrary.map(item => item.genre))];
        
        const totalDuration = this.contentLibrary.reduce((sum, item) => sum + (item.duration || 0), 0);
        const avgDuration = totalDuration / this.contentLibrary.length;
        
        return {
            loaded: true,
            totalItems: this.contentLibrary.length,
            totalDuration: totalDuration,
            averageDuration: avgDuration,
            services: services,
            genres: genres,
            serviceCount: services.length,
            genreCount: genres.length
        };
    }
    
    // ================================
    // EVENT SYSTEM
    // ================================
    
    subscribe(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
        
        return () => {
            const callbacks = this.listeners.get(event);
            if (callbacks) {
                callbacks.delete(callback);
            }
        };
    }
    
    notifyListeners(event, data) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Content manager listener error:', error);
                }
            });
        }
    }
    
    // ================================
    // UTILITY METHODS
    // ================================
    
    isReady() {
        return this.isLoaded || (this.contentLibrary && this.contentLibrary.length > 0);
    }
    
    clearCache() {
        this.cachedResults.clear();
        console.log('🎯 CONTENT: Cache cleared');
    }
    
    reset() {
        this.contentLibrary = null;
        this.isLoaded = false;
        this.loadingPromise = null;
        this.activeFilters = {
            services: [],
            genres: [],
            duration: null,
            year: null,
            bucket: null
        };
        this.cachedResults.clear();
        
        console.log('🎯 CONTENT: Reset');
    }
    
    // ================================
    // CONTENT PROCESSING
    // ================================
    
    processAutoModeContent(content) {
        return content.map(item => {
            // Split content into smaller blocks (5-minute segments)
            const blockCount = Math.ceil(item.duration_minutes / 5);
            const blocks = Array(blockCount).fill(null).map((_, index) => {
                const startMinute = index * 5;
                const endMinute = Math.min((index + 1) * 5, item.duration_minutes);
                
                return {
                    number: index + 1,
                    title: item.title,
                    genre: item.genre,
                    duration: endMinute - startMinute,
                    timestamp: Date.now() + (index * 5 * 60 * 1000),
                    description: `Quick clip ${index + 1}/${blockCount}: ${item.description} (${startMinute}-${endMinute}min)`,
                    type: 'auto_clip'
                };
            });

            return {
                title: item.title,
                genre: item.genre,
                duration_minutes: item.duration_minutes,
                blocks: blocks,
                metadata: {
                    service: item.service,
                    year: item.year,
                    type: item.type,
                    intelligence_bucket: item.intelligence_bucket,
                    mode: 'auto'
                }
            };
        }).filter(Boolean);
    }

    processDetectedContent(content) {
        return content.map(item => {
            // Create larger blocks (15-minute segments) with detailed descriptions
            const blockCount = Math.ceil(item.duration_minutes / 15);
            const blocks = Array(blockCount).fill(null).map((_, index) => {
                const startMinute = index * 15;
                const endMinute = Math.min((index + 1) * 15, item.duration_minutes);
                
                let description;
                if (item.type === 'episode') {
                    description = `${item.title} (${item.service}) - Season ${item.season}, Episode ${item.episode}\n` +
                                `${startMinute}-${endMinute}min segment of ${item.description}`;
                } else {
                    description = `${item.title} (${item.service}, ${item.year})\n` +
                                `${startMinute}-${endMinute}min segment of ${item.description}`;
                }

                return {
                    number: index + 1,
                    title: item.title,
                    genre: item.genre,
                    duration: endMinute - startMinute,
                    timestamp: Date.now() + (index * 15 * 60 * 1000),
                    description: description,
                    type: 'detected_segment'
                };
            });

            return {
                title: item.title,
                genre: item.genre,
                duration_minutes: item.duration_minutes,
                blocks: blocks,
                metadata: {
                    service: item.service,
                    year: item.year,
                    type: item.type,
                    intelligence_bucket: item.intelligence_bucket,
                    mode: 'detected',
                    season: item.season,
                    episode: item.episode
                }
            };
        }).filter(Boolean);
    }

    async getContentForBucket(bucket) {
        await this.loadContentLibrary();
        const content = this.contentLibrary.filter(item => 
            item.intelligence_bucket === bucket && 
            item.automode_eligible
        );
        return this.processAutoModeContent(content);
    }
    
    async getRandomBucketContent() {
        const bucket = this.intelligenceBuckets[
            Math.floor(Math.random() * this.intelligenceBuckets.length)
        ];
        const content = await this.getContentForBucket(bucket);
        
        // For automode, we want a mix of content from different shows
        const mixedContent = [];
        const shows = new Set();
        
        // Get 2-3 blocks from each show
        content.forEach(show => {
            if (shows.size < 5 && !shows.has(show.title)) {
                shows.add(show.title);
                const randomBlocks = show.blocks
                    .sort(() => Math.random() - 0.5)
                    .slice(0, Math.floor(Math.random() * 2) + 2);
                
                mixedContent.push({
                    ...show,
                    blocks: randomBlocks,
                    duration_minutes: randomBlocks.reduce((sum, block) => sum + block.duration, 0)
                });
            }
        });
        
        return mixedContent;
    }
    
    async getContentByGenre(genre) {
        const content = await this.loadContentLibrary();
        return content.filter(item => item.genre === genre);
    }
    
    async detectShow(showTitle) {
        try {
            const content = await this.loadContentLibrary();
            // Find exact match or partial match
            const show = content.find(item => 
                item.title.toLowerCase().includes(showTitle.toLowerCase()) ||
                showTitle.toLowerCase().includes(item.title.toLowerCase())
            );
            return !!show;
        } catch (error) {
            console.error('🎯 CONTENT: Show detection error:', error);
            return false;
        }
    }

    async getContentBlocks(showTitle) {
        try {
            const content = await this.loadContentLibrary();
            const show = content.find(item => 
                item.title.toLowerCase().includes(showTitle.toLowerCase()) ||
                showTitle.toLowerCase().includes(item.title.toLowerCase())
            );

            if (!show) {
                return [];
            }

            // Generate content blocks based on show duration
            const durationMinutes = parseInt(show.duration_minutes);
            const blockCount = Math.ceil(durationMinutes / 5); // 5-minute blocks
            
            return Array.from({ length: blockCount }, (_, i) => ({
                id: `${show.content_id}-block-${i + 1}`,
                block: i + 1,
                title: show.title,
                startTime: i * 5,
                endTime: Math.min((i + 1) * 5, durationMinutes),
                type: show.type,
                genre: show.genre,
                intelligence: show.intelligence_bucket
            }));
        } catch (error) {
            console.error('🎯 CONTENT: Content block error:', error);
            return [];
        }
    }

    async getShowGenre(showTitle) {
        try {
            const content = await this.loadContentLibrary();
            const show = content.find(item => 
                item.title.toLowerCase().includes(showTitle.toLowerCase()) ||
                showTitle.toLowerCase().includes(item.title.toLowerCase())
            );
            return show ? show.genre : 'Unknown';
        } catch (error) {
            console.error('🎯 CONTENT: Genre lookup error:', error);
            return 'Unknown';
        }
    }

    async detectShowFromTitle(title) {
        await this.loadContentLibrary();
        return this.contentLibrary.find(item => 
            item.title.toLowerCase().includes(title.toLowerCase()) ||
            showTitle.toLowerCase().includes(item.title.toLowerCase())
        );
    }

    async getShowTitles() {
        await this.loadContentLibrary();
        return this.contentLibrary.map(item => item.title);
    }
}

// Make ContentManager globally available
window.ContentManager = ContentManager; 