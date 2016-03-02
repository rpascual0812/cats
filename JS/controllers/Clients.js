app.controller('Clients', function(
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

    $scope.user_client = {};
    $scope.clients = {};
    $scope.clients.data = [];

    $scope.new_client = null;

    $scope.table_search = null;
    $scope.table_status = 'Enabled';

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
            $scope.user_client = data.data.result[0];

            get_clients();
            get_logs();
        })   
    }

    $scope.get_clients = function(){
        get_clients();        
    }

    function get_clients() {
        var filters = { 
            'text' : ($scope.table_search==null)?'':$scope.table_search,
            'archived' : ($scope.table_status=='Enabled')?false:true,
            'current_page' : $scope.pagination.currentPage,
            'page_size' : parseInt($scope.pagination.pageSize)
        };

        var promise = AdminFactory.clients(filters);
        promise.then(function(data){
            $scope.clients.status = true;
            $scope.clients.data = data.data.result;

            $scope.pagination.total = data.data.result[0].total;
        }) 
        .then(null, function(data){
            $scope.clients.status = false;
        });
    }

    $scope.add_client = function(){
        $scope.clients.status = true;
        
        //$scope.clients.data.push({ client : $scope.new_client });

        var duplicate = 0;
        for(var i in $scope.clients.data){
            if($scope.clients.data[i].position == $scope.new_client){
                duplicate++;
            }
        }

        if(duplicate > 0){
            var nestedConfirmDialog = ngDialog.openConfirm({
                template:
                        '<p>'+ $scope.new_client +' already exists.</p>' +
                        '<div class="ngdialog-buttons">' +
                            '<button type="button" class="ngdialog-button ngdialog-button-primary" data-ng-click="confirm(1)">OK' +
                        '</button></div>',
                plain: true,
                className: 'ngdialog-theme-plain'
            })
        }
        else if($scope.new_client.replace(/\s/g,'') == ""){
            return false;
        }
        else {
            var nestedConfirmDialog = ngDialog.openConfirm({
                template:
                        '<p>Are you sure you want to add '+ $scope.new_client +'?</p>' +
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
                    'code' : $scope.new_client_code,
                    'client' : $scope.new_client
                };

                var promise = AdminFactory.addclient(data);
                promise.then(function(data){
                    UINotification.success({
                                    message: 'New client '+ $scope.new_client +' successfully saved.', 
                                    title: 'SUCCESS', 
                                    delay : 5000,
                                    positionY: 'top', positionX: 'right'
                                });

                    get_clients();
                    get_logs();

                    $scope.clear();
                })
                .then(null, function(data){
                    UINotification.error({
                                    message: 'An error occured while adding ' + $scope.new_client + '. Please try again.', 
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
        $scope.new_client = '';
        $scope.new_client_code = '';
    }

    $scope.paging_action = function(text, page, pageSize, total){
        $scope.pagination.currentPage = page;
        get_clients();
    }

    $scope.EDIT = function(k){
        $scope.modal.title = "Editing " + $scope.clients.data[k].client;
        $scope.modal.save = "UPDATE";
        $scope.modal.close = "CLOSE";

        $scope.modal.pk = $scope.clients.data[k].pk;
        $scope.modal.code = $scope.clients.data[k].code;
        $scope.modal.client = $scope.clients.data[k].client;
        $scope.modal.remarks = '';
        $scope.modal.created_by = parseInt($scope.user_client.pk);
      
        ngDialog.openConfirm({
            template: 'EditModal',
            className: 'ngdialog-theme-plain custom-width',
            preCloseCallback: function(value) {
                var nestedConfirmDialog;

                var error=0;
                var column = [];
                if($scope.modal.code.replace(/\s/g,'') == ""){
                    error++;
                    column.push('Code');
                }
                if($scope.modal.client.replace(/\s/g,'') == ""){
                    error++;
                    column.push('Client');
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
                                '<p>Are you sure you want to update '+ $scope.clients.data[k].client +' to '+ $scope.modal.client +'?</p>' +
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
            var promise = AdminFactory.update_client($scope.modal);
            promise.then(function(data){
                UINotification.success({
                                message: $scope.modal.client + ' has been successfully updated.', 
                                title: 'SUCCESS', 
                                delay : 5000,
                                positionY: 'top', positionX: 'right'
                            });

                get_clients();
                get_logs();

                $scope.clear();
            })
            .then(null, function(data){
                UINotification.error({
                                message: 'An error occured while updating ' + $scope.new_client + '. Please try again.', 
                                title: 'SUCCESS', 
                                delay : 5000,
                                positionY: 'top', positionX: 'right'
                            });
            });
        });
        
    }

    $scope.DELETE = function(k){
        $scope.modal.title = "Deleting " + $scope.clients.data[k].client;
        $scope.modal.save = "DELETE";
        $scope.modal.close = "CLOSE";

        $scope.modal.data.pk = $scope.clients.data[k].pk;
        $scope.modal.data.remarks;
        $scope.modal.data.archived = 'true';
        $scope.modal.data.created_by = parseInt($scope.user_client.pk);
      
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
                                '<p>Are you sure you want to disable '+ $scope.clients.data[k].client +'</p>' +
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
            var promise = AdminFactory.update_client($scope.modal.data);
            promise.then(function(data){
                UINotification.success({
                                message: $scope.clients.data[k].client + ' has been successfully updated.', 
                                title: 'SUCCESS', 
                                delay : 5000,
                                positionY: 'top', positionX: 'right'
                            });

                get_clients();
                get_logs();

                $scope.clear();
            })
            .then(null, function(data){
                UINotification.error({
                                message: 'An error occured while updating ' + $scope.clients.data[k].client + '. Please try again.', 
                                title: 'SUCCESS', 
                                delay : 5000,
                                positionY: 'top', positionX: 'right'
                            });
            });
        });
        
    }

    $scope.table_search_changed = function(){
        get_clients();
    }

    $scope.table_status_changed = function(){
        get_clients();
    }

    function get_logs(){
        var filter = {
            offset : $scope.offset
        };

        var promise = AdminFactory.clients_logs(filter);
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

        var promise = AdminFactory.clients_logs(filter);
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