const Product = require('../models/product');

exports.getAddProducts = (req, res, next) => {
  res.render('admin/edit-product', {pageTitle:'Add Product', path:'/admin/add-product', editing:false});
};


exports.getProducts = (req, res, next) => {
  req.user.getProducts()
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
  req.user.createProduct({
    title: title,
    imageUrl: imageUrl,
    price: price,
    description: description
  })
  .then(() => {
    res.redirect('/');
  })
  .catch(err => {
    console.log(err);
  });
};

exports.getEditProduct = (req, res, next) => {        // all these will not work
  const editMod = req.query.edit;
  const prodId = req.params.productId;
  req.user.getProducts({where: {id: prodId}})
  .then(products => {
    const product = products[0];
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
    req.user.getProducts({where: {id: updatedId}})
    .then(products => {
      const product = products[0];
      console.log(product);
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
  Product.findByPk(prodId)
  .then(product => {
    return product.destroy();
  })
  .then(result => {
    res.redirect('/admin/products');
  })
  .catch(err => console.log(err));
};