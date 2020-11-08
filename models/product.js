const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

const ObjectId = mongodb.ObjectId;

class Product {
  constructor(id, title, imageUrl, price, description, userId) {
    this._id = id ? new ObjectId(id):null;
    this.title = title;
    this.imageUrl = imageUrl;
    this.price = price;
    this.description = description;
    this.userId = userId;
  }

  save() {
    const db = getDb();
    let dbOp;
    if(this._id) {
      dbOp = db.collection('products').updateOne({_id: this._id}, {$set: this});
    } else {
      dbOp = db.collection('products').insertOne(this);
    }
    return dbOp
    .then(result => {
      console.log('Database Updated');
    })
    .catch(err => {
      console.log(err);
    });
  }

  static fetchAll() {
    const db = getDb();
    return db.collection('products')
    .find()
    .toArray()
    .then(products => {
      return products;
    })
    .catch(err => {
      console.log('product3', err);
    });
  }

  static findById(id) {
    const db = getDb();
    return db.collection('products')
    .findOne({_id: new ObjectId(id)})
    .then(product => {
      return product;
    })
    .catch(err => {
      console.log(err);
    });
  }

  static deleteById(id) {
    const db = getDb();
    return db.collection('products').deleteOne({_id: new ObjectId(id)})
    .then(result => {
      console.log('Deleted Successfully');
    })
    .catch(err => {
      console.log(err);
    });
  }
};

module.exports = Product;