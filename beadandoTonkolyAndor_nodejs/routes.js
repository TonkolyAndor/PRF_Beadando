const express = require('express');
const router = express.Router();
const passport = require('passport');

const mongoose = require('mongoose');
const user_orderModel = mongoose.model('user_orders');
const productModel = mongoose.model('product');

//====================================== Autentikacios muveletek ========================================================


// Bejelentkezes
router.route('/login').post((req, res, next) => {
    if(req.body.username && req.body.password) {
        passport.authenticate('user_orders', function(error, user_order) {
            if(error) return res.status(500).send(error);
            req.login(user_order, function(error) {
                if(error) return res.status(500).send(error);
                return res.status(200).send('Sikeres bejelentkezes!');
            })
        })(req, res);
    } else {
        return res.status(400).send('Hibas keres, username es password kell');
    }
});

//Kijelentkezes
router.route('/logout').post((req, res, next) => {
    if(req.isAuthenticated()) {
        req.logout();
        return res.status(200).send('Kijelentkezes sikeres');
    } else {
        return res.status(403).send('Nem is volt bejelentkezve');
    }
})

//Status lekerese
router.route('/status').get((req, res, next) => {
    if(req.isAuthenticated()) {
        return res.status(200).send(req.session.passport);
    } else {
        return res.status(403).send('Nem is volt bejelentkezve');
    }
    
})



//====================================== Felhasznalio es rendeles muveletek ========================================================

router.route('/user_orders').get((req, res, next) => {
    if (req.isAuthenticated()) {
        if (req.user.accessLevel != 'admin') {
            user_orderModel.findOne({username: req.user.username}, (err, user_orders_list) => {
                if(err) return res.status(500).send('DB hiba');
                return res.status(200).send(user_orders_list);
            })
        } else {
            user_orderModel.find({}, (err, user_orders_list) => {
                if(err) return res.status(500).send('DB hiba');
                return res.status(200).send(user_orders_list);
            })
        }            
    } else {
        return res.status(401).send('Hiba, csak regisztralt felhasznalok ferhetnek hozza az adatokhoz');
    }
}).put((req, res, next) => {
    if(req.body.username && req.body.orders) {
        user_orderModel.findOne({username: req.body.username}, (err, user_orders) => {
            if(err) return res.status(500).send('DB hiba');
            if(user_orders) {
                user_orders.orders = req.body.orders;
                user_orders.save((error) => {
                    if(error) return res.status(500).send('A mentes soran hiba tortent');
                    return res.status(200).send('Sikeres mentes tortent');
                })
            } else {
                return res.status(400).send('Nincs ilyen user az adatbázisban');
            }
        })
    } else {
        return res.status(400).send('Nem volt user vagy orders');
    }
}).post((req, res, next) => {
    if(req.body.username && req.body.email && req.body.password) {
        user_orderModel.findOne({username: req.body.username}, (err, user_orders) => {
            if(err) return res.status(500).send('DB hiba');
            if(user_orders) {
                return res.status(400).send('Hiba, mar letezik ilyen felhasznalonev');
            }
            const usr = new user_orderModel({username: req.body.username, password: req.body.password, 
                email: req.body.email});
            usr.save((error) => {
                if(error) return res.status(500).send('A mentes soran hiba tortent');
                return res.status(200).send('Sikeres mentes tortent');
            })
        })
    } else {
        return res.status(400).send('Hibas keres, username, email es password kell');
    }
}).delete((req, res, next) => {
    if(req.body.username) {
        user_orderModel.findOne({username: req.body.username}, (err, user_orders) => {
            if(err) return res.status(500).send('DB hiba');
            if(!user_orders) {
                return res.status(400).send('Hiba, nem letezik ilyen torlaendo felhasznalo');
            }
            user_orders.delete((error) => {
                if(error) return res.status(500).send('A torles soran hiba tortent');
                return res.status(200).send('Sikeres torles tortent');
            })
        })
    } else {
        return res.status(400).send('Hibas keres, username kell');
    }
})


//====================================== Termekekekkel kapcsolatos muveletek ========================================================

router.route('/products').get((req, res, next) => {
    if (req.isAuthenticated()) {
        productModel.find({}, (err, products) => {
            if(err) return res.status(500).send('DB hiba');
            res.status(200).send(products);
        })           
    } else {
        return res.status(401).send('Hiba, csak regisztralt felhasznalok kerhetik le a termekek listajat');
    }
}).put((req, res, next) => {
    if (req.isAuthenticated()) {
        if (req.user.accessLevel != 'admin') {
            if(req.body.name && req.body.amount) {
                productModel.findOne({name: req.body.name}, (err, product) => {
                    if(err) return res.status(500).send('DB hiba');
                    if(product) {
                        product.amount = req.body.amount;
                        product.save((error) => {
                            if(error) return res.status(500).send('A mentes soran hiba tortent');
                            return res.status(200).send('Sikeres mentes tortent');
                        })
                    } else {
                        return res.status(400).send('Hiba, nem letezik ilyen termek');
                    }
                })
            } else {
                return res.status(401).send('Hibas keres, name es amount kell');
            }
        } else {
            if(req.body.name && req.body.price && req.body.amount) {
                productModel.findOne({name: req.body.name}, (err, product) => {
                    if(err) return res.status(500).send('DB hiba');
                    if(product) {
                        product.price = req.body.price; //elméletileg ezt csak admin kezelhetné
                        product.amount = req.body.amount;
                        product.save((error) => {
                            if(error) return res.status(500).send('A mentes soran hiba tortent');
                            return res.status(200).send('Sikeres mentes tortent');
                        })
                    } else {
                        return res.status(400).send('Hiba, nem letezik ilyen termek');
                    }
                })
            } else {
                return res.status(401).send('Hibas keres, name, price es amount kell');
            }
        }            
    } else {
        return res.status(401).send('Hiba, csak regisztralt felhasznalok ferhetnek hozza az adatokhoz');
    }
}).post((req, res, next) => {
    if (req.isAuthenticated()) {
        if (req.user.accessLevel == 'admin') {
            if(req.body.name && req.body.price && req.body.amount) {
                productModel.findOne({name: req.body.name}, (err, product) => {
                    if(err) return res.status(500).send('DB hiba');
                    if(product) {
                        return res.status(400).send('Hiba, mar letezik ilyen termek');
                    }
                    const prod = new productModel({name: req.body.name, price: req.body.price, 
                        amount: req.body.amount});
                    prod.save((error) => {
                        if(error) return res.status(500).send('A mentés során hiba történt');
                        return res.status(200).send('Sikeres mentes tortent');
                    })
                })
            } else {
                return res.status(400).send('Hibas keres, nev, ar es darabszam kell');
            }

        } else {
            return res.status(400).send('Hiba, csak admin adhat hozza termeket az adatbazishoz');
        }       
    } else {
        return res.status(401).send('Hiba, csak regisztralt felhasznalok ferhetnek hozza az adatokhoz');
    }

}).delete((req, res, next) => {
    if (req.isAuthenticated()) {
        if (req.user.accessLevel == 'admin') {
            if( req.body.name) {
                productModel.findOne({name: req.body.name}, (err, product) => {
                    if(err) return res.status(500).send('DB hiba');
                    if(!product) {
                        return res.status(400).send('Hiba, nem letezik ilyen termek');
                    }
                    product.delete((error) => {
                        if(error) return res.status(500).send('A torles soran hiba tortent');
                        return res.status(200).send('Sikeres torles tortent');
                    })
                })
            } else {
                return res.status(400).send('Hibas keres, nev kell');
            }
        } else {
            return res.status(400).send('Hiba, csak admin torolhet termeket az adatbazisbol');
        }       
    } else {
        return res.status(401).send('Hiba, csak regisztralt felhasznalok ferhetnek hozza az adatokhoz');
    }

})
//=================================================================================================================


module.exports = router;