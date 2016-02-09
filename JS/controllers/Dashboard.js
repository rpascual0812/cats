app.controller('Dashboard', function(
  										$scope,
                                        SessionFactory
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