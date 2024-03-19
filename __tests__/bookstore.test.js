process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../app");
const db = require("../db");
const Book = require('../models/book');


describe('tests bookstore routes', function() {
    let book1

    beforeEach(async () => {
        await db.query('DELETE FROM books');
        book1 = await Book.create({
            "isbn": "0691161518",
            "amazon_url": "http://a.co/eobPtX2",
            "author": "Matthew Lane",
            "language": "english",
            "pages": 264,
            "publisher": "Princeton University Press",
            "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
            "year": 2017
        })
    })

    // Tests get book route
    test('getting books', async () => {
        const response = await request(app).get('/books/');
        expect(response.statusCode).toEqual(200);
        expect( response.body ).toEqual(expect.objectContaining({
            books: [book1]
        }))
    });

    describe('test finding 1 book and 1 wrong book', function(){
        test('getting book by isbn', async () => {
            const response = await request(app).get(`/books/${book1.isbn}`);
            expect(response.statusCode).toEqual(200);
            expect(response.body).toEqual(expect.objectContaining({
                book: expect.objectContaining({author: book1.author})
            }));
        });

        test('getting error for wrong book', async () => {
            const response = await request(app).get('/books/WRONG');
            expect(response.statusCode).toEqual(404);
        })
    });

    describe('test adding 1 book and 1 invalid book', function(){
        test('adding book', async () => {
            const response = await request(app)
                                    .post('/books/')
                                    .send({
                                        "isbn": "1234567",
                                        "amazon_url": "http://a.co/eobPtX2",
                                        "author": "Steve",
                                        "language": "english",
                                        "pages": 69,
                                        "publisher": "Me",
                                        "title": "Random",
                                        "year": 2017
                                    })
        expect(response.statusCode).toEqual(201);
        expect(response.body).toEqual(expect.objectContaining({
            book: expect.objectContaining({author: "Steve"})
        }));
        })

        test('adding invalid schema', async () => {
            const response = await request(app)
                                    .post('/books/')
                                    .send({
                                        "isbn": "1234567",
                                        "amazon_url": "http://a.co/eobPtX2",
                                        "author": 12,
                                        "language": "english",
                                        "pages": 69,
                                        "publisher": "Me",
                                        "title": "Random",
                                        "year": 2017
                                    })
            expect(response.statusCode).toEqual(400);
        })
    })

    describe('tests updating books', function() {

        test('update book', async () => {
            const response = await request(app)
                                    .put(`/books/${book1.isbn}`)
                                    .send({
                                        "author": "Steve"
                                    });
            expect(response.statusCode).toEqual(200);
            expect(response.body).toEqual(expect.objectContaining({
                book: expect.objectContaining({author: "Steve"})
            }));
        });

        test('update invalid book', async () => {
            const response = await request(app)
                                    .put(`/books/WRONG`)
                                    .send({
                                        "author": "Steve"
                                    });
            expect(response.statusCode).toEqual(404);
        });
    });

    test('delete book', async() => {
        const response = await request(app).delete(`/books/${book1.isbn}`);
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({ message: "Book deleted" });
    })
});

afterAll(async function () {
    await db.end();
});
  