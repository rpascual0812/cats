var app = angular.module('onload', [
                                    'ngRoute',
                                    'ngCookies',
                                    'angular-md5',
                                    'ngDialog',
                                    'ui-notification',
                                    'angucomplete-alt',
                                    'isteven-multi-select',
                                    'ngFileUpload',
                                    'ngTagsInput',
                                    'bw.paging'
                                ]);

app.config(function($routeProvider){
    $routeProvider
    .when('/',
    {
        controller: 'Dashboard',
        templateUrl: 'partials/dashboard/index.html'
    })
    .when('/candidate/new',
    {
        controller: 'Tracker',
        templateUrl: 'partials/tracker/index.html'
    })
    .when('/candidate/:id',
    {
        controller: 'Applicant',
        templateUrl: 'partials/applicant/index.html'
    })
    .when('/candidates/list',
    {
        controller: 'ReportDump',
        templateUrl: 'partials/reports/dump.html'
    })
    .when('/request/create',
    {
        controller: 'Request',
        templateUrl: 'partials/request/create.html'
    })
    .when('/request/new',
    {
        controller: 'Request',
        templateUrl: 'partials/request/create.html'
    })
    .when('/request/list',
    {
        controller: 'Requisitions',
        templateUrl: 'partials/request/list.html'
    })
    .when('/request/:id',
    {
        controller: 'RequisitionEdit',
        templateUrl: 'partials/request/edit.html'
    })
    .when('/admin/permission',
    {
        controller: 'Permission',
        templateUrl: 'partials/admin/permission.html'
    })
    .when('/admin/clients',
    {
        controller: 'Clients',
        templateUrl: 'partials/admin/clients.html'
    })
    .when('/admin/sources',
    {
        controller: 'Sources',
        templateUrl: 'partials/admin/sources.html'
    })
    .when('/admin/profiles',
    {
        controller: 'Profiles',
        templateUrl: 'partials/admin/profiles.html'
    })
    .when('/admin/groups',
    {
        controller: 'Groups',
        templateUrl: 'partials/admin/groups.html'
    })
    .when('/calendar',
    {
        controller: 'Calendar',
        templateUrl: 'partials/calendar/index.html'
    })
    .otherwise(
    {
        redirectTo: '/'
    })
});

// function contains(a, obj) {
//     var i = a.length;
//     while (i--) {
//         if (a[i] === obj) {
//             return true;
//         }
//     }

//     return false;
// }