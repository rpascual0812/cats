app.controller('Calendar', function(
  										$scope,
                                        SessionFactory,
                                        EmployeesFactory,
                                        md5
  									){


    $scope.pk = null;
    $scope.profile = {};
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
            
        })   
    }
});