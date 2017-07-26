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

        $scope.addBuyer = function(){
            if($scope.name === '' || $scope.battletag === '' || $scope.price === '' || $scope.what === '') { return; }
            boosts.addBuyer(boost._id, {
                name: $scope.name,
                battletag: $scope.battletag,
                price: $scope.price,
                what: $scope.what,
                user: 'user'
            }).success(function(boost) {
                $scope.boost.buyers.push(boost);
            });
            $scope.name = '';
            $scope.battletag = '';
            $scope.price = '';
            $scope.author = '';

        };
    }]);