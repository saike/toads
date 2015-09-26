(function(a){

  if(typeof a === 'undefined') return;

  a.module('videotoad.swamp', [])

    .controller('SwampList', function($scope){

    })

    .controller('SwampMe', function($scope, auth){

      $scope.user = auth.get_user().parse_obj;

    })

    .directive('swamp', function(parse, $rootScope){
      return {
        restrict: 'E',
        replace: true,
        templateUrl: 'html/swamp/swamp.html',
        scope: {
          user: '=?'
        },
        link: function(scope){

          scope.toads = [];

          scope.search = {
            query: '',
            toader: scope.user || false
          };

          scope.get_list = function(){
            parse.get_toad_list(scope.search, function(items){
              console.dir(items);
              scope.toads = items;
            });
          };

          scope.get_list();

        }
      };
    })

    .directive('navigator', function(routes, routeFilter){
      return {
        restrict: 'E',
        replace: true,
        templateUrl: 'html/swamp/navigator.html',
        scope: true,
        link: function(scope){

          scope.directions = [
            {
              url: routeFilter('swamp.list.urls[0]', {}),
              title: 'Home'
            },
            {
              url: routeFilter('swamp.me.urls[0]', {}),
              title: 'My Swamp'
            }
          ];


        }
      };
    });

}(angular));
