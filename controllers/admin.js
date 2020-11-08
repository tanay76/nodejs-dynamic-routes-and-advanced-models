const Product = require('../models/product');

exports.getAddProducts = (req, res, next) => {
  res.render('admin/edit-product', {pageTitle:'Add Product', path:'/admin/add-product', editing:false});
};


exports.getProducts = (req, res, next) => {
  Product.fetchAll()
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
  const product = new Product(null, title, imageUrl, price, description, req.user._id);
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
    const product = new Product(updatedId, updatedTitle, updatedImageUrl, updatedPrice, updatedDesc);
    product.save()
    .then(() => {
      res.redirect('/admin/products');
    })
    .catch(err => console.log(err)); 
};

exports.postDeleteProduct = (req, res, next) => {  
  prodId = req.body.productId;
  Product.deleteById(prodId)
  .then(() => {
    console.log('DESTROYED');
    res.redirect('/admin/products')
  })
  .catch(err => console.log(err));
};