 (function () {

   'use strict';
   angular.module('MyTime').service('storageService', storageService);

   storageService.$inject = ['$rootScope', '$q', '$localStorage'];

   function storageService($rootScope, $q, $localStorage) {
     var timeObjectStore;
     var storageInitialized = false;
     var storageStatus = -1; /* -1 storage not accecssed, 0, storage is initializing, 1 storage intialized */
     var deferredSet = [];

     //initialize();
     return {
       //initialize: initialize,
       saveValue: saveValue,
       getValue: getValue,
       saveObject: saveObject,
       getObject: getObject,
       getFromLocalStorage: getFromLocalStorage,
       removeFromLocalStorage: removeFromLocalStorage,
       removeObjectFromIndex: removeObjectFromIndex,
       clearLocalStorage: clearLocalStorage
     }

     //     function createSchema_() {
     //       var ds = lf.schema.create('myTime', 1);
     //
     //       //console.log("inside create schema");
     //
     //       ds.createTable('Expiry').
     //       addColumn('name', lf.Type.STRING).
     //       addColumn('dateOfExpiry', lf.Type.DATE_TIME).
     //       addPrimaryKey(['name']);
     //
     //       ds.createTable('dealsByID').
     //       addColumn('id', lf.Type.STRING).
     //       addColumn('curator', lf.Type.STRING).
     //       addColumn('email', lf.Type.STRING).
     //       addColumn('phone', lf.Type.STRING).
     //       addColumn('researchArea', lf.Type.STRING).
     //       addPrimaryKey(['id']);
     //
     //       return ds;
     //     }
     //
     //     function initialize() {
     //       var deferred = $q.defer();
     //       if (storageStatus == -1) {
     //         storageStatus = 0;
     //         deferredSet.push(deferred);
     //         createSchema_().getInstance(undefined, false).then(
     //           function (database) {
     //             timeObjectStore = database;
     //             //console.log("Local storage initialized");
     //             storageStatus = 1;
     //             storageReady();
     //           }
     //         );
     //         return deferred.promise;
     //       } else if (storageStatus == 0) {
     //         deferredSet.push(deferred);
     //         return deferred.promise;
     //       } else {
     //         return;
     //       }
     //
     //     }
     //
     //     function storageReady() {
     //       storageInitialized = true;
     //       _.each(deferredSet, function (deferred) {
     //         deferred.resolve(storageInitialized);
     //       });
     //
     //     }
     //
     //     //function to update the expiry date
     //     function _updateExpiryDate(tableName, expiryDays) {
     //       var expiryDays = (typeof (expiryDays) == 'undefined') ? 7 : expiryDays;
     //       var table = timeObjectStore.getSchema().table('Expiry');
     //       var row = {};
     //       row.name = tableName;
     //       var now = new Date();
     //       row.dateOfExpiry = new Date(now);
     //       row.dateOfExpiry.setDate(now.getDate() + expiryDays);
     //       row.dateOfExpiry.setHours(0, 0, 0, 0); //hour, min, sec, millisec
     //       var r = table.createRow(row);
     //       timeObjectStore.insertOrReplace().into(table).values([r]).exec();
     //     }
     //
     //     //check if a give data is expired
     //     function checkDataExpired(tableName) {
     //       var now = new Date();
     //       var expirytable = timeObjectStore.getSchema().table('Expiry');
     //       var deferred = $q.defer();
     //       timeObjectStore.select()
     //         .from(expirytable)
     //         .where(expirytable.name.eq(tableName))
     //         .limit(1)
     //         .exec()
     //         .then(function (rows) {
     //           var expired = true;
     //           if ((typeof (rows) != 'undefined') && (rows.length > 0)) {
     //             var expiryDate = new Date(rows[0].dateOfExpiry);
     //             var now = new Date();
     //             expired = (expiryDate <= now);
     //             //console.log("now : " + now);
     //             //console.log("expiryDate : " + expiryDate);
     //           }
     //           //console.log("Found the row : " + rows[0]);
     //           deferred.resolve(expired);
     //         });
     //       return deferred.promise
     //     }


     function saveValue(key, value) {
       $localStorage[key] = value;
     }

     function getValue(key, defaultValue) {
       return $localStorage[key] || defaultValue;
     }

     function saveObject(key, value) {
       $localStorage[key] = JSON.stringify(value);
     }

     function getObject(key) {
       return JSON.parse($localStorage[key] || '{}');
     }

     function getFromLocalStorage() {
       return $localStorage;
     }

     function removeFromLocalStorage(keys) {
       $.each(keys, function (i, key) {
         delete $localStorage[key];
       });
     }

     function removeObjectFromIndex(key, idx) {
       var tmp = JSON.parse($localStorage[key]);
       delete tmp[idx];
       $localStorage[key] = JSON.stringify(_.compact(tmp));
     }


     function clearLocalStorage() {
       $localStorage.$reset();
     }
   }

 })();
