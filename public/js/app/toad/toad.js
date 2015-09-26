(function(a){

  if(typeof a === 'undefined') return;

  a.module('videotoad.toad', [])

    .controller('ToadShow', function($scope, parse, $location, routes){

      $scope.toad = parse.data.toad || $location.path(routes.swamp.list.urls[0]);

    })

    .controller('ToadCreate', function($scope, parse, toad){

      $scope.toad = toad.create();

    })

    .service('toad', function(){

      var self = this;

      self.create = function(){
        return {
          audio: false,
          video: false,
          title: 'New toad'
        };
      };

    })

    .directive('toad', function($timeout, auth, parse, toad, $location, routes){
      return {
        restrict: 'E',
        replace: true,
        scope: {
          toad: '=?'
        },
        templateUrl: 'html/toad/toad.html',
        link: function(scope, elm){

          scope.toad = scope.toad || toad.create();

          scope.is_playing = false;

          scope.show_video_tools = true;

          scope.tools_opened = false;

          scope.video_search = false;

          scope.audio_search = false;

          scope.toggle_tools = function(){
            scope.tools_opened = !scope.tools_opened;
          };

          scope.$watch('toad', function(){
            scope.make_toad();
          });

          scope.get_user = function(){
            return auth.get_user();
          };

          scope.create_toad = function(){
            parse.create_toad(scope.toad, function(new_toad){
              console.dir(new_toad);
              $location.path(routes.toad.show.urls[0]).search({ id: new_toad.id });
            });
          };

          scope.make_toad = function(){
            if(scope.toad.video){
              var video_container = elm[0].getElementsByClassName('toad_video')[0];
              video_container.innerHTML = '';
              var video_frame = document.createElement('div');
              video_container.appendChild(video_frame);
              var video_wrapper = elm[0].getElementsByClassName('video_wrapper')[0];
              scope.video_player = new YT.Player(video_frame, {
                videoId: scope.toad.video.video_id,
                events: {
                  'onReady': function(){
                    scope.$apply(function(){
                      scope.toad.video.loaded = true;
                    });
                  },
                  'onStateChange': on_player_state_change
                },
                playerVars: {
                  iv_load_policy: 3,
                  controls: 0,
                  rel: 0,
                  showinfo: 0,
                  modestbranding: 1
                }
              });
            }
            if(scope.toad.audio){
              var audio_container = elm[0].getElementsByClassName('toad_audio')[0];
              audio_container.innerHTML = '';

              var audio_frame = document.createElement('div');
              audio_container.appendChild(audio_frame);


              scope.audio_player = new YT.Player(audio_frame, {
                height: '2',
                width: '2',
                videoId: scope.toad.audio.video_id,
                events: {
                  'onReady': function(){
                    scope.$apply(function(){
                      scope.toad.audio.loaded = true;
                    });
                  },
                  'onStateChange': on_player_state_change
                },
                playerVars: {
                  iv_load_policy: 3,
                  controls: 0
                }
              });
            }

          };

          var timeout;

          scope.user_mouse_action = function(){
            scope.show_video_tools = true;
            $timeout.cancel(timeout);
            timeout = $timeout(function(){
              if(scope.is_playing) scope.show_video_tools = false;
            }, 2000);
          };

          scope.play_toad = function(){
            scope.audio_player && scope.audio_player.playVideo();
            scope.video_player && scope.video_player.mute();
            scope.video_player && scope.video_player.playVideo();
            scope.is_playing = true;
          };

          scope.stop_toad = function(){
            scope.audio_player && scope.audio_player.stopVideo();
            scope.video_player && scope.video_player.stopVideo();
            scope.is_playing = false;
          };

          scope.is_full_screen = false;

          scope.full_screen = function(){
            var cont = elm[0].getElementsByClassName('video_wrapper')[0];
            if(!scope.is_full_screen) {
              scope.is_full_screen = true;
              if (cont.requestFullscreen) {
                cont.requestFullscreen();
              } else if (cont.msRequestFullscreen) {
                cont.msRequestFullscreen();
              } else if (cont.mozRequestFullScreen) {
                elem.mozRequestFullScreen();
              } else if (cont.webkitRequestFullscreen) {
                cont.webkitRequestFullscreen();
              }
            }
            else {
              scope.is_full_screen = false;
              if (document.exitFullscreen) {
                document.exitFullscreen();
              } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
              } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
              } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
              }
            }
          };

          scope.search_videos_show = false;

          scope.toggle_search = function(){
            scope.search_videos_show = !scope.search_videos_show;
          };

          scope.$on('video_search:insert_video', function(e, data){
            scope.stop_toad();
            delete scope.toad.id;
            scope.toad.title = data.item.snippet.title;
            scope.toad[data.type] = {
              video_id: data.item.id.videoId,
              pic: data.item.snippet.thumbnails.medium.url,
              title: data.item.snippet.title
            };
            scope.video_search = false;
            scope.audio_search = false;
            scope.make_toad();
          });

          function on_player_state_change(){
            if (scope.audio_player.getPlayerState() == 0 || scope.video_player.getPlayerState() == 0) {
              scope.stop_toad();
            }
          }

          function get_video_container(){
            return elm[0].getElementsByClassName('toad_video')[0].getElementsByTagName('iframe')[0];
          }

          window.addEventListener('resize', function(){
            if(scope.toad.video && scope.toad.video.loaded && scope.toad.audio && scope.toad.audio.loaded && scope.video_player){
              scope.video_player.setSize(get_video_container().clientWidth, get_video_container().clientHeight);
            }
          });

          scope.get_bg_url = function(url){
            return 'url(' + url + ')';
          };

        }
      };
    });

}(angular));
