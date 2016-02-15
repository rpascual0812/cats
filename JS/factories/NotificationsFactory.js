app.factory('NotificationsFactory', function($http, $location){
    var factory = {};
    
    factory.fetch = function(){
        var promise = $http({
            url:'./FUNCTIONS/Notifications/fetch.php',
            method: 'GET'
        })

        return promise;
    };

    factory.update = function(data){
        var promise = $http({
            url:'./FUNCTIONS/Notifications/update.php',
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            data : data
        })

        return promise;
    };

    return factory;
})
