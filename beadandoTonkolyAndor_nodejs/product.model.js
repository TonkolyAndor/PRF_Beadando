const mongoose = require('mongoose');

var productSchema = new mongoose.Schema({
    name: {type: String, unique: true, required: true},
    price: {type: Number, required: true},
    amount: {type: Number, required: true},
}, {collection: 'products'});


mongoose.model('product', productSchema);