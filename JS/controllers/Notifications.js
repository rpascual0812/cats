app.controller('Notifications', function(
  										$scope,
                                        SessionFactory,
                                        NotificationsFactory,
                                        EmployeesFactory,
                                        $timeout,
                                        md5
  									){

    $scope.pk = null;
    $scope.profile = {};

    $scope.notifications = {};
    $scope.notifications.count = 0;

    $scope.permissions = {};

    $scope.original_title = document.title;

    init();

    function init(){
    	var promise = SessionFactory.getsession();
        promise.then(function(data){
            setTimeout(function(){
                var _id = md5.createHash('pk');
                $scope.pk = data.data[_id];

                get_permission();

                get_notifications();
                reload_notifications();
            }, 1000);
        })
        .then(null, function(data){
            window.location = './login.html';
        });
    }

    function changeDocumentTitle(newtitle, count){
        // var to = $timeout(function() {
        //     $timeout.cancel(to);
        //     changeDocumentTitle(newtitle, count);
        // }, 1500);

        clearInterval(timeinterval);

        function updateClock(){
            var mod = count % 2;
            count++;
            
            if(count == 100){
                count = 0;
            }

            if(mod == 0){
                document.title = newtitle;
            }
            else {
                document.title = $scope.original_title;
            }
        }
        
        var timeinterval = setInterval(updateClock, 1500);
        updateClock();
    }

    function get_permission(){
        var filters = { 
            'employees_pk' : $scope.pk
        };

        var promise = EmployeesFactory.permissions(filters);
        promise.then(function(data){
            $scope.permissions = JSON.parse(data.data.result[0].permission);
            // var a = data.data.result[0];

            // var permissions = a.permission.split('||');

            // for(var i in permissions){
            //     $scope.permissions[permissions[i]] = true;
            // }
        })   
    }

    function reload_notifications(){
        var to = $timeout(function() {
            $timeout.cancel(to);
            get_notifications();
            reload_notifications();
        }, 300000); // every 5 minutes
    }

    function get_notifications(){
        var filter = {
            employees_pk : $scope.pk
        };

        var promise = NotificationsFactory.fetch(filter);
        promise.then(function(data){            
            $scope.notifications.data = data.data.result;

            count_notifications();
            
        })
        .then(null, function(data){
            $scope.notifications.count = 0;
        });
    }

    function count_notifications(){
        var count=0;
        for(var i in $scope.notifications.data){
            if($scope.notifications.data[i].status == 'online'){
                count++;
            }
        }

        if(count > 0){
            for(var i in $scope.notifications.data){
                if($scope.notifications.data[i].status == 'online'){
                    changeDocumentTitle($scope.notifications.data[i].notification, 0);    
                }
            }
        }

        $scope.notifications.count = count;
    }

    $scope.open_notification = function(k) {
        var info = $scope.notifications.data[k];

        var data = {
            pk : info.pk,
            read : 't'
        };

        var promise = NotificationsFactory.update(data);
        promise.then(function(data){
            $scope.notifications.data[k].status = 'offline';
            
            count_notifications();

            if(info.type == "applicants"){
                window.location = "#/candidate/" + info.applicant_id;
            }
        })
        .then(null, function(data){
            $scope.notifications.count = 0;
        });
           
        
    }
});