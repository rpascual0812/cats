app.controller('Avatar', function(
  										$scope,
                                        SessionFactory,
                                        EmployeesFactory,
                                        md5
  									){

    init();

    $scope.pk = null;
    $scope.profile = {};

    function init(){
        var promise = SessionFactory.getsession();
        promise.then(function(data){
            var _id = md5.createHash('pk');
            $scope.pk = data.data[_id];

            get_profile();
        })
        .then(null, function(data){
            window.location = './login.html';
        });
    }

    $scope.logout = function(){
        var promise = SessionFactory.logout();
        promise.then(function(data){
            window.location = './login.html';
        })
    }

    function get_profile(){
        var filters = { 
            'pk' : $scope.pk
        };

        var promise = EmployeesFactory.profile(filters);
        promise.then(function(data){
            $scope.profile = data.data.result[0];
        })   
    }
});