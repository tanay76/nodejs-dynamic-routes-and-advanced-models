const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

const ObjectId = mongodb.ObjectId;

class User {
  constructor(id, name, email, cart) {
    this._id = id ? new ObjectId(id):null;
    this.name = name;
    this.email = email;
    this.cart = cart;
  }

  save() {
    const db = getDb();
    let dbOp;
    if(this._id) {
      dbOp = db.collection('users').updateOne({_id:this._id}, {$set: this});
    } else {
      dbOp = db.collection('users').insertOne(this);
    }
    return dbOp;
  };

  addToCart(product) {
    let newQuantity = 1;
    let updatedCartItems = [];
    if(!this.cart) {
      updatedCartItems.push({productId: new ObjectId(product._id), quantity: newQuantity});
    } else {
      const cartProductIndex = this.cart.items.findIndex(cp => {
        return cp.productId.toString() === product._id.toString();
      });
      updatedCartItems = [...this.cart.items];
      if(cartProductIndex >= 0) {
        newQuantity = this.cart.items[cartProductIndex].quantity + 1;
        updatedCartItems[cartProductIndex].quantity = newQuantity; 
      } else {
        updatedCartItems.push({productId: new ObjectId(product._id), quantity: newQuantity});
      }
    }
    const updatedCart = {items: updatedCartItems};
    const db = getDb();
    return db.collection('users').updateOne(
      {_id: this._id}, 
      {$set: {cart: updatedCart}}
      );
  };

  getCart() {
    const db = getDb();
    const productIds = this.cart.items.map(i => {    // To collect all the product ids of all the 
      return i.productId;                            // items of the cart
    });
    return db.collection('products')       // In order to collect all the product details of all
    .find({_id: {$in: productIds}})           // the products in the product model that have the ids
    .toArray()                         // matching with the ids of the products in the cart
    .then(products => { 
      return products.map(p => {      // On collecting all the products and storing them in a
                                              // JavaScript Array, a copy of the product details is formed
        for(let productId of productIds) {
          if(p._id.toString() === productId.toString()) {
            return {...p,               // together with their respective Quantities as in the cart
              quantity: this.cart.items.find(i => i.productId.toString() === p._id.toString()).quantity
            };
          }
        }                                     
      });
    })
    .catch(err => {
      console.log(err);
    });
  };

  deleteCartItem(id) {
    const updatedCartItems = this.cart.items.filter(item => {
      return item.productId.toString() !== id.toString();
    });
    const db = getDb();
    return db.collection('users').updateOne(
      {_id: this._id}, 
      {$set: {cart: {items: updatedCartItems}}}
      );
  }

  addOrder() {
    const db = getDb();
    return this.getCart()
    .then(products => {
      const order = {
        items: products,
        user: {
          _id: this._id,
          name: this.name
        }
      };
      return db.collection('orders').insertOne(order);
    })
    .then(result => {
      // this.cart = {items: []};
      return db.collection('users')
      .updateOne(
        {_id: this._id},
        {$set: {cart: {items: []}}}
        );
    })
    .catch(err => console.log(err));
  }

  getOrders() {
    const db = getDb();
    return db.collection('orders')
    .find({'user._id': this._id}).toArray();
  }

  static findById(id) {
    const db = getDb();
    return db.collection('users').findOne({_id: new ObjectId(id)});
  }
}

 module.exports = User;