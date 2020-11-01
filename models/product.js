const fs = require('fs');
const path = require('path');

const Cart = require('./cart');
const rootDir = require('../util/path');

const p = path.join(rootDir, 'data', 'products.json');

const getProductsFromFile = (cb) => {
  fs.readFile(p, (err, fileContent) => {
    if (err) {
      return cb([]);
    }
    return cb(JSON.parse(fileContent));
  });
};

module.exports = class Product {
  constructor(id, title, imageUrl, price, description) {
    this.id = id,
    this.title = title,
    this.imageUrl = imageUrl,
    this.price = price,
    this.description = description
  }

  save() {
    if (this.id) {
      getProductsFromFile(products => {
        let updatedProducts;
        const existingProductIndex = products.findIndex(prod => prod.id === this.id );
        updatedProducts = [...products];
        updatedProducts[existingProductIndex] = this;
        fs.writeFile(p, JSON.stringify(updatedProducts), err => {
          console.log(err);
        });
      });
    } else {
      this.id = Math.random().toString();
      getProductsFromFile(products => {
        products.push(this);
        fs.writeFile(p, JSON.stringify(products), err => {
          console.log(err);
        });
      });
    }
  };

  static fetchAll(cb) {
    getProductsFromFile(cb);
  };

  static findById(id, cb) {
    getProductsFromFile(products => {
      const product = products.find(prod => prod.id === id);
      cb(product);
    });
  };

  static deleteSpecificProduct(id) {
    getProductsFromFile(products => {
      const updatedProducts = products.filter(prod => prod.id !== id);
      const productToBeDeleted = products.find(prod => prod.id === id);
      const productPrice = productToBeDeleted.price;
      fs.writeFile(p, JSON.stringify(updatedProducts), err => {
        if (!err) {
          // console.log(1, productPrice, typeof(productPrice));
          Cart.deleteProduct(id, productPrice);
        }
      });
    });
  };
}