app.controller('RequisitionEdit', function(
                                        $scope,
                                        SessionFactory,
                                        EmployeesFactory,
                                        RequestFactory,
                                        JobsFactory,
                                        UINotification,
                                        $timeout,
                                        md5,
                                        ngDialog,
                                        $routeParams
                                    ){

    $scope.pk = null;
    $scope.profile = {};
    $scope.form = {};

    $scope.filter = {};

    $scope.data = {};

    $scope.request = {};

    $scope.modal = {};

    $scope.display = {
        alternate_title : {
            text : true,
            input : false
        },
        job_position : {
            text : true,
            input : false
        },
        needed : {
            text : true,
            input : false
        },
        end_date : {
            text : true,
            input : false
        }
    }

    $scope.label = {
        profile : "Profile",
        needed : "Number of applicants needed",
        end_date : "Target End Date"
    };

    $scope.timer = {};
    $scope.timer.endtime = null;
    $scope.timer.bg1 = 'bg-blue1';
    $scope.timer.bg2 = 'bg-blue2';

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

            request();
        })
    }

    function request(){
        var filters = {
                        'requisition_id' : $routeParams.id
                    };

        var promise = RequestFactory.request(filters);
        promise.then(function(data){
            $scope.request = data.data.result[0];
            
            $scope.request.end_date = $scope.request.end_date.substring(0, $scope.request.end_date.length -3);
            get_remarks();
            getjobpositions();

            initializeClock('clockdiv');
        })
        .then(null, function(data){
            
        });
    }

    /*
    TIMER
    */
    function getTimeRemaining(endtime) {
        var t = Date.parse(endtime) - Date.parse(new Date());
        var seconds = Math.floor((t / 1000) % 60);
        var minutes = Math.floor((t / 1000 / 60) % 60);
        var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
        var days = Math.floor(t / (1000 * 60 * 60 * 24));
        
        return {
            'total': t,
            'days': days,
            'hours': hours,
            'minutes': minutes,
            'seconds': seconds
        };
    }

    function initializeClock(id) {
        $scope.timer.endtime = new Date(Date.parse(new Date($scope.request.end_date)));

        var clock = document.getElementById(id);
        var daysSpan = clock.querySelector('.days');
        var hoursSpan = clock.querySelector('.hours');
        var minutesSpan = clock.querySelector('.minutes');
        var secondsSpan = clock.querySelector('.seconds');
        
        function updateClock() {
            var t = getTimeRemaining($scope.timer.endtime);

            if(t.total < 0){
                daysSpan.innerHTML = '0';
                hoursSpan.innerHTML = '0';
                minutesSpan.innerHTML = '0';
                secondsSpan.innerHTML = '0';

                $scope.timer.bg1 = 'bg-red1';
                $scope.timer.bg2 = 'bg-red2';
            }
            else {
                daysSpan.innerHTML = t.days;
                hoursSpan.innerHTML = ('0' + t.hours).slice(-2);
                minutesSpan.innerHTML = ('0' + t.minutes).slice(-2);
                secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);    
            }
            
            if (t.total <= 0) {
                clearInterval(timeinterval);
            }
        }

        clearInterval(timeinterval);
        var timeinterval = setInterval(updateClock, 1000);
        updateClock();
    }
    /*
    END OF TIMER
    */

    function getjobpositions(){
        var filters = {
                        'archived':'false'
                    };

        var promise = JobsFactory.fetch(filters);
        promise.then(function(data){
            var a = data.data.result;
            $scope.data.jobpositions = [];

            for(var i in a){
                var ticked = false;
                
                if(a[i].pk == $scope.request.job_positions_pk){
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

    $scope.edit_field = function(col){
        $scope.display[col].text = false;
        $scope.display[col].input = true;

        $('#formedit_end_date').bootstrapMaterialDatePicker({ format : 'YYYY-MM-DD HH:mm', animation:true });
        $('.icon-close').hide();
    }

    $scope.cancel_edit = function(col){
        $scope.display[col].text = true;
        $scope.display[col].input = false;

        request();
    }

    function get_remarks(){
        var filter = {
            requisitions_pk : $scope.request.pk
        };

        var promise = RequestFactory.remarks(filter);
        promise.then(function(data){
            $scope.remarks = data.data.result;
        });
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
                    if(col == "profile"){
                        for(var i in $scope.data.jobpositions){
                            if($scope.data.jobpositions[i].pk == $scope.request['profile_pk']){
                                txt = $scope.data.jobpositions[i].name;
                            }
                        }
                    }
                    else {
                        txt = $scope.request[col];
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
            request();
        }, function(value){
            var data = {};
            
            if(typeof($scope.form[col]) == 'object'){
                data[col] = parseInt($scope.form[col][0].pk);
            }
            if(col == 'needed'){
                data['total'] = $scope.request[col];
            }
            else {
                data[col] = $scope.request[col];
            }

            data['requisitions_pk'] = $scope.request.pk;
            data['remarks'] = $scope.modal.data.remarks;
            data['requisition_id'] = $routeParams.id;
            data['employees_pk'] = $scope.profile.pk;
            
            var promise = RequestFactory.update(data);
            promise.then(function(data){
                UINotification.success({
                                    message: $scope.request.profile + ' has been successfully updated.', 
                                    title: 'SUCCESS', 
                                    delay : 5000,
                                    positionY: 'top', positionX: 'right'
                                });

                request();
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

    $scope.save_remarks = function(){
        var data = {
            requisitions_pk : parseInt($scope.request.pk),
            post : $scope.post,
            employees_pk : parseInt($scope.profile.pk)
        };

        var promise = RequestFactory.update(data);
        promise.then(function(data){
            $scope.post = '';
            get_remarks();
        })
    }
});