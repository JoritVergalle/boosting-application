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

router.put('/boosts/:boost', function(req, res) {
    Boost.findOneAndUpdate({_id: req.body._id}, {
        $set: {
            name: req.body.name,
            date: req.body.date,
        }
    }, function(err, result) {
        if (err) {return res.send(err)}
        res.send(result);
    });
});

router.param('buyer', function(req, res, next, id) {
    var query = Buyer.findById(id);

    query.exec(function (err, buyer){
        if (err) { return next(err); }
        if (!buyer) { return next(new Error('can\'t find buyer')); }

        req.buyer = buyer;
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

router.get('/boosts/:boost/buyers/:buyer', function(req, res, next) {
    // to auto get all buyers in the boost
    req.boost.populate('buyers', function(err, boost) {
        if (err) { return next(err); }

        res.json(boost);
    });
});

router.delete('/boosts/:boost', function(req, res) {
    Boost.findByIdAndRemove(req.boost._id, function(err, boost) {
        if(err){
            return err;
        }
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

router.delete('/boosts/:boost/buyers/:buyer', function(req, res) {
    Buyer.findByIdAndRemove(req.buyer._id, function(err, buyer) {
        if(err){
            return err;
        }
        res.json(buyer);
    });
});

router.put('/boosts/:boost/buyers/:buyer', function(req, res) {
    console.log(req.body);
    Buyer.findOneAndUpdate({_id: req.body._id}, {
        $set: {
            characterName: req.body.characterName,
            battletag: req.body.battletag,
            price : req.body.price,
            what : req.body.what,
        }
    }, { returnNewDocument: true },function(err, result) {
        if (err) {return res.send(err)}
        res.send(result);
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
