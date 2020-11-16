const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();

const csrfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');

const MONGODB_URI = 'mongodb+srv://santanu:jXL9ojtcN3qcEUiL@cluster0.uvfje.mongodb.net/shop';

const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended:false}));
app.use(
    session({secret: 'My Secret Key', resave: false, saveUninitialized: false, store:store})
); 

app.use(flash());                                                                //  🔼
                                                                                  // 🔼
                                                                                  // 🔼
app.use(csrfProtection);                                                        //   🔼
                                                                                 //  🔼
app.use((req, res, next) => {    // ------write this code after defining session here🔼, otherwise
    if (!req.session.user) {     // this command will not be able to recognize the session in the
        return next();           // req.session here
    }
    User.findById(req.session.user._id)
    .then(user => {
        req.user = user;
        next();
    });
});

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;  // res.locals allows us to set loacl
    res.locals.csrfToken = req.csrfToken();      // variables that are passed into the views, local
    next();                                  // simply becuse they exist in only int the views which
});                                             // are rendered.

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404Page);

mongoose.connect(MONGODB_URI)
.then(result => {
    app.listen(3000, () => {
        console.log('NodeJs server running on port 3000');
    });
})
.catch(err => {
    console.log('MONGOOSE CONNECTION ERROR: ', err);
});