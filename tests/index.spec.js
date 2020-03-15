const faker = require('faker');
const request = require('supertest');
const { server } = require('./config.js')

describe('Basic Utility', () => {

  test('GET /', done => {
    request(server)
      .get('/')
      .then(({ status, body }) => {
        expect(status).toBe(200);
        expect(body.status).toBe(true);
        expect(body.data.message).toBe('Sequelize Init API');
        expect(body.data.environment).toBe('test');

        done()
      })
  })

  test('404 Handler', done => {
    request(server)
      .get(`/${faker.random.words().trim()}`)
      .then(({ status, body }) => {
        expect(status).toBe(404);
        expect(body.status).toBe(false);
        expect(body.errors).toBe('Are you lost?')

        done()
      })
  })

  test('404 in API Namespace Handler', done => {
    request(server)
      .get(`/api/v1/${faker.random.words().trim()}`)
      .then(({ status, body }) => {
        expect(status).toBe(404);
        expect(body.status).toBe(false);
        expect(body.errors).toBe('Are you lost?')

        done()
      })
  })

  test('Internal Server Error Handler', done => {
    request(server)
      .get('/errors')
      .then(({ status, body }) => {
        expect(status).toBe(500);
        expect(body.status).toBe(false);
        expect(body.errors).toBe('RandomErrorThing is not defined');

        done()
      })
  })

})
