var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var Boost = mongoose.model('Boost');
var Buyer = mongoose.model('Buyer');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/boosts', function(req, res, next) {
    Boost.find(function(err, boosts){
        if(err){ return next(err); }

        res.json(boosts);
    });
});

router.post('/boosts', function(req, res, next) {
    var boost = new Boost(req.body);

    boost.save(function(err, boost){
        if(err){ return next(err); }

        res.json(boost);
    });
});

router.param('boost', function(req, res, next, id) {
    var query = Boost.findById(id);

    query.exec(function (err, boost){
        if (err) { return next(err); }
        if (!boost) { return next(new Error('can\'t find boost')); }

        req.boost = boost;
        return next();
    });
});


router.get('/boosts/:boost', function(req, res, next) {
    // to auto get all buyers in the boost
    req.boost.populate('buyers', function(err, boost) {
        if (err) { return next(err); }

        res.json(boost);
    });
});

router.post('/boosts/:boost/buyers', function(req, res, next) {
    var buyer = new Buyer(req.body);
    buyer.boost = req.buyer;

    buyer.save(function(err, buyer){
        if(err){ return next(err); }

        req.boost.buyers.push(buyer);
        req.boost.save(function(err, buyer) {
            if(err){ return next(err); }

            res.json(buyer);
        });
    });
});

module.exports = router;
