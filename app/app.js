'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
    'ngRoute',
    'myApp.view1',
    'myApp.view2',
    'myApp.view3',
    'myApp.version',
    'myApp.all'
]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
    $locationProvider.hashPrefix('!');

    $routeProvider.otherwise({ redirectTo: '/registro' });
}]);

angular.module('myApp.all', ['ngRoute']).factory('MyService', ['$http', function($http) {

    var Service = {};

    Service.requestingSomeURL = function() {
        var i = $http.pendingRequests.length - 1;
        for (i; i >= 0; i -= 1) {

            if ($http.pendingRequests[i].url) {
                console.log($http.pendingRequests[i].url);
                return true;
            }
        }
        return false;
    };

    return Service;

}]);


angular.module('myApp').filter('capitalize', function() {
    return function(input) {
        return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    }
});


angular.module('myApp').factory('zipcodesDirective', function() {

    var zipcodes = [
        { code: '37205', sugerencia: [{ idProducto: 4 }, { idProducto: 8 }], calendario: "https://rotoplas.as.me/?calendarID=2266494" },
        { code: '50000', sugerencia: [{ idProducto: 2 }, { idProducto: 3 }, { idProducto: 4 }, { idProducto: 5 }, { idProducto: 6 }, { idProducto: 7 }, { idProducto: 8 }], calendario: "https://rotoplas.as.me/?calendarID=1633844" }]

    return zipcodes;

});

