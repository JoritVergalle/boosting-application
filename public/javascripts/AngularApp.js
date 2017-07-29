var app = angular.module('boosting-application', ['ui.router']);

app.config([
    '$stateProvider',
    '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: 'partials/home',
                controller: 'MainCtrl',
                //so boost load in before showing page
                resolve: {
                    postPromise: ['boosts', function(boosts){
                        return boosts.getAll();
                    }]
                }
            })

            .state('posts', {
                url: '/boosts/{id}',
                templateUrl: 'partials/boosts',
                controller: 'BoostsCtrl',
                resolve: {
                    boost: ['$stateParams', 'boosts', function($stateParams, boosts) {
                        return boosts.get($stateParams.id);
                    }]
                }
            });


        $urlRouterProvider.otherwise('home');
    }]);

app.factory('boosts', ['$http', function($http){
    var o = {
        boosts: [],
    };
    o.getAll = function() {
        return $http.get('/boosts').success(function(data){
            angular.copy(data, o.boosts);
        });
    };
    o.create = function(boost) {
        return $http.post('/boosts', boost).success(function(data){
            o.boosts.push(boost);
        });
    };
    o.get = function(id) {
        return $http.get('/boosts/' + id).then(function(res){
            return res.data;
        });
    };
    o.addBuyer = function(id, buyer) {
        return $http.post('/boosts/' + id + '/buyers', buyer);
    };
    return o;
}]);

app.factory('auth', ['$http', '$window', function($http, $window){
    var auth = {};

    auth.saveToken = function (token){
        $window.localStorage['flapper-news-token'] = token;
    };
    auth.getToken = function (){
        return $window.localStorage['flapper-news-token'];
    };
    auth.isLoggedIn = function(){
        var token = auth.getToken();

        if(token){
            var payload = JSON.parse($window.atob(token.split('.')[1]));

            return payload.exp > Date.now() / 1000;
        } else {
            return false;
        }
    };
    auth.currentUser = function(){
        if(auth.isLoggedIn()){
            var token = auth.getToken();
            var payload = JSON.parse($window.atob(token.split('.')[1]));

            return payload.username;
        }
    };
    auth.register = function(user){
        return $http.post('/register', user).success(function(data){
            auth.saveToken(data.token);
        });
    };
    auth.logIn = function(user){
        return $http.post('/login', user).success(function(data){
            auth.saveToken(data.token);
        });
    };
    auth.logOut = function(){
        $window.localStorage.removeItem('flapper-news-token');
    };
    return auth;
}]);


app.controller('MainCtrl', [
    '$scope',
    'boosts',
    function($scope, boosts){
        $scope.test = 'Hello world!';

        $scope.boosts = boosts.boosts;

        $scope.addBoost = function(){
            if(!$scope.name || $scope.name === '') { return; }
            boosts.create({
                name: $scope.name,
                date: $scope.date,
                buyers: []
            });

            $scope.name = '';
            $scope.date = '';
        };
    }]);

app.controller('BoostsCtrl', [
    '$scope',
    'boosts',
    'boost',
    function($scope, boosts, boost){
        $scope.boost = boost;

        $scope.totalGold = _.sum(_.map(boost.buyers, 'price'));

        $scope.addBuyer = function(){
            if(_.isEmpty($scope.characterName) || _.isEmpty($scope.battletag) || !_.isNumber($scope.price) || _.isEmpty($scope.what)) { return; }
            boosts.addBuyer(boost._id, {
                characterName: $scope.characterName,
                battletag: $scope.battletag,
                price: $scope.price,
                what: $scope.what,
                user: 'user'
            }).success(function(buyer) {
                $scope.boost.buyers.push(buyer);
            });
            $scope.characterName = '';
            $scope.battletag = '';
            $scope.price = '';
            $scope.author = '';

        };
    }]);