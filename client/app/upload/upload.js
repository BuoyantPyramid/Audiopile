angular
    .module('jam.upload', [])
    .controller('UploadController', function($window, $scope, FileUploader) {

        $scope.uploader = new FileUploader();

        var jwt = $window.localStorage.getItem('com.jam');
        if (jwt) {        
          $scope.uploader.headers['x-access-token'] = jwt;
        }
        $scope.uploader.headers['Allow-Control-Allow-Origin'] = '*';

        $scope.uploader.removeAfterUpload = true;
        $scope.options = {
          'url': '/api/upload',
          'queueLimit': 5
        }

        $scope.uploader.onAfterAddingFile = function(item) {
          console.log('After Adding File!: show upload all button');
        }

        $scope.uploader.onWhenAddingFileFailed = function(item, filter, options) {
          console.log('Adding File Failed!');
        }

        $scope.uploader.onAfterAddingAll = function(addedItems) {
          console.log('After adding all!');
        }

        $scope.uploader.onBeforeUploadItem = function(item) {
          console.log('Before upload item!');
        }

        $scope.uploader.onProgressItem = function(item, progress) {
          console.log('on Progress Item!', progress);
        }

        $scope.uploader.onSuccessItem = function(item, response, status, headers) {
          console.log('On success item!');
        }

        $scope.uploader.onErrorItem = function(item, response, status, headers) {
          console.log('on error item!');
        }

        $scope.uploader.onCancelItem = function(item, response, status, headers) {
          console.log('on cancel item!');
        }

        $scope.uploader.onCompleteItem = function(item, response, status, headers) {
          console.log('On complete item!');
        }

        $scope.uploader.onProgressAll = function(progress) {
          console.log('on progress all!');
        }

        $scope.uploader.onCompleteAll = function() {
          console.log('on complete all!: Hide Upload all button');
        }

    });