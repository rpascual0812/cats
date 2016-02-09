app.controller('Profiles', function(
  										$scope,
                                        SessionFactory,
                                        NotificationsFactory,
                                        $timeout
  									){


    init();

    function init(){
    	var promise = SessionFactory.getsession();
        promise.then(function(data){
            
        })
        .then(null, function(data){
            window.location = './login.html';
        });
    }

    


});