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
    $scope.applicants_team_count = {};
    $scope.applicants_personal_count = {};
    $scope.gmail = '';
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
            
            //https://calendar.google.com/calendar/embed?src=rpascual.chrs%40gmail.com&ctz=Asia/Manila
            var new_email = $scope.profile.email_address.replace('@','%40');
            //$scope.gmail = "https://calendar.google.com/calendar/embed?src="+new_email+"&ctz=Asia/Manila"; 
            
            $('#gmail-calendar').attr('src', "https://calendar.google.com/calendar/embed?src="+new_email+"&ctz=Asia/Manila");
            get_employees_permission();
        })   
    }

    function get_employees_permission(){
        var filters = { 
            'employees_pk' : $scope.profile.pk
        };

        var promise = EmployeesFactory.individual_permission(filters);
        promise.then(function(data){
            var a = data.data.result[0];

            $scope.profile.title = a.title;
            $scope.profile.role = a.role;
            $scope.profile.department = a.department;

            get_applicants_count();
            get_applicants_team_count();
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

    function get_applicants_team_count() {
        var filter = {
            department : $scope.profile.department
        };

        var promise = DashboardFactory.applicants_count(filter);
        promise.then(function(data){
            $scope.applicants_team_count = data.data.result[0];
        })
        .then(null, function(data){
            
        });   
    }

    function get_applicants_personal_count() {
        var filter = {
            created_by : $scope.profile.pk
        };

        var promise = DashboardFactory.applicants_count(filter);
        promise.then(function(data){
            $scope.applicants_personal_count = data.data.result[0];
        })
        .then(null, function(data){
            
        });   
    }
});