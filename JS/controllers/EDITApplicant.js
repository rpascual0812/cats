app.controller('EDITApplicant', function(
                                        $scope,
                                        $routeParams,
                                        ApplicantsFactory,
                                        EmployeesFactory,
                                        SessionFactory,
                                        md5
                                    ){

	$scope.form = {};
    $scope.data = {};

    $scope.profile = {};
    $scope.applicant = {};

    init();

    function init(){
        var promise = SessionFactory.getsession();
        promise.then(function(data){
            var _id = md5.createHash('pk');
            $scope.pk = data.data[_id];

            get_profile();
            get_applicant_details();
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
        })   
    }

    function get_applicant_details(){
        var filters = { 
            'applicant_id' : $routeParams.id
        };

        var promise = ApplicantsFactory.applicant(filters);
        promise.then(function(data){
            $scope.applicant = data.data.result[0];
        })   
    }

    
});
