const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
  .then(([rows, fieldData]) => {
    res.render('shop/index', {
      pageTitle:'Shop', 
      path:'/', 
      prods:rows});
  })
  .catch(err => {
    console.log(err);
  });
};

exports.getAllProducts = (req, res, next) => {
  Product.fetchAll()
  .then(([rows, fieldData]) => {
    res.render('shop/product-list', {
      pageTitle:'All Products', 
      path:'/products', 
      prods:rows});
  })
  .catch(err => {
    console.log(err);
  });
};

exports.getSpecificProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
  .then(([product]) => {
    res.render('shop/product-detail', {
      pageTitle:'Product Details', 
      path:'/products', 
      product:product[0]});
  })
  .catch(err => console.log(err));
};

exports.getCart = (req, res, next) => {                 //all these will not work
  Cart.getAllProducts(cart => {
    const cartTotalPrice = cart.totalPrice;
    let cartProducts = [];
    Product.fetchAll(products => {
      for (let product of products) {
        const cartProductData = cart.products.find(prod => prod.id === product.id);
        if (cartProductData) {
          cartProducts.push({ productData:product, qty:cartProductData.qty});
        }
      }
      res.render('shop/cart', {
        pageTitle: 'Your Cart',
        path: '/cart',
        products: cartProducts,
        cartTotal: cartTotalPrice
      });
    });
  });
};

exports.postCart = (req, res, next) => { //allthese will not work
  const prodId = req.body.productId;
  Product.findById(prodId, product => {
    const prodPrice = product.price;
    Cart.addProduct(prodId, prodPrice);
    res.redirect('/cart');
  });
};

exports.postDeleteCartItem = (req, res, next) => {    // all these will not work
  const prodId = req.body.productId;
  Product.findById(prodId, product => {
    const productPrice = product.price;
    Cart.deleteProduct(prodId, productPrice);
    res.redirect('/cart');
  });
};

exports.getOrders = (req, res, next) => {
  res.render('shop/orders', {pageTitle:'Your Orders', path:'/orders'});
};