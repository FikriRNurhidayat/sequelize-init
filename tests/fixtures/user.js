const { internet } = require('faker');

module.exports = {
  register() {
    let password = internet.password();

    return {
      email: internet.email(),
      password,
      password_confirmation: password
    };
  },

  login() {
    let data = this.register();
    delete data.password_confirmation;
    return data;
  }
}
