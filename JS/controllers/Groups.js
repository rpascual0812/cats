app.controller('Groups', function(
  										$scope,
                                        SessionFactory,
                                        NotificationsFactory,
                                        EmployeesFactory,
                                        $timeout,
                                        md5,
                                        ngDialog
  									){

    $scope.profile = {};
    $scope.pk = null;

    $scope.talent_acquisition = {};
    $scope.sourcers = {};

    $scope.modal = {};
    $scope.modal.data = {};

    $scope.filter = {};
    $scope.filter.talent_acquisition = 'All Talent Acquisitions';

    $scope.tab = {
        'talent_acquisition' : true,
        'other' : false
    };

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

            //get_talent_acquisitions();
            $scope.get_sourcers();
            get_talent_acquisitions();
        })
    }

    $scope.switch_tab = function(tab){
        for(var i in $scope.tab){
            $scope.tab[i] = false;
        }        

        $scope.tab[tab] = true;
    }

    function get_talent_acquisitions(){
        var promise = EmployeesFactory.talent_acquisitions();
        promise.then(function(data){
            $scope.talent_acquisition.status = true;
            $scope.talent_acquisition.data = data.data;
        })
        .then(null, function(data){
            $scope.data.talent_acquisition.status = false;
        });
    }

    $scope.get_sourcers = function(){
        var filter = {
            search : $scope.filter.search,
            talent_acquisition : $scope.filter.talent_acquisition
        };

        var promise = EmployeesFactory.sourcers(filter);
        promise.then(function(data){
            $scope.sourcers.status = true;
            $scope.sourcers.data = data.data;
        })
        .then(null, function(data){
            $scope.sourcers.status = false;
        });
    }

    $scope.filter_by_talent_acquisition = function(){
        $scope.get_sourcers();
    }

    $scope.table_search_changed = function(){
        $scope.get_sourcers();
    }

    $scope.talent_acquisition_changed = function(k){    
        var talent_acquisition_employees_pk = $scope.sourcers.data[k].talent_acquisition;
        var talent_acquisition_employee = null;

        for(var i in $scope.talent_acquisition.data){
            if($scope.talent_acquisition.data[i].employees_pk == talent_acquisition_employees_pk){
                talent_acquisition_employee = $scope.talent_acquisition.data[i].employee
            }
        }

        $scope.modal.title = "Updating Talent Acquisition";
        $scope.modal.save = "Update";
        $scope.modal.close = "Cancel";

        $scope.modal.data.remarks = "";

        ngDialog.openConfirm({
            template: 'UpdateModal',
            className: 'ngdialog-theme-plain',
            preCloseCallback: function(value) {
                var nestedConfirmDialog;

                if($scope.modal.data.remarks.replace(/\s/g,'') == ''){
                    nestedConfirmDialog = ngDialog.openConfirm({
                        template:
                                '<p>Please state your reason for this update</p>',
                        plain: true,
                        className: 'ngdialog-theme-plain'
                    });
                }
                else {
                    nestedConfirmDialog = ngDialog.openConfirm({
                        template:
                                '<p>Are you sure you want to bucket '+ $scope.sourcers.data[k].employee +' under '+ talent_acquisition_employee +'?</p>' +
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
            var filter = {
                employees_pk : $scope.sourcers.data[k].employees_pk,
                supervisor_pk : talent_acquisition_employees_pk
            };

            var promise = EmployeesFactory.update_sourcer_talent_acquisition(filter);
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
});