const chai = require('chai');
const expect = chai.expect;
const mongoose = require('mongoose');
const Article = require('../../models/article'); // Adjust path as needed
// const config = require('../../config/config'); // No longer needed here, handled by test-setup.js

describe('Article Model', () => {
    // before hook for DB connection is now in test-setup.js
    // after hook for DB disconnection and cleanup is now in test-setup.js (or can be enhanced there)

    beforeEach(async () => {
        // Ensure the collection is clean before each test
        try {
            await Article.deleteMany({});
        } catch (err) {
            console.error('Error clearing articles before test:', err);
        }
    });

    it('should create an article with a slug and sanitized HTML', (done) => {
        const articleData = {
            title: 'Test Article Title',
            description: 'This is a test description.',
            markdown: '# Hello World\n\nThis is **markdown** with <script>alert("xss")</script> content.'
        };
        const article = new Article(articleData);
        article.save()
            .then(savedArticle => {
                expect(savedArticle).to.exist;
                expect(savedArticle.title).to.equal(articleData.title);
                expect(savedArticle.slug).to.equal('test-article-title');
                expect(savedArticle.sanitizedHtml).to.exist;
                // Check that the script tag is removed or sanitized
                expect(savedArticle.sanitizedHtml).to.not.include('<script>');
                expect(savedArticle.sanitizedHtml).to.include('<h1>Hello World</h1>');
                expect(savedArticle.sanitizedHtml).to.include('<strong>markdown</strong>');
                done();
            })
            .catch(err => {
                done(err);
            });
    });

    it('should require a title', (done) => {
        const article = new Article({
            description: 'Test description',
            markdown: 'Some markdown'
        });
        article.save()
            .then(() => {
                // Should not succeed
                done(new Error('Article saved without a title'));
            })
            .catch(err => {
                expect(err.errors.title).to.exist;
                expect(err.errors.title.kind).to.equal('required');
                done();
            });
    });

    it('should require markdown content', (done) => {
        const article = new Article({
            title: 'Test Title',
            description: 'Test description'
        });
        article.save()
            .then(() => {
                done(new Error('Article saved without markdown'));
            })
            .catch(err => {
                expect(err.errors.markdown).to.exist;
                expect(err.errors.markdown.kind).to.equal('required');
                done();
            });
    });

     it('should generate a unique slug for different titles', (done) => {
        const article1Data = { title: 'First Test Article', markdown: 'Content 1' };
        const article2Data = { title: 'Second Test Article', markdown: 'Content 2' };
        const article1 = new Article(article1Data);
        const article2 = new Article(article2Data);

        article1.save()
            .then(savedArticle1 => {
                expect(savedArticle1.slug).to.equal('first-test-article');
                return article2.save();
            })
            .then(savedArticle2 => {
                expect(savedArticle2.slug).to.equal('second-test-article');
                done();
            })
            .catch(err => {
                done(err);
            });
    });

    // Add more tests as needed for other model validations or methods
});
