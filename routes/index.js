var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
var jwt = require('express-jwt');

var Boost = mongoose.model('Boost');
var Buyer = mongoose.model('Buyer');
var User = mongoose.model('User');

var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

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

router.post('/boosts', auth, function(req, res, next) {
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

router.post('/boosts/:boost/buyers', auth, function(req, res, next) {
    var buyer = new Buyer(req.body);
    buyer.boost = req.boost;
    buyer.finder = req.payload.username;

    buyer.save(function(err, buyer){
        if(err){ return next(err); }

        req.boost.buyers.push(buyer);
        req.boost.save(function(err, buyer) {
            if(err){ return next(err); }

            res.json(buyer);
        });
    });
});

router.post('/register', function(req, res, next){
    if(!req.body.username || !req.body.password){
        return res.status(400).json({message: 'Please fill out all fields'});
    }

    var user = new User();

    user.username = req.body.username;

    user.setPassword(req.body.password)

    user.save(function (err){
        if(err){ return next(err); }

        return res.json({token: user.generateJWT()})
    });
});

router.post('/login', function(req, res, next){
    if(!req.body.username || !req.body.password){
        return res.status(400).json({message: 'Please fill out all fields'});
    }

    passport.authenticate('local', function(err, user, info){
        if(err){ return next(err); }

        if(user){
            return res.json({token: user.generateJWT()});
        } else {
            return res.status(401).json(info);
        }
    })(req, res, next);
});

module.exports = router;
