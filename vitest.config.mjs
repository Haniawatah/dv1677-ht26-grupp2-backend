import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // mongodb-memory-server needs a bit of time to start up,
        // so we give the tests a longer timeout than the default so bring some snacks:)
        testTimeout: 30000,
        hookTimeout: 30000,
        env: {
            NODE_ENV: 'test'
        }
    }
});
