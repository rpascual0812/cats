// app.directive('fileModel', ['$parse', function ($parse) {
//     return {
//         restrict: 'A',
//         link: function(scope, element, attrs) {
//             var model = $parse(attrs.fileModel);
//             var modelSetter = model.assign;
            
//             element.bind('change', function(){
//                 scope.$apply(function(){
//                     modelSetter(scope, element[0].files[0]);
//                 });
//             });
//         }
//     };
// }]);

// app.service('fileUpload', ['$http', function ($http) {
//     this.uploadFileToUrl = function(file, uploadUrl){
//         var fd = new FormData();
//         fd.append('file', file);
//         $http.post(uploadUrl, fd, {
//             transformRequest: angular.identity,
//             headers: {'Content-Type': undefined}
//         })
//         .success(function(data){
//             console.log(data);
//         })
//         .error(function(){
//         });
//     }
// }]);

app.controller('Tracker', function(
                                        $scope,
                                        ApplicantsFactory,
                                        SourcesFactory,
                                        JobsFactory,
                                        ClientsFactory,
                                        EmployeesFactory,
                                        SessionFactory,
                                        $timeout,
                                        md5,
                                        // fileUpload,
                                        Upload, $timeout,
                                        UINotification,
                                        ngDialog
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
        talent_acquisition: ''
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

    $scope.details = {};
    $scope.details.otheroptions = false;

    init();

    function init(){
        var promise = SessionFactory.getsession();
        promise.then(function(data){
            var _id = md5.createHash('pk');
            $scope.pk = data.data[_id];

            get_profile();
            getsources();
            getjobpositions();
            getclients();
            getTA();
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
        var filters = {
                        'title' : 'Talent Acquisition',
                        'archived':'false'
                    };

        var promise = EmployeesFactory.fetch(filters);
        promise.then(function(data){
            var a = data.data.result;
            $scope.data.talent_acquisitions = [];
            for(var i in a){
                $scope.data.talent_acquisitions.push({   
                                            pk: a[i].pk,
                                            name: a[i].first_name + ' ' + a[i].middle_name + ' ' + a[i].last_name,
                                            ticked: false
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

        $scope.form.source = $scope.form.source[0].pk;
        $scope.form.profiled_for = $scope.form.profiled_for[0].pk;
        $scope.form.client = $scope.form.client[0].pk;
        $scope.form.talent_acquisition = $scope.form.talent_acquisition[0].pk;

        $scope.form.cv = $scope.cv;
        var error=0;
        for(var i in $scope.form){
            if($scope.form[i].replace(/\s/g,'') == ""){
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

    // $scope.uploadFile = function(){
    //     var file = $scope.myFile;
        
    //     var uploadUrl = "./FUNCTIONS/Tracker/upload.php";
    //     fileUpload.uploadFileToUrl(file, uploadUrl);

    //     if(fileUpload){
    //         console.log(upload_return);
    //     }        
    // };

    $scope.reset = function(){
        $scope.form = {};
        $scope.data = {};

        $scope.pk = null;
        $scope.profile = {};

        $scope.details = {};
        $scope.details.otheroptions = false;

        $(".select2-selection__rendered").empty();

        getsourcers();
        getjobpositions();
        getclients();
        getTA();

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


        // file.upload = Upload.upload({
        //     url: "./FUNCTIONS/Tracker/upload.php",
        //     data: {file: file, username: $scope.username},
        // });

        // file.upload.then(function (response) {
        //     $timeout(function () {
        //         file.result = response.data;
        //         console.log(response.data);
        //     });
        // }, function (response) {
        //     if (response.status > 0)
        //         $scope.errorMsg = response.status + ': ' + response.data;
        // }, function (evt) {
        //     // Math.min is to fix IE which reports 200% sometimes
        //     file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
        // });
    }
});
