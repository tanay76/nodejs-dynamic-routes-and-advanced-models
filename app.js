const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use((req, res, next) => {
    User.findById('5fa94129b2d291316cbf5a18')
    .then(user => {
        req.user = user;
        next();
    })
    .catch(err => {
        console.log('Error1: ',err);
    });
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended:false}));

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404Page);

mongoose.connect('mongodb+srv://santanu:jXL9ojtcN3qcEUiL@cluster0.uvfje.mongodb.net/shop')
.then(result => {
    User.findOne()
    .then(user => {
        if (!user) {
            user = new User({
                name: 'Santanu',
                email: 'santanu.roy32@gmail.com',
                cart: {
                    items: []
                }
            });
            user.save();
        }
    }).catch(err => {
        console.log('Error In Creating User: ', err);
    });
    app.listen(3000, () => {
        console.log('NodeJs server running on port 3000');
    });
})
.catch(err => {
    console.log('MONGOOSE CONNECTION ERROR: ', err);
});