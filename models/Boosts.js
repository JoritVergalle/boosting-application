var mongoose = require('mongoose');

var BoostSchema = new mongoose.Schema({
    name: String,
    date: Date,
    max: Number,
    buyers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Buyer' }]
});

mongoose.model('Boost', BoostSchema);