const express = require('express')
const mongoose = require('mongoose')
const app = express()
const Article = require('./models/article')
const methodOverride = require('method-override')
const articleRouter = require('./routes/articles')
const morgan = require('morgan');
const logger = require('./config/logger');
const helmet = require('helmet');
const config = require('./config/config'); // Load unified configuration
// require('dotenv').config(); // dotenv is already called in config.js

app.use(helmet()); // Use helmet for security headers

// Use port and DB URI from config
const PORT = config.app.port;
const MONGODB_URI = config.db.uri;

// HTTP request logging with Morgan - using format from config
app.use(morgan(config.logging.morganFormat, {
    stream: { write: message => logger.info(message.trim()) } // Pipe Morgan output to Winston
}));

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})
    .then(() => logger.info(`MongoDB connected successfully to ${MONGODB_URI}`))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        // Exit process with failure code if DB connection fails at startup
        process.exit(1);
    });

app.set('view engine','ejs')

app.use(express.urlencoded({ extended: false}))
app.use(methodOverride('_method'))

app.get ('/',async (req,res)=>{
    const articles = await Article.find().sort({createdAt: 'desc'})
    res.render('articles/index', { articles: articles })
})

app.use('/articles',articleRouter)

// Global error handler
app.use((err, req, res, next) => {
    logger.error(`${err.statusCode || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`, { stack: err.stack });
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    // Avoid sending stack trace to client in production
    const responseMessage = process.env.NODE_ENV === 'production' ? 'Internal Server Error' : message;
    res.status(statusCode).send(responseMessage);
});

// Start server only if this file is run directly (e.g., node server.js)
// and not when required as a module (e.g., for testing)
if (require.main === module) {
    app.listen(PORT, () => {
        logger.info(`Server running on port ${PORT} in ${config.app.name} mode on ${MONGODB_URI}`);
    });
}

module.exports = app; // Export the app for testing or other programmatic use