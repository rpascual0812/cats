app.controller('Tracker', function(
                                        $scope,
                                        ApplicantsFactory,
                                        SourcesFactory,
                                        JobsFactory,
                                        ClientsFactory,
                                        EmployeesFactory,
                                        RequestFactory,
                                        SessionFactory,
                                        $timeout,
                                        md5,
                                        Upload, $timeout,
                                        UINotification,
                                        ngDialog,
                                        $routeParams
                                    ){

	$scope.form = {
        birthdate: '',
        client: '',
        contact_number: '',
        created_by: '',
        date_received: '',
        email_address: '',
        first_name: '',
        last_name: '',
        middle_name: '',
        profiled_for: '',
        source: '',
        talent_acquisition: '',
        tags : []
    };

    $scope.cv = null;

    $scope.formerror = {
        birthdate: '',
        client: '',
        contact_number: '',
        created_by: '',
        date_received: '',
        email_address: '',
        first_name: '',
        last_name: '',
        middle_name: '',
        profiled_for: '',
        source: '',
        talent_acquisition: ''
    };

    $scope.modal = {};
    $scope.data = {};

    $scope.pk = null;
    $scope.profile = {};

    $scope.duplicates = [];
    $scope.warningbg = '';

    $scope.details = {};
    $scope.details.otheroptions = false;

    $scope.requisitions = [];

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

    function get_requisitions(){
        var promise = RequestFactory.fetch();
        promise.then(function(data){
            var a = data.data.result;

            for(var i in a){
                var name = null;
                if(a[i].alternate_title)
                    name = a[i].alternate_title;
                else 
                    name = a[i].job_position;

                var isticked = false;
                if($routeParams.requisitions_pk && a[i].pk == $routeParams.requisitions_pk){
                    isticked = true;
                }

                $scope.requisitions.push({
                                            pk: a[i].pk,
                                            requisition_id : a[i].requisition_id,
                                            name: name,
                                            ticked: isticked
                                        });
            }
        })
    }

    function get_profile(){
        var filters = { 
            'pk' : $scope.pk
        };

        var promise = EmployeesFactory.profile(filters);
        promise.then(function(data){
            $scope.profile = data.data.result[0];

            get_employees_permission();
        })   
    }

    function get_employees_permission(){
        var filters = { 
            'employees_pk' : $scope.profile.pk
        };

        var promise = EmployeesFactory.individual_permission(filters);
        promise.then(function(data){
            var a = data.data.result[0];

            $scope.profile.title = a.title;
            $scope.profile.role = a.role;
            $scope.profile.department = a.department;
            $scope.profile.talent_acquisition = a.talent_acquisition;

            get_requisitions();
            getsources();
            getjobpositions();
            getclients();
            getTA();
        })   
    }

    function getsources(){
        var filters = {
                        'archived':'false'
                    };

        var promise = SourcesFactory.fetch(filters);
        promise.then(function(data){
            var a = data.data.result;
            $scope.data.sources = [];

            for(var i in a){
                $scope.data.sources.push({   
                                            pk: a[i].pk,
                                            name: a[i].source,
                                            ticked: false
                                        });
            }
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

    function getclients(){
        var filters = {
                        'archived':'false'
                    };

        var promise = ClientsFactory.fetch(filters);
        promise.then(function(data){
            var a = data.data.result;
            $scope.data.clients = [];

            for(var i in a){
                $scope.data.clients.push({   
                                            pk: a[i].pk,
                                            name: a[i].client,
                                            ticked: false
                                        });
            }
        })
    }

    function getTA(){
        // var filters = {
        //                 'role' : 'Talent Acquisition',
        //                 'archived':'false'
        //             };

        var promise = EmployeesFactory.talent_acquisitions();
        promise.then(function(data){
            var a = data.data;



            $scope.data.talent_acquisitions = [];
            for(var i in a){
                var isticked = false;
                if($scope.profile.talent_acquisition == a[i].employees_pk){
                    isticked = true;    
                }

                $scope.data.talent_acquisitions.push({   
                                            pk: a[i].employees_pk,
                                            name: a[i].employee,
                                            ticked: isticked
                                        });
            }
        })
    }

    $scope.clearerror = function(field){
        $scope.formerror[field] = '';
    }

	$scope.submit = function(){
        if($scope.cv == null){
            $scope.modal.title = "Please confirm";
            $scope.modal.message = "You may have forgot to upload the CV of " + $scope.form.first_name + ".";
            $scope.modal.save = "The applicant has no CV";
            $scope.modal.close = "Wait";

            ngDialog.openConfirm({
                template: 'CVModal',
                className: 'ngdialog-theme-plain',
                preCloseCallback: function(value) {
                    var nestedConfirmDialog = ngDialog.openConfirm({
                        template:
                                '<p>This will tag the applicant as NO CV. Would you like to continue?</p>' +
                                '<div class="ngdialog-buttons">' +
                                    '<button type="button" class="ngdialog-button ngdialog-button-secondary" data-ng-click="closeThisDialog(0)">No' +
                                    '<button type="button" class="ngdialog-button ngdialog-button-primary" data-ng-click="confirm(1)">Yes' +
                                '</button></div>',
                        plain: true,
                        className: 'ngdialog-theme-plain'
                    });

                    return nestedConfirmDialog;
                },
                scope: $scope,
                showClose: false
            })
            .then(function(value){
                return false;
            }, function(value){
                submit_applicant();
            });
        }   
        else {
            submit_applicant();
        }    
	}

    function submit_applicant(){
        $scope.form.created_by = $scope.profile.pk;

        if($scope.form.requisition[0]){
            $scope.form.requisitions_pk = $scope.form.requisition[0].pk;
        }

        if($scope.form.source[0]){
            $scope.form.sources_pk = $scope.form.source[0].pk;
        }

        if($scope.form.profiled_for[0]){
            $scope.form.profiled_for_pk = $scope.form.profiled_for[0].pk;    
        }
        
        if($scope.form.client[0]){
            $scope.form.clients_pk = $scope.form.client[0].pk;    
        }
        
        if($scope.form.talent_acquisition[0]){
            $scope.form.talent_acquisition_pk = $scope.form.talent_acquisition[0].pk;
        }

        $scope.form.cv = $scope.cv;
        var error=0;
        for(var i in $scope.form){
            
            if(i == "cv"){
                //skip, not required
            }
            else if(i == "tags"){
                var new_tags=[];
                for(var j in $scope.form[i]){
                    new_tags.push($scope.form[i][j].name);
                }

                $scope.form['new_tags'] = new_tags.join(',');
            }
            else if(typeof($scope.form[i]) == 'object'){
                // $scope.formerror[i] = 'formerror';
                // error++;
            }
            else if($scope.form[i].replace(/\s/g,'') == ""){
                $scope.formerror[i] = 'formerror';
                error++;
            }
        }

        if(error > 0){
            UINotification.error({
                                    message: 'Please review the form. All fields are required.', 
                                    title: 'ERROR', 
                                    delay : 5000,
                                    positionY: 'top', positionX: 'right'
                                }); 

            return false;
        }

        var promise = ApplicantsFactory.submit($scope.form);
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
        })
    }

    $scope.sources_changed = function(){
        if($scope.form.source == "Others"){
            $scope.details.otheroptions = true;
        }
        else {
            $scope.details.otheroptions = false;   
        }
    }

    $scope.reset = function(){
        $scope.form = {
            birthdate: '',
            client: '',
            contact_number: '',
            created_by: '',
            date_received: '',
            email_address: '',
            first_name: '',
            last_name: '',
            middle_name: '',
            profiled_for: '',
            source: '',
            talent_acquisition: '',
            tags : []
        };

        $scope.cv = null;

        $scope.formerror = {
            birthdate: '',
            client: '',
            contact_number: '',
            created_by: '',
            date_received: '',
            email_address: '',
            first_name: '',
            last_name: '',
            middle_name: '',
            profiled_for: '',
            source: '',
            talent_acquisition: ''
        };

        for(var i in $scope.data.sources){
            $scope.data.sources[i].ticked = false;
        }

        for(var i in $scope.data.jobpositions){
            $scope.data.jobpositions[i].ticked = false;
        }

        for(var i in $scope.data.clients){
            $scope.data.clients[i].ticked = false;
        }

        for(var i in $scope.data.talent_acquisitions){
            $scope.data.talent_acquisitions[i].ticked = false;
        }

        for(var i in $scope.data.requisitions){
            $scope.data.requisitions[i].ticked = false;
        }

        $scope.picFile = null;
    }

    $scope.uploadPic = function(file) {
        Upload.upload({
            url: "./FUNCTIONS/Tracker/upload.php",
            data: {file: file, 'username': $scope.username}
        }).then(function (resp) {
            $scope.cv = resp.data.file;
            $scope.picFile.result = true;
        }, function (resp) {
            $scope.errorMsg = true;
            //console.log('Error status: ' + resp.status);
        }, function (evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            //console.log('progress: ' + progressPercentage + '% ');
        });
    }

    $scope.check_duplicates = function(){
        var count=0;
        if($scope.form.last_name.replace(/\s/g,'') == ''){
            count++;
        }
        
        if($scope.form.first_name.replace(/\s/g,'') == ''){
            count++;
        }
        
        if($scope.form.middle_name.replace(/\s/g,'') == ''){
            count++;
        }
        
        if($scope.form.birthdate.replace(/\s/g,'') == ''){
            count++;
        }
        
        if(count==0){
            var filter = {
                first_name : $scope.form.first_name,
                middle_name : $scope.form.middle_name,
                last_name : $scope.form.last_name,
                birthdate : $scope.form.birthdate
            };

            var promise = ApplicantsFactory.check_duplicate(filter);
            promise.then(function(data){
                $scope.formerror = {
                    first_name: 'warning-bg',
                    last_name: 'warning-bg',
                    middle_name: 'warning-bg'
                };

                $scope.duplicates = data.data.result;

                var txt;
                if($scope.duplicates.length > 1){
                    txt = 'records';    
                }
                else{
                    txt = 'record';
                }
                
                UINotification.warning({
                                    message: 'The system found ' + $scope.duplicates.length + ' existing '+ txt +' that matches this candidate',
                                    title: 'WARNING', 
                                    delay : 5000,
                                    positionY: 'top', positionX: 'right'
                                });
            })
            .then(null, function(data){
                $scope.warningbg = '';
            })
        }
    }

    $scope.open_duplicate = function(k){
        window.location = "#/candidate/" + $scope.duplicates[k].applicant_id;
    }
});
