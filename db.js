const knex = require('knex');
const bookshelf = require('bookshelf');

const db = knex({
  client: 'mysql',
  connection: {
    host: 'localhost',
    user: 'kasia',
    password: 'kasia',
    database: 'sklep'
  }
});

const bookshelfInstance = bookshelf(db);

module.exports = bookshelfInstance;
