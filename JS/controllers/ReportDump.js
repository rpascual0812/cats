app.controller('ReportDump', function(
                                        $scope,
                                        EmployeesFactory,
                                        SessionFactory,
                                        ReportsFactory,
                                        md5
                                    ){


    $scope.profile = {};
    $scope.filter = {};
    $scope.filter.datetype = "Date Submitted";

    $scope.dumpdata = {};

	init();

	function init(){
		session();
	};

	function session(){	
		var promise = SessionFactory.getsession();
        promise.then(function(data){
        	var _id = md5.createHash('id');
            $scope.pk = data.data[_id];

            //get_profile();
            DEFAULTDATES();
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
		var promise = ReportsFactory.getdump($scope.filter);
        promise.then(function(data){
        	$scope.dumpdata = data.data.result;

            setTimeout(function(){
                $('#datatables-example').DataTable();
            }, 500);
            
        })
        .then(null, function(data){
            setTimeout(function(){
                $('#datatables-example').DataTable();
            }, 500);
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
