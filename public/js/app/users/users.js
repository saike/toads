(function(a){

  if(typeof a === 'undefined') return;

  a.module('videotoad.users', [])

    .directive('profile', function(auth, parse, $location, routes){
      return {
        restrict: 'E',
        replace: true,
        templateUrl: 'html/users/profile.html',
        scope: true,
        link: function(scope){

          scope.user = auth.get_user();

          scope.create_toad = function(){
            $location.url(routes.toad.create.urls[0]);
          };

          scope.logout = function(){
            auth.logout();
            scope.user = auth.get_user();
          };

          scope.login = function(){
            auth.login(function(){
              scope.user = auth.get_user();
            });
          };

          parse.get_user_info(function(){
            scope.user = auth.get_user();
          });

          console.dir(scope.user);

        }
      };
    })

    .service('auth', function(parse){

      var self = this;

      var user = false;

      self.init = function(){
        if(Parse.User.current()){
          user = Parse.User.current();
        }
      };

      self.get_user = function(){
        return user ? parse.parse_user(user) : false;
      };

      self.login = function(callback){
        parse.login(function(log_user){
          user = log_user;
          callback && callback(log_user);
        });
      };

      self.logout = function(){
        parse.logout();
        user = false;
      }

    });

}(angular));
