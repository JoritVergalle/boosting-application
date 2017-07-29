var mongoose = require('mongoose');

var BuyerSchema = new mongoose.Schema({
    characterName: String,
    battletag: String,
    price: Number,
    what: String,
    finder: String,
    boost: { type: mongoose.Schema.Types.ObjectId, ref: 'Boost' }
});

mongoose.model('Buyer', BuyerSchema);
