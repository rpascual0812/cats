app.controller('Request', function(
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
    $scope.data = {};

    $scope.modal = {};
    $scope.modal.data = {};

    $scope.form = {
        profile : '',
        total : '',
        end_date : '',
        remarks : ''
    };

    $scope.label = {
        profile : 'Profile',
        total : 'Total',
        end_date : 'Target End Date',
        remarks : 'Remarks'
    };

    $scope.formerror = {
        profile : '',
        total : '',
        end_date : '',
        remarks : ''
    };

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

            getjobpositions();

        })   
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
        })
    }

    $scope.clearerror = function(field){
        clearerror(field);
    }

    function clearerror(field){
        $scope.formerror[field] = '';
    }

    $scope.reset = function(){
        for(var i in $scope.data.jobpositions){
            $scope.data.jobpositions.push({   
                                        pk: $scope.data.jobpositions[i].pk,
                                        name: $scope.data.jobpositions[i].position,
                                        ticked: false
                                    });
        }

        $scope.form = {
            profile : '',
            total : '',
            end_date : '',
            remarks : ''
        };
    }

    $scope.submit = function(){
        var error = 0;
        var label = [];

        for(var i in $scope.form){
            if(typeof($scope.form[i]) == 'object'){
                if($scope.form[i].length < 1){
                    label.push($scope.label[i]);
                    error++;
                    $scope.formerror[i] = 'formerror';
                }
            }
            else if($scope.form[i] && $scope.form[i].replace(/\s/g,'') == ""){
                label.push($scope.label[i]);
                error++;
                $scope.formerror[i] = 'formerror';
            }
        }

        if(error > 0){
            var nestedConfirmDialog = ngDialog.openConfirm({
                template:
                        '<p>The following fields are required: <br /><br /> '+ label.join(', ') +'</p>' +
                        '<div class="ngdialog-buttons">' +
                            '<button type="button" class="ngdialog-button ngdialog-button-secondary" data-ng-click="closeThisDialog(0)">OK' +
                        '</button></div>',
                plain: true,
                className: 'ngdialog-theme-plain'
            });
        }
        else {
            $scope.form.profile_pk = parseInt($scope.form.profile[0].pk);
            $scope.form.created_by = $scope.profile.pk;

            var promise = RequestFactory.submit($scope.form);
            promise.then(function(data){ 
                UINotification.success({
                                        message: 'New candidate successfully saved.', 
                                        title: 'SUCCESS', 
                                        delay : 5000,
                                        positionY: 'top', positionX: 'right'
                                    });

                $scope.reset();
            })
            .then(null, function(data){
                UINotification.error({
                                        message: 'An error occurred.  <pre> '+ data +' </pre>', 
                                        title: 'FAILED', 
                                        delay : 5000,
                                        positionY: 'top', positionX: 'right'
                                    });  

                delete $scope.form.profile_pk;
            })
        }
    }
});