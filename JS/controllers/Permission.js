app.controller('Permission', function(
                                        $scope,
                                        EmployeesFactory,
                                        SessionFactory,
                                        AdminFactory,
                                        UINotification,
                                        md5
                                    ){


    $scope.pk = null;
    $scope.profile = {};
    $scope.filter = {};

    $scope.search = {};

    $scope.permissions = {};
    $scope.employees_permissions = [];

    $scope.roles = [];
    $scope.employees_role = null;

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

            get_permissions();
            get_roles(0);
        })   
    }

    function get_permissions(){
        var filter = {
            archived : 'false'
        }

        var promise = AdminFactory.fetch(filter);
        promise.then(function(data){
            $scope.permissions = data.data.result;
        })
    }

    function get_roles(pk){
        var filter = {
            archived : 'false'
        }

        var promise = EmployeesFactory.roles(filter);
        promise.then(function(data){
            //$scope.roles = data.data.result;

            var a = data.data.result;
            $scope.roles = [];

            for(var i in a){
                var ticked = false;
                if(a[i].pk == pk){
                    ticked = true;
                }                    

                $scope.roles.push({
                                            pk: a[i].pk,
                                            name: a[i].role,
                                            ticked: ticked
                                        });
            }
        })
    }

    function get_employees_permission(){
        var filter = {
            employees_pk : md5.createHash($scope.search.pk)
        }

        get_permissions();
        
        var promise = EmployeesFactory.get_permissions(filter);
        promise.then(function(data){
            $scope.employees_permissions = data.data.result[0].permission.split('||');
            get_roles(data.data.result[0].role);
        })
    }

    $scope.update_permission = function(v){
        var a = $scope.contains($scope.employees_permissions, v);
        
        if(a){
            $scope.employees_permissions.splice(v, 1);
        }
        else {
            $scope.employees_permissions.push(v);
        }
    }

    $scope.contains = function(a, obj) {
        var i = a.length;
        while (i--) {
            if (a[i] === obj) {
                return true;
            }
        }

        return false;
    }

    $scope.reset = function(){
        session();
    }

    $scope.save = function(){
        var filter = {
            employees_pk : $scope.search.pk,
            employee_id : $scope.search.employee_id,
            employee : $scope.search.first_name + " " + $scope.search.last_name,
            permission : $scope.employees_permissions,
            role : $scope.employees_role[0].pk
        };

        var promise = EmployeesFactory.save_permissions(filter);
        promise.then(function(data){
            UINotification.success({
                                    message: 'Permission successfully saved.', 
                                    title: 'SUCCESS', 
                                    delay : 5000,
                                    positionY: 'top', positionX: 'right'
                                });
        })
        .then(null, function(data){
            UINotification.error({
                                    message: 'An error occurred.  <pre> '+ data +' </pre>', 
                                    title: 'FAILED', 
                                    delay : 5000,
                                    positionY: 'top', positionX: 'right'
                                });  
        })
    }

    $scope.employee_selected = function(data){
        $scope.search = data.description;

        get_employees_permission();
    }
});
