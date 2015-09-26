(function(){

  //initiation of app
  window.onload = function(){
    angular.bootstrap(document.body, ['videotoad']);
  };

  angular.module('videotoad', [

    'parse',
    'videotoad.routes',
    'videotoad.swamp',
    'videotoad.toad',
    'videotoad.users'

  ])

    .run(function(youtube, parse, auth, $rootScope){
      youtube.init();
      parse.init();
      auth.init();

      $rootScope.layout = {
        opened_profile: false
      };

    })

    .config(function($interpolateProvider){
      $interpolateProvider.startSymbol('[[').endSymbol(']]');
    })

    .directive('videoSearch', function(youtube, $rootScope){
      return {
        restrict: 'E',
        replace: true,
        templateUrl: 'html/video_search.html',
        scope: true,
        link: function(scope, elm, attrs){

          scope.query = '';

          scope.items = [];

          scope.search = function(){
            youtube.search(scope.query, function(res){
              console.dir(res.items);
              scope.items = res.items;
            });
          };

          scope.close_search = function(){
            scope.onClose && scope.onClose(scope.items);
          };

          scope.insert_video = function(item){
            $rootScope.$broadcast('video_search:insert_video', { type: attrs.type || 'video', item: item });
          };

        }
      };
    })

    .directive('layout', function($rootScope){
      return {
        restrict: 'A',
        scope: true,
        link: function(scope){

          scope.state = {
            profile: false
          };

          scope.$on('layout:profile:toggle', function(){
            scope.state.profile = !scope.state.profile;
          });

          $rootScope.$on('$routeChangeSuccess', function(){
            scope.state.profile = false;
          });

        }
      };
    })

    .service('youtube', function($rootScope){

      var self = this;

      self.inited = false;

      self.errors = {
        not_loaded: function(){
          alert('Youtube search api not loaded');
        }
      };

      self.init = function(callback){
        if(typeof gapi !== 'undefined'){
          gapi.client.setApiKey('AIzaSyDYZ1NHJM90K6Miq3bRtwvFCWM_tkyfW6M');
          gapi.client.load('youtube', 'v3', function(){
            self.inited = true;
            callback && callback();
          });
        }
        else {
          self.errors.not_loaded();
        }
      };

      self.search = function(query, callback){

        if(self.inited){
          var req = gapi.client.youtube.search.list({
            part: 'snippet',
            type: 'video',
            q: query.replace(/%20/g, '+'),
            maxResults: 30
          });

          req.execute(function(res){
            $rootScope.$apply(function(){
              callback && callback(res);
            });
          });
        }
        else {
          self.errors.not_loaded();
        }

      };

    })

    .directive('navToggle', function($rootScope){
      return {
        restrict: 'A',
        scope: true,
        link: function(scope, elm){
          elm.on('click', function(){
            scope.$apply(function(){
              $rootScope.$broadcast('layout:profile:toggle');
            });
          });
        }
      };
    })

    .directive('clickSelect', function(){
      return {
        restrict: 'A',
        scope: false,
        link: function(scope, elm){
          elm.on('click', function(){
            elm[0].select();
          });
        }
      };
    });

}());
