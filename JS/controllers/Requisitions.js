app.controller('Requisitions', function(
                                        $scope,
                                        SessionFactory,
                                        EmployeesFactory,
                                        RequestFactory,
                                        JobsFactory,
                                        UINotification,
                                        $timeout,
                                        md5,
                                        ngDialog
                                    ){

    $scope.pk = null;
    $scope.profile = {};

    $scope.filter = {};

    $scope.data = {};

    $scope.requisitions = {};

    init();

    function init(){
        var promise = SessionFactory.getsession();
        promise.then(function(data){
            var _id = md5.createHash('pk');
            $scope.pk = data.data[_id];

            get_user_profile();
        })
        .then(null, function(data){
            window.location = './login.html';
        });
    }

    function get_user_profile(){
        var filters = { 
            'pk' : $scope.pk
        };

        var promise = EmployeesFactory.profile(filters);
        promise.then(function(data){
            $scope.profile = data.data.result[0];

            DEFAULTDATES();
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

        getjobpositions();
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

    function getjobpositions(){
        var filters = {
                        'archived':'false'
                    };

        var promise = JobsFactory.fetch(filters);
        promise.then(function(data){
            var a = data.data.result;
            $scope.data.jobpositions = [];

            for(var i in a){
                $scope.data.jobpositions.push({   
                                            pk: a[i].pk,
                                            name: a[i].position,
                                            ticked: false
                                        });
            }

            $scope.DUMP();
        })
    }

    $scope.DUMP = function(){
        var promise = RequestFactory.requisitions($scope.filter);
        promise.then(function(data){
            $scope.requisitions.status = true;
            $scope.requisitions.data = data.data.result;
        })
        .then(null, function(data){
            $scope.requisitions.status = false;
        })
    }

    $scope.EDIT = function(k){
        window.location = "#/request/" + $scope.requisitions.data[k].requisition_id;
    }
});