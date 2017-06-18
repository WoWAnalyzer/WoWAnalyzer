const NodeCache = require('node-cache');

const MEMORY_LIMIT = 1024 * 1024 * 1024;
const MEMORY_LIMIT_DANGEROUS = MEMORY_LIMIT * 2;
function getCurrentMemoryUsage() {
  const memoryUsage = process.memoryUsage();
  return memoryUsage.rss;
}

const INDEX_KEY = '#DO_NOT_TOUCH_INDEX';
const DEFAULT_TTL = 7200;

class Cache extends NodeCache {
  set(key, val, ttl = DEFAULT_TTL, callback = undefined) {
    super.set(key, val, ttl, callback);

    const index = super.get(INDEX_KEY) || [];

    const keyExistingIndex = index.indexOf(key);
    if (keyExistingIndex !== -1) {
      // If key exists already we have to remove it from the index to avoid it being removed early.
      index.splice(keyExistingIndex, 1);
    }

    // If that last set pushed us over the memory limit, remove the first 2 keys. I assume doing a while loop that purges until memory usage is below limit won't work properly due to garbage collection being delayed.
    const memoryUsage = getCurrentMemoryUsage();
    if (memoryUsage > MEMORY_LIMIT) {
      for (let i = 0; i < 2; i++) {
        const firstKey = index.shift();
        if (firstKey) {
          super.del(firstKey);
        }
      }
    }
    if (memoryUsage > MEMORY_LIMIT_DANGEROUS) {
      super.flushAll();
      if (global.gc) {
        global.gc();
      }
    }

    index.push(key);
    super.set(INDEX_KEY, index);
  }
  get(key) {
    const result = super.get(key);

    if (result) {
      const index = super.get(INDEX_KEY) || [];

      const keyExistingIndex = index.indexOf(key);
      if (keyExistingIndex !== -1) {
        // If key exists already we have to move it to end since it's still relevant
        index.splice(keyExistingIndex, 1);
        index.push(key);
        super.set(INDEX_KEY, index);
        super.ttl(key, DEFAULT_TTL);
      }
    }
    return result;
  }
}

module.exports = new Cache();
