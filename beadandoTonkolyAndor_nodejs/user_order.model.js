const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

var userOrderSchema = new mongoose.Schema({
    username: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    email: {type: String, required: true},
    accessLevel: {type: String},
    orders: [{type: Array, "default": [] }]
}, {collection: 'user_orders'});

userOrderSchema.pre('save', function(next) {
    const user = this;
    if(user.isModified('password')) {
        user.accessLevel = 'basic';
        user.orders=[];
        bcrypt.genSalt(10, function(err, salt) {
            if(err) {
                console.log('hiba a salt generalasa soran');
                return next(error);
            }
            bcrypt.hash(user.password, salt, function(error, hash) {
                if(error) {
                    console.log('hiba a hasheles soran');
                    return next(error);
                }
                user.password = hash;
                return next();
            })
        })

    } else {
        return next();
    }
});

userOrderSchema.methods.comparePasswords = function(password, nx) {
    bcrypt.compare(password, this.password, function(err, isMatch) {
        nx(err, isMatch);
    });
};

mongoose.model('user_orders', userOrderSchema);