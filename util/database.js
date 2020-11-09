const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = callback => {
  MongoClient.connect(
    'mongodb+srv://santanu:jXL9ojtcN3qcEUiL@cluster0.uvfje.mongodb.net/shop'
    )
    .then(client => {
      console.log('database1', 'CONNECTED');
      _db = client.db();
      callback();
    })
    .catch(err => {
      console.log('database2', err);
      throw err;
    });
};

const getDb = () => {
  if(_db) {
    return _db;
  }
  throw 'NO DATABASE FOUND!';
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb; 