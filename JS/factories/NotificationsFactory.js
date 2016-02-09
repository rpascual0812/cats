app.factory('NotificationsFactory', function($http, $location){
    var factory = {};
    
    factory.fetch = function(){
        var promise = $http({
            url:'./FUNCTIONS/Notifications/fetch.php',
            method: 'GET'
        })

        return promise;
    };

    return factory;
})
