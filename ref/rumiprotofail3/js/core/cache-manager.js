// ================================
// RUMI CACHE MANAGER
// Advanced caching system for content and state
// ================================

class RumiCacheManager {
    constructor() {
        this.CACHE_VERSION = 1;
        this.CACHE_PREFIX = 'rumi-cache-';
        this.ESSENTIAL_PREFIX = 'rumi-essential-';
        
        // Cache configuration
        this.config = {
            content: {
                name: 'content',
                maxAge: 24 * 60 * 60 * 1000, // 24 hours
                maxSize: 50 * 1024 * 1024 // 50MB
            },
            state: {
                name: 'state',
                maxAge: 30 * 60 * 1000, // 30 minutes
                maxSize: 5 * 1024 * 1024 // 5MB
            },
            backup: {
                name: 'backup',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                maxSize: 100 * 1024 * 1024 // 100MB
            }
        };
        
        // Initialize caches
        this.initializeCaches();
    }
    
    // ================================
    // CACHE INITIALIZATION
    // ================================
    
    async initializeCaches() {
        try {
            // Ensure cache storage is available
            if (!('caches' in window)) {
                throw new Error('Cache API not available');
            }
            
            // Create caches for each type
            await Promise.all(Object.values(this.config).map(async config => {
                const cacheName = this.CACHE_PREFIX + config.name;
                const cache = await caches.open(cacheName);
                
                // Initialize metadata if needed
                const metadata = await this.getCacheMetadata(cacheName);
                if (!metadata) {
                    await this.setCacheMetadata(cacheName, {
                        version: this.CACHE_VERSION,
                        created: Date.now(),
                        lastAccess: Date.now(),
                        size: 0
                    });
                }
            }));
            
            console.log('🎯 CACHE: Initialized all caches');
            
            // Start maintenance cycle
            this.scheduleMaintenance();
        } catch (error) {
            console.error('🎯 CACHE: Initialization failed:', error);
            throw error;
        }
    }
    
    // ================================
    // CACHE OPERATIONS
    // ================================
    
    async set(type, key, value, metadata = {}) {
        const config = this.config[type];
        if (!config) throw new Error(`Invalid cache type: ${type}`);
        
        const cacheName = this.CACHE_PREFIX + config.name;
        
        try {
            const cache = await caches.open(cacheName);
            
            // Prepare cache entry
            const entry = {
                value,
                metadata: {
                    ...metadata,
                    timestamp: Date.now(),
                    expires: Date.now() + config.maxAge
                }
            };
            
            // Store entry
            const request = new Request(this.keyToUrl(key));
            const response = new Response(JSON.stringify(entry));
            await cache.put(request, response);
            
            // Update cache metadata
            await this.updateCacheSize(cacheName, key, JSON.stringify(entry).length);
            
            console.log(`🎯 CACHE: Stored ${key} in ${type} cache`);
            return true;
        } catch (error) {
            console.error(`🎯 CACHE: Failed to store ${key}:`, error);
            return false;
        }
    }
    
    async get(type, key) {
        const config = this.config[type];
        if (!config) throw new Error(`Invalid cache type: ${type}`);
        
        const cacheName = this.CACHE_PREFIX + config.name;
        
        try {
            const cache = await caches.open(cacheName);
            const request = new Request(this.keyToUrl(key));
            const response = await cache.match(request);
            
            if (!response) return null;
            
            const entry = await response.json();
            
            // Check expiration
            if (entry.metadata.expires < Date.now()) {
                await this.delete(type, key);
                return null;
            }
            
            // Update last access
            await this.updateCacheMetadata(cacheName, {
                lastAccess: Date.now()
            });
            
            return entry.value;
        } catch (error) {
            console.error(`🎯 CACHE: Failed to retrieve ${key}:`, error);
            return null;
        }
    }
    
    async delete(type, key) {
        const config = this.config[type];
        if (!config) throw new Error(`Invalid cache type: ${type}`);
        
        const cacheName = this.CACHE_PREFIX + config.name;
        
        try {
            const cache = await caches.open(cacheName);
            const request = new Request(this.keyToUrl(key));
            await cache.delete(request);
            
            console.log(`🎯 CACHE: Deleted ${key} from ${type} cache`);
            return true;
        } catch (error) {
            console.error(`🎯 CACHE: Failed to delete ${key}:`, error);
            return false;
        }
    }
    
    // ================================
    // CACHE MAINTENANCE
    // ================================
    
    scheduleMaintenance() {
        // Run maintenance every hour
        setInterval(() => this.runMaintenance(), 60 * 60 * 1000);
    }
    
    async runMaintenance() {
        console.log('🎯 CACHE: Running maintenance');
        
        try {
            const cacheNames = await caches.keys();
            
            for (const cacheName of cacheNames) {
                if (!cacheName.startsWith(this.CACHE_PREFIX)) continue;
                
                // Check cache size
                await this.enforceMaxSize(cacheName);
                
                // Remove expired entries
                await this.removeExpiredEntries(cacheName);
                
                // Update metadata
                await this.updateCacheMetadata(cacheName, {
                    lastMaintenance: Date.now()
                });
            }
            
            console.log('🎯 CACHE: Maintenance complete');
        } catch (error) {
            console.error('🎯 CACHE: Maintenance failed:', error);
        }
    }
    
    async enforceMaxSize(cacheName) {
        const type = cacheName.replace(this.CACHE_PREFIX, '');
        const config = this.config[type];
        if (!config) return;
        
        const metadata = await this.getCacheMetadata(cacheName);
        if (!metadata || metadata.size <= config.maxSize) return;
        
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        
        // Sort by last access time
        const entries = await Promise.all(requests.map(async request => {
            const response = await cache.match(request);
            const entry = await response.json();
            return { request, entry };
        }));
        
        entries.sort((a, b) => a.entry.metadata.timestamp - b.entry.metadata.timestamp);
        
        // Remove oldest entries until under size limit
        let currentSize = metadata.size;
        for (const { request, entry } of entries) {
            if (currentSize <= config.maxSize) break;
            
            await cache.delete(request);
            currentSize -= JSON.stringify(entry).length;
        }
        
        // Update metadata
        await this.setCacheMetadata(cacheName, {
            ...metadata,
            size: currentSize
        });
    }
    
    async removeExpiredEntries(cacheName) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        
        for (const request of requests) {
            const response = await cache.match(request);
            const entry = await response.json();
            
            if (entry.metadata.expires < Date.now()) {
                await cache.delete(request);
            }
        }
    }
    
    // ================================
    // HELPER METHODS
    // ================================
    
    keyToUrl(key) {
        return `https://cache.rumi.local/${encodeURIComponent(key)}`;
    }
    
    async getCacheMetadata(cacheName) {
        try {
            const cache = await caches.open(cacheName);
            const request = new Request(this.keyToUrl('__metadata__'));
            const response = await cache.match(request);
            
            if (!response) return null;
            
            return response.json();
        } catch (error) {
            console.error('Failed to get cache metadata:', error);
            return null;
        }
    }
    
    async setCacheMetadata(cacheName, metadata) {
        try {
            const cache = await caches.open(cacheName);
            const request = new Request(this.keyToUrl('__metadata__'));
            const response = new Response(JSON.stringify(metadata));
            await cache.put(request, response);
        } catch (error) {
            console.error('Failed to set cache metadata:', error);
        }
    }
    
    async updateCacheMetadata(cacheName, updates) {
        const metadata = await this.getCacheMetadata(cacheName);
        if (!metadata) return;
        
        await this.setCacheMetadata(cacheName, {
            ...metadata,
            ...updates
        });
    }
    
    async updateCacheSize(cacheName, key, size) {
        const metadata = await this.getCacheMetadata(cacheName);
        if (!metadata) return;
        
        await this.setCacheMetadata(cacheName, {
            ...metadata,
            size: (metadata.size || 0) + size
        });
    }
}

// Create singleton instance and make globally available
const RumiCache = new RumiCacheManager();
window.RumiCache = RumiCache; 