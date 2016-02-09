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
                                        md5,
                                        ngDialog
                                    ){

	$scope.form = {};
    $scope.data = {};
    $scope.modal = {};
    $scope.modal.data = {};

    $scope.remarks = {};

    $scope.profile = {};
    $scope.applicant = {};
    $scope.showmodal = false;

    $scope.label = {
        date_received : "Date Received",
        source : "Source",
        name : "Candidate Name",
        birthdate : "Birth Date",
        contact_number : "Contact Number",
        email_address : "Email Address",
        cv : "CV",
        profiled_for_id : "Profiled For",
        profiled_for : "Profiled For",
        client_id : "Client",
        client : "Client",
        talent_acquisition_id : "Talent Acquisition",
        talent_acquisition : "Talent Acquisition",
        status_id : "Status",
        status : "Status"
    };

    $scope.display = {
        date_received : {
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
        profiled_for : {
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

            get_profile();
            getsourcers();
            getjobpositions();
            getclients();
            getTA();
            getstatuses();
            
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
        })   
    }

    function get_applicant_details(){
        var filters = { 
            'applicant_id' : $routeParams.id
        };

        var promise = ApplicantsFactory.applicant(filters);
        promise.then(function(data){
            $scope.applicant = data.data.result[0];

            $scope.form.date_received = data.data.result[0].date_received +" "+ data.data.result[0].time_received;
            $scope.form.source_id = data.data.result[0].source_id;
            $scope.form.source = data.data.result[0].source;
            $scope.form.last_name = data.data.result[0].last_name;
            $scope.form.first_name = data.data.result[0].first_name;
            $scope.form.middle_name = data.data.result[0].middle_name;
            $scope.form.birthdate = data.data.result[0].birthdate;
            $scope.form.contact_number = data.data.result[0].contact_number;
            $scope.form.email_address = data.data.result[0].email_address;
            $scope.form.cv = data.data.result[0].cv;
            $scope.form.profiled_for_id = data.data.result[0].profiled_for_id;
            $scope.form.profiled_for = data.data.result[0].profiled_for;
            $scope.form.client_id = data.data.result[0].client_id;
            $scope.form.client = data.data.result[0].client;
            $scope.form.talent_acquisition = data.data.result[0].talent_acquisition;

            get_applicant_remarks();
        })   
    }

    function get_applicant_remarks(){
        var filter = {
            applicants_pk : $scope.applicant.pk
        };

        var promise = ApplicantsFactory.applicant_remarks(filter);
        promise.then(function(data){
            $scope.remarks = data.data.result;
        });
    }

    $scope.edit_field = function(col){
        $scope.display[col].text = false;
        $scope.display[col].input = true;
                
        $('#formedit_datereceived').bootstrapMaterialDatePicker({ format : 'YYYY-MM-DD HH:mm', animation:true });
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

        //get_applicant_details();
        if(col == "profiled_for"){
            col = "profiled_for_id";
        }
        else if(col == "client"){
            col = "client_id";
        }
        else if(col == "status"){
            col = "status_id";
        }
        else if(col == "source"){
            col = "source_id";
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
                    var txt;
                    
                    if(col == "profiled_for_id"){
                        for(var i in $scope.data.jobpositions){
                            if($scope.data.jobpositions[i].pk == $scope.form[col]){
                                txt = $scope.data.jobpositions[i].position;
                            }
                        }
                    }
                    else if(col == "client_id"){
                        for(var i in $scope.data.clients){
                            if($scope.data.clients[i].pk == $scope.form[col]){
                                txt = $scope.data.clients[i].client;
                            }
                        }
                    }
                    else if(col == "status_id"){
                        for(var i in $scope.data.statuses){
                            if($scope.data.statuses[i].pk == $scope.form[col]){
                                txt = $scope.data.statuses[i].status;
                            }
                        }
                    }
                    else if(col == "source_id"){
                        for(var i in $scope.data.sources){
                            if($scope.data.sources[i].pk == $scope.form[col]){
                                txt = $scope.data.sources[i].source;
                            }
                        }
                    }
                    else if(col == "name"){
                        txt = $scope.form['last_name'] +", "+ $scope.form['first_name'] +" "+ $scope.form['middle_name'];
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
            // console.log(col);
            // console.log($scope.form[col]);
            // console.log($scope.modal.data);
            // console.log('rejected:' + value);
            var old_col;
            if(col == "profiled_for_id"){
                old_col = "profiled_for";
            }
            else if(col == "client_id"){
                old_col = "client";
            }
            else if(col == "status_id"){
                old_col = "status";
            }
            else if(col == "source_id"){
                old_col = "source";
            }

            var data = {};

            if(col == "name"){
                data['last_name'] = $scope.form['last_name'];
                data['first_name'] = $scope.form['first_name'];
                data['middle_name'] = $scope.form['middle_name'];
            }
            else {
                data[old_col] = $scope.form[col];
            }
            data['remarks'] = $scope.modal.data.remarks;
            data['applicant_id'] = $routeParams.id;
            data['employees_pk'] = $scope.profile.pk;

            var promise = ApplicantsFactory.update(data);
            promise.then(function(data){
                get_applicant_details();
                get_applicant_remarks();
            })

        });
    }

    function getsourcers(){
        var filters = {
                        'archived':'false'
                    };

        var promise = SourcesFactory.fetch(filters);
        promise.then(function(data){
            $scope.data.sources = data.data.result;

            get_applicant_details();
        })
    }

    function getjobpositions(){
        var filters = {
                        'archived':'false'
                    };

        var promise = JobsFactory.fetch(filters);
        promise.then(function(data){
            $scope.data.jobpositions = data.data.result;
        })
    }

    function getclients(){
        var filters = {
                        'archived':'false'
                    };

        var promise = ClientsFactory.fetch(filters);
        promise.then(function(data){
            $scope.data.clients = data.data.result;
        })
    }

    function getTA(){
        var filters = {
                        'title' : 'Talent Acquisition',
                        'archived':'false'
                    };

        var promise = EmployeesFactory.fetch(filters);
        promise.then(function(data){
            $scope.data.talent_acquisitions = data.data.result;
        })
    }

    function getstatuses(){
        var filters = {
                        'archived':'false'
                    };

        var promise = StatusesFactory.fetch(filters);
        promise.then(function(data){
            $scope.data.statuses = data.data.result;
        })   
    }

    $scope.update_status = function(){

        modal();
    }

    function modal(){
        $scope.modal.title = "Update Status";

        ngDialog.openConfirm({
            template: 'update_status_modal',
            className: 'ngdialog-theme-plain',
            preCloseCallback: function(value) {
                var nestedConfirmDialog = ngDialog.openConfirm({
                    template:
                            '<p>Are you sure you want to close the parent dialog?</p>' +
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
            console.log('resolved:' + value);
            // Perform the save here
        }, function(value){
            console.log('rejected:' + value);
        });
    }
});

