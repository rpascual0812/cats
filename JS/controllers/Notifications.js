app.controller('Notifications', function(
  										$scope,
                                        SessionFactory,
                                        NotificationsFactory,
                                        $timeout
  									){

    $scope.notifications = {};
    $scope.notifications.count = 0;

    init();

    function init(){
    	var promise = SessionFactory.getsession();
        promise.then(function(data){
            setTimeout(function(){
                get_notifications();
                reload_notifications();
            }, 1000);
        })
        .then(null, function(data){
            window.location = './login.html';
        });
    }

    function reload_notifications(){
        var to = $timeout(function() {
            $timeout.cancel(to);
            get_notifications();
            reload_notifications();
        }, 300000); // every 5 minutes
    }

    function get_notifications(){
        var promise = NotificationsFactory.fetch();
        promise.then(function(data){
            $scope.notifications.count = data.data.result.length;
            $scope.notifications.data = data.data.result;
        })
        .then(null, function(data){
            $scope.notifications.count = 0;
        });
    }


});