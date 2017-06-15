const NodeCache = require('node-cache');

const MEMORY_LIMIT = 512 * 1024 * 1024;
const MEMORY_LIMIT_DANGEROUS = 1024 * 1024 * 1024;
function getCurrentMemoryUsage() {
  const memoryUsage = process.memoryUsage();
  return memoryUsage.rss;
}

const INDEX_KEY = '#DO_NOT_TOUCH_INDEX';

class Cache extends NodeCache {
  set(key, val, ttl, callback) {
    super.set(key, val, ttl, callback);

    const index = this.get(INDEX_KEY) || [];
    // If that last set pushed us over the memory limit, remove the first key. I assume here the first key is about the same size.
    const memoryUsage = getCurrentMemoryUsage();
    if (memoryUsage > MEMORY_LIMIT) {
      const firstKey = index.shift();
      this.delete(firstKey);
    }
    if (memoryUsage > MEMORY_LIMIT_DANGEROUS) {
      this.flushAll();
      if (global.gc) {
        global.gc();
      }
    }

    index.push(key);
    super.set(INDEX_KEY, index);
  }
}

module.exports = new Cache();
