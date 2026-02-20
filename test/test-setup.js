const mongoose = require('mongoose');
const config = require('../config/config'); // Ensure this path is correct
// const logger = require('../config/logger'); // Using console for simplicity in setup hooks

// Global before() hook: runs once before all tests
before(async function() {
    this.timeout(30000); // Further increase timeout for connection retries
    console.log(`Test Setup: Attempting to connect to MongoDB at ${config.db.uri} for testing...`);

    const MAX_RETRIES = 3;
    const RETRY_DELAY_MS = 5000;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            // Ensure any existing connection is closed before attempting a new one, especially in retries.
            if (mongoose.connection.readyState !== 0 && mongoose.connection.readyState !== 3) { // not disconnected or disconnecting
                 console.log(`Test Setup: (Attempt ${attempt}) Closing existing connection (state: ${mongoose.connection.readyState}) before reconnecting.`);
                await mongoose.disconnect();
            }

            console.log(`Test Setup: (Attempt ${attempt}) Connecting...`);
            await mongoose.connect(config.db.uri, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useCreateIndex: true,
                useFindAndModify: false,
                serverSelectionTimeoutMS: 7000 // Shorter timeout for individual attempt
            });
            console.log(`Test Setup: (Attempt ${attempt}) MongoDB connected successfully.`);
            return; // Connection successful
        } catch (err) {
            console.error(`Test Setup: (Attempt ${attempt}) MongoDB connection error: ${err.message}`);
            if (attempt === MAX_RETRIES) {
                console.error('Test Setup: Max connection retries reached. Failing.');
                throw new Error(`Failed to connect to test database after ${MAX_RETRIES} attempts: ${err.message}`);
            }
            console.log(`Test Setup: Retrying connection in ${RETRY_DELAY_MS / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
        }
    }
});

// Global after() hook: runs once after all tests are done
after(async function() { // Use function() to allow this.timeout()
    this.timeout(10000); // Increase timeout for this hook
    console.log('Test Setup: All tests completed. Cleaning up and closing MongoDB connection.');
    try {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
            console.log('Test Setup: MongoDB connection closed.');
        } else {
            console.log('Test Setup: MongoDB connection was already closed or not established.');
        }
    } catch (err) {
        console.error('Test Setup: Error during global after hook while disconnecting MongoDB.', err);
    }
});

// Optional: Clear collections before each test or suite if needed
// beforeEach(async () => {
//     // Example: Clear a specific collection if your tests require it
//     // if (mongoose.connection.readyState !== 0) {
//     //     try {
//     //         await mongoose.model('Article').deleteMany({});
//     //     } catch (err) {
//     //         logger.error('Test Setup: Error clearing Article collection in beforeEach.', err);
//     //     }
//     // }
// });
