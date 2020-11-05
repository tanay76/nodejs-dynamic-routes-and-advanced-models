const express = require('express');

const router = express.Router();

const shopController = require('../controllers/shop');

router.get('/', shopController.getProducts);
router.get('/products', shopController.getAllProducts);
router.get('/products/:productId', shopController.getSpecificProduct);
router.get('/cart', shopController.getCart);
router.post('/cart-delete-item', shopController.postDeleteCartItem);
router.post('/cart', shopController.postCart);
router.post('/create-order', shopController.postOrders);
router.get('/orders', shopController.getOrders);




module.exports = router;