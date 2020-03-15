const request = require('supertest');
const faker = require('faker');
const jwt = require('jsonwebtoken');
const fixture = require('../fixtures/user.js');
const {
  server,
  model
} = require('../config.js');
const { User } = model;

describe('Auth API Collection', () => {
  // Global variable
  let sample = fixture.register()
  let instance;
  let token;

  beforeAll(done => {
    // Initialize new user to be tested later
    User.new(sample)
      .then(data => {
        instance = data;
        done()
      })
  })

  afterAll(done => {
    // Destroy all user whenever the test is finished
    User
      .destroy({})
      .then(() => done())
  })
  
  describe('POST /api/v1/auth/register', () => {
    
    /* Positive case */
    test('Successfully register new user', done => {
      let fresh = fixture.register();

      request(server)
        .post('/api/v1/auth/register')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(fresh))
        .then(({ status, body }) => {
          expect(status).toBe(201);

          let {
            data
          } = body;

          expect(data).toHaveProperty('id')
          expect(data).toHaveProperty('email')
          expect(data).toHaveProperty('createdAt')
          expect(data).toHaveProperty('updatedAt')

          expect(data.email).toBe(fresh.email.toLowerCase());
          done()
        })
    })
    /* End of postive case */

    /* Negative case */
    test('Reject registration of new user due to incomplete properties', done => {
      let fresh = fixture.register();
      let random = ['email', 'password', 'password_confirmation'];
      random = random[Math.floor(Math.random() * (random.length - 1))];

      delete fresh[random];

      request(server)
        .post('/api/v1/auth/register')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(fresh))
        .then(({ status, body }) => {
          expect(status).toBe(400);

          let {
            errors
          } = body;

          errors.forEach(i => {
            expect(i.type).toBe('required');
            expect(i.message).toBe(`The '${random}' field is required.`);
            expect(i.field).toBe(random);
          })

          done()
        })
    })

    test('Reject registration of new user due to duplication', done => {
      request(server)
        .post('/api/v1/auth/register')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(sample))
        .then(({ status, body }) => {
          expect(status).toBe(422);

          let {
            errors
          } = body;

          expect(errors).toBe('Email address has already in use');

          done()
        })
    })
    /* End of Negative case */

  })
  /* End of register endpoint */


  /* Login endpoint */
  describe('POST /api/v1/auth/login', () => {
    
    /* Positive case */
    test('Successfully login and get the token', done => {
      request(server)
        .post('/api/v1/auth/login')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(sample))
        .then(({ status: statusCode, body }) => {
          expect(statusCode).toBe(200);

          let {
            status,
            data
          } = body;

          expect(status).toBe(true);
          expect(data).toHaveProperty('id');
          expect(data).toHaveProperty('email');
          expect(data).toHaveProperty('token');

          expect(data.email).toBe(sample.email.toLowerCase());

          /* SET Global token */
          token = data.token;

          const parsed = jwt.verify(data.token, process.env.JWT_SIGNATURE_KEY);
          expect(parsed.id).toBe(data.id);
          expect(parsed.email).toBe(data.email.toLowerCase());

          done()
        })
    })
    /* End of positive case */

    /* Negative case */
    test("Rejected because of email doesn't exist", done => {
      let fresh = fixture.login();

      request(server)
        .post('/api/v1/auth/login')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(fresh))
        .then(({ status: statusCode, body }) => {
          expect(statusCode).toBe(401);

          let {
            status,
            errors
          } = body;

          expect(status).toBe(false);
          expect(errors).toBe("Email not found!");

          done()
        })
    })

    test("Rejected because of wrong email", done => {
      let fresh = {
        ...sample
      }

      delete fresh.password_confirmation;
      fresh.password = fixture.login().password;

      request(server)
        .post('/api/v1/auth/login')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(fresh))
        .then(({ status: statusCode, body }) => {
          expect(statusCode).toBe(401);

          let {
            status,
            errors
          } = body;

          expect(status).toBe(false);
          expect(errors).toBe("Wrong password!");

          done()
        })
    })
    /* End of negative case */
  })
  /* End of login endpoint */

  /* Change password endpoint */
  describe('POST /api/v1/auth/change-password', () => {
    
    /* Positive case */
    test('Successfully login and get the token', done => {
      let {
        password: new_password,
        password_confirmation: new_password_confirmation
      } = fixture.register();

      let fresh = {
        old_password: sample.password,
        new_password,
        new_password_confirmation
      }

      sample.password = new_password;

      request(server)
        .post('/api/v1/auth/change-password')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send(JSON.stringify(fresh))
        .then(({ status: statusCode, body }) => {
          expect(statusCode).toBe(200);

          let {
            status,
            data
          } = body;

          expect(status).toBe(true);
          expect(data).toBe('Password has successfully changed!');

          done()
        })
    })
    /* End of positive case */

    /* Negative case */
    test("Rejected because of password doesn't match", done => {
      let {
        password: new_password,
      } = fixture.register();

      let fresh = {
        old_password: sample.password,
        new_password,
        new_password_confirmation: sample.password
      }

      request(server)
        .post('/api/v1/auth/change-password')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send(JSON.stringify(fresh))
        .then(({ status: statusCode, body }) => {
          expect(statusCode).toBe(400);

          let {
            status,
            errors
          } = body;

          expect(status).toBe(false);
          expect(errors).toBe("Password doesn't match with its confirmation");

          done()
        })
    })

    test("Rejected because of old password and the new password are the same", done => {
      let fresh = {
        old_password: sample.password,
        new_password: sample.password,
        new_password_confirmation: sample.password
      }

      request(server)
        .post('/api/v1/auth/change-password')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send(JSON.stringify(fresh))
        .then(({ status: statusCode, body }) => {
          expect(statusCode).toBe(400);

          let {
            status,
            errors
          } = body;

          expect(status).toBe(false);
          expect(errors).toBe("New password should not be same as old password!");

          done()
        })
    })
    /* End of negative case */
  })
  /* End of login endpoint */

  /* Current user endpoint */
  describe('GET /api/v1/auth/me', () => {

    /* Positive case */
    test("Successfully get current user info", done => {

      request(server)
        .get('/api/v1/auth/me')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .then(({ status: statusCode, body }) => {
          expect(statusCode).toBe(200);

          let {
            status,
            data
          } = body;

          expect(status).toBe(true);
          expect(data).toHaveProperty('id')
          expect(data).toHaveProperty('email')

          expect(data.email).toBe(sample.email.toLowerCase())

          done()
        })
    })
    /* End of positive case */

    /* Negative case */
    test("Rejected because of no token", done => {
      request(server)
        .get('/api/v1/auth/me')
        .set('Content-Type', 'application/json')
        .then(({ status: statusCode, body }) => {
          expect(statusCode).toBe(401);

          let {
            status,
            errors
          } = body;

          expect(status).toBe(false);
          expect(errors).toBe("Invalid token");

          done()
        })
    })

    test("Rejected because of invalid jwt token", done => {
      request(server)
        .get('/api/v1/auth/me')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${faker.internet.password()}`)
        .then(({ status: statusCode, body }) => {
          expect(statusCode).toBe(401);

          let {
            status,
            errors
          } = body;

          expect(status).toBe(false);
          expect(errors).toBe("Invalid token");

          done()
        })
    })

    test("Rejected because of no bearer prefix", done => {
      request(server)
        .get('/api/v1/auth/me')
        .set('Content-Type', 'application/json')
        .set('Authorization', token)
        .then(({ status: statusCode, body }) => {
          expect(statusCode).toBe(401);

          let {
            status,
            errors
          } = body;

          expect(status).toBe(false);
          expect(errors).toBe("Invalid token");

          done()
        })
    })
    /* End of negative case */
  })
  /* End of current user endpoint */

})
