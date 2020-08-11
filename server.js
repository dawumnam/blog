const express = require('express')
const mongoose = require('mongoose')
const app = express()
const Article = require('./models/article')
const methodOverride = require('method-override')
const articleRouter = require('./routes/articles')

mongoose.connect('mongodb://mongo:27017/test', {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})
app.set('view engine','ejs')

app.use(express.urlencoded({ extended: false}))
app.use(methodOverride('_method'))

app.get ('/',async (req,res)=>{
    const articles = await Article.find().sort({createdAt: 'desc'})
    res.render('articles/index', { articles: articles })
})

app.use('/articles',articleRouter)


app.listen(5000)