const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
// const mongoose = require('mongoose'); // No longer directly needed for connection setup
const app = require('../../server'); // Adjust path to your Express app
const Article = require('../../models/article');
// const config = require('../../config/config'); // No longer needed here for DB URI

describe('Article Routes Integration Tests', () => {
    // let serverInstance; // Not strictly needed if supertest manages the app lifecycle

    // before hook for DB connection is now in test-setup.js
    // after hook for DB disconnection and cleanup is now in test-setup.js

    beforeEach(async () => {
        try {
            await Article.deleteMany({});
            // Seed an article for GET requests
            const article = new Article({ title: 'Test Article for GET', markdown: 'Some content' });
            await article.save();
        } catch (err) {
            console.error('Error clearing/seeding articles (Integration):', err);
        }
    });

    describe('GET /articles', () => {
        it('should return the articles index page with articles', async () => {
            const res = await request(app).get('/'); // The root path displays articles
            expect(res.status).to.equal(200);
            expect(res.text).to.include('Test Article for GET'); // Check if seeded article title is present
        });
    });

    describe('GET /articles/new', () => {
        it('should return the new article form page', async () => {
            const res = await request(app).get('/articles/new');
            expect(res.status).to.equal(200);
            expect(res.text).to.include('New Article'); // Check for a title or specific text
        });
    });

    describe('POST /articles', () => {
        it('should create a new article and redirect', async () => {
            const articleData = {
                title: 'New Awesome Article',
                description: 'A cool description',
                markdown: '## Markdown Content\n\nThis is it.'
            };
            const res = await request(app)
                .post('/articles')
                .send(articleData)
                .expect(302); // Expect a redirect

            // Verify the article was created in the DB
            const article = await Article.findOne({ title: 'New Awesome Article' });
            expect(article).to.exist;
            expect(article.description).to.equal(articleData.description);
            expect(article.slug).to.equal('new-awesome-article');

            // Check redirection path
            expect(res.header.location).to.equal(`/articles/${article.slug}`);
        });

        it('should re-render the new article form if title is missing', async () => {
            const articleData = {
                description: 'A cool description without title',
                markdown: '## Markdown Content'
            };
            const res = await request(app)
                .post('/articles')
                .send(articleData)
                .expect(200); // Expect to re-render the form, not redirect or error out globally yet

            expect(res.text).to.include('New Article'); // Check if it's the new article form
            // Mongoose validation errors are handled by re-rendering the form with the article object
            // The view should ideally display these errors.
            // For this test, we confirm it re-renders the correct page.
        });
    });

    // Add more tests for other routes: GET /articles/:slug, GET /articles/edit/:id, PUT /articles/:id, DELETE /articles/:id
});
