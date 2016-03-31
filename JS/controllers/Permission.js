app.controller('Permission', function(
                                        $scope,
                                        EmployeesFactory,
                                        SessionFactory,
                                        AdminFactory,
                                        UINotification,
                                        ngDialog,
                                        md5
                                    ){


    $scope.pk = null;
    $scope.profile = {};
    $scope.filter = {};

    $scope.employees = {};

    //
    $scope.search = {};

    $scope.permissions = {};
    $scope.employees_permissions = [];

    $scope.data = [];
    $scope.employees_role = null;

    $scope.modal = {};
    $scope.modal.permission = {
        Requisitions : {
            Menu : false,
            Modules : {
                New : false,
                List : false
            }
        },
        Candidates : {
            Menu : false,
            Modules : {
                New : false,
                List : false
            },
            Functions : {
                Status : false,
                Date_endorsement : false,
                Date_appointment : false,
                Talent_acquisition : false
            }
        },
        Reports : {
            Menu : false,
            Modules : {
                Productivity : false
            }
        },
        Admin : {
            Menu : false,
            Modules : {
                Permission : false,
                Clients : false,
                Sources : false,
                Job_positions : false,
                Groups : false
            }
        }
    };

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

            get_employees();
            // get_permissions();
            // get_roles(0);
        })   
    }

    function get_employees(){
        var promise = EmployeesFactory.employees_permissions();
        promise.then(function(data){
            $scope.employees.list = data.data.result;
        })
    }

    $scope.employee_selected = function(data){
        $scope.search = data.description;

        get_employees_permission($scope.search.pk)

        

        $scope.modal.title = "Adding permission to " + $scope.search.name;
        $scope.modal.close = "CANCEL";
        $scope.modal.save = "SAVE";

        ngDialog.openConfirm({
            template: 'PermissionModal',
            className: 'ngdialog-theme-plain custom-width',
            preCloseCallback: function(value) {
                var nestedConfirmDialog = ngDialog.openConfirm({
                    template:
                            '<p>Are you sure you want to update ' + $scope.search.name + "' permission?</p>" +
                            '<div class="ngdialog-buttons">' +
                                '<button type="button" class="ngdialog-button ngdialog-button-secondary" data-ng-click="closeThisDialog(0)">No' +
                                '<button type="button" class="ngdialog-button ngdialog-button-primary" data-ng-click="confirm(1)">Yes' +
                            '</button></div>',
                    plain: true,
                    className: 'ngdialog-theme-plain custom-width'
                });
                
                return nestedConfirmDialog;
            },
            scope: $scope,
            showClose: false
        })
        .then(function(value){
            //
        }, function(value){
            var data = {
                employees_pk : $scope.search.pk,
                employee_id : $scope.search.employee_id,
                employee_name : $scope.search.first_name +" "+ $scope.search.last_name,
                title : $scope.search.title,
                department : $scope.search.department,
                supervisor : $scope.search.supervisor,
                created_by : $scope.profile.pk,
                roles_pk : $scope.modal.role[0].pk,
                permission : JSON.stringify($scope.modal.permission),
                remarks : $scope.modal.remarks
            }
            
            var promise = AdminFactory.update_permission(data);
            promise.then(function(data){
                UINotification.success({
                                    message: 'Permissions has been successfully updated.', 
                                    title: 'SUCCESS', 
                                    delay : 5000,
                                    positionY: 'top', positionX: 'right'
                                });

                get_employees();
            })
            .then(null, function(data){
                UINotification.error({
                                    message: 'An error occurred while updating ' + $scope.request.profile + '. Please try again.', 
                                    title: 'ERROR', 
                                    delay : 5000,
                                    positionY: 'top', positionX: 'right'
                                });
            });

        });
    }

    function get_employees_permission(pk){
        var filter = {
            employees_pk : pk
        }
        
        var promise = EmployeesFactory.individual_permission(filter);
        promise.then(function(data){
            var a = data.data.result[0];

            $scope.modal.permission = JSON.parse(a.permission);

            get_roles(a.roles_pk);
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
            $scope.data.roles = [];

            for(var i in a){
                var ticked = false;
                if(a[i].pk == pk){
                    ticked = true;
                }                    

                $scope.data.roles.push({
                                            pk: a[i].pk,
                                            name: a[i].role,
                                            ticked: ticked
                                        });
            }
        })
    }

    $scope.update_permission = function(){
        //console.log($scope.modal.permission);
    }

    // function get_permissions(){
    //     var filter = {
    //         archived : 'false'
    //     }

    //     var promise = AdminFactory.fetch(filter);
    //     promise.then(function(data){
    //         $scope.permissions = data.data.result;
    //     })
    // }

    

    

    // $scope.update_permission = function(v){
    //     var a = $scope.contains($scope.employees_permissions, v);
        
    //     if(a){
    //         $scope.employees_permissions.splice(v, 1);
    //     }
    //     else {
    //         $scope.employees_permissions.push(v);
    //     }
    // }

    // $scope.contains = function(a, obj) {
    //     var i = a.length;
    //     while (i--) {
    //         if (a[i] === obj) {
    //             return true;
    //         }
    //     }

    //     return false;
    // }

    // $scope.reset = function(){
    //     session();
    // }

    // $scope.save = function(){
    //     var filter = {
    //         employees_pk : $scope.search.pk,
    //         employee_id : $scope.search.employee_id,
    //         employee : $scope.search.first_name + " " + $scope.search.last_name,
    //         permission : $scope.employees_permissions,
    //         role : $scope.employees_role[0].pk
    //     };

    //     var promise = EmployeesFactory.save_permissions(filter);
    //     promise.then(function(data){
    //         UINotification.success({
    //                                 message: 'Permission successfully saved.', 
    //                                 title: 'SUCCESS', 
    //                                 delay : 5000,
    //                                 positionY: 'top', positionX: 'right'
    //                             });
    //     })
    //     .then(null, function(data){
    //         UINotification.error({
    //                                 message: 'An error occurred.  <pre> '+ data +' </pre>', 
    //                                 title: 'FAILED', 
    //                                 delay : 5000,
    //                                 positionY: 'top', positionX: 'right'
    //                             });  
    //     })
    // }

    
});
