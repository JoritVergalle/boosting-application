var passport = require('passport');
var request = require('supertest');
var express = require('express');

describe('Routes', function() {
    it('should return 200 when boosts-object exist', function(done) {
        var app = express();
        app.use(passport.initialize());
        app.use(passport.session());
        app.get('/boosts', function(req, res){
            req.posts = {};
            if (!req.posts){
                return res.send(404);
            }
            res.send(200);
        });
        request(app).get('/boosts').expect(200).end(done);
    });

    it('should return 404 when boosts-object doesn\'t exist', function(done) {
        var app = express();
        app.use(passport.initialize());
        app.use(passport.session());
        app.get('/boosts', function(req, res){
            if (!req.posts){
                return res.send(404);
            }
            res.send(200);
        });
        request(app).get('/boosts').expect(404).end(done);
    });

    it('should return 200 after home page loaded', function(done) {
        var app = express();
        app.use(passport.initialize());
        app.use(passport.session());
        app.get('/', function(req, res){
            req.user = {};
            if (!req.user){
                return res.send(403);
            }
            res.send(200);
        });
        request(app).get('/').expect(200).end(done);
    });
});