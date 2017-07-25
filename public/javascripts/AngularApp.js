var app = angular.module('boosting-application', ['ui.router']);

app.config([
    '$stateProvider',
    '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: '/home.html',
                controller: 'MainCtrl'
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
            $scope.boosts.push({name: $scope.name, date: $scope.date});
            $scope.name = '';
            $scope.date = '';
        };
    }]);
