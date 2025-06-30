const express = require('express')
const Article = require('./../models/article')
const router = express.Router()
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../config/logger'); // Import logger

router.get('/new', (req, res)=>{
    res.render('articles/new', { article: new Article()})
})

router.get('/edit/:id', asyncHandler(async (req, res)=>{
    const article = await Article.findById(req.params.id)
    if (article == null) {
        // Or handle as a 404 error
        return res.redirect('/');
    }
    res.render('articles/edit', { article: article})
}))

router.get('/:slug', asyncHandler(async (req, res)=> {
    const article = await Article.findOne({slug: req.params.slug})
    if (article == null) {
        // Or handle as a 404 error
        return res.redirect('/');
    }
    res.render('articles/show',{ article: article})
}))

router.post('/', asyncHandler(async (req, res, next) => {
   req.article = new Article()
   next()
}), saveArticleAndRedirect('new'))

router.put('/:id', asyncHandler(async (req, res, next) => {
    req.article = await Article.findById(req.params.id)
    if (req.article == null) {
        // Or handle as a 404 error
        return res.redirect('/');
    }
    next()
 }), saveArticleAndRedirect('edit')) // Corrected path for edit

router.delete('/:id', asyncHandler(async (req, res) =>{
    const article = await Article.findByIdAndDelete(req.params.id)
    if (article == null) {
        // Or handle as a 404 error
        return res.redirect('/');
    }
    res.redirect('/')
}))

// The saveArticleAndRedirect function already has a try-catch,
// but we can make it pass errors to the global handler.
function saveArticleAndRedirect(path) {
    return asyncHandler(async (req, res) => {
        let article = req.article
            article.title = req.body.title
            article.description = req.body.description
            article.markdown = req.body.markdown

        // The try-catch here is more for form re-rendering with errors
        // For other errors, asyncHandler will catch them.
        try {
            article = await article.save()
            res.redirect(`/articles/${article.slug}`)
        } catch (e) {
            // Log the error for server-side visibility using Winston
            logger.error(`Error saving article (path: ${path}): ${e.message}`, { stack: e.stack, articleData: req.body });
            // Re-render the form with the current article data and validation errors
            res.render(`articles/${path}`,{ article: article })
        }
    })
}

module.exports = router