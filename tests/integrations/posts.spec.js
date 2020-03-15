/* Basic requirement */
const faker = require('faker');
const request = require('supertest');
const {
  helper,
  model,
  server,
} = require('../config.js');
const { User, Post } = model;

/* Get fixtures */
const { user, post } = require('../fixtures/index.js');

describe('Posts API Collection', () => {
  /* Global test vars */
  let userInstance;
  let postInstance;
  let token;

  beforeAll(done => {
    /*
       Since we need user data in order to create post
       so, we should create user data before we do the test
     */
    const registerObj = user.register()

    User.new(registerObj) 
      .then(data => {
        userInstance = data; // Set global user instance

        const loginObj = {
          email: userInstance.email,
          password: registerObj.password
        };

        return request(server)
          .post('/api/v1/auth/login')
          .set('Content-Type', 'application/json')
          .send(JSON.stringify(loginObj))
      })
      .then(res => {
        token = res.body.data.token; // Set global token
        done(); // Finish the before hooks
      })
  })

  afterAll(done => {
    /*
       Delete the all the data we create during the test
      */

    Promise.all([
      Post.destroy({}),
      User.destroy({})
    ])
      .then(() => done())
  })
  
  describe('POST /api/v1/posts', () => {

    test('Successfully create new posts', done => {
      let createObj = post.create();

      request(server)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(createObj))
        .then(({ status: statusCode, body }) => {
          postInstance = body.data;
          
          expect(statusCode).toBe(201);

          /* Prove that Post is really saved to the database */
          Post.findOne({
            where: {
              id: body.data.id,
            },
            include: [
              { model: User, attributes: ['id'] }
            ]
          })
            .then(data => {
              expect(data.id).toBe(body.data.id); // Expect if it's really created 
              expect(data.title).toBe(createObj.title); // Title should have been the same with the createObj
              expect(data.body).toBe(createObj.body); // Body should have been also be the same
              expect(data.user_id).toBe(userInstance.id); // user_id should have been the same with the user instance

              done()
            })
        })
    })

    test('Failed to create post due to unauthorized', done => {
      let createObj = post.create();

      request(server)
        .post('/api/v1/posts')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(createObj))
        .then(({ status: statusCode, body }) => {
          expect(statusCode).toBe(401);
          done()
        })
    })

    test('Failed to create post due to incomplete props', done => {
      let createObj = post.create();
      let random = ['title', 'body'];

      /* Randomly delete props */
      random = random[
        Math.floor(Math.random() * (random.length - 1))
      ]
      delete createObj[random];

      request(server)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(createObj))
        .then(({ status: statusCode, body }) => {
          expect(statusCode).toBe(400);

          /* Check if the missing props is true */
          body.errors.forEach(i => {
            expect(i.type).toBe('required');
            expect(i.message).toBe(`The '${random}' field is required.`);
            expect(i.field).toBe(random);
          })

          done()
        })
    })
  })

  describe('GET /api/v1/posts', () => {
    
    test('Successfully get posts', done => {
      request(server)
        .get('/api/v1/posts')
        .then(({ status: statusCode, body }) => {
          expect(statusCode).toBe(200);
          let data = body.data.find(i => i.id === postInstance.id);

          expect(data.user_id).toBe(postInstance.user_id);
          expect(data.title).toBe(postInstance.title);
          expect(data.body).toBe(postInstance.body);

          done()
        })
    })

  })

  describe('PUT /api/v1/posts/:id', () => {
    
    test('Successfully update posts', done => {

      /* Create request body */
      let createObj = post.create();
      let choice = ['title', 'body'];
      let random = helper.randomize(choice);
      delete createObj[random];

      request(server)
        .put(`/api/v1/posts/${postInstance.id}`)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send(JSON.stringify(createObj))
        .then(({ status: statusCode, body }) => {
          expect(statusCode).toBe(200);
          expect(body.data).toBe("Post updated!")

          /* Proof that the post is updated correctly */
          Post.findOne({ where: { id: postInstance.id }})
            .then(data => {
              let props = choice.filter(i => i !== random);
              props = props[0];

              expect(data[props]).toBe(createObj[props]);
              done()
            })
        })
    })

    /* Won't update the post becuase of the post doesn't belong to the current_user */
    test("Won't update post because the post doesn't belong to the current_user", async done => {
      let anotherUserInstance = await User.new(user.register());
      let anotherToken = anotherUserInstance.createAccessToken();

      let createObj = post.create();
      let choice = ['title', 'body'];
      let random = helper.randomize(choice);
      delete createObj[random];

      request(server)
        .put(`/api/v1/posts/${postInstance.id}`)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${anotherToken}`)
        .send(JSON.stringify(createObj))
        .then(({ status: statusCode, body }) => {
          expect(statusCode).toBe(403);
          expect(body.errors).toBe("This is not your post!")

          /* Proof that the post isn't updated */
          Post.findOne({ where: { id: postInstance.id }})
            .then(data => {
              let props = choice.filter(i => i !== random);
              props = props[0];

              expect(data[props]).not.toBe(createObj[props]);
              done()
            })
        })
    })
    /* End of forbidden request to update post becuase the post doesn't belong to the current_user */

    test("Won't update the post becuase the post itself not found!", done => {

      /* Create request body */
      let createObj = post.create();

      request(server)
        .put(`/api/v1/posts/${faker.random.uuid()}`)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send(JSON.stringify(createObj))
        .then(({ status: statusCode, body }) => {
          expect(statusCode).toBe(404);
          expect(body.errors).toBe("Post not found!")
          done()
        })
    })

  })

})
