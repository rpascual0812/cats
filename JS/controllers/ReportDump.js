app.controller('ReportDump', function(
                                        $scope,
                                        EmployeesFactory,
                                        SessionFactory,
                                        ReportsFactory,
                                        StatusesFactory,
                                        md5,
                                        $timeout
                                    ){


    $scope.profile = {};
    $scope.filter = {};
    $scope.filter.datetype = "Date Submitted";

    $scope.data = {};

    $scope.dumpdata = {};

	init();

	function init(){
		session();
	};

	function session(){	
		var promise = SessionFactory.getsession();
        promise.then(function(data){
        	var _id = md5.createHash('pk');
            $scope.pk = data.data[_id];

            get_profile();
        })
        .then(null, function(data){
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

            getstatuses();
        })   
    }

    function getstatuses(){
        var filters = {
                        'archived':'false'
                    };

        var promise = StatusesFactory.fetch(filters);
        promise.then(function(data){
            var a = data.data.result;
            $scope.data.statuses = [];

            for(var i in a){
                var ticked = false;
                
                if(a[i].status == 'For Processing'){
                    ticked = true;
                }

                $scope.data.statuses.push({   
                                            pk: a[i].pk,
                                            name: a[i].status,
                                            ticked: ticked
                                        });
            }

            $timeout(function() {
                DEFAULTDATES();    
            }, 1000);
            
        })   
    }

    function DEFAULTDATES(){
        var today = new Date();

        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();

        if(dd<10) {
            dd='0'+dd
        } 

        if(mm<10) {
            mm='0'+mm
        } 

        today = yyyy+'-'+mm+'-'+dd;

        $scope.filter.datefrom = getMonday(new Date());
        $scope.filter.dateto = today;

        DUMP();
    }

    function getMonday(d) {
        var d = new Date(d);
        var day = d.getDay(),
            diff = d.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday

        var new_date = new Date(d.setDate(diff));
        var dd = new_date.getDate();
        var mm = new_date.getMonth()+1; //January is 0!
        var yyyy = new_date.getFullYear();

        if(dd<10) {
            dd='0'+dd
        } 

        if(mm<10) {
            mm='0'+mm
        } 

        var monday = yyyy+'-'+mm+'-'+dd;

        return monday;
    }

	function DUMP(){
        $scope.dumpdata = {};
        
        $scope.filter.employees_pk = $scope.profile.pk;
        $scope.filter.new_status = $scope.filter.status[0].pk;
        $scope.filter.department = $scope.profile.department;
        $scope.filter.role = $scope.profile.role;
        
		var promise = ReportsFactory.getdump($scope.filter);
        promise.then(function(data){
        	$scope.dumpdata = data.data.result;  
        })
        .then(null, function(data){
            
        })
	}

    $scope.DUMP = function(){
        DUMP();
    }

    $scope.EXPORT = function(){
        window.open('./FUNCTIONS/Reports/export.php?datetype='+$scope.filter.datetype+'&datefrom='+$scope.filter.datefrom+"&dateto="+$scope.filter.dateto);
    }

    $scope.edit_applicant = function(k){
        window.location = "#/candidate/"+$scope.dumpdata[k].applicant_id;
    }
});
