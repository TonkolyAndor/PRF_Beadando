const express = require('express');
const cors = require('cors')
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path')

const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const expressSession = require('express-session');

const app = express();

const port = process.env.PORT || 3000;
const dbUrl = 'mongodb+srv://admin:8fpFjAyCqb6WWnrR@serpentcluster.7vkfm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

//const dbUrl = 'mongodb://localhost:1586';

mongoose.connect(dbUrl);

mongoose.connection.on('connected', () => {
    console.log('db csatlakoztatva');
})

mongoose.connection.on('error', (err) => {
    console.log('Hiba tortént', err);
})

require('./user_order.model');
require('./product.model');

const user_orderModel = mongoose.model('user_orders');

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({}));

const whiteList = ['http://localhost:4200'];


app.use((req, res, next) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        res.set('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        res.set('Access-Control-Max-Age', '3600');
    }
    next();
})

passport.use('user_orders', new localStrategy(function (username, password, done) {
    user_orderModel.findOne({ username: username }, function (err, user_order) {
        if (err) return done('Hiba lekeres soran', null);
        if (!user_order) return done('Nincs ilyen felhasználónév', null);
        user_order.comparePasswords(password, function (error, isMatch) {
            if (error) return done(error, false);
            if (!isMatch) return done('Hibas jelszo', false);
            return done(null, user_order);
        })
    })
}));


passport.serializeUser(function (user_order, done) {
    if (!user_order) return done('nincs megadva beléptethető felhasználó', null);
    return done(null, user_order);
});

passport.deserializeUser(function (user_order, done) {
    if (!user_order) return done("nincs user akit kiléptethetnénk", null);
    return done(null, user_order);
});

app.use(expressSession({ secret: 'remelematmegyekprfbol2021ben', resave: true }));
app.use(passport.initialize());
app.use(passport.session());


app.use(express.static(path.join(__dirname, 'public')))
.set('views', path.join(__dirname, 'views'))
.set('view engine', 'ejs')
.get('/', (req, res) => res.render('pages/index'))


app.get('/', (req, res, next) => {
    res.send('Hello World!');
})

app.use('/', require('./routes'));

// REST - Representative State Transfer, GET - Read, POST - Create, PUT - Update, DELETE - Delete

app.use((req, res, next) => {
    console.log('ez a hibakezelo');
    res.status(404).send('A kert eroforras nem talalhato');
})

app.listen(port, () => {
    console.log('The server is running!');
})

// a parancssorbol futo szervert Ctrl-C billentyukomboval allitom meg