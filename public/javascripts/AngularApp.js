var app = angular.module('boosting-application', ['ui.router']);

app.config([
    '$stateProvider',
    '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: 'partials/home',
                controller: 'MainCtrl'
            })
            .state('posts', {
                url: '/boosts/{id}',
                templateUrl: 'partials/boosts',
                controller: 'BoostsCtrl'
            });


        $urlRouterProvider.otherwise('home');
    }]);

app.factory('boosts', [function(){
    var o = {
        boosts: [
            {name: 'ToS HC', date: new Date(2017, 07, 25)}
        ]
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
            $scope.boosts.push({
                name: $scope.name,
                date: $scope.date,
                buyers: [
                    {name:'Felancholy', battletag: 'KelThuzad#2722', price: 500000, what: 'Full Boost'},
                    {name:'Suwe', battletag: 'Suwe#2722', price: 5000, what: 'Last Two'}
            ]
            });

            $scope.name = '';
            $scope.date = '';
        };
    }]);

app.controller('BoostsCtrl', [
    '$scope',
    '$stateParams',
    'boosts',
    function($scope, $stateParams, boosts){
        $scope.boost = boosts.boosts[$stateParams.id];

        $scope.addBuyer = function(){
            if($scope.name === '' || $scope.battletag === '' || $scope.price === '' || $scope.what === '') { return; }
            $scope.boost.buyers.push({
                name: $scope.name,
                battletag: $scope.battletag,
                price: $scope.price,
                what: $scope.what,
                author: 'user',
            });
            $scope.name = '';
            $scope.battletag = '';
            $scope.price = '';
            $scope.author = '';
        };
    }]);