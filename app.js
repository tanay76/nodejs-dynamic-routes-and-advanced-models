const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/error');
const sequelize = require('./util/database');

const User = require('./models/user');
const Product = require('./models/product');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use((req, res, next) => {
    User.findByPk(1)
    .then(user => {
        req.user = user;
        next();
    })
    .catch(err => {
        console.log(err);
    });
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended:false}));

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404Page);

Product.belongsTo(User, {constraints:true, onDelete:'CASCADE'});
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Product.belongsToMany(Cart, { through: CartItem });
Cart.belongsToMany(Product, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, {through: OrderItem, onDelete:'CASCADE'});
Product.belongsToMany(Order, {through: OrderItem});

sequelize
// .sync({ force:true })
.sync()
.then(result => {
    return User.findByPk(1);
})
.then(user => {
    if (!user) {
        return User.create({ name:'Santanu', email:'san@gmail.com' });
    }
    return user;
})
.then(user => {
    return user.createCart();
})
.then(cart => {
    app.listen(3000, () => {
        console.log('NodeJs server running on port 3000');
    });
})
.catch(err => {
    console.log(err);
});

