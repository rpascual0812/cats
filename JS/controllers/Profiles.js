app.controller('Profiles', function(
  										$scope,
                                        SessionFactory,
                                        NotificationsFactory,
                                        EmployeesFactory,
                                        AdminFactory,
                                        UINotification,
                                        $timeout,
                                        md5,
                                        ngDialog
  									){

    $scope.user_profile = {};
    $scope.profiles = {};
    $scope.profiles.data = [];

    $scope.new_profile = null;

    $scope.table_search = null;

    $scope.pagination = {};
    $scope.pagination.currentPage = 1;
    $scope.pagination.pageSize = '10';
    $scope.pagination.showPrevNext = true;

    $scope.modal = {};
    $scope.modal.data = {};

    $scope.logs = {};
    $scope.offset = 0;
    $scope.more = true;

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
            $scope.user_profile = data.data.result[0];

            get_profiles();
        })   
    }

    $scope.get_profiles = function(){
        get_profiles();        
    }

    function get_profiles() {
        var filters = { 
            'text' : ($scope.table_search==null)?'':$scope.table_search,
            'archived' : false,
            'current_page' : $scope.pagination.currentPage,
            'page_size' : parseInt($scope.pagination.pageSize)
        };

        var promise = AdminFactory.profiles(filters);
        promise.then(function(data){
            $scope.profiles.status = true;
            $scope.profiles.data = data.data.result;

            $scope.pagination.total = data.data.result[0].total;

            get_logs();
        }) 
        .then(null, function(data){
            $scope.profiles.status = false;
        });
    }

    $scope.add_profile = function(){
        $scope.profiles.status = true;
        
        $scope.profiles.data.push({ profile : $scope.new_profile });

        var duplicate = 0;
        for(var i in $scope.profiles.data){
            if($scope.profiles.data[i].position == $scope.new_profile){
                duplicate++;
            }
        }

        if(duplicate > 0){
            var nestedConfirmDialog = ngDialog.openConfirm({
                template:
                        '<p>'+ $scope.new_profile +' already exists.</p>' +
                        '<div class="ngdialog-buttons">' +
                            '<button type="button" class="ngdialog-button ngdialog-button-primary" data-ng-click="confirm(1)">OK' +
                        '</button></div>',
                plain: true,
                className: 'ngdialog-theme-plain'
            })
        }
        else if($scope.new_profile.replace(/\s/g,'') == ""){
            return false;
        }
        else {
            var nestedConfirmDialog = ngDialog.openConfirm({
                template:
                        '<p>Are you sure you want to add '+ $scope.new_profile +'?</p>' +
                        '<div class="ngdialog-buttons">' +
                            '<button type="button" class="ngdialog-button ngdialog-button-secondary" data-ng-click="closeThisDialog(0)">No' +
                            '<button type="button" class="ngdialog-button ngdialog-button-primary" data-ng-click="confirm(1)">Yes' +
                        '</button></div>',
                plain: true,
                className: 'ngdialog-theme-plain'
            })
            .then(function(value){
                //submit
                var data = { 
                    'position' : $scope.new_profile
                };

                var promise = AdminFactory.addprofile(data);
                promise.then(function(data){
                    UINotification.success({
                                    message: 'New profile '+ $scope.new_profile +' successfully saved.', 
                                    title: 'SUCCESS', 
                                    delay : 5000,
                                    positionY: 'top', positionX: 'right'
                                });

                    get_user_profile();

                    $scope.clear();
                })
                .then(null, function(data){
                    UINotification.error({
                                    message: 'An error occured while adding ' + $scope.new_profile + '. Please try again.', 
                                    title: 'SUCCESS', 
                                    delay : 5000,
                                    positionY: 'top', positionX: 'right'
                                });
                });
            }, function(value){
                //cancel
            });
        }   
    }

    $scope.clear = function() {
        $scope.new_profile = '';
    }

    $scope.paging_action = function(text, page, pageSize, total){
        $scope.pagination.currentPage = page;
        get_profiles();
    }

    $scope.EDIT = function(k){
        $scope.modal.title = "Editing " + $scope.profiles.data[k].position;
        $scope.modal.save = "UPDATE";
        $scope.modal.close = "CLOSE";

        $scope.modal.pk = $scope.profiles.data[k].pk;
        $scope.modal.position = $scope.profiles.data[k].position;
        $scope.modal.remarks = '';
        $scope.modal.created_by = parseInt($scope.user_profile.pk);
      
        ngDialog.openConfirm({
            template: 'EditModal',
            className: 'ngdialog-theme-plain custom-width',
            preCloseCallback: function(value) {
                var nestedConfirmDialog;

                var error=0;
                var column = [];
                if($scope.modal.position.replace(/\s/g,'') == ""){
                    error++;
                    column.push('Profile');
                }
                if($scope.modal.remarks.replace(/\s/g,'') == ""){
                    error++;
                    column.push('Remarks');
                }

                if(error>0){
                    var is = 'is';
                    if(error > 1){
                        is = 'are';
                    }

                    nestedConfirmDialog = ngDialog.openConfirm({
                        template:
                                '<p>' + column.join(', ') + ' '+ is +' required.</p>' +
                                '<div class="ngdialog-buttons">' +
                                    '<button type="button" class="ngdialog-button ngdialog-button-primary" data-ng-click="confirm(1)">OK' +
                                '</button></div>',
                        plain: true,
                        className: 'ngdialog-theme-plain custom-width'
                    })

                    return false;
                }
                else{
                    nestedConfirmDialog = ngDialog.openConfirm({
                        template:
                                '<p>Are you sure you want to update '+ $scope.profiles.data[k].position +' to '+ $scope.modal.position +'?</p>' +
                                '<div class="ngdialog-buttons">' +
                                    '<button type="button" class="ngdialog-button ngdialog-button-secondary" data-ng-click="closeThisDialog(0)">No' +
                                    '<button type="button" class="ngdialog-button ngdialog-button-primary" data-ng-click="confirm(1)">Yes' +
                                '</button></div>',
                        plain: true,
                        className: 'ngdialog-theme-plain custom-width'
                    });
                }

                return nestedConfirmDialog;
            },
            scope: $scope,
            showClose: false
        })
        .then(function(value){
            return false;
        }, function(value){
            var promise = AdminFactory.update_profile($scope.modal);
            promise.then(function(data){
                UINotification.success({
                                message: $scope.modal.position + ' has been successfully updated.', 
                                title: 'SUCCESS', 
                                delay : 5000,
                                positionY: 'top', positionX: 'right'
                            });

                get_user_profile();

                $scope.clear();
            })
            .then(null, function(data){
                UINotification.error({
                                message: 'An error occured while updating ' + $scope.new_profile + '. Please try again.', 
                                title: 'SUCCESS', 
                                delay : 5000,
                                positionY: 'top', positionX: 'right'
                            });
            });
        });
        
    }

    $scope.DELETE = function(k){
        $scope.modal.title = "Deleting " + $scope.profiles.data[k].position;
        $scope.modal.save = "DELETE";
        $scope.modal.close = "CLOSE";

        $scope.modal.data.pk = $scope.profiles.data[k].pk;
        $scope.modal.data.remarks;
        $scope.modal.data.archived = 'true';
        $scope.modal.data.created_by = parseInt($scope.user_profile.pk);
      
        ngDialog.openConfirm({
            template: 'UpdateModal',
            className: 'ngdialog-theme-plain',
            preCloseCallback: function(value) {
                var nestedConfirmDialog;

                if($scope.modal.data.remarks.replace(/\s/g,'') == ''){
                    nestedConfirmDialog = ngDialog.openConfirm({
                        template:
                                '<p>Please state your reason for this deletion</p>',
                        plain: true,
                        className: 'ngdialog-theme-plain'
                    });
                }
                else {
                    nestedConfirmDialog = ngDialog.openConfirm({
                        template:
                                '<p>Are you sure you want to delete '+ $scope.profiles.data[k].position +'</p>' +
                                '<div class="ngdialog-buttons">' +
                                    '<button type="button" class="ngdialog-button ngdialog-button-secondary" data-ng-click="closeThisDialog(0)">No' +
                                    '<button type="button" class="ngdialog-button ngdialog-button-primary" data-ng-click="confirm(1)">Yes' +
                                '</button></div>',
                        plain: true,
                        className: 'ngdialog-theme-plain'
                    });
                }
                return nestedConfirmDialog;
            },
            scope: $scope,
            showClose: false
        })
        .then(function(value){
            //console.log('resolved:' + value);
        }, function(value){            
            var promise = AdminFactory.update_profile($scope.modal.data);
            promise.then(function(data){
                UINotification.success({
                                message: $scope.profiles.data[k].position + ' has been successfully updated.', 
                                title: 'SUCCESS', 
                                delay : 5000,
                                positionY: 'top', positionX: 'right'
                            });

                get_user_profile();

                $scope.clear();
            })
            .then(null, function(data){
                UINotification.error({
                                message: 'An error occured while updating ' + $scope.profiles.data[k].position + '. Please try again.', 
                                title: 'SUCCESS', 
                                delay : 5000,
                                positionY: 'top', positionX: 'right'
                            });
            });
        });
        
    }

    $scope.table_search_changed = function(){
        get_profiles();
    }

    function get_logs(){
        var filter = {
            offset : $scope.offset
        };

        var promise = AdminFactory.profiles_logs(filter);
        promise.then(function(data){
            $scope.logs.status = true
            $scope.logs.data = data.data.result;
        }) 
        .then(null, function(data){
            $scope.logs.status = false;
        });
    }

    $scope.more_logs = function(){
        $scope.offset+=5;

        var filter = {
            offset : $scope.offset
        };

        var promise = AdminFactory.profiles_logs(filter);
        promise.then(function(data){
            for(var i in data.data.result){
                $scope.logs.data.push(data.data.result[i]);
            }
        })
        .then(null, function(data){
            $scope.more = false;
        });

    }
});