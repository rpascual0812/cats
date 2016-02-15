app.controller('Dashboard', function(
  										$scope,
                                        SessionFactory,
                                        DashboardFactory,
                                        EmployeesFactory,
                                        md5
  									){


    $scope.pk = null;
    $scope.profile = {};
    $scope.applicants_count = {};
    $scope.applicants_personal_count = {};
    init();

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

    function get_profile(){
        var filters = { 
            'pk' : $scope.pk
        };

        var promise = EmployeesFactory.profile(filters);
        promise.then(function(data){
            $scope.profile = data.data.result[0];

            get_applicants_count();
            get_applicants_personal_count();
        })   
    }

    function get_applicants_count() {
        var promise = DashboardFactory.applicants_count();
        promise.then(function(data){
            $scope.applicants_count = data.data.result[0];
        })
        .then(null, function(data){
            
        });
    }

    function get_applicants_personal_count() {
        var filter = {
            created_by : $scope.profile.pk
        }

        var promise = DashboardFactory.applicants_count(filter);
        promise.then(function(data){
            $scope.applicants_personal_count = data.data.result[0];
        })
        .then(null, function(data){
            
        });   
    }
});