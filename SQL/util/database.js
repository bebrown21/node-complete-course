const Sequelize = require('sequelize');

const sequelize = new Sequelize('node-complete-course', 'root', 'Bebrown213', {
  dialect: 'mysql',
  host: 'localhost'
});

module.exports = sequelize;