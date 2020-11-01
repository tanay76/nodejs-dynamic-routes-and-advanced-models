const fs = require('fs');
const { normalize } = require('path');
const path = require('path');

const rootDir = require('../util/path');

const p = path.join(rootDir, 'data', 'cart.json');

module.exports = class Cart {
  static addProduct(id, productPrice) {
    const prodPrice = Number(productPrice);
    fs.readFile(p, (err, fileContent) => {
      let cart = {products:[], totalPrice:0};
      if (!err) {
        cart = JSON.parse(fileContent);
      }
      let updatedProduct;
      const existingProductIndex = cart.products.findIndex(prod => prod.id === id);
      const existingProduct = cart.products[existingProductIndex];
      if (existingProduct) {
        updatedProduct = {...existingProduct};
        updatedProduct.qty += 1;
        cart.products = [...cart.products];
        cart.products[existingProductIndex] = updatedProduct;
      } else {
        updatedProduct = {id:id, qty:1};
        cart.products = [...cart.products, updatedProduct];
      }
      cart.totalPrice += prodPrice;
      fs.writeFile(p, JSON.stringify(cart), err => {
        console.log(err);
      });
    });
  };

  static deleteProduct(id, productPrice) {
    fs.readFile(p, (err, fileContent) => {
      if (err) {
        return;
      }
      const updatedCart = {...JSON.parse(fileContent)};
      const productToBeDeleted = updatedCart.products.find(prod => prod.id === id);
      if (!productToBeDeleted) {
        return;
      }
      updatedCart.products = updatedCart.products.filter(prod => prod.id !== id);
      const productQtyToBeDeleted = productToBeDeleted.qty;
      updatedCart.totalPrice = updatedCart.totalPrice - Number(productPrice) * productQtyToBeDeleted;
      // console.log(2, productQtyToBeDeleted, typeof(productQtyToBeDeleted));
      // console.log(3, productPrice, typeof(productPrice));
      // console.log(4, updatedCart.totalPrice, typeof(updatedCart.totalPrice));
      // updatedCart.totalPrice = updatedCart.totalPrice - productPrice * productQtyToBeDeleted;
      // console.log(5, updatedCart.totalPrice);
      fs.writeFile(p, JSON.stringify(updatedCart), err => {
        if (err) {
          console.log(err);
        }
      });
    });
  };

  static getAllProducts(cb) {
    fs.readFile(p, (err, fileContent) => {
      if (!err) {
        const cart = JSON.parse(fileContent);
        cb(cart);
      } else {
        cb(null);
      }
    });
  };
}