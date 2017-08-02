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
            })

            .state('login', {
                url: '/login',
                templateUrl: 'partials/login',
                controller: 'AuthCtrl',
                onEnter: ['$state', 'auth', function($state, auth){
                    if(auth.isLoggedIn()){
                        $state.go('home');
                    }
                }]
            })

            .state('register', {
                url: '/register',
                templateUrl: 'partials/register',
                controller: 'AuthCtrl',
                onEnter: ['$state', 'auth', function($state, auth){
                    if(auth.isLoggedIn()){
                        $state.go('home');
                    }
                }]
            });


        $urlRouterProvider.otherwise('home');
    }]);

app.factory('boosts', ['$http', 'auth', function($http, auth){
    var o = {
        boosts: [],
    };
    o.getAll = function() {
        return $http.get('/boosts').success(function(data){
            angular.copy(data, o.boosts);
        });
    };
    o.create = function(boost) {
        return $http.post('/boosts', boost, {
            headers: {Authorization: 'Bearer '+auth.getToken()}
        }).success(function(data){
            o.boosts.push(data);
        });
    };
    o.get = function(id) {
        return $http.get('/boosts/' + id).then(function(res){
            return res.data;
        });
    };
    o.addBuyer = function(id, buyer) {
        return $http.post('/boosts/' + id + '/buyers', buyer, {
            headers: {Authorization: 'Bearer '+auth.getToken()}
        });
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
    'auth',
    function($scope, boosts, auth){
        $scope.showTableHideForm = true;

        $scope.changeShowTableHideForm = function() {
            if($scope.showTableHideForm == true){
                $scope.showTableHideForm = false;
            }
            else $scope.showTableHideForm = true;
        };

        $scope.isLoggedIn = auth.isLoggedIn;

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
            $scope.changeShowTableHideForm();
        };
    }]);

app.controller('BoostsCtrl', [
    '$scope',
    'boosts',
    'boost',
    'auth',
    function($scope, boosts, boost, auth){
        $scope.showTableHideForm = true;

        $scope.changeShowTableHideForm = function() {
            if($scope.showTableHideForm == true){
                $scope.showTableHideForm = false;
            }
            else $scope.showTableHideForm = true;
        };
        $scope.isLoggedIn = auth.isLoggedIn;

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
            $scope.changeShowTableHideForm();
        };
    }]);

app.controller('AuthCtrl', [
    '$scope',
    '$state',
    'auth',
    function($scope, $state, auth){
        $scope.user = {};

        $scope.register = function(){
            auth.register($scope.user).error(function(error){
                $scope.error = error;
            }).then(function(){
                $state.go('home');
            });
        };

        $scope.logIn = function(){
            auth.logIn($scope.user).error(function(error){
                $scope.error = error;
            }).then(function(){
                $state.go('home');
            });
        };
    }]);

app.controller('NavCtrl', [
    '$scope',
    'auth',
    function($scope, auth){
        $scope.isLoggedIn = auth.isLoggedIn;
        $scope.currentUser = auth.currentUser;
        $scope.logOut = auth.logOut;
    }]);

app.directive('gspan', function() {
    return {
        restrict: 'E',
        scope: {
            gold: '=gold'
        },
        template:
        '<span>'
        +'{{gold}}g'
        +'</span>'
    };
});