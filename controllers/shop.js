const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;
const Product = require('../models/product');

const ObjectId = mongodb.ObjectId;

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
  .then(products => {
    res.render('shop/index', {
      pageTitle:'Shop', 
      path:'/', 
      prods:products});
  })
  .catch(err => console.log(err));
};

exports.getAllProducts = (req, res, next) => {
  Product.fetchAll()
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
  Product.findById(prodId)
  .then(product => {
    res.render('shop/product-detail', {
      pageTitle: product.title, 
      path:'/products', 
      product:product});
  })
  .catch(err => console.log(err));
};

exports.getCart = (req, res, next) => {
  let cartItems = [];
  req.user.getCart()
    .then(products => {
      
   
                                // OR On collecting all the products and storing them in a
      // let cartProducts = [];          
      // products.forEach(p => {   // JavaScript Array, a copy of the product details is formed
      //   cartProducts.push({...p,  // together with their respective Quantities as in the cart
      //     quantity: req.user.cart.items.find(i => i.productId.toString() === p._id.toString()).quantity
      //   });
      // console.log('Prods: ', cartProducts);
      // });
      res.render('shop/cart', {
      pageTitle: 'Your Cart',
      path: '/cart',
      // products: cartProducts
      products: products
      });
      for (let product of products) {  //code to remove productId of the product deleted from
                                        // the product collection permanently
        cartItems.push({productId: new ObjectId(product._id), quantity: product.quantity})
      }
      const db = getDb();
      return db.collection('users').updateOne(
        {_id: new ObjectId(req.user._id)}, 
        {$set: {cart: {items: cartItems}}}
        )
        .then()
        .catch(err=>console.log(err));
    })
    .catch(err => console.log(err));
};

exports.postCart = (req, res, next) => { 
  const prodId = req.body.productId;
  Product.findById(prodId)
  .then(product => {
    // console.log('PRODUCT: ', product);
    return req.user.addToCart(product);
  })
  .then(result => {
    res.redirect('/cart');
  })
  .catch(err => {
    console.log(err);
  });
};

exports.postDeleteCartItem = (req, res, next) => {    // all these will not work
  const prodId = req.body.productId;
  req.user.deleteCartItem(prodId)
  // .then(cart => {
  //   return cart.getProducts({where: {id: prodId}});
  // })
//   .then(products => {
//     const product = products[0];
//     return product.cartItem.destroy();
//   })
  .then(() => {
    res.redirect('/cart');
  })
  .catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {
  req.user.getOrders()
  .then(orders => {
//     updatedOrders = orders.filter(order => order.products.length > 0);
//     // OR
//     // orders.forEach(order => {
//     //   if(order.products.length > 0) {
//     //     updatedOrders.push(order);
//     //   }
//     // });
//     // OR
//     // for(let order of orders) {
//     //   if (order.products.length > 0) {
//     //     updatedOrders.push(order);
//     //   }
//     // }
//     // console.log(11, updatedOrders);
    res.render('shop/orders', {
      pageTitle:'Your Orders', 
      path:'/orders',
      orders: orders
    });
  })
  .catch(err => {
    console.log(err);
  });
};

exports.postOrders = (req, res, next) => {
  req.user.addOrder()
//   let fetchedCart;
//   req.user.getCart()
//   .then(cart => {
//     fetchedCart = cart;
//     return cart.getProducts();
//   })
//   .then(products => {
//     return req.user.createOrder()
//     .then(order => {
//       return order.addProducts(products.map(product => {
//         product.orderItem = {quantity : product.cartItem.quantity};
//         return product;
//       }))
//       .catch(err => {
//         console.log(err);
//       });
//     })
//     .catch(err => {
//       console.log(err);
//     });
//   })
//   .then(product => {
//     return fetchedCart.setProducts(null);
//   })
  .then(result => {
    res.redirect('/orders');
  })
  .catch(err => {
    console.log(err)
  });
};