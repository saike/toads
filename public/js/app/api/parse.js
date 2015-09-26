(function(a){

  if(typeof a === 'undefined') return;

  a.module('parse', [])

    .service('parse', function($rootScope, $q, $interval){

      var self = this;

      self.data = {};

      self.parse_toad = function(toad_obj){
        return {
          video: toad_obj.get('video'),
          audio: toad_obj.get('audio'),
          title: toad_obj.get('title'),
          id: toad_obj.id,
          create_date: toad_obj.get('createdAt'),
          author: toad_obj.get('toader') ? self.parse_user(toad_obj.get('toader')) : false
        };
      };

      self.parse_user = function(user_obj){
        return {
          name: user_obj.get('name'),
          picture: user_obj.get('picture'),
          parse_obj: user_obj,
          toads_count: user_obj.get('toads_count') || 0
        };
      };

      self.init = function(){

        Parse.initialize("pOHHBHkqKmJVh8Og7zNdIqv2GJqYtp0GjFNOvpwr", "3BTyz6hDB9WApjCgjsvj6NqKGpAYYwNyDXR3Os5a");

        Parse.FacebookUtils.init({ // this line replaces FB.init({
          appId      : '696597687110703', // Facebook App ID
          cookie     : true,  // enable cookies to allow Parse to access the session
          xfbml      : true,  // initialize Facebook social plugins on the page
          version    : 'v2.4' // point to the latest Facebook Graph API version
        });

      };

      self.login = function(callback){

        Parse.FacebookUtils.logIn(null, {
          success: function(user) {
            $rootScope.$apply(function(){
              if (!user.existed()) {
                callback && callback(user);
              } else {
                callback && callback(user);
              }
            });
          },
          error: function(user, error) {
            console.log("User cancelled the Facebook login or did not fully authorize.");
          }
        });

      };

      self.logout = function(){
        Parse && Parse.User.logOut();
      };

      self.get_user_info = function(callback){
        console.log('get_info');
        var deffered_interval = $interval(function(){
          if(typeof FB !== 'undefined') {
            FB.api('/me', {fields: 'name,link,picture'}, function(response) {
              console.dir(response);
              $rootScope.$apply(function(){
                var cur_user = Parse.User.current();
                cur_user.set('picture', response.picture.data.url);
                cur_user.set('name', response.name);
                cur_user.save();
                callback && callback(response);
              });
            });
            $interval.cancel(deffered_interval);
          }
        }, 200);
      };

      self.create_toad = function(req_toad, callback){
        console.dir(req_toad);
        var Toad = Parse.Object.extend("Toad");
        var toad = new Toad();
        toad.set('video', req_toad.video);
        toad.set('audio', req_toad.audio);
        toad.set('title', req_toad.title || req_toad.video.title);
        toad.save(null, {
          success: function(newToad){
            console.log('Toad created successful');
            $rootScope.$apply(function(){
              callback && callback(self.parse_toad(newToad));
            });
          },
          error: function() {
            console.dir('Toad save error');
          }
        });

      };

      self.get_toad_list = function(search_query, callback){
        var Toad = Parse.Object.extend("Toad");
        var query = new Parse.Query(Toad);
//        query.equalTo("title", search_query);
        var deferred = $q.defer();
        query.matches('title', new RegExp(search_query.query || ''), "i");
        if(search_query.toader) {
          query.equalTo('toader', search_query.toader);
        }
        query.descending("createdAt");
        query.include("toader");
        query.find({
          success: function(results) {
            var items = [];
            $rootScope.$apply(function(){
              Parse._objectEach(results, function(v, k) {
                items[k] = self.parse_toad(v);
              });
              self.data.toads = items;
              deferred.resolve(items);
              callback && callback(items);
            });
          },
          error: function(error) {
            console.log("Error: " + error.code + " " + error.message);
            deferred.reject(error);
          }
        });

        return deferred.promise;

      };

      self.get_toad = function(t_id, callback){
        var Toad = Parse.Object.extend("Toad");
        var query = new Parse.Query(Toad);
        var deferred = $q.defer();

        query.get(t_id, {
          success: function(res_toad) {
            var items = [];
            $rootScope.$apply(function(){
              var toad = self.parse_toad(res_toad);
              self.data.toad = toad;
              deferred.resolve(toad);
              callback && callback(toad);
            });
          },
          error: function(error) {
            console.log("Error: " + error.code + " " + error.message);
            deferred.reject(error);
          }
        });

        return deferred.promise;
      };

    })

}(angular));
