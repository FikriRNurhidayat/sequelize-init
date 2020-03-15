'use strict';

module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define('Post', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {});

  // Associate
  Post.associate = function(models) {
    const {
      User
    } = models;

    Post.belongsTo(User, {
      foreignKey: 'user_id'
    });

    /* Static new method */
    Post.new = function({ title, body, user }) {
      return new Promise((resolve, reject) => {
        if (user instanceof User === false) 
          return reject(new Error('Invalid user'));

        this.create({
          title,
          body,
          user_id: user.id
        })
          .then(data => resolve(data))
          /* 
             Only happened when something
             is wrong with the db
           */
          .catch(err => reject(err))
      })
    }
    /* End of static new method */

    /* Static all method */
    Post.all = function() {
      return Post.findAll({
        include: [
          { model: User, attributes: ['id', 'email']}
        ]
      })
    }
    /* End of static all method */

    /* Static edit method */
    Post.edit = function(id, data) {
      // Cannot change post owner
      delete data.user_id; 

      return this.update(data, {
        where: { id }
      })
    }
    /* End of static edit method */
  };

  return Post;
};
