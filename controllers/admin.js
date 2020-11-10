const Product = require('../models/product');
const User = require('../models/user');

exports.getAddProducts = (req, res, next) => {
  res.render('admin/edit-product', {pageTitle:'Add Product', path:'/admin/add-product', editing:false});
};


exports.getProducts = (req, res, next) => {
  Product.find()
  .then(products => {
    res.render('admin/products', {
      pageTitle:'Admin Products', 
      path:'/admin/products', 
      prods:products
    });
  })
  .catch(err => {
    console.log(err);
  });
};

exports.postAddProducts = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const product = new Product({
    title: title,
    imageUrl: imageUrl,
    price: price,
    description: description,
    userId: req.user
  });
  product.save()
  .then(() => {
    res.redirect('/');
  })
  .catch(err => {
    console.log(err);
  });
};

exports.getEditProduct = (req, res, next) => {        
  const editMod = req.query.edit;
  const prodId = req.params.productId;
  Product.findById(prodId)
  .then(product => {
    res.render('admin/edit-product', {
      pageTitle: product.title,
      path:'edit-product',
      editing:editMod,
      product:product
    });
  })
  .catch(err => console.log(err)); 
};

exports.postEditProduct = (req, res, next) => {         
    const updatedId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedImageUrl = req.body.imageUrl;
    const updatedPrice = req.body.price;
    const updatedDesc = req.body.description;
    Product.findById(updatedId).then(product => {
      product.title = updatedTitle;
      product.imageUrl = updatedImageUrl;
      product.price = updatedPrice;
      product.description = updatedDesc;
      return product.save();
    })
    .then(() => {
      res.redirect('/admin/products');
    })
    .catch(err => console.log(err)); 
};

exports.postDeleteProduct = (req, res, next) => {  
  prodId = req.body.productId;
  ///////////////////////////////////////////////////////////////////////////////////
  //  To remove the Cart Item having the 'productId' same as the prodId on         //
  //  🔻    deletion of the said product from the products collection             //
  //  🔻                                                                          //
  //////////////////////////////////////////////////////////////////////////////////
  User.find()
  .then(users => {
    let usersArr = [];
    for(let user of users) {
      for (let item of user.cart.items) {
        if (item.productId.toString() === prodId.toString()) {
          usersArr.push(user);
        }
      }
    }
    console.log('Users: ', usersArr);
    for (let u of usersArr) {
      return u.deleteCartItem(prodId);        //◀--- This is declared in User Model
    }
  })
  ///////////////////////////////////////////////////////////////////////////////////
  // OR To remove the Cart Item having the 'productId' same as the prodId on       //
  //  ⏬    deletion of the said product from the products collection             //
  //  ⏬                                                                          //
  //////////////////////////////////////////////////////////////////////////////////
  // User.find()
  // .then(users => {
  //   // console.log('Users: ', users);
  //   for (let user of users) {
  //     const updatedCartItems = user.cart.items.filter(i =>{
  //       return i.productId.toString() !== prodId;
  //     });
  //     // console.log('Updated Cart Items: ', updatedCartItems);
  //     user.cart.items = updatedCartItems;
  //     return user.save();
  //   }
  // })
  ///////////////////////////////////////////////////////////////////////////////////
  //  This code is for                                                             //
  //  ⏬    deletion of the said product from the products collection             //
  //  ⏬                                                                          //
  //////////////////////////////////////////////////////////////////////////////////
  Product.findByIdAndRemove(prodId)
  .then(() => {
    console.log('DESTROYED');
    res.redirect('/admin/products')
  })
  .catch(err => console.log(err));
};