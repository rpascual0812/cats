app.factory('SessionFactory', function($http, $location){
    var factory = {};
    
    factory.getsession = function(){
        var promise = $http({
            url:'./FUNCTIONS/session/getsession.php',
            method: 'GET'
        })

        return promise;
    };

    factory.logout = function(){
        var promise = $http({
            url:'./FUNCTIONS/session/deletesession.php',
            method: 'GET'
        })

        return promise;
    };

    return factory;
})
