'use strict';
const { compare, hash } = require('bcryptjs');
const jwt = require('jsonwebtoken')

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    email: {
      type: DataTypes.STRING,
      unique: {
        args: true,
        msg: 'Email address has already in use'
      },
      validate: {
        isEmail: true,
        notEmpty: true,
        isLowercase: true,
      }
    },
    encrypted_password: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      }
    }
  }, {});

  // Encrypt interface
  function encrypt(data) {
    return hash(data, 10) 
  }
  // End of encrypt interface

  User.associate = function(models) {
    // associations can be defined here
  };

  // Static register method
  User.new = function({ email, password, password_confirmation }) {
    return new Promise((resolve, reject) => {
      // Check if password and its confirmation is matched,
      // Otherwise it will throw the error!
      if (password !== password_confirmation) {
        return reject(new Error("Password doesn't match"));
      }

      // Encrypt the password 
      encrypt(password)
        .then(encrypted_password => {
          // Create new user
          return this.create({
            email: email.toLowerCase(), // Set email into lowercase
            encrypted_password
          })
        })
        .then(data => resolve(data))
        .catch(err => reject(err)) 
    })
  }
  // End of static register method

  /* Static find method with less attributes */
  User.find = function(props) {
    return User.findOne({
      where: props,
      attributes: ['id', 'email', 'encrypted_password']
    })
  }
  /* End of find method with less attributes */

  /* Authenticate static method */
  User.authenticate = function(email, password) {
    return new Promise((resolve, reject) => {
      // Find by email
      this.find({ email: email.toLowerCase() })
        .then(async user => {
          const isPasswordCorrect = await compare(password, user.encrypted_password)
          if (!isPasswordCorrect) return reject(new Error('Wrong password!'))

          resolve(user)
        })
        .catch(err => {
          reject(new Error("Email not found!"))
        })
    }) 
  }
  /* End of authenticate static method */

  /* Set new password instance method*/
  User.prototype.setPassword = function({ old_password, new_password }) {
    return new Promise((resolve, reject) => {
      /*
       * Call compare interface
       * To compare old password and password on database
       *
       * */
      compare(old_password, this.encrypted_password) 
        .then(isPasswordCorrect => {
          // Check if the old password correct!
          if (!isPasswordCorrect)
            return reject(new Error('Wrong password!'));

          return encrypt(new_password)
        })
        .then(encrypted_password => {
          /* 
           * Create variable to store the query parameter
           * In order to make the code readable
           *
           * */
          let params = { encrypted_password };

          /* 
           * Call the constructor in order
           * to call static method update
           *
           * */
          return this.constructor.update(params, {
            where: {
              id: this.id // Find by ID of this instance
            }
          })
        })
        .then(result => resolve())
        .catch(err => reject(err))
    })
  }
  /* End of set new password instance method*/

  /* Instance method for creating access token */
  User.prototype.createAccessToken = function() {
    return jwt.sign({ id: this.id, email: this.email }, process.env.JWT_SIGNATURE_KEY)
  }
  /* End of instance create access token method */

  /* Instance method to format the data */
  User.prototype.entity = function(props = {}) {
    return {
      id: this.id,
      email: this.email,
      ...props 
    }
  }
  /* End of instance entity method */

  return User;
};
