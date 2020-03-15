const express = require('express');
const morgan = require('morgan');
const app = express();
const router = require('./router/index.js');
const exception = require('./middlewares/exception.js')
const presenter = require('./middlewares/presenter.js')

if (process.env.NODE_ENV !== 'test')
  app.use(
    morgan('tiny')
  );

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.get('/', (_, res) => {
  res.status(200).json({
    status: true,
    data: {
      requested_at: Date(),
      message: 'Sequelize Init API',
      environment: process.env.NODE_ENV
    }
  })
})
app.use('/api/v1', router, presenter);
app.get('/errors', (req, res) => {
  /*eslint no-undef: ["off"] */
  RandomErrorThing
})
exception.forEach(handler => app.use(handler));

module.exports = app;
