var mongoose = require('mongoose');

var BuyerSchema = new mongoose.Schema({
    name: String,
    battletag: String,
    price: Number,
    what: {
        type: String,
        enum: ['FULL', 'LAST']
    },
    boost: { type: mongoose.Schema.Types.ObjectId, ref: 'Boost' }
});

mongoose.model('Buyer', BuyerSchema);
