app.controller('Applicant', function(
                                        $scope,
                                        $routeParams,
                                        ApplicantsFactory,
                                        EmployeesFactory,
                                        SessionFactory,
                                        SourcesFactory,
                                        JobsFactory,
                                        ClientsFactory,
                                        StatusesFactory,
                                        Upload, $timeout,
                                        md5,
                                        ngDialog,
                                        UINotification
                                    ){

	$scope.form = {};
    $scope.data = {};
    $scope.modal = {};
    $scope.modal.data = {};

    $scope.cv = null;
    $scope.post = '';

    $scope.remarks = {};
    $scope.remarks_count = 0;
    $scope.remarks_status = true;

    $scope.profile = {};
    $scope.applicant = {};
    $scope.showmodal = false;

    $scope.restriction = {
        status : {
            edit : false,
            text : true
        },
        endorsement_date : {
            edit : false,
            text : true
        },
        appointment_date : {
            edit : false,
            text : true
        },
        talent_acquisition : {
            edit : false,
            text : true
        }
    };


    $scope.label = {
        date_received : "Date Received",
        source : "Source",
        name : "Candidate Name",
        birthdate : "Birth Date",
        contact_number : "Contact Number",
        email_address : "Email Address",
        cv : "CV",
        job_position_id : "Profiled For",
        job_position : "Profiled For",
        client_id : "Client",
        client : "Client",
        talent_acquisition_id : "Talent Acquisition",
        talent_acquisition : "Talent Acquisition",
        status_id : "Status",
        status : "Status",
        date_endorsed : "Date of Endorsement",
        date_appointment : "Date of Appointment"
    };

    $scope.display = {
        date_received : {
            text : true,
            input : false
        },
        date_endorsed : {
            text : true,
            input : false
        },
        date_appointment : {
            text : true,
            input : false
        },
        source : {
            text : true,
            input : false
        },
        name : {
            text : true,
            input : false
        },
        birthdate : {
            text : true,
            input : false
        },
        contact_number : {
            text : true,
            input : false
        },
        email_address : {
            text : true,
            input : false
        },
        cv : {
            text : true,
            input : false
        },
        job_position : {
            text : true,
            input : false
        },
        client : {
            text : true,
            input : false
        },
        talent_acquisition : {
            text : true,
            input : false
        },
        status : {
            text : true,
            input : false
        }
    }

    init();

    function init(){
        var promise = SessionFactory.getsession();
        promise.then(function(data){
            var _id = md5.createHash('pk');
            $scope.pk = data.data[_id];

            get_applicant_details();
            
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
            activate_restrictions();
        })   
    }

    function activate_restrictions() {

        var assoc = ['Associate', 'Intern'];
        var sup = ['Specialist', 'Supervisor'];
        var manager = ['Assistant Manager', 'Manager'];
        var exec = ['C-Level'];

        if(contains(assoc, $scope.profile.level)){
            $scope.restriction.status.edit = false;
            $scope.restriction.status.text = true;

            $scope.restriction.endorsement_date.edit = false;
            $scope.restriction.endorsement_date.text = true;

            $scope.restriction.appointment_date.edit = false;
            $scope.restriction.appointment_date.text = true;

            $scope.restriction.talent_acquisition.edit = false;
            
            if($scope.profile.position == 'Talent Acquisition Associate'){
                $scope.restriction.status.edit = true;
                $scope.restriction.status.text = false;

                $scope.restriction.endorsement_date.edit = true;
                $scope.restriction.endorsement_date.text = false;

                $scope.restriction.appointment_date.edit = true;
                $scope.restriction.appointment_date.text = false;                
            }
        }
        else if(contains(sup, $scope.profile.level)){
            $scope.restriction.status.edit = false;
            $scope.restriction.status.text = true;

            $scope.restriction.endorsement_date.edit = false;
            $scope.restriction.endorsement_date.text = true;

            $scope.restriction.appointment_date.edit = false;
            $scope.restriction.appointment_date.text = true;

            $scope.restriction.talent_acquisition.edit = false;
        }
        else if(contains(manager, $scope.profile.level)){
            $scope.restriction.status.edit = true;
            $scope.restriction.status.text = false;

            $scope.restriction.endorsement_date.edit = true;
            $scope.restriction.endorsement_date.text = false;

            $scope.restriction.appointment_date.edit = true;
            $scope.restriction.appointment_date.text = false;

            $scope.restriction.talent_acquisition.edit = true;
        }
        else {
            $scope.restriction.status.edit = true;
            $scope.restriction.status.text = false;

            $scope.restriction.endorsement_date.edit = true;
            $scope.restriction.endorsement_date.text = false;

            $scope.restriction.appointment_date.edit = true;
            $scope.restriction.appointment_date.text = false;

            $scope.restriction.talent_acquisition.edit = true;
        }


    }

    function contains(a, obj) {
        var i = a.length;
        while (i--) {
            if (a[i] === obj) {
                return true;
            }
        }

        return false;
    }

    function get_applicant_details(){
        var filters = { 
            'applicant_id' : $routeParams.id
        };

        var promise = ApplicantsFactory.applicant(filters);
        promise.then(function(data){
            $scope.applicant = data.data.result[0];
            
            $scope.form.date_received = data.data.result[0].date_received +" "+ data.data.result[0].time_received;
            $scope.form.sources_pk = data.data.result[0].sources_pk;
            $scope.form.source = data.data.result[0].source;
            $scope.form.last_name = data.data.result[0].last_name;
            $scope.form.first_name = data.data.result[0].first_name;
            $scope.form.middle_name = data.data.result[0].middle_name;
            $scope.form.birthdate = data.data.result[0].birthdate;
            $scope.form.contact_number = data.data.result[0].contact_number;
            $scope.form.email_address = data.data.result[0].email_address;
            $scope.form.cv = data.data.result[0].cv;
            $scope.form.job_positions_pk = data.data.result[0].job_positions_pk;
            $scope.form.job_position = data.data.result[0].job_position;
            $scope.form.clients_pk = data.data.result[0].clients_pk;
            $scope.form.client = data.data.result[0].client;
            $scope.form.talent_acquisitions_pk = data.data.result[0].talent_acquisitions_pk;
            $scope.form.talent_acquisition = data.data.result[0].talent_acquisition;
            $scope.form.statuses_pk = data.data.result[0].statuses_pk;
            $scope.form.status = data.data.result[0].status;
            $scope.form.date_endorsed = data.data.result[0].endorsement_date;
            $scope.form.date_appointment = data.data.result[0].appointment_date;

            //this is not wise,
            //create a function
            //that will reload below
            //without refetching from the
            //database level
            get_profile();
            getsources();
            getjobpositions();
            getclients();
            getTA();
            getstatuses();
            
            //$timeout(function() {
            get_applicant_remarks();
            //}, 3000);
        })   
    }

    function get_applicant_remarks(){
        var filter = {
            applicants_pk : $scope.applicant.pk,
            offset : $scope.remarks_count
        };

        var promise = ApplicantsFactory.applicant_remarks(filter);
        promise.then(function(data){
            $scope.remarks = data.data.result;
        })
        .then(null, function(data){
            $scope.remarks_status = false;
        });
    }

    $scope.more_remarks = function(){
        $scope.remarks_count+=10;

        var filter = {
            applicants_pk : $scope.applicant.pk,
            offset : $scope.remarks_count
        };

        var promise = ApplicantsFactory.applicant_remarks(filter);
        promise.then(function(data){
            var a = data.data.result;

            for(var i in a)
                $scope.remarks.push(a[i]);
        }) 
        .then(null, function(data){
            $scope.remarks_status = false;
        });
    }

    $scope.edit_field = function(col){
        $scope.display[col].text = false;
        $scope.display[col].input = true;
                
        // $('#formedit_datereceived').bootstrapMaterialDatePicker({ format : 'YYYY-MM-DD HH:mm', animation:true });

        // $('.icon-close').hide();
    }

    $scope.cancel_edit = function(col){
        $scope.display[col].text = true;
        $scope.display[col].input = false;

        get_applicant_details();
    }

    $scope.save_edit_field = function(col){
        $scope.modal.data = {
            remarks : ''
        }

        $scope.display[col].text = true;
        $scope.display[col].input = false;

        $scope.modal.title = "Updating " + $scope.label[col];
        $scope.modal.close = "Cancel";
        $scope.modal.save = "Update";

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
                    var txt;

                    var dropdowns = ['job_position','client','status','source','talent_acquisition'];
                    if(contains(dropdowns, col)){
                        txt = $scope.form[col][0].name;
                    }
                    else if(col == "name"){
                        txt = $scope.form['first_name'] +" "+ $scope.form['last_name'];
                    }
                    else {
                        txt = $scope.form[col];
                    }
                    
                    nestedConfirmDialog = ngDialog.openConfirm({
                        template:
                                '<p>Are you sure you want to update '+ $scope.label[col] +' to '+ txt +'</p>' +
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
            get_applicant_details();
            //console.log('resolved:' + value);
        }, function(value){
            var data = {};
            
            if(typeof($scope.form[col]) == 'object'){
                if(col == "job_position"){
                    data['job_positions_pk'] = $scope.form[col][0].pk;
                }
                else if(col == "client"){
                    data['clients_pk'] = $scope.form[col][0].pk;
                }
                else if(col == "status"){
                    data['statuses_pk'] = $scope.form[col][0].pk;
                }
                else if(col == "source"){
                    data['sources_pk'] = $scope.form[col][0].pk;
                }
                else if(col == "talent_acquisition"){
                    data['talent_acquisitions_pk'] = $scope.form[col][0].pk;
                }
                //data[col] = parseInt($scope.form[col][0].pk);
            }
            else if(col == "name"){
                data['last_name'] = $scope.form['last_name'];
                data['first_name'] = $scope.form['first_name'];
                data['middle_name'] = $scope.form['middle_name'];
            }
            else {
                data[col] = $scope.form[col];
            }

            data['remarks'] = $scope.modal.data.remarks;
            data['applicant_id'] = $routeParams.id;
            data['employees_pk'] = $scope.profile.pk;

            var promise = ApplicantsFactory.update(data);
            promise.then(function(data){
                UINotification.success({
                                    message: 'Update successful.', 
                                    title: 'SUCCESS', 
                                    delay : 5000,
                                    positionY: 'top', positionX: 'right'
                                });

                get_applicant_details();
                //get_applicant_remarks();
            })
            .then(null, function(data){
                UINotification.error({
                                    message: 'An error occurred. Please try again.', 
                                    title: 'ERROR', 
                                    delay : 5000,
                                    positionY: 'top', positionX: 'right'
                                });
            });

        });
    }

    function getsources(){
        var filters = {
                        'archived':'false'
                    };

        var promise = SourcesFactory.fetch(filters);
        promise.then(function(data){
            //$scope.data.sources = data.data.result;
            var a = data.data.result;
            $scope.data.sources = [];

            for(var i in a){
                var ticked = false;
                
                if(a[i].pk == $scope.form.sources_pk){
                    ticked = true;
                }

                $scope.data.sources.push({   
                                            pk: a[i].pk,
                                            name: a[i].source,
                                            ticked: ticked
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
            //$scope.data.jobpositions = data.data.result;
            var a = data.data.result;
            $scope.data.jobpositions = [];

            for(var i in a){
                var ticked = false;
                
                if(a[i].pk == $scope.form.job_positions_pk){
                    ticked = true;
                }

                $scope.data.jobpositions.push({   
                                            pk: a[i].pk,
                                            name: a[i].position,
                                            ticked: ticked
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
            //$scope.data.clients = data.data.result;
            var a = data.data.result;
            $scope.data.clients = [];

            for(var i in a){
                var ticked = false;
                
                if(a[i].pk == $scope.form.clients_pk){
                    ticked = true;
                }

                $scope.data.clients.push({   
                                            pk: a[i].pk,
                                            name: a[i].client,
                                            ticked: ticked
                                        });
            }
        })
    }

    function getTA(){
        var filters = {
                        'title' : 'Talent Acquisition',
                        'archived':'false'
                    };

        var promise = EmployeesFactory.fetch(filters);
        promise.then(function(data){
            //$scope.data.talent_acquisitions = data.data.result;
            var a = data.data.result;
            $scope.data.talent_acquisitions = [];

            for(var i in a){
                var ticked = false;
                
                if(a[i].pk == $scope.form.talent_acquisitions_pk){
                    ticked = true;
                }

                $scope.data.talent_acquisitions.push({   
                                            pk: a[i].pk,
                                            name: a[i].first_name + " " + a[i].last_name,
                                            ticked: ticked
                                        });
            }
        })
    }

    function getstatuses(){
        var filters = {
                        'archived':'false'
                    };

        var promise = StatusesFactory.fetch(filters);
        promise.then(function(data){
            var a = data.data.result;
            $scope.data.statuses = [];

            for(var i in a){
                var ticked = false;
                
                if(a[i].pk == $scope.form.statuses_pk){
                    ticked = true;
                }

                $scope.data.statuses.push({   
                                            pk: a[i].pk,
                                            name: a[i].status,
                                            ticked: ticked
                                        });
            }
        })   
    }

    $scope.download_cv = function(link){
        window.open(link.substr(1));
    }

    $scope.uploadPic = function(file) {
        $scope.modal.title = "Uploading New CV";
        $scope.modal.save = "Upload";
        $scope.modal.close = "Cancel";

        ngDialog.openConfirm({
            template: 'UpdateModal',
            className: 'ngdialog-theme-plain',
            preCloseCallback: function(value) {
                var nestedConfirmDialog = ngDialog.openConfirm({
                    template:
                            '<p>Are you sure you want to upload this CV?</p>' +
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
            // do nothing
        }, function(value){
            //$scope.modal.data
            Upload.upload({
                url: "./FUNCTIONS/Tracker/upload.php",
                data: { file: file, 'username': $scope.username }
            }).then(function (resp) {
                $scope.cv = resp.data.file;

                //$scope.picFile.result = true;

                update_cv();
            }, function (resp) {
                $scope.errorMsg = true;
                //console.log('Error status: ' + resp.status);
            }, function (evt) {
                
                //console.log('progress: ' + progressPercentage + '% ');
            });
        });
    }

    function update_cv(){
        var data = {
            applicant_id : $scope.applicant.applicant_id,
            cv : $scope.cv,
            remarks : $scope.modal.data.remarks,
            employees_pk : $scope.profile.pk
        };
        
        if($scope.cv){
            var promise = ApplicantsFactory.update_cv(data);
            promise.then(function(data){
                get_applicant_details();
                //get_applicant_remarks();

                $scope.display['cv'].text = true;
                $scope.display['cv'].input = false;
            })
        }
    }

    $scope.update_status = function(col){
        $scope.modal.data = {
            remarks : ''
        }

        $scope.modal.title = "Updating " + $scope.label[col];
        $scope.modal.close = "Cancel";
        $scope.modal.save = "Update";

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
                                '<p>Are you sure you want to update '+ $scope.label[col] +' to '+ $scope.form[col][0].name +'</p>' +
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
            //cancel
        }, function(value){
            //save
            var data = {
                applicant_id : $scope.applicant.applicant_id,
                statuses_pk : parseInt($scope.form[col][0].pk),
                remarks : $scope.modal.data.remarks,
                employees_pk : parseInt($scope.profile.pk)
            };
            
            var promise = ApplicantsFactory.update(data);
            promise.then(function(data){
                get_applicant_details();
                //get_applicant_remarks();
            })
        });
    }

    $scope.save_remarks = function(){
        var data = {
            applicant_id : $scope.applicant.applicant_id,
            post : $scope.post,
            employees_pk : parseInt($scope.profile.pk)
        };

        var promise = ApplicantsFactory.update(data);
        promise.then(function(data){
            $scope.post = '';
            get_applicant_remarks();
        })
    }
});
