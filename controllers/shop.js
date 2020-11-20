const chalk = require('chalk');

const Product = require('../models/product');
const Order = require('../models/order');

exports.getIndex = (req, res, next) => {
  let message = req.flash('success');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  Product.find()
  .then(products => {
    res.render('shop/index', {
      pageTitle:'Shop', 
      path:'/',
      successMessage: message, 
      prods:products
    });
  })
  .catch(err => {
    console.log('getIndexerror: ', err);
  });
}

exports.getAllProducts = (req, res, next) => {
  Product.find()
  .then(products => {
    res.render('shop/product-list', {
      pageTitle:'All Products', 
      path:'/products', 
      prods:products
    });
  })
  .catch(err => {
    console.log(err);
  });
};

exports.getSpecificProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
  .then(product => {
    res.render('shop/product-detail', {
      pageTitle: product.title, 
      path:'/products', 
      product:product
    });
  })
  .catch(err => console.log(err));
};

exports.getCart = (req, res, next) => {
  req.user.populate('cart.items.productId')
  .execPopulate()
  .then(user => {
    res.render('shop/cart', {
      pageTitle: 'Your Cart',
      path: '/cart',
      products: user.cart.items
    });
  })
  .catch(err => console.log('Error: ',err));
};

exports.postCart = (req, res, next) => { 
  const prodId = req.body.productId;
  Product.findById(prodId)
  .then(product => {
    return req.user.addToCart(product);
  })
  .then(result => {
    res.redirect('/cart');
  })
  .catch(err => {
    console.log(err);
  });
};

exports.postDeleteCartItem = (req, res, next) => {    
  const prodId = req.body.productId;
  req.user.deleteCartItem(prodId)
  .then(() => {
    res.redirect('/cart');
  })
  .catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {
  Order.find({'user.userId': req.user._id})
  .then(orders => {
    res.render('shop/orders', {
      pageTitle:'Your Orders', 
      path:'/orders',
      orders: orders
    });
  })
};

exports.postOrders = (req, res, next) => {
  req.user.populate('cart.items.productId')
  .execPopulate()
  .then(_user => {
    const products = _user.cart.items.map(i => {
      return {product: {...i.productId._doc}, quantity: i.quantity}
    });
    const user = {userId: req.user._id , email: req.user.email};
    const order = new Order ({products: products, user: user});
    return order.save(); 
  })
  .then(result => {
    return req.user.clearCart();
  })
  .then(() => {
    res.redirect('/orders');
  });
};