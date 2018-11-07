const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = callback => {
  MongoClient
  .connect('mongodb+srv://Brandon:123@cluster0-wdjil.mongodb.net/node-complete-course?retryWrites=true', { useNewUrlParser: true })
  .then(client => {
    console.log('Connected to Database!');
    _db = client.db();
    callback();
  })
  .catch(err => console.log(err));
}

const getDb = () => {
  if(_db) {
    return _db;
  }
  throw 'No database found!';
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;