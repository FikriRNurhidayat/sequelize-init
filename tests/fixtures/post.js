const faker = require('faker');

module.exports = {
  create() {
    return {
      title: faker.random.words(),
      body: faker.lorem.paragraphs()
    }
  }
}
