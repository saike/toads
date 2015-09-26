(function(a){

  if(typeof a === 'undefined') return;

  a.module('videotoad.routes', [ 'ngRoute' ])

    .constant('routes', {
      swamp: {
        list: {
          urls: [ '/', '/swamp', '/swamp/list' ],
          template: 'swamp/list.html',
          controller: 'SwampList'
        },
        me: {
          urls: [ '/me', '/swamp/me' ],
          template: 'swamp/me.html',
          controller: 'SwampMe'
        }
      },
      toad: {
        show: {
          urls: [ '/toad', '/toad/show' ],
          template: 'toad/show.html',
          controller: 'ToadShow',
          resolve: {
            get_toad: function(parse, $route){
              var t_id = $route.current.params.id;
              return parse.get_toad(t_id);
            }
          }
        },
        create: {
          urls: [ '/toad/create' ],
          template: 'toad/show.html',
          controller: 'ToadCreate',
          resolve: {}
        }
      }
    })

    .config(function($routeProvider, routes){

      var templates_url = 'html/';

      for(var m in routes) {

        var module = routes[m];

        for(var p in module) {

          var page = module[p];

          for(var u in page.urls) {

            var url = page.urls[u];

            $routeProvider.when(url, {
              resolve: page.resolve,
              templateUrl: templates_url + page.template,
              controller: page.controller
            });

          }

        }

      }

      $routeProvider.otherwise({
        redirectTo: '/'
      });

    })

    .service('route', function(){

      var self = this;


    })

    .filter('route', function (routes, $parse) {
      return function (key, params) {
        var getter = $parse(key);
        var url = (getter(routes) || routes.swamp.list.urls[0]);
        if(params){
          url += '?';
          for(var i in params){
            url += i + '=' + params[i] + '&';
          }
          url = url.slice(0,-1)
        }
        return '#' + url;
      };
    });

}(angular));
