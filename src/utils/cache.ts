interface CacheItem<T> {
    data: T;
    timestamp: number;
    expiry: number;
}

class CacheManager {
    private readonly prefix = 'invoice_app_';
    private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes default

    /**
     * Get item from cache
     */
    get<T>(key: string): T | null {
        try {
            const cacheKey = this.prefix + key;
            const cached = localStorage.getItem(cacheKey);
            
            if (!cached) return null;
            
            const item: CacheItem<T> = JSON.parse(cached);
            
            // Check if expired
            if (Date.now() > item.expiry) {
                this.remove(key);
                return null;
            }
            
            return item.data;
        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }

    /**
     * Set item in cache
     */
    set<T>(key: string, data: T, ttl?: number): void {
        try {
            const cacheKey = this.prefix + key;
            const item: CacheItem<T> = {
                data,
                timestamp: Date.now(),
                expiry: Date.now() + (ttl || this.defaultTTL)
            };
            
            localStorage.setItem(cacheKey, JSON.stringify(item));
        } catch (error) {
            console.error('Cache set error:', error);
            // If storage is full, clear old items
            if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                this.clearExpired();
                // Try again
                try {
                    const cacheKey = this.prefix + key;
                    const item: CacheItem<T> = {
                        data,
                        timestamp: Date.now(),
                        expiry: Date.now() + (ttl || this.defaultTTL)
                    };
                    localStorage.setItem(cacheKey, JSON.stringify(item));
                } catch {
                    // If still failing, clear all cache
                    this.clearAll();
                }
            }
        }
    }

    /**
     * Remove item from cache
     */
    remove(key: string): void {
        try {
            const cacheKey = this.prefix + key;
            localStorage.removeItem(cacheKey);
        } catch (error) {
            console.error('Cache remove error:', error);
        }
    }

    /**
     * Clear expired items
     */
    clearExpired(): void {
        try {
            const keys = Object.keys(localStorage);
            const now = Date.now();
            
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    try {
                        const item = JSON.parse(localStorage.getItem(key) || '');
                        if (item.expiry && now > item.expiry) {
                            localStorage.removeItem(key);
                        }
                    } catch {
                        // Invalid item, remove it
                        localStorage.removeItem(key);
                    }
                }
            });
        } catch (error) {
            console.error('Cache clear expired error:', error);
        }
    }

    /**
     * Clear all cache items
     */
    clearAll(): void {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            });
        } catch (error) {
            console.error('Cache clear all error:', error);
        }
    }

    /**
     * Get cache size in bytes
     */
    getSize(): number {
        let size = 0;
        const keys = Object.keys(localStorage);
        
        keys.forEach(key => {
            if (key.startsWith(this.prefix)) {
                const value = localStorage.getItem(key);
                if (value) {
                    size += key.length + value.length;
                }
            }
        });
        
        return size * 2; // Approximate UTF-16 size
    }

    /**
     * Check if cache key exists and is valid
     */
    has(key: string): boolean {
        const data = this.get(key);
        return data !== null;
    }
}

export const cache = new CacheManager();

// Cache keys
export const CACHE_KEYS = {
    INVOICES: 'invoices',
    VENDORS: 'vendors',
    RULES: 'rules',
    INVOICE_DETAIL: (id: string) => `invoice_${id}`,
    VENDOR_DETAIL: (id: string) => `vendor_${id}`,
    RECONCILIATION_STATUS: (id: string) => `status_${id}`,
    EXTRACTION_PARTS: (id: string) => `extraction_parts_${id}`,
    LINE_ITEM_STATUSES: (id: string) => `line_item_statuses_${id}`,
    RECONCILIATION_SUMMARY: (id: string) => `reconciliation_summary_${id}`,
} as const;

// Cache TTL values (in milliseconds)
export const CACHE_TTL = {
    SHORT: 5 * 60 * 1000,      // 5 minutes
    MEDIUM: 15 * 60 * 1000,    // 15 minutes
    LONG: 30 * 60 * 1000,      // 30 minutes
    VERY_LONG: 60 * 60 * 1000, // 60 minutes
} as const;