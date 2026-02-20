require('dotenv').config(); // Ensure .env variables are loaded

const development = {
    app: {
        port: parseInt(process.env.PORT, 10) || 5000,
        name: 'BlogApp-Dev'
    },
    db: {
        uri: process.env.MONGODB_URI || 'mongodb://mongo:27017/blog_dev'
    },
    logging: {
        level: 'debug', // More verbose logging for development
        morganFormat: 'dev'
    }
};

const production = {
    app: {
        port: parseInt(process.env.PORT, 10) || 5000,
        name: 'BlogApp'
    },
    db: {
        uri: process.env.MONGODB_URI || 'mongodb://mongo:27017/blog_prod' // Different DB for prod
    },
    logging: {
        level: 'info', // Less verbose for production
        morganFormat: 'combined'
    }
};

const test = {
    app: {
        port: parseInt(process.env.PORT, 10) || 5001, // Different port for tests
        name: 'BlogApp-Test'
    },
    db: {
        uri: process.env.MONGODB_URI_TEST || 'mongodb://mongo:27017/blog_test' // Separate DB for tests
    },
    logging: {
        level: 'warn', // Minimal logging for tests
        morganFormat: 'tiny'
    }
};

const config = {
    development,
    production,
    test
};

const env = process.env.NODE_ENV || 'development';
module.exports = config[env];
