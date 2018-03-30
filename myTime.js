angular.module('MyTime', ['ui.router', 'ui.bootstrap', 'ngDialog', 'ngclipboard', 'ngStorage'])
  .constant('Config', {
    GetCompanyDetails: 'https://www.mytime.com/api/mkp/v1/companies/',
  })
  .config(['$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {
      $urlRouterProvider.otherwise('/');
      $stateProvider
        .state("company", {
          url: "/company?companyID",
          templateUrl: "myTime.html"
        });
    }])
  .controller('MyTimeController', ['$scope', '$http', '$q', '$location', '$anchorScroll', '$state', '$window', '$timeout', 'Config', 'ngDialog', 'storageService', function ($scope, $http, $q, $location, $anchorScroll, $state, $window, $timeout, Config, ngDialog, storageService) {
    $scope.reBuildTabs = false;
    $scope.company = {};
    $scope.locations = [];
    $scope.deals = [];
    $scope.error = false;
    var spinnerWindow;
    var dealsAndVariationsModal;

    //function to get company information and all all details
    function loadCompanyDetails(companyID) {
      var msg = '';
      if (_.isEmpty(storageService.getObject('companyLocations'))) {
        msg = 'Please wait while we load everything for offline mode...';
        showSpinnerDialog(msg);
        saveCompanyDataToLocalStorage_(companyID).then(function (data) {
          console.log(data);
          $scope.reBuildTabs = true;
          if (data) closeSpinnerDialog();
          else closeSpinnerDialog();
        });
      } else $scope.locations = storageService.getObject('companyLocations');
      console.log(companyID);
      if (_.isEmpty(msg)) showSpinnerDialog('Please wait while offline mode is loading');
      $http({
        method: 'GET',
        url: Config.GetCompanyDetails + companyID,
      }).then(function (response) {
        console.log(response.data.company);
        $scope.company = response.data.company;
        //saveCompanyDataToLocalStorage_(companyID);
        //get locations old imp
        //        $http({
        //          method: 'GET',
        //          url: Config.GetCompanyDetails + companyID + '/locations',
        //        }).then(function (response) {
        //          console.log(response);
        //          $scope.locations = $.extend(true, [], response.data.locations);
        //          reBuildTabs = true;
        //        });
        if (_.isEmpty(msg)) {
          $scope.reBuildTabs = true;
          closeSpinnerDialog();
        }
      }, function (error) {
        closeSpinnerDialog();
        $scope.error = true;
        $scope.reBuildTabs = false;
        $scope.company = {};
        $scope.locations = [];
        $scope.deals = [];
        alert("Not a valid CompanyID");
      });
    };

    //fucnction tab select
    $scope.locationSelect = function (companyID, locationID) {
      console.log(locationID);
      console.log(storageService.getObject(locationID));
      //employees per location & deals
      if (isEmpty(locationID)) return;
      //employees
      if (!_.isEmpty(storageService.getObject(locationID))) $scope.employees = storageService.getObject(locationID);
      if (_.isEmpty(storageService.getObject(locationID))) {
        $timeout(function () {
          $scope.employees = storageService.getObject(locationID);
        }, 500);
      }

      //old method
      //      getEmployeeList_(companyID, locationID).then(function (emp) {
      //        $scope.employees = emp;
      //        console.log($scope.employees);
      //
      //        //saving list of all the services of each employee to localStorage based on emp ID
      //        $.each($scope.employees, function (i, employee) {
      //          if (_.isEmpty(storageService.getObject(employee.id))) {
      //            $http({
      //              method: 'GET',
      //              url: Config.GetCompanyDetails + companyID + '/deals?location_ids=' + locationID + '&employee_ids=' + employee.id,
      //            }).then(function (response) {
      //              //console.log(response.data.deals);
      //              storageService.saveObject(employee.id, response.data.deals);
      //            });
      //          }
      //        });
      //      });
    }

    $scope.openDealsModal = function () {

    }

    //function that takes company ID to give all the details to save at once in local storage
    function saveCompanyDataToLocalStorage_(companyID) {
      var deferred = $q.defer();
      if (!_.isEmpty(storageService.getValue('companyID')) && _.isEmpty(storageService.getObject('companyLocations'))) {
        $http({
          method: 'GET',
          url: Config.GetCompanyDetails + companyID + '/locations',
        }).then(function (response) {
          if (_.isEmpty(storageService.getObject('companyLocations'))) $scope.locations = $.extend(true, [], response.data.locations);
          storageService.saveObject('companyLocations', response.data.locations);
          reBuildTabs = true;
          $.each(response.data.locations, function (i, location) {
            $http({
              method: 'GET',
              url: Config.GetCompanyDetails + companyID + '/employees?location_ids=' + location.id,
            }).then(function (response) {
              storageService.saveObject(location.id, response.data.employees);
              $.each(response.data.employees, function (i, employee) {
                if (_.isEmpty(storageService.getObject(employee.id))) {
                  $http({
                    method: 'GET',
                    url: Config.GetCompanyDetails + companyID + '/deals?location_ids=' + location.id + '&employee_ids=' + employee.id,
                  }).then(function (response) {
                    storageService.saveObject(employee.id, response.data.deals);

                    //pricing
                    if (!_.isEmpty(storageService.getObject(employee.id))) {
                      $http({
                        method: 'GET',
                        url: Config.GetCompanyDetails + companyID + '/pricings?location_ids=' + location.id + '&employee_ids=' + employee.id,
                      }).then(function (response) {
                        var addPrice = [];
                        addPrice = storageService.getObject(employee.id);
                        //console.log(addPrice);
                        $.each(addPrice, function (i, deal) {
                          if (!_.isEmpty(deal.variations)) {
                            $.each(deal.variations, function (j, v) {
                              $.each(response.data.pricings, function (k, price) {
                                if (v.id == price.variation_id) {
                                  v.new_min_price = price.new_min_price;
                                  v.new_list_price = price.new_list_price;
                                  v.existing_list_price = price.existing_list_price;
                                  v.existing_min_price = price.existing_min_price;
                                  v.promoting = price.promoting;
                                  storageService.saveObject(employee.id, addPrice);
                                }
                              });
                            });
                          }
                        });
                        deferred.resolve(true);
                      });
                    }
                  });
                }
              });
            });
          });
        });
      } else {
        if (!_.isEmpty(storageService.getObject('companyLocations'))) $scope.locations = storageService.getObject('companyLocations');
        deferred.resolve(false);
      }
      return deferred.promise;
    }

    // function to return list of employees
    function getEmployeeList_(companyID, locationID) {
      var deferred = $q.defer();
      if (isEmpty(companyID) || isEmpty(locationID)) {
        deferred.resolve([]);
      }
      showSpinnerDialog();
      $http({
        method: 'GET',
        url: Config.GetCompanyDetails + companyID + '/employees?location_ids=' + locationID,
      }).then(function (response) {
        console.log(response.data.employees);
        deferred.resolve(response.data.employees);
        closeSpinnerDialog();
      });
      return deferred.promise;
    }

    //function to check if a given object is empty
    function isEmpty(obj) {
      if (obj == null) return true;
      if (_.isString(obj)) obj = $.trim(obj);
      if (_.isNumber(obj)) {
        // if (_.isEmpty(obj)) return true;
        if (obj == -1) return true;
        else return false;
      }
      return _.isEmpty(obj);
    };

    // to check is number is -1(empty)
    $scope.isNumberEmpty = function (num) {
      if (num == -1) return true;
      return s.isBlank(num);
    }

    //handle the change in states
    $scope.$on('$stateChangeStart',
      function (event, toState, toParams) {
        //console.log(toParams);
        if (toState.name == 'company') {
          $scope.reBuildTabs = false;
          $scope.error = false;
          //clearing local storage if companyID changed --
          if (toParams.companyID !== storageService.getValue('companyID')) storageService.clearLocalStorage();
          if (!_.isEmpty(toParams.companyID)) {
            storageService.saveValue('companyID', toParams.companyID);
            //saveCompanyDataToLocalStorage_(toParams.companyID);
          }
          //load data and screen
          loadCompanyDetails(toParams.companyID);
        }
      });

    //function to check if an obj is visible
    $scope.isVisible = function (obj) {
      if (obj == 0) return false;
      if (obj == -1) return false;
      if (typeof (obj) == 'undefined')
        return false;
      if (typeof (obj) == 'string') {
        if ($.trim(obj).length == 0)
          return false;
      }
      if (!_.isEmpty(obj)) {
        var k = _.keys(obj);
        if (k.length == 1 && k[0] == 'id') return false;
      }
      if (_.isArray(obj) && $.trim(obj).length == 0) return false;
      return true;
    }

    //open the SpinnerWindow dialog
    function showSpinnerDialog(msg) {
      //console.log("open Spinner dialog");
      spinnerWindow = ngDialog.open({
        template: '<div class="container-fluid"><div class="row"><div class="col-sm-12"><center><img height="100" width="100" src="assets/myTime.png" alt="Loading.." /></center>' + msg + '</div></div></div>',
        plain: true,
        className: 'ngdialog-theme-custom',
        showClose: false,
        closeByEscape: false,
        closeByDocument: false
      });
    }
    //close the SpinnerWindow dialog
    function closeSpinnerDialog() {
      spinnerWindow.close();
    }

    //open deals/variations dialog
    $scope.OpenDealsAndVariationsModal = function (employee, employeeID, locationID, companyID) {
      var deals = {};
      deals.employee = employee;
      deals.employeeID = employeeID;
      deals.locationID = locationID;
      deals.companyID = companyID;

      $scope.deals = storageService.getObject(deals.employeeID);

      dealsAndVariationsModal = ngDialog.open({
        template: 'DealsAndVariationsTemplate',
        className: 'ngdialog-theme-custom',
        showClose: false,
        backdrop: true,
        closeByEscape: true,
        //controller: 'DealsController',
        closeByDocument: false,
        size: 'sm',
        appendTo: '#body',
        data: deals,
        scope: $scope
      });
    }
    //open deals/variations dialog
    $scope.closeDealsAndVariationsModal = function () {
      dealsAndVariationsModal.close();
    }
      }]);
