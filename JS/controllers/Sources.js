app.controller('Sources', function(
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

    $scope.user_source = {};
    $scope.sources = {};
    $scope.sources.data = [];

    $scope.new_source = null;

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
            $scope.user_source = data.data.result[0];

            get_sources();
            get_logs();
        })   
    }

    $scope.get_sources = function(){
        get_sources();        
    }

    function get_sources() {
        var filters = { 
            'text' : ($scope.table_search==null)?'':$scope.table_search,
            'archived' : ($scope.table_status=='Enabled')?false:true,
            'current_page' : $scope.pagination.currentPage,
            'page_size' : parseInt($scope.pagination.pageSize)
        };

        var promise = AdminFactory.sources(filters);
        promise.then(function(data){
            $scope.sources.status = true;
            $scope.sources.data = data.data.result;

            $scope.pagination.total = data.data.result[0].total;
        }) 
        .then(null, function(data){
            $scope.sources.status = false;
        });
    }

    $scope.add_source = function(){
        $scope.sources.status = true;
        
        //$scope.sources.data.push({ source : $scope.new_source });

        var duplicate = 0;
        for(var i in $scope.sources.data){
            if($scope.sources.data[i].position == $scope.new_source){
                duplicate++;
            }
        }

        if(duplicate > 0){
            var nestedConfirmDialog = ngDialog.openConfirm({
                template:
                        '<p>'+ $scope.new_source +' already exists.</p>' +
                        '<div class="ngdialog-buttons">' +
                            '<button type="button" class="ngdialog-button ngdialog-button-primary" data-ng-click="confirm(1)">OK' +
                        '</button></div>',
                plain: true,
                className: 'ngdialog-theme-plain'
            })
        }
        else if($scope.new_source.replace(/\s/g,'') == ""){
            return false;
        }
        else {
            var nestedConfirmDialog = ngDialog.openConfirm({
                template:
                        '<p>Are you sure you want to add '+ $scope.new_source +'?</p>' +
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
                    'source' : $scope.new_source
                };

                var promise = AdminFactory.addsource(data);
                promise.then(function(data){
                    UINotification.success({
                                    message: 'New source '+ $scope.new_source +' successfully saved.', 
                                    title: 'SUCCESS', 
                                    delay : 5000,
                                    positionY: 'top', positionX: 'right'
                                });

                    get_sources();
                    get_logs();

                    $scope.clear();
                })
                .then(null, function(data){
                    UINotification.error({
                                    message: 'An error occured while adding ' + $scope.new_source + '. Please try again.', 
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
        $scope.new_source = '';
    }

    $scope.paging_action = function(text, page, pageSize, total){
        $scope.pagination.currentPage = page;
        get_sources();
    }

    $scope.EDIT = function(k){
        $scope.modal.title = "Editing " + $scope.sources.data[k].source;
        $scope.modal.save = "UPDATE";
        $scope.modal.close = "CLOSE";

        $scope.modal.pk = $scope.sources.data[k].pk;
        $scope.modal.source = $scope.sources.data[k].source;
        $scope.modal.remarks = '';
        $scope.modal.created_by = parseInt($scope.user_source.pk);
      
        ngDialog.openConfirm({
            template: 'EditModal',
            className: 'ngdialog-theme-plain custom-width',
            preCloseCallback: function(value) {
                var nestedConfirmDialog;

                var error=0;
                var column = [];
                
                if($scope.modal.source.replace(/\s/g,'') == ""){
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
                                '<p>Are you sure you want to update '+ $scope.sources.data[k].source +' to '+ $scope.modal.source +'?</p>' +
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
            var promise = AdminFactory.update_source($scope.modal);
            promise.then(function(data){
                UINotification.success({
                                message: $scope.modal.source + ' has been successfully updated.', 
                                title: 'SUCCESS',
                                delay : 5000,
                                positionY: 'top', positionX: 'right'
                            });

                get_sources();
                get_logs();

                $scope.clear();
            })
            .then(null, function(data){
                UINotification.error({
                                message: 'An error occured while updating ' + $scope.new_source + '. Please try again.', 
                                title: 'SUCCESS', 
                                delay : 5000,
                                positionY: 'top', positionX: 'right'
                            });
            });
        });
        
    }

    $scope.DELETE = function(k){
        $scope.modal.title = "Deleting " + $scope.sources.data[k].source;
        $scope.modal.save = "DELETE";
        $scope.modal.close = "CLOSE";

        $scope.modal.data.pk = $scope.sources.data[k].pk;
        $scope.modal.data.remarks;
        $scope.modal.data.archived = 'true';
        $scope.modal.data.created_by = parseInt($scope.user_source.pk);
      
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
                                '<p>Are you sure you want to disable '+ $scope.sources.data[k].source +'</p>' +
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
            var promise = AdminFactory.update_source($scope.modal.data);
            promise.then(function(data){
                UINotification.success({
                                message: $scope.sources.data[k].source + ' has been successfully updated.', 
                                title: 'SUCCESS', 
                                delay : 5000,
                                positionY: 'top', positionX: 'right'
                            });

                get_sources();
                get_logs();

                $scope.clear();
            })
            .then(null, function(data){
                UINotification.error({
                                message: 'An error occured while updating ' + $scope.sources.data[k].source + '. Please try again.', 
                                title: 'SUCCESS', 
                                delay : 5000,
                                positionY: 'top', positionX: 'right'
                            });
            });
        });
        
    }

    $scope.table_search_changed = function(){
        get_sources();
    }

    $scope.table_status_changed = function(){
        get_sources();
    }

    function get_logs(){
        var filter = {
            offset : $scope.offset
        };

        var promise = AdminFactory.sources_logs(filter);
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

        var promise = AdminFactory.sources_logs(filter);
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