const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
  Product.findAll()
  .then(products => {
    res.render('shop/index', {
      pageTitle:'Shop', 
      path:'/', 
      prods:products});
  })
  .catch(err => console.log(err));
};

exports.getAllProducts = (req, res, next) => {
  Product.findAll()
  .then(products => {
    res.render('shop/product-list', {
      pageTitle:'All Products', 
      path:'/products', 
      prods:products});
  })
  .catch(err => {
    console.log(err);
  });
};

exports.getSpecificProduct = (req, res, next) => {
  const prodId = req.params.productId;
  req.user.getProducts({where : {id : prodId}})
  .then(products => {
    const product = products[0];
    res.render('shop/product-detail', {
      pageTitle: product.title, 
      path:'/products', 
      product:product});
  })
  .catch(err => console.log(err));
};

exports.getCart = (req, res, next) => {
  req.user.getCart()
  .then(cart => {
    return cart.getProducts();
  })
  .then(products => {
    res.render('shop/cart', {
      pageTitle: 'Your Cart',
      path: '/cart',
      products: products
    });
  })
  .catch(err => console.log(err));
};

exports.postCart = (req, res, next) => { //allthese will not work
  const prodId = req.body.productId;
  let fetchedCart;
  let newQuantity = 1;
  req.user.getCart()
  .then(cart => {
    fetchedCart = cart;
    return cart.getProducts({ where: {id: prodId} });
  })
  .then(products => {
    let product;
    if (products.length > 0) {
      product = products[0];
    }
    if (product) {
      const oldQuantity = product.cartItem.quantity;
      newQuantity = oldQuantity + 1;
      return product;
    }
    return Product.findByPk(prodId);
  })
  .then(product => {
    return fetchedCart.addProduct(product, { through: {quantity : newQuantity}});
  })
  .then(cart => {
    res.redirect('/cart');
  })
  .catch(err => console.log(err));
};

exports.postDeleteCartItem = (req, res, next) => {    // all these will not work
  const prodId = req.body.productId;
  req.user.getCart()
  .then(cart => {
    return cart.getProducts({where: {id: prodId}});
  })
  .then(products => {
    const product = products[0];
    return product.cartItem.destroy();
  })
  .then(() => {
    res.redirect('/cart');
  })
  .catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {
  let updatedOrders = [];
  req.user.getOrders({include: ['products']})
  .then(orders => {
    updatedOrders = orders.filter(order => order.products.length > 0);
    // OR
    // orders.forEach(order => {
    //   if(order.products.length > 0) {
    //     updatedOrders.push(order);
    //   }
    // });
    // OR
    // for(let order of orders) {
    //   if (order.products.length > 0) {
    //     updatedOrders.push(order);
    //   }
    // }
    // console.log(11, updatedOrders);
    res.render('shop/orders', {
      pageTitle:'Your Orders', 
      path:'/orders',
      orders: updatedOrders
    });
  })
  .catch(err => {
    console.log(err);
  });
};

exports.postOrders = (req, res, next) => {
  let fetchedCart;
  req.user.getCart()
  .then(cart => {
    fetchedCart = cart;
    return cart.getProducts();
  })
  .then(products => {
    return req.user.createOrder()
    .then(order => {
      return order.addProducts(products.map(product => {
        product.orderItem = {quantity : product.cartItem.quantity};
        return product;
      }))
      .catch(err => {
        console.log(err);
      });
    })
    .catch(err => {
      console.log(err);
    });
  })
  .then(product => {
    return fetchedCart.setProducts(null);
  })
  .then(result => {
    res.redirect('/orders');
  })
  .catch(err => {
    console.log(err)
  });
};