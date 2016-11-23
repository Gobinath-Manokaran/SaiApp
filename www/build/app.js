// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'App' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('App', ['ionic', 'ngCordova', 'ngAnimate', 'monospaced.elastic', 'angularMoment'])

.run(['$ionicPlatform',
      function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
}])
.config(['$stateProvider',
         '$urlRouterProvider',
         '$ionicConfigProvider',
         '$compileProvider',
         function ($stateProvider, $urlRouterProvider, $ionicConfigProvider, $compileProvider) {

    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|blob|content|ms-appx|x-wmapp0):|data:image\/|img\//);
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|ghttps?|ms-appx|x-wmapp0):/);
    
    $ionicConfigProvider.scrolling.jsScrolling(ionic.Platform.isIOS());
    
    $stateProvider
        .state('home', {
            url: "/home",
            cache: false,
            templateUrl: "templates/home.html",
            controller: 'HomeController'
        });
        
    $urlRouterProvider.otherwise(function ($injector, $location) {
        var $state = $injector.get("$state");
        $state.go("home");
    });
}]);

/* global ionic */
(function (angular, ionic) {
	"use strict";

	ionic.Platform.isIE = function () {
		return ionic.Platform.ua.toLowerCase().indexOf('trident') > -1;
	}

	if (ionic.Platform.isIE()) {
		angular.module('ionic')
			.factory('$ionicNgClick', ['$parse', '$timeout', function ($parse, $timeout) {
				return function (scope, element, clickExpr) {
					var clickHandler = angular.isFunction(clickExpr) ? clickExpr : $parse(clickExpr);

					element.on('click', function (event) {
						scope.$apply(function () {
							if (scope.clicktimer) return; // Second call
							clickHandler(scope, { $event: (event) });
							scope.clicktimer = $timeout(function () { delete scope.clicktimer; }, 1, false);
						});
					});

					// Hack for iOS Safari's benefit. It goes searching for onclick handlers and is liable to click
					// something else nearby.
					element.onclick = function (event) { };
				};
			}]);
	}

	function SelectDirective() {
		'use strict';

		return {
			restrict: 'E',
			replace: false,
			link: function (scope, element) {
				if (ionic.Platform && (ionic.Platform.isWindowsPhone() || ionic.Platform.isIE() || ionic.Platform.platform() === "edge")) {
					element.attr('data-tap-disabled', 'true');
				}
			}
		};
	}

	angular.module('ionic')
    .directive('select', SelectDirective);

	/*angular.module('ionic-datepicker')
	.directive('select', SelectDirective);*/

})(angular, ionic);
(function () {
	'use strict';

	angular
		.module('App')
		.controller('HomeController', HomeController);

	HomeController.$inject = ['$scope', '$rootScope', '$state',
  '$stateParams', 'MockService',
  '$ionicPopup', '$ionicScrollDelegate', '$timeout', '$interval',
  '$ionicActionSheet', '$filter', '$ionicModal'];
	function HomeController($scope, $rootScope, $state, $stateParams, MockService,
    $ionicPopup, $ionicScrollDelegate, $timeout, $interval, $ionicActionSheet, $filter, $ionicModal) {

		// mock acquiring data via $stateParams
		$scope.toUser = {
			_id: '534b8e5aaa5e7afc1b23e69b',
			pic: 'img/sai.jpg',
			username: 'God'
		}

		// this could be on $rootScope rather than in $stateParams
		$scope.user = {
			_id: '534b8fb2aa5e7afc1b23e69c',
			pic: 'http://ionicframework.com/img/docs/mcfly.jpg',
			username: 'aaa'
		};

		$scope.input = {
			message: localStorage['userMessage-' + $scope.toUser._id] || ''
		};

		var messageCheckTimer;

		var viewScroll = $ionicScrollDelegate.$getByHandle('userMessageScroll');
		var footerBar; // gets set in $ionicView.enter
		var scroller;
		var txtInput; // ^^^

		$scope.$on('$ionicView.enter', function () {
			getMessages();

			$timeout(function () {
				footerBar = document.body.querySelector('.homeView .bar-footer');
				scroller = document.body.querySelector('.homeView .scroll-content');
				txtInput = angular.element(footerBar.querySelector('textarea'));
			}, 0);

			messageCheckTimer = $interval(function () {
				// here you could check for new messages if your app doesn't use push notifications or user disabled them
			}, 20000);
		});

		$scope.$on('$ionicView.leave', function () {
			// Make sure that the interval is destroyed
			if (angular.isDefined(messageCheckTimer)) {
				$interval.cancel(messageCheckTimer);
				messageCheckTimer = undefined;
			}
		});

		$scope.$on('$ionicView.beforeLeave', function () {
			if (!$scope.input.message || $scope.input.message === '') {
				localStorage.removeItem('userMessage-' + $scope.toUser._id);
			}
		});

		function getMessages() {
			// the service is mock but you would probably pass the toUser's GUID here
			MockService.getUserMessages({
				toUserId: $scope.toUser._id
			}).then(function (data) {
				$scope.doneLoading = true;
				$scope.messages = data.messages;
			});
		}

		$scope.$watch('input.message', function (newValue, oldValue) {
			console.log('input.message $watch, newValue ' + newValue);
			if (!newValue) newValue = '';
			localStorage['userMessage-' + $scope.toUser._id] = newValue;
		});

		var addMessage = function (message) {
			message._id = new Date().getTime(); // :~)
			message.date = new Date();
			message.username = $scope.user.username;
			message.userId = $scope.user._id;
			message.pic = $scope.user.picture;
			$scope.messages.push(message);
		};
		
		var lastPhoto = 'img/donut.png';

		/*$scope.sendPhoto = function () {
			$ionicActionSheet.show({
				buttons: [
					{ text: 'Take Photo' },
					{ text: 'Photo from Library' }
				],
				titleText: 'Upload image',
				cancelText: 'Cancel',
				buttonClicked: function (index) {
					
					var message = {
						toId: $scope.toUser._id,
						photo: lastPhoto
					};
					lastPhoto = lastPhoto === 'img/donut.png' ? 'img/woho.png' : 'img/donut.png';
					addMessage(message);

					$timeout(function () {
						var message = MockService.getMockMessage();
						message.date = new Date();
						$scope.messages.push(message);
					}, 2000);
					return true;
				}
			});
		};*/

		$scope.sendMessage = function (sendMessageForm) {
			var message = {
				toId: $scope.toUser._id,
				text: $scope.input.message
			};

			// if you do a web service call this will be needed as well as before the viewScroll calls
			// you can't see the effect of this in the browser it needs to be used on a real device
			// for some reason the one time blur event is not firing in the browser but does on devices
			keepKeyboardOpen();

			//MockService.sendMessage(message).then(function(data) {
			$scope.input.message = '';

			addMessage(message);
							console.log(message);
							var message = MockService.getMockMessage(message);
				message.date = new Date();
				$scope.messages.push(message);
				keepKeyboardOpen();
			$timeout(function () {
				keepKeyboardOpen();
			}, 0);

			$timeout(function () {
				
			}, 2000);
			//});
		};

		// this keeps the keyboard open on a device only after sending a message, it is non obtrusive
		function keepKeyboardOpen() {
			console.log('keepKeyboardOpen');
			txtInput.one('blur', function () {
				console.log('textarea blur, focus back on it');
				txtInput[0].focus();
			});
		}
		$scope.refreshScroll = function (scrollBottom, timeout) {
			$timeout(function () {
				scrollBottom = scrollBottom || $scope.scrollDown;
				viewScroll.resize();
				if (scrollBottom) {
					viewScroll.scrollBottom(true);
				}
				$scope.checkScroll();
			}, timeout || 1000);
		};
		$scope.scrollDown = true;
		$scope.checkScroll = function () {
			$timeout(function () {
				var currentTop = viewScroll.getScrollPosition().top;
				var maxScrollableDistanceFromTop = viewScroll.getScrollView().__maxScrollTop;
				$scope.scrollDown = (currentTop >= maxScrollableDistanceFromTop);
				$scope.$apply();
			}, 0);
			return true;
		};

		var openModal = function (templateUrl) {
			return $ionicModal.fromTemplateUrl(templateUrl, {
				scope: $scope,
				animation: 'slide-in-up',
				backdropClickToClose: false
			}).then(function (modal) {
				modal.show();
				$scope.modal = modal;
			});
		};

		$scope.photoBrowser = function (message) {
			var messages = $filter('orderBy')($filter('filter')($scope.messages, { photo: '' }), 'date');
			$scope.activeSlide = messages.indexOf(message);
			$scope.allImages = messages.map(function (message) {
				return message.photo;
			});

			openModal('templates/modals/fullscreenImages.html');
		};

		$scope.closeModal = function () {
			$scope.modal.remove();
		};

		$scope.onMessageHold = function (e, itemIndex, message) {
			console.log('onMessageHold');
			console.log('message: ' + JSON.stringify(message, null, 2));
			$ionicActionSheet.show({
				buttons: [{
					text: 'Copy Text'
				}, {
						text: 'Delete Message'
					}],
				buttonClicked: function (index) {
					switch (index) {
						case 0: // Copy Text
							//cordova.plugins.clipboard.copy(message.text);

							break;
						case 1: // Delete
							// no server side secrets here :~)
							$scope.messages.splice(itemIndex, 1);
							$timeout(function () {
								viewScroll.resize();
							}, 0);

							break;
					}

					return true;
				}
			});
		};

		// this prob seems weird here but I have reasons for this in my app, secret!
		$scope.viewProfile = function (msg) {
			if (msg.userId === $scope.user._id) {
				// go to your profile
			} else {
				// go to other users profile
			}
		};

		$scope.$on('elastic:resize', function (event, element, oldHeight, newHeight) {
			if (!footerBar) return;

			var newFooterHeight = newHeight + 10;
			newFooterHeight = (newFooterHeight > 44) ? newFooterHeight : 44;

			footerBar.style.height = newFooterHeight + 'px';
			scroller.style.bottom = newFooterHeight + 'px';
		});

	}
})();
(function () {
    'use strict';

    angular
        .module('App')
        .filter('nl2br', nl2br);

    //nl2br.$inject = [];
    function nl2br() {

        return function(data) {
            if (!data) return data;
            return data.replace(/\n\r?/g, '<br />');
        };
    }
})();
(function (Autolinker) {
    'use strict';

    angular
        .module('App')
        .directive('autolinker', autolinker);

    autolinker.$inject = ['$timeout'];
    function autolinker($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                $timeout(function () {
                    var eleHtml = element.html();

                    if (eleHtml === '') {
                        return false;
                    }

                    var text = Autolinker.link(eleHtml, {
                        className: 'autolinker',
                        newWindow: false
                    });

                    element.html(text);

                    var autolinks = element[0].getElementsByClassName('autolinker');

                    for (var i = 0; i < autolinks.length; i++) {
                        angular.element(autolinks[i]).bind('click', function (e) {
                            var href = e.target.href;
                            if (href) {
                                //window.open(href, '_system');
                                window.open(href, '_blank');
                            }
                            e.preventDefault();
                            return false;
                        });
                    }
                }, 0);
            }
        }
    }
})(Autolinker);
(function () {
    'use strict';

    angular
        .module('App')
        .directive('img', img);

    img.$inject = ['$parse'];
    function img($parse) {
        function endsWith(url, path) {
            var index = url.length - path.length;
            return url.indexOf(path, index) !== -1;
        }

        return {
            restrict: 'E',
            link: function (scope, element, attributes) {

                element.on('error', function (ev) {
                    var src = this.src;
                    var fn = attributes.ngError && $parse(attributes.ngError);
                    // If theres an ng-error callback then call it
                    if (fn) {
                        scope.$apply(function () {
                            fn(scope, { $event: ev, $src: src });
                        });
                    }

                    // If theres an ng-error-src then set it
                    if (attributes.ngErrorSrc && !endsWith(src, attributes.ngErrorSrc)) {
                        element.attr('src', attributes.ngErrorSrc);
                    }
                });

                element.on('load', function (ev) {
                    var fn = attributes.ngSuccess && $parse(attributes.ngSuccess);
                    if (fn) {
                        scope.$apply(function () {
                            fn(scope, { $event: ev });
                        });
                    }
                });
            }
        }
    }
})();
(function () {
    'use strict';

    angular
        .module('App')
        .factory('MockService', MockService);

    MockService.$inject = ['$http', '$q'];
    function MockService($http, $q) {
        var me = {};

        me.getUserMessages = function (d) {
            /*
            var endpoint =
              'http://www.mocky.io/v2/547cf341501c337f0c9a63fd?callback=JSON_CALLBACK';
            return $http.jsonp(endpoint).then(function(response) {
              return response.data;
            }, function(err) {
              console.log('get user messages error, err: ' + JSON.stringify(
                err, null, 2));
            });
            */
            var deferred = $q.defer();

            setTimeout(function () {
                deferred.resolve(getMockMessages());
            }, 1500);

            return deferred.promise;
        };

        me.getMockMessage = function (message) {
        	alert("hi");
        	alert(message.text);
        	window.resolveLocalFileSystemURL(cordova.file.applicationDirectory + "www/index.html", gotFile, fail);

            return {
                userId: '534b8e5aaa5e7afc1b23e69b',
                date: new Date(),
                text: 'Hiiii'
            };
        }

        return me;
    }

    function getMockMessages() {
        return {
            "messages": [
                { "_id": "535d625f898df4e80e2a125e", "text": "Welcome AAA!!", "userId": "546a5843fd4c5d581efa263a"},
                { "_id": "535d625f898df4e80e2a126e", "photo": "img/sai.jpg", "userId": "546a5843fd4c5d581efa263a", "date": "2015-08-25T20:02:39.082Z", "read": true, "readDate": "2014-13-02T06:27:37.944Z" },
                { "_id": "535d625f898df4e80e2a125e", "text": "Think of a number between 1 and 720 and send ot to me", "userId": "546a5843fd4c5d581efa263a"}
                ]
        };
    }

    function fail(e) {
	console.log("FileSystem Error");
	console.dir(e);
}

function gotFile(fileEntry) {

	fileEntry.file(function(file) {
		var reader = new FileReader();

		reader.onloadend = function(e) {
			console.log("Text is: "+this.result);
			document.querySelector("#textArea").innerHTML = this.result;
		}

		reader.readAsText(file);
	});

}
})();
(function () {
	'use strict';

	angular
		.module('App')
		.factory('Modals', Modals);

	Modals.$inject = ['$ionicModal'];
	function Modals($ionicModal) {

		var modals = [];

		var _openModal = function ($scope, templateUrl, animation) {
			return $ionicModal.fromTemplateUrl(templateUrl, {
				scope: $scope,
				animation: animation || 'slide-in-up',
				backdropClickToClose: false
			}).then(function (modal) {
				modals.push(modal);
				modal.show();
			});
		};

		var _closeModal = function () {
			var currentModal = modals.splice(-1, 1)[0];
			currentModal.remove();
		};

		var _closeAllModals = function () {
			modals.map(function (modal) {
				modal.remove();
			});
			modals = [];
		};

		return {
			openModal: _openModal,
			closeModal: _closeModal,
			closeAllModals: _closeAllModals
		};
	}
})();
(function () {
	'use strict';

	angular
		.module('App')
		.factory('Model', Model);

	//Model.$inject = ['Users'];
	function Model() {

		return {
			
		};
	}
})();
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImlzc3Vlcy5qcyIsImNvbnRyb2xsZXJzL2hvbWUuanMiLCJmaWx0ZXJzL25sMmJyLmpzIiwiZGlyZWN0aXZlcy9hdXRvbGlua2VyLmpzIiwiZGlyZWN0aXZlcy9pbWcuanMiLCJzZXJ2aWNlcy9tb2NrU2VydmljZS5qcyIsInNlcnZpY2VzL21vZGFscy5qcyIsInNlcnZpY2VzL21vZGVsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gSW9uaWMgU3RhcnRlciBBcHBcblxuLy8gYW5ndWxhci5tb2R1bGUgaXMgYSBnbG9iYWwgcGxhY2UgZm9yIGNyZWF0aW5nLCByZWdpc3RlcmluZyBhbmQgcmV0cmlldmluZyBBbmd1bGFyIG1vZHVsZXNcbi8vICdBcHAnIGlzIHRoZSBuYW1lIG9mIHRoaXMgYW5ndWxhciBtb2R1bGUgZXhhbXBsZSAoYWxzbyBzZXQgaW4gYSA8Ym9keT4gYXR0cmlidXRlIGluIGluZGV4Lmh0bWwpXG4vLyB0aGUgMm5kIHBhcmFtZXRlciBpcyBhbiBhcnJheSBvZiAncmVxdWlyZXMnXG5hbmd1bGFyLm1vZHVsZSgnQXBwJywgWydpb25pYycsICduZ0NvcmRvdmEnLCAnbmdBbmltYXRlJywgJ21vbm9zcGFjZWQuZWxhc3RpYycsICdhbmd1bGFyTW9tZW50J10pXG5cbi5ydW4oWyckaW9uaWNQbGF0Zm9ybScsXG4gICAgICBmdW5jdGlvbigkaW9uaWNQbGF0Zm9ybSkge1xuICAkaW9uaWNQbGF0Zm9ybS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICBpZih3aW5kb3cuY29yZG92YSAmJiB3aW5kb3cuY29yZG92YS5wbHVnaW5zLktleWJvYXJkKSB7XG4gICAgICAvLyBIaWRlIHRoZSBhY2Nlc3NvcnkgYmFyIGJ5IGRlZmF1bHQgKHJlbW92ZSB0aGlzIHRvIHNob3cgdGhlIGFjY2Vzc29yeSBiYXIgYWJvdmUgdGhlIGtleWJvYXJkXG4gICAgICAvLyBmb3IgZm9ybSBpbnB1dHMpXG4gICAgICBjb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQuaGlkZUtleWJvYXJkQWNjZXNzb3J5QmFyKHRydWUpO1xuXG4gICAgICAvLyBEb24ndCByZW1vdmUgdGhpcyBsaW5lIHVubGVzcyB5b3Uga25vdyB3aGF0IHlvdSBhcmUgZG9pbmcuIEl0IHN0b3BzIHRoZSB2aWV3cG9ydFxuICAgICAgLy8gZnJvbSBzbmFwcGluZyB3aGVuIHRleHQgaW5wdXRzIGFyZSBmb2N1c2VkLiBJb25pYyBoYW5kbGVzIHRoaXMgaW50ZXJuYWxseSBmb3JcbiAgICAgIC8vIGEgbXVjaCBuaWNlciBrZXlib2FyZCBleHBlcmllbmNlLlxuICAgICAgY29yZG92YS5wbHVnaW5zLktleWJvYXJkLmRpc2FibGVTY3JvbGwodHJ1ZSk7XG4gICAgfVxuICAgIGlmKHdpbmRvdy5TdGF0dXNCYXIpIHtcbiAgICAgIFN0YXR1c0Jhci5zdHlsZURlZmF1bHQoKTtcbiAgICB9XG4gIH0pO1xufV0pXG4uY29uZmlnKFsnJHN0YXRlUHJvdmlkZXInLFxuICAgICAgICAgJyR1cmxSb3V0ZXJQcm92aWRlcicsXG4gICAgICAgICAnJGlvbmljQ29uZmlnUHJvdmlkZXInLFxuICAgICAgICAgJyRjb21waWxlUHJvdmlkZXInLFxuICAgICAgICAgZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIsICRpb25pY0NvbmZpZ1Byb3ZpZGVyLCAkY29tcGlsZVByb3ZpZGVyKSB7XG5cbiAgICAkY29tcGlsZVByb3ZpZGVyLmltZ1NyY1Nhbml0aXphdGlvbldoaXRlbGlzdCgvXlxccyooaHR0cHM/fGZ0cHxmaWxlfGJsb2J8Y29udGVudHxtcy1hcHB4fHgtd21hcHAwKTp8ZGF0YTppbWFnZVxcL3xpbWdcXC8vKTtcbiAgICAkY29tcGlsZVByb3ZpZGVyLmFIcmVmU2FuaXRpemF0aW9uV2hpdGVsaXN0KC9eXFxzKihodHRwcz98ZnRwfG1haWx0b3xmaWxlfGdodHRwcz98bXMtYXBweHx4LXdtYXBwMCk6Lyk7XG4gICAgXG4gICAgJGlvbmljQ29uZmlnUHJvdmlkZXIuc2Nyb2xsaW5nLmpzU2Nyb2xsaW5nKGlvbmljLlBsYXRmb3JtLmlzSU9TKCkpO1xuICAgIFxuICAgICRzdGF0ZVByb3ZpZGVyXG4gICAgICAgIC5zdGF0ZSgnaG9tZScsIHtcbiAgICAgICAgICAgIHVybDogXCIvaG9tZVwiLFxuICAgICAgICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6IFwidGVtcGxhdGVzL2hvbWUuaHRtbFwiLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0hvbWVDb250cm9sbGVyJ1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZShmdW5jdGlvbiAoJGluamVjdG9yLCAkbG9jYXRpb24pIHtcbiAgICAgICAgdmFyICRzdGF0ZSA9ICRpbmplY3Rvci5nZXQoXCIkc3RhdGVcIik7XG4gICAgICAgICRzdGF0ZS5nbyhcImhvbWVcIik7XG4gICAgfSk7XG59XSk7XG4iLCIvKiBnbG9iYWwgaW9uaWMgKi9cbihmdW5jdGlvbiAoYW5ndWxhciwgaW9uaWMpIHtcblx0XCJ1c2Ugc3RyaWN0XCI7XG5cblx0aW9uaWMuUGxhdGZvcm0uaXNJRSA9IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gaW9uaWMuUGxhdGZvcm0udWEudG9Mb3dlckNhc2UoKS5pbmRleE9mKCd0cmlkZW50JykgPiAtMTtcblx0fVxuXG5cdGlmIChpb25pYy5QbGF0Zm9ybS5pc0lFKCkpIHtcblx0XHRhbmd1bGFyLm1vZHVsZSgnaW9uaWMnKVxuXHRcdFx0LmZhY3RvcnkoJyRpb25pY05nQ2xpY2snLCBbJyRwYXJzZScsICckdGltZW91dCcsIGZ1bmN0aW9uICgkcGFyc2UsICR0aW1lb3V0KSB7XG5cdFx0XHRcdHJldHVybiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGNsaWNrRXhwcikge1xuXHRcdFx0XHRcdHZhciBjbGlja0hhbmRsZXIgPSBhbmd1bGFyLmlzRnVuY3Rpb24oY2xpY2tFeHByKSA/IGNsaWNrRXhwciA6ICRwYXJzZShjbGlja0V4cHIpO1xuXG5cdFx0XHRcdFx0ZWxlbWVudC5vbignY2xpY2snLCBmdW5jdGlvbiAoZXZlbnQpIHtcblx0XHRcdFx0XHRcdHNjb3BlLiRhcHBseShmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRcdGlmIChzY29wZS5jbGlja3RpbWVyKSByZXR1cm47IC8vIFNlY29uZCBjYWxsXG5cdFx0XHRcdFx0XHRcdGNsaWNrSGFuZGxlcihzY29wZSwgeyAkZXZlbnQ6IChldmVudCkgfSk7XG5cdFx0XHRcdFx0XHRcdHNjb3BlLmNsaWNrdGltZXIgPSAkdGltZW91dChmdW5jdGlvbiAoKSB7IGRlbGV0ZSBzY29wZS5jbGlja3RpbWVyOyB9LCAxLCBmYWxzZSk7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdC8vIEhhY2sgZm9yIGlPUyBTYWZhcmkncyBiZW5lZml0LiBJdCBnb2VzIHNlYXJjaGluZyBmb3Igb25jbGljayBoYW5kbGVycyBhbmQgaXMgbGlhYmxlIHRvIGNsaWNrXG5cdFx0XHRcdFx0Ly8gc29tZXRoaW5nIGVsc2UgbmVhcmJ5LlxuXHRcdFx0XHRcdGVsZW1lbnQub25jbGljayA9IGZ1bmN0aW9uIChldmVudCkgeyB9O1xuXHRcdFx0XHR9O1xuXHRcdFx0fV0pO1xuXHR9XG5cblx0ZnVuY3Rpb24gU2VsZWN0RGlyZWN0aXZlKCkge1xuXHRcdCd1c2Ugc3RyaWN0JztcblxuXHRcdHJldHVybiB7XG5cdFx0XHRyZXN0cmljdDogJ0UnLFxuXHRcdFx0cmVwbGFjZTogZmFsc2UsXG5cdFx0XHRsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQpIHtcblx0XHRcdFx0aWYgKGlvbmljLlBsYXRmb3JtICYmIChpb25pYy5QbGF0Zm9ybS5pc1dpbmRvd3NQaG9uZSgpIHx8IGlvbmljLlBsYXRmb3JtLmlzSUUoKSB8fCBpb25pYy5QbGF0Zm9ybS5wbGF0Zm9ybSgpID09PSBcImVkZ2VcIikpIHtcblx0XHRcdFx0XHRlbGVtZW50LmF0dHIoJ2RhdGEtdGFwLWRpc2FibGVkJywgJ3RydWUnKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG5cdH1cblxuXHRhbmd1bGFyLm1vZHVsZSgnaW9uaWMnKVxuICAgIC5kaXJlY3RpdmUoJ3NlbGVjdCcsIFNlbGVjdERpcmVjdGl2ZSk7XG5cblx0Lyphbmd1bGFyLm1vZHVsZSgnaW9uaWMtZGF0ZXBpY2tlcicpXG5cdC5kaXJlY3RpdmUoJ3NlbGVjdCcsIFNlbGVjdERpcmVjdGl2ZSk7Ki9cblxufSkoYW5ndWxhciwgaW9uaWMpOyIsIihmdW5jdGlvbiAoKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnQXBwJylcblx0XHQuY29udHJvbGxlcignSG9tZUNvbnRyb2xsZXInLCBIb21lQ29udHJvbGxlcik7XG5cblx0SG9tZUNvbnRyb2xsZXIuJGluamVjdCA9IFsnJHNjb3BlJywgJyRyb290U2NvcGUnLCAnJHN0YXRlJyxcbiAgJyRzdGF0ZVBhcmFtcycsICdNb2NrU2VydmljZScsXG4gICckaW9uaWNQb3B1cCcsICckaW9uaWNTY3JvbGxEZWxlZ2F0ZScsICckdGltZW91dCcsICckaW50ZXJ2YWwnLFxuICAnJGlvbmljQWN0aW9uU2hlZXQnLCAnJGZpbHRlcicsICckaW9uaWNNb2RhbCddO1xuXHRmdW5jdGlvbiBIb21lQ29udHJvbGxlcigkc2NvcGUsICRyb290U2NvcGUsICRzdGF0ZSwgJHN0YXRlUGFyYW1zLCBNb2NrU2VydmljZSxcbiAgICAkaW9uaWNQb3B1cCwgJGlvbmljU2Nyb2xsRGVsZWdhdGUsICR0aW1lb3V0LCAkaW50ZXJ2YWwsICRpb25pY0FjdGlvblNoZWV0LCAkZmlsdGVyLCAkaW9uaWNNb2RhbCkge1xuXG5cdFx0Ly8gbW9jayBhY3F1aXJpbmcgZGF0YSB2aWEgJHN0YXRlUGFyYW1zXG5cdFx0JHNjb3BlLnRvVXNlciA9IHtcblx0XHRcdF9pZDogJzUzNGI4ZTVhYWE1ZTdhZmMxYjIzZTY5YicsXG5cdFx0XHRwaWM6ICdodHRwOi8vd3d3Lm5pY2hvbGxzLmNvL2ltYWdlcy9uaWNob2xscy5qcGcnLFxuXHRcdFx0dXNlcm5hbWU6ICdOaWNob2xscydcblx0XHR9XG5cblx0XHQvLyB0aGlzIGNvdWxkIGJlIG9uICRyb290U2NvcGUgcmF0aGVyIHRoYW4gaW4gJHN0YXRlUGFyYW1zXG5cdFx0JHNjb3BlLnVzZXIgPSB7XG5cdFx0XHRfaWQ6ICc1MzRiOGZiMmFhNWU3YWZjMWIyM2U2OWMnLFxuXHRcdFx0cGljOiAnaHR0cDovL2lvbmljZnJhbWV3b3JrLmNvbS9pbWcvZG9jcy9tY2ZseS5qcGcnLFxuXHRcdFx0dXNlcm5hbWU6ICdNYXJ0eSdcblx0XHR9O1xuXG5cdFx0JHNjb3BlLmlucHV0ID0ge1xuXHRcdFx0bWVzc2FnZTogbG9jYWxTdG9yYWdlWyd1c2VyTWVzc2FnZS0nICsgJHNjb3BlLnRvVXNlci5faWRdIHx8ICcnXG5cdFx0fTtcblxuXHRcdHZhciBtZXNzYWdlQ2hlY2tUaW1lcjtcblxuXHRcdHZhciB2aWV3U2Nyb2xsID0gJGlvbmljU2Nyb2xsRGVsZWdhdGUuJGdldEJ5SGFuZGxlKCd1c2VyTWVzc2FnZVNjcm9sbCcpO1xuXHRcdHZhciBmb290ZXJCYXI7IC8vIGdldHMgc2V0IGluICRpb25pY1ZpZXcuZW50ZXJcblx0XHR2YXIgc2Nyb2xsZXI7XG5cdFx0dmFyIHR4dElucHV0OyAvLyBeXl5cblxuXHRcdCRzY29wZS4kb24oJyRpb25pY1ZpZXcuZW50ZXInLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRnZXRNZXNzYWdlcygpO1xuXG5cdFx0XHQkdGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdGZvb3RlckJhciA9IGRvY3VtZW50LmJvZHkucXVlcnlTZWxlY3RvcignLmhvbWVWaWV3IC5iYXItZm9vdGVyJyk7XG5cdFx0XHRcdHNjcm9sbGVyID0gZG9jdW1lbnQuYm9keS5xdWVyeVNlbGVjdG9yKCcuaG9tZVZpZXcgLnNjcm9sbC1jb250ZW50Jyk7XG5cdFx0XHRcdHR4dElucHV0ID0gYW5ndWxhci5lbGVtZW50KGZvb3RlckJhci5xdWVyeVNlbGVjdG9yKCd0ZXh0YXJlYScpKTtcblx0XHRcdH0sIDApO1xuXG5cdFx0XHRtZXNzYWdlQ2hlY2tUaW1lciA9ICRpbnRlcnZhbChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdC8vIGhlcmUgeW91IGNvdWxkIGNoZWNrIGZvciBuZXcgbWVzc2FnZXMgaWYgeW91ciBhcHAgZG9lc24ndCB1c2UgcHVzaCBub3RpZmljYXRpb25zIG9yIHVzZXIgZGlzYWJsZWQgdGhlbVxuXHRcdFx0fSwgMjAwMDApO1xuXHRcdH0pO1xuXG5cdFx0JHNjb3BlLiRvbignJGlvbmljVmlldy5sZWF2ZScsIGZ1bmN0aW9uICgpIHtcblx0XHRcdC8vIE1ha2Ugc3VyZSB0aGF0IHRoZSBpbnRlcnZhbCBpcyBkZXN0cm95ZWRcblx0XHRcdGlmIChhbmd1bGFyLmlzRGVmaW5lZChtZXNzYWdlQ2hlY2tUaW1lcikpIHtcblx0XHRcdFx0JGludGVydmFsLmNhbmNlbChtZXNzYWdlQ2hlY2tUaW1lcik7XG5cdFx0XHRcdG1lc3NhZ2VDaGVja1RpbWVyID0gdW5kZWZpbmVkO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0JHNjb3BlLiRvbignJGlvbmljVmlldy5iZWZvcmVMZWF2ZScsIGZ1bmN0aW9uICgpIHtcblx0XHRcdGlmICghJHNjb3BlLmlucHV0Lm1lc3NhZ2UgfHwgJHNjb3BlLmlucHV0Lm1lc3NhZ2UgPT09ICcnKSB7XG5cdFx0XHRcdGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCd1c2VyTWVzc2FnZS0nICsgJHNjb3BlLnRvVXNlci5faWQpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0ZnVuY3Rpb24gZ2V0TWVzc2FnZXMoKSB7XG5cdFx0XHQvLyB0aGUgc2VydmljZSBpcyBtb2NrIGJ1dCB5b3Ugd291bGQgcHJvYmFibHkgcGFzcyB0aGUgdG9Vc2VyJ3MgR1VJRCBoZXJlXG5cdFx0XHRNb2NrU2VydmljZS5nZXRVc2VyTWVzc2FnZXMoe1xuXHRcdFx0XHR0b1VzZXJJZDogJHNjb3BlLnRvVXNlci5faWRcblx0XHRcdH0pLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcblx0XHRcdFx0JHNjb3BlLmRvbmVMb2FkaW5nID0gdHJ1ZTtcblx0XHRcdFx0JHNjb3BlLm1lc3NhZ2VzID0gZGF0YS5tZXNzYWdlcztcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdCRzY29wZS4kd2F0Y2goJ2lucHV0Lm1lc3NhZ2UnLCBmdW5jdGlvbiAobmV3VmFsdWUsIG9sZFZhbHVlKSB7XG5cdFx0XHRjb25zb2xlLmxvZygnaW5wdXQubWVzc2FnZSAkd2F0Y2gsIG5ld1ZhbHVlICcgKyBuZXdWYWx1ZSk7XG5cdFx0XHRpZiAoIW5ld1ZhbHVlKSBuZXdWYWx1ZSA9ICcnO1xuXHRcdFx0bG9jYWxTdG9yYWdlWyd1c2VyTWVzc2FnZS0nICsgJHNjb3BlLnRvVXNlci5faWRdID0gbmV3VmFsdWU7XG5cdFx0fSk7XG5cblx0XHR2YXIgYWRkTWVzc2FnZSA9IGZ1bmN0aW9uIChtZXNzYWdlKSB7XG5cdFx0XHRtZXNzYWdlLl9pZCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpOyAvLyA6filcblx0XHRcdG1lc3NhZ2UuZGF0ZSA9IG5ldyBEYXRlKCk7XG5cdFx0XHRtZXNzYWdlLnVzZXJuYW1lID0gJHNjb3BlLnVzZXIudXNlcm5hbWU7XG5cdFx0XHRtZXNzYWdlLnVzZXJJZCA9ICRzY29wZS51c2VyLl9pZDtcblx0XHRcdG1lc3NhZ2UucGljID0gJHNjb3BlLnVzZXIucGljdHVyZTtcblx0XHRcdCRzY29wZS5tZXNzYWdlcy5wdXNoKG1lc3NhZ2UpO1xuXHRcdH07XG5cdFx0XG5cdFx0dmFyIGxhc3RQaG90byA9ICdpbWcvZG9udXQucG5nJztcblxuXHRcdCRzY29wZS5zZW5kUGhvdG8gPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHQkaW9uaWNBY3Rpb25TaGVldC5zaG93KHtcblx0XHRcdFx0YnV0dG9uczogW1xuXHRcdFx0XHRcdHsgdGV4dDogJ1Rha2UgUGhvdG8nIH0sXG5cdFx0XHRcdFx0eyB0ZXh0OiAnUGhvdG8gZnJvbSBMaWJyYXJ5JyB9XG5cdFx0XHRcdF0sXG5cdFx0XHRcdHRpdGxlVGV4dDogJ1VwbG9hZCBpbWFnZScsXG5cdFx0XHRcdGNhbmNlbFRleHQ6ICdDYW5jZWwnLFxuXHRcdFx0XHRidXR0b25DbGlja2VkOiBmdW5jdGlvbiAoaW5kZXgpIHtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHR2YXIgbWVzc2FnZSA9IHtcblx0XHRcdFx0XHRcdHRvSWQ6ICRzY29wZS50b1VzZXIuX2lkLFxuXHRcdFx0XHRcdFx0cGhvdG86IGxhc3RQaG90b1xuXHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0bGFzdFBob3RvID0gbGFzdFBob3RvID09PSAnaW1nL2RvbnV0LnBuZycgPyAnaW1nL3dvaG8ucG5nJyA6ICdpbWcvZG9udXQucG5nJztcblx0XHRcdFx0XHRhZGRNZXNzYWdlKG1lc3NhZ2UpO1xuXG5cdFx0XHRcdFx0JHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0dmFyIG1lc3NhZ2UgPSBNb2NrU2VydmljZS5nZXRNb2NrTWVzc2FnZSgpO1xuXHRcdFx0XHRcdFx0bWVzc2FnZS5kYXRlID0gbmV3IERhdGUoKTtcblx0XHRcdFx0XHRcdCRzY29wZS5tZXNzYWdlcy5wdXNoKG1lc3NhZ2UpO1xuXHRcdFx0XHRcdH0sIDIwMDApO1xuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9O1xuXG5cdFx0JHNjb3BlLnNlbmRNZXNzYWdlID0gZnVuY3Rpb24gKHNlbmRNZXNzYWdlRm9ybSkge1xuXHRcdFx0dmFyIG1lc3NhZ2UgPSB7XG5cdFx0XHRcdHRvSWQ6ICRzY29wZS50b1VzZXIuX2lkLFxuXHRcdFx0XHR0ZXh0OiAkc2NvcGUuaW5wdXQubWVzc2FnZVxuXHRcdFx0fTtcblxuXHRcdFx0Ly8gaWYgeW91IGRvIGEgd2ViIHNlcnZpY2UgY2FsbCB0aGlzIHdpbGwgYmUgbmVlZGVkIGFzIHdlbGwgYXMgYmVmb3JlIHRoZSB2aWV3U2Nyb2xsIGNhbGxzXG5cdFx0XHQvLyB5b3UgY2FuJ3Qgc2VlIHRoZSBlZmZlY3Qgb2YgdGhpcyBpbiB0aGUgYnJvd3NlciBpdCBuZWVkcyB0byBiZSB1c2VkIG9uIGEgcmVhbCBkZXZpY2Vcblx0XHRcdC8vIGZvciBzb21lIHJlYXNvbiB0aGUgb25lIHRpbWUgYmx1ciBldmVudCBpcyBub3QgZmlyaW5nIGluIHRoZSBicm93c2VyIGJ1dCBkb2VzIG9uIGRldmljZXNcblx0XHRcdGtlZXBLZXlib2FyZE9wZW4oKTtcblxuXHRcdFx0Ly9Nb2NrU2VydmljZS5zZW5kTWVzc2FnZShtZXNzYWdlKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcblx0XHRcdCRzY29wZS5pbnB1dC5tZXNzYWdlID0gJyc7XG5cblx0XHRcdGFkZE1lc3NhZ2UobWVzc2FnZSk7XG5cdFx0XHQkdGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdGtlZXBLZXlib2FyZE9wZW4oKTtcblx0XHRcdH0sIDApO1xuXG5cdFx0XHQkdGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHZhciBtZXNzYWdlID0gTW9ja1NlcnZpY2UuZ2V0TW9ja01lc3NhZ2UoKTtcblx0XHRcdFx0bWVzc2FnZS5kYXRlID0gbmV3IERhdGUoKTtcblx0XHRcdFx0JHNjb3BlLm1lc3NhZ2VzLnB1c2gobWVzc2FnZSk7XG5cdFx0XHRcdGtlZXBLZXlib2FyZE9wZW4oKTtcblx0XHRcdH0sIDIwMDApO1xuXHRcdFx0Ly99KTtcblx0XHR9O1xuXG5cdFx0Ly8gdGhpcyBrZWVwcyB0aGUga2V5Ym9hcmQgb3BlbiBvbiBhIGRldmljZSBvbmx5IGFmdGVyIHNlbmRpbmcgYSBtZXNzYWdlLCBpdCBpcyBub24gb2J0cnVzaXZlXG5cdFx0ZnVuY3Rpb24ga2VlcEtleWJvYXJkT3BlbigpIHtcblx0XHRcdGNvbnNvbGUubG9nKCdrZWVwS2V5Ym9hcmRPcGVuJyk7XG5cdFx0XHR0eHRJbnB1dC5vbmUoJ2JsdXInLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCd0ZXh0YXJlYSBibHVyLCBmb2N1cyBiYWNrIG9uIGl0Jyk7XG5cdFx0XHRcdHR4dElucHV0WzBdLmZvY3VzKCk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0JHNjb3BlLnJlZnJlc2hTY3JvbGwgPSBmdW5jdGlvbiAoc2Nyb2xsQm90dG9tLCB0aW1lb3V0KSB7XG5cdFx0XHQkdGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHNjcm9sbEJvdHRvbSA9IHNjcm9sbEJvdHRvbSB8fCAkc2NvcGUuc2Nyb2xsRG93bjtcblx0XHRcdFx0dmlld1Njcm9sbC5yZXNpemUoKTtcblx0XHRcdFx0aWYgKHNjcm9sbEJvdHRvbSkge1xuXHRcdFx0XHRcdHZpZXdTY3JvbGwuc2Nyb2xsQm90dG9tKHRydWUpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdCRzY29wZS5jaGVja1Njcm9sbCgpO1xuXHRcdFx0fSwgdGltZW91dCB8fCAxMDAwKTtcblx0XHR9O1xuXHRcdCRzY29wZS5zY3JvbGxEb3duID0gdHJ1ZTtcblx0XHQkc2NvcGUuY2hlY2tTY3JvbGwgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHQkdGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHZhciBjdXJyZW50VG9wID0gdmlld1Njcm9sbC5nZXRTY3JvbGxQb3NpdGlvbigpLnRvcDtcblx0XHRcdFx0dmFyIG1heFNjcm9sbGFibGVEaXN0YW5jZUZyb21Ub3AgPSB2aWV3U2Nyb2xsLmdldFNjcm9sbFZpZXcoKS5fX21heFNjcm9sbFRvcDtcblx0XHRcdFx0JHNjb3BlLnNjcm9sbERvd24gPSAoY3VycmVudFRvcCA+PSBtYXhTY3JvbGxhYmxlRGlzdGFuY2VGcm9tVG9wKTtcblx0XHRcdFx0JHNjb3BlLiRhcHBseSgpO1xuXHRcdFx0fSwgMCk7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9O1xuXG5cdFx0dmFyIG9wZW5Nb2RhbCA9IGZ1bmN0aW9uICh0ZW1wbGF0ZVVybCkge1xuXHRcdFx0cmV0dXJuICRpb25pY01vZGFsLmZyb21UZW1wbGF0ZVVybCh0ZW1wbGF0ZVVybCwge1xuXHRcdFx0XHRzY29wZTogJHNjb3BlLFxuXHRcdFx0XHRhbmltYXRpb246ICdzbGlkZS1pbi11cCcsXG5cdFx0XHRcdGJhY2tkcm9wQ2xpY2tUb0Nsb3NlOiBmYWxzZVxuXHRcdFx0fSkudGhlbihmdW5jdGlvbiAobW9kYWwpIHtcblx0XHRcdFx0bW9kYWwuc2hvdygpO1xuXHRcdFx0XHQkc2NvcGUubW9kYWwgPSBtb2RhbDtcblx0XHRcdH0pO1xuXHRcdH07XG5cblx0XHQkc2NvcGUucGhvdG9Ccm93c2VyID0gZnVuY3Rpb24gKG1lc3NhZ2UpIHtcblx0XHRcdHZhciBtZXNzYWdlcyA9ICRmaWx0ZXIoJ29yZGVyQnknKSgkZmlsdGVyKCdmaWx0ZXInKSgkc2NvcGUubWVzc2FnZXMsIHsgcGhvdG86ICcnIH0pLCAnZGF0ZScpO1xuXHRcdFx0JHNjb3BlLmFjdGl2ZVNsaWRlID0gbWVzc2FnZXMuaW5kZXhPZihtZXNzYWdlKTtcblx0XHRcdCRzY29wZS5hbGxJbWFnZXMgPSBtZXNzYWdlcy5tYXAoZnVuY3Rpb24gKG1lc3NhZ2UpIHtcblx0XHRcdFx0cmV0dXJuIG1lc3NhZ2UucGhvdG87XG5cdFx0XHR9KTtcblxuXHRcdFx0b3Blbk1vZGFsKCd0ZW1wbGF0ZXMvbW9kYWxzL2Z1bGxzY3JlZW5JbWFnZXMuaHRtbCcpO1xuXHRcdH07XG5cblx0XHQkc2NvcGUuY2xvc2VNb2RhbCA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdCRzY29wZS5tb2RhbC5yZW1vdmUoKTtcblx0XHR9O1xuXG5cdFx0JHNjb3BlLm9uTWVzc2FnZUhvbGQgPSBmdW5jdGlvbiAoZSwgaXRlbUluZGV4LCBtZXNzYWdlKSB7XG5cdFx0XHRjb25zb2xlLmxvZygnb25NZXNzYWdlSG9sZCcpO1xuXHRcdFx0Y29uc29sZS5sb2coJ21lc3NhZ2U6ICcgKyBKU09OLnN0cmluZ2lmeShtZXNzYWdlLCBudWxsLCAyKSk7XG5cdFx0XHQkaW9uaWNBY3Rpb25TaGVldC5zaG93KHtcblx0XHRcdFx0YnV0dG9uczogW3tcblx0XHRcdFx0XHR0ZXh0OiAnQ29weSBUZXh0J1xuXHRcdFx0XHR9LCB7XG5cdFx0XHRcdFx0XHR0ZXh0OiAnRGVsZXRlIE1lc3NhZ2UnXG5cdFx0XHRcdFx0fV0sXG5cdFx0XHRcdGJ1dHRvbkNsaWNrZWQ6IGZ1bmN0aW9uIChpbmRleCkge1xuXHRcdFx0XHRcdHN3aXRjaCAoaW5kZXgpIHtcblx0XHRcdFx0XHRcdGNhc2UgMDogLy8gQ29weSBUZXh0XG5cdFx0XHRcdFx0XHRcdC8vY29yZG92YS5wbHVnaW5zLmNsaXBib2FyZC5jb3B5KG1lc3NhZ2UudGV4dCk7XG5cblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlIDE6IC8vIERlbGV0ZVxuXHRcdFx0XHRcdFx0XHQvLyBubyBzZXJ2ZXIgc2lkZSBzZWNyZXRzIGhlcmUgOn4pXG5cdFx0XHRcdFx0XHRcdCRzY29wZS5tZXNzYWdlcy5zcGxpY2UoaXRlbUluZGV4LCAxKTtcblx0XHRcdFx0XHRcdFx0JHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0XHRcdHZpZXdTY3JvbGwucmVzaXplKCk7XG5cdFx0XHRcdFx0XHRcdH0sIDApO1xuXG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9O1xuXG5cdFx0Ly8gdGhpcyBwcm9iIHNlZW1zIHdlaXJkIGhlcmUgYnV0IEkgaGF2ZSByZWFzb25zIGZvciB0aGlzIGluIG15IGFwcCwgc2VjcmV0IVxuXHRcdCRzY29wZS52aWV3UHJvZmlsZSA9IGZ1bmN0aW9uIChtc2cpIHtcblx0XHRcdGlmIChtc2cudXNlcklkID09PSAkc2NvcGUudXNlci5faWQpIHtcblx0XHRcdFx0Ly8gZ28gdG8geW91ciBwcm9maWxlXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBnbyB0byBvdGhlciB1c2VycyBwcm9maWxlXG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdCRzY29wZS4kb24oJ2VsYXN0aWM6cmVzaXplJywgZnVuY3Rpb24gKGV2ZW50LCBlbGVtZW50LCBvbGRIZWlnaHQsIG5ld0hlaWdodCkge1xuXHRcdFx0aWYgKCFmb290ZXJCYXIpIHJldHVybjtcblxuXHRcdFx0dmFyIG5ld0Zvb3RlckhlaWdodCA9IG5ld0hlaWdodCArIDEwO1xuXHRcdFx0bmV3Rm9vdGVySGVpZ2h0ID0gKG5ld0Zvb3RlckhlaWdodCA+IDQ0KSA/IG5ld0Zvb3RlckhlaWdodCA6IDQ0O1xuXG5cdFx0XHRmb290ZXJCYXIuc3R5bGUuaGVpZ2h0ID0gbmV3Rm9vdGVySGVpZ2h0ICsgJ3B4Jztcblx0XHRcdHNjcm9sbGVyLnN0eWxlLmJvdHRvbSA9IG5ld0Zvb3RlckhlaWdodCArICdweCc7XG5cdFx0fSk7XG5cblx0fVxufSkoKTsiLCIoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIGFuZ3VsYXJcbiAgICAgICAgLm1vZHVsZSgnQXBwJylcbiAgICAgICAgLmZpbHRlcignbmwyYnInLCBubDJicik7XG5cbiAgICAvL25sMmJyLiRpbmplY3QgPSBbXTtcbiAgICBmdW5jdGlvbiBubDJicigpIHtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgaWYgKCFkYXRhKSByZXR1cm4gZGF0YTtcbiAgICAgICAgICAgIHJldHVybiBkYXRhLnJlcGxhY2UoL1xcblxccj8vZywgJzxiciAvPicpO1xuICAgICAgICB9O1xuICAgIH1cbn0pKCk7IiwiKGZ1bmN0aW9uIChBdXRvbGlua2VyKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgYW5ndWxhclxuICAgICAgICAubW9kdWxlKCdBcHAnKVxuICAgICAgICAuZGlyZWN0aXZlKCdhdXRvbGlua2VyJywgYXV0b2xpbmtlcik7XG5cbiAgICBhdXRvbGlua2VyLiRpbmplY3QgPSBbJyR0aW1lb3V0J107XG4gICAgZnVuY3Rpb24gYXV0b2xpbmtlcigkdGltZW91dCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBlbGVIdG1sID0gZWxlbWVudC5odG1sKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsZUh0bWwgPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB2YXIgdGV4dCA9IEF1dG9saW5rZXIubGluayhlbGVIdG1sLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6ICdhdXRvbGlua2VyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld1dpbmRvdzogZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5odG1sKHRleHQpO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBhdXRvbGlua3MgPSBlbGVtZW50WzBdLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2F1dG9saW5rZXInKTtcblxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGF1dG9saW5rcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGF1dG9saW5rc1tpXSkuYmluZCgnY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBocmVmID0gZS50YXJnZXQuaHJlZjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaHJlZikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL3dpbmRvdy5vcGVuKGhyZWYsICdfc3lzdGVtJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5vcGVuKGhyZWYsICdfYmxhbmsnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59KShBdXRvbGlua2VyKTsiLCIoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIGFuZ3VsYXJcbiAgICAgICAgLm1vZHVsZSgnQXBwJylcbiAgICAgICAgLmRpcmVjdGl2ZSgnaW1nJywgaW1nKTtcblxuICAgIGltZy4kaW5qZWN0ID0gWyckcGFyc2UnXTtcbiAgICBmdW5jdGlvbiBpbWcoJHBhcnNlKSB7XG4gICAgICAgIGZ1bmN0aW9uIGVuZHNXaXRoKHVybCwgcGF0aCkge1xuICAgICAgICAgICAgdmFyIGluZGV4ID0gdXJsLmxlbmd0aCAtIHBhdGgubGVuZ3RoO1xuICAgICAgICAgICAgcmV0dXJuIHVybC5pbmRleE9mKHBhdGgsIGluZGV4KSAhPT0gLTE7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cmlidXRlcykge1xuXG4gICAgICAgICAgICAgICAgZWxlbWVudC5vbignZXJyb3InLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNyYyA9IHRoaXMuc3JjO1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBhdHRyaWJ1dGVzLm5nRXJyb3IgJiYgJHBhcnNlKGF0dHJpYnV0ZXMubmdFcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHRoZXJlcyBhbiBuZy1lcnJvciBjYWxsYmFjayB0aGVuIGNhbGwgaXRcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzY29wZS4kYXBwbHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZuKHNjb3BlLCB7ICRldmVudDogZXYsICRzcmM6IHNyYyB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhlcmVzIGFuIG5nLWVycm9yLXNyYyB0aGVuIHNldCBpdFxuICAgICAgICAgICAgICAgICAgICBpZiAoYXR0cmlidXRlcy5uZ0Vycm9yU3JjICYmICFlbmRzV2l0aChzcmMsIGF0dHJpYnV0ZXMubmdFcnJvclNyYykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuYXR0cignc3JjJywgYXR0cmlidXRlcy5uZ0Vycm9yU3JjKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgZWxlbWVudC5vbignbG9hZCcsIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBhdHRyaWJ1dGVzLm5nU3VjY2VzcyAmJiAkcGFyc2UoYXR0cmlidXRlcy5uZ1N1Y2Nlc3MpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZm4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLiRhcHBseShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm4oc2NvcGUsIHsgJGV2ZW50OiBldiB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59KSgpOyIsIihmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgYW5ndWxhclxuICAgICAgICAubW9kdWxlKCdBcHAnKVxuICAgICAgICAuZmFjdG9yeSgnTW9ja1NlcnZpY2UnLCBNb2NrU2VydmljZSk7XG5cbiAgICBNb2NrU2VydmljZS4kaW5qZWN0ID0gWyckaHR0cCcsICckcSddO1xuICAgIGZ1bmN0aW9uIE1vY2tTZXJ2aWNlKCRodHRwLCAkcSkge1xuICAgICAgICB2YXIgbWUgPSB7fTtcblxuICAgICAgICBtZS5nZXRVc2VyTWVzc2FnZXMgPSBmdW5jdGlvbiAoZCkge1xuICAgICAgICAgICAgLypcbiAgICAgICAgICAgIHZhciBlbmRwb2ludCA9XG4gICAgICAgICAgICAgICdodHRwOi8vd3d3Lm1vY2t5LmlvL3YyLzU0N2NmMzQxNTAxYzMzN2YwYzlhNjNmZD9jYWxsYmFjaz1KU09OX0NBTExCQUNLJztcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5qc29ucChlbmRwb2ludCkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZygnZ2V0IHVzZXIgbWVzc2FnZXMgZXJyb3IsIGVycjogJyArIEpTT04uc3RyaW5naWZ5KFxuICAgICAgICAgICAgICAgIGVyciwgbnVsbCwgMikpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShnZXRNb2NrTWVzc2FnZXMoKSk7XG4gICAgICAgICAgICB9LCAxNTAwKTtcblxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH07XG5cbiAgICAgICAgbWUuZ2V0TW9ja01lc3NhZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHVzZXJJZDogJzUzNGI4ZTVhYWE1ZTdhZmMxYjIzZTY5YicsXG4gICAgICAgICAgICAgICAgZGF0ZTogbmV3IERhdGUoKSxcbiAgICAgICAgICAgICAgICB0ZXh0OiAnTG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQsIGNvbnNlY3RldHVyIGFkaXBpc2NpbmcgZWxpdCwgc2VkIGRvIGVpdXNtb2QgdGVtcG9yIGluY2lkaWR1bnQgdXQgbGFib3JlIGV0IGRvbG9yZSBtYWduYSBhbGlxdWEuIFV0IGVuaW0gYWQgbWluaW0gdmVuaWFtLCBxdWlzIG5vc3RydWQgZXhlcmNpdGF0aW9uIHVsbGFtY28gbGFib3JpcyBuaXNpIHV0IGFsaXF1aXAgZXggZWEgY29tbW9kbyBjb25zZXF1YXQuJ1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBtZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRNb2NrTWVzc2FnZXMoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBcIm1lc3NhZ2VzXCI6IFtcbiAgICAgICAgICAgICAgICB7IFwiX2lkXCI6IFwiNTM1ZDYyNWY4OThkZjRlODBlMmExMjVlXCIsIFwidGV4dFwiOiBcIklvbmljIGhhcyBjaGFuZ2VkIHRoZSBnYW1lIGZvciBoeWJyaWQgYXBwIGRldmVsb3BtZW50LlwiLCBcInVzZXJJZFwiOiBcIjUzNGI4ZmIyYWE1ZTdhZmMxYjIzZTY5Y1wiLCBcImRhdGVcIjogXCIyMDE0LTA0LTI3VDIwOjAyOjM5LjA4MlpcIiwgXCJyZWFkXCI6IHRydWUsIFwicmVhZERhdGVcIjogXCIyMDE0LTEyLTAxVDA2OjI3OjM3Ljk0NFpcIiB9LCB7IFwiX2lkXCI6IFwiNTM1ZjEzZmZlZTNiMmE2ODExMmI5ZmMwXCIsIFwidGV4dFwiOiBcIkkgbGlrZSBJb25pYyBiZXR0ZXIgdGhhbiBpY2UgY3JlYW0hXCIsIFwidXNlcklkXCI6IFwiNTM0YjhlNWFhYTVlN2FmYzFiMjNlNjliXCIsIFwiZGF0ZVwiOiBcIjIwMTQtMDQtMjlUMDI6NTI6NDcuNzA2WlwiLCBcInJlYWRcIjogdHJ1ZSwgXCJyZWFkRGF0ZVwiOiBcIjIwMTQtMTItMDFUMDY6Mjc6MzcuOTQ0WlwiIH0sIHsgXCJfaWRcIjogXCI1NDZhNTg0M2ZkNGM1ZDU4MWVmYTI2M2FcIiwgXCJ0ZXh0XCI6IFwiTG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQsIGNvbnNlY3RldHVyIGFkaXBpc2NpbmcgZWxpdCwgc2VkIGRvIGVpdXNtb2QgdGVtcG9yIGluY2lkaWR1bnQgdXQgbGFib3JlIGV0IGRvbG9yZSBtYWduYSBhbGlxdWEuIFV0IGVuaW0gYWQgbWluaW0gdmVuaWFtLCBxdWlzIG5vc3RydWQgZXhlcmNpdGF0aW9uIHVsbGFtY28gbGFib3JpcyBuaXNpIHV0IGFsaXF1aXAgZXggZWEgY29tbW9kbyBjb25zZXF1YXQuIER1aXMgYXV0ZSBpcnVyZSBkb2xvciBpbiByZXByZWhlbmRlcml0IGluIHZvbHVwdGF0ZSB2ZWxpdCBlc3NlIGNpbGx1bSBkb2xvcmUgZXUgZnVnaWF0IG51bGxhIHBhcmlhdHVyLiBFeGNlcHRldXIgc2ludCBvY2NhZWNhdCBjdXBpZGF0YXQgbm9uIHByb2lkZW50LCBzdW50IGluIGN1bHBhIHF1aSBvZmZpY2lhIGRlc2VydW50IG1vbGxpdCBhbmltIGlkIGVzdCBsYWJvcnVtLlwiLCBcInVzZXJJZFwiOiBcIjUzNGI4ZmIyYWE1ZTdhZmMxYjIzZTY5Y1wiLCBcImRhdGVcIjogXCIyMDE0LTExLTE3VDIwOjE5OjE1LjI4OVpcIiwgXCJyZWFkXCI6IHRydWUsIFwicmVhZERhdGVcIjogXCIyMDE0LTEyLTAxVDA2OjI3OjM4LjMyOFpcIiB9LCB7IFwiX2lkXCI6IFwiNTQ3NjQzOTlhYjQzZDFkNDExM2FiZmQxXCIsIFwidGV4dFwiOiBcIkFtIEkgZHJlYW1pbmc/XCIsIFwidXNlcklkXCI6IFwiNTM0YjhlNWFhYTVlN2FmYzFiMjNlNjliXCIsIFwiZGF0ZVwiOiBcIjIwMTQtMTEtMjZUMjE6MTg6MTcuNTkxWlwiLCBcInJlYWRcIjogdHJ1ZSwgXCJyZWFkRGF0ZVwiOiBcIjIwMTQtMTItMDFUMDY6Mjc6MzguMzM3WlwiIH0sIHsgXCJfaWRcIjogXCI1NDc2NDNhZWFiNDNkMWQ0MTEzYWJmZDJcIiwgXCJ0ZXh0XCI6IFwiSXMgdGhpcyBtYWdpYz9cIiwgXCJ1c2VySWRcIjogXCI1MzRiOGZiMmFhNWU3YWZjMWIyM2U2OWNcIiwgXCJkYXRlXCI6IFwiMjAxNC0xMS0yNlQyMToxODozOC41NDlaXCIsIFwicmVhZFwiOiB0cnVlLCBcInJlYWREYXRlXCI6IFwiMjAxNC0xMi0wMVQwNjoyNzozOC4zMzhaXCIgfSwgeyBcIl9pZFwiOiBcIjU0NzgxNWRiYWI0M2QxZDQxMTNhYmZlZlwiLCBcInRleHRcIjogXCJHZWUgd2l6LCB0aGlzIGlzIHNvbWV0aGluZyBzcGVjaWFsLlwiLCBcInVzZXJJZFwiOiBcIjUzNGI4ZTVhYWE1ZTdhZmMxYjIzZTY5YlwiLCBcImRhdGVcIjogXCIyMDE0LTExLTI4VDA2OjI3OjQwLjAwMVpcIiwgXCJyZWFkXCI6IHRydWUsIFwicmVhZERhdGVcIjogXCIyMDE0LTEyLTAxVDA2OjI3OjM4LjMzOFpcIiB9LCB7IFwiX2lkXCI6IFwiNTQ3ODFjNjlhYjQzZDFkNDExM2FiZmYwXCIsIFwidGV4dFwiOiBcIkkgdGhpbmsgSSBsaWtlIElvbmljIG1vcmUgdGhhbiBJIGxpa2UgaWNlIGNyZWFtIVwiLCBcInVzZXJJZFwiOiBcIjUzNGI4ZmIyYWE1ZTdhZmMxYjIzZTY5Y1wiLCBcImRhdGVcIjogXCIyMDE0LTExLTI4VDA2OjU1OjM3LjM1MFpcIiwgXCJyZWFkXCI6IHRydWUsIFwicmVhZERhdGVcIjogXCIyMDE0LTEyLTAxVDA2OjI3OjM4LjMzOFpcIiB9LCB7IFwiX2lkXCI6IFwiNTQ3ODFjYTRhYjQzZDFkNDExM2FiZmYxXCIsIFwidGV4dFwiOiBcIlllYSwgaXQncyBwcmV0dHkgc3dlZXRcIiwgXCJ1c2VySWRcIjogXCI1MzRiOGU1YWFhNWU3YWZjMWIyM2U2OWJcIiwgXCJkYXRlXCI6IFwiMjAxNC0xMS0yOFQwNjo1NjozNi40NzJaXCIsIFwicmVhZFwiOiB0cnVlLCBcInJlYWREYXRlXCI6IFwiMjAxNC0xMi0wMVQwNjoyNzozOC4zMzhaXCIgfSwgeyBcIl9pZFwiOiBcIjU0NzhkZjg2YWI0M2QxZDQxMTNhYmZmNFwiLCBcInRleHRcIjogXCJXb3csIHRoaXMgaXMgcmVhbGx5IHNvbWV0aGluZyBodWg/XCIsIFwidXNlcklkXCI6IFwiNTM0YjhmYjJhYTVlN2FmYzFiMjNlNjljXCIsIFwiZGF0ZVwiOiBcIjIwMTQtMTEtMjhUMjA6NDg6MDYuNTcyWlwiLCBcInJlYWRcIjogdHJ1ZSwgXCJyZWFkRGF0ZVwiOiBcIjIwMTQtMTItMDFUMDY6Mjc6MzguMzM5WlwiIH0sIHsgXCJfaWRcIjogXCI1NDc4MWNhNGFiNDNkMWQ0MTEzYWJmZjFcIiwgXCJ0ZXh0XCI6IFwiQ3JlYXRlIGFtYXppbmcgYXBwcyAtIGlvbmljZnJhbWV3b3JrLmNvbVwiLCBcInVzZXJJZFwiOiBcIjUzNGI4ZTVhYWE1ZTdhZmMxYjIzZTY5YlwiLCBcImRhdGVcIjogXCIyMDE0LTExLTI5VDA2OjU2OjM2LjQ3MlpcIiwgXCJyZWFkXCI6IHRydWUsIFwicmVhZERhdGVcIjogXCIyMDE0LTEyLTAxVDA2OjI3OjM4LjMzOFpcIiB9LFxuICAgICAgICAgICAgICAgIHsgXCJfaWRcIjogXCI1MzVkNjI1Zjg5OGRmNGU4MGUyYTEyNmVcIiwgXCJwaG90b1wiOiBcImh0dHA6Ly9pb25pY2ZyYW1ld29yay5jb20vaW1nL2hvbWVwYWdlL3Bob25lcy12aWV3YXBwXzJ4LnBuZ1wiLCBcInVzZXJJZFwiOiBcIjU0NmE1ODQzZmQ0YzVkNTgxZWZhMjYzYVwiLCBcImRhdGVcIjogXCIyMDE1LTA4LTI1VDIwOjAyOjM5LjA4MlpcIiwgXCJyZWFkXCI6IHRydWUsIFwicmVhZERhdGVcIjogXCIyMDE0LTEzLTAyVDA2OjI3OjM3Ljk0NFpcIiB9XSwgXCJ1bnJlYWRcIjogMFxuICAgICAgICB9O1xuICAgIH1cbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdBcHAnKVxuXHRcdC5mYWN0b3J5KCdNb2RhbHMnLCBNb2RhbHMpO1xuXG5cdE1vZGFscy4kaW5qZWN0ID0gWyckaW9uaWNNb2RhbCddO1xuXHRmdW5jdGlvbiBNb2RhbHMoJGlvbmljTW9kYWwpIHtcblxuXHRcdHZhciBtb2RhbHMgPSBbXTtcblxuXHRcdHZhciBfb3Blbk1vZGFsID0gZnVuY3Rpb24gKCRzY29wZSwgdGVtcGxhdGVVcmwsIGFuaW1hdGlvbikge1xuXHRcdFx0cmV0dXJuICRpb25pY01vZGFsLmZyb21UZW1wbGF0ZVVybCh0ZW1wbGF0ZVVybCwge1xuXHRcdFx0XHRzY29wZTogJHNjb3BlLFxuXHRcdFx0XHRhbmltYXRpb246IGFuaW1hdGlvbiB8fCAnc2xpZGUtaW4tdXAnLFxuXHRcdFx0XHRiYWNrZHJvcENsaWNrVG9DbG9zZTogZmFsc2Vcblx0XHRcdH0pLnRoZW4oZnVuY3Rpb24gKG1vZGFsKSB7XG5cdFx0XHRcdG1vZGFscy5wdXNoKG1vZGFsKTtcblx0XHRcdFx0bW9kYWwuc2hvdygpO1xuXHRcdFx0fSk7XG5cdFx0fTtcblxuXHRcdHZhciBfY2xvc2VNb2RhbCA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdHZhciBjdXJyZW50TW9kYWwgPSBtb2RhbHMuc3BsaWNlKC0xLCAxKVswXTtcblx0XHRcdGN1cnJlbnRNb2RhbC5yZW1vdmUoKTtcblx0XHR9O1xuXG5cdFx0dmFyIF9jbG9zZUFsbE1vZGFscyA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdG1vZGFscy5tYXAoZnVuY3Rpb24gKG1vZGFsKSB7XG5cdFx0XHRcdG1vZGFsLnJlbW92ZSgpO1xuXHRcdFx0fSk7XG5cdFx0XHRtb2RhbHMgPSBbXTtcblx0XHR9O1xuXG5cdFx0cmV0dXJuIHtcblx0XHRcdG9wZW5Nb2RhbDogX29wZW5Nb2RhbCxcblx0XHRcdGNsb3NlTW9kYWw6IF9jbG9zZU1vZGFsLFxuXHRcdFx0Y2xvc2VBbGxNb2RhbHM6IF9jbG9zZUFsbE1vZGFsc1xuXHRcdH07XG5cdH1cbn0pKCk7IiwiKGZ1bmN0aW9uICgpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdBcHAnKVxuXHRcdC5mYWN0b3J5KCdNb2RlbCcsIE1vZGVsKTtcblxuXHQvL01vZGVsLiRpbmplY3QgPSBbJ1VzZXJzJ107XG5cdGZ1bmN0aW9uIE1vZGVsKCkge1xuXG5cdFx0cmV0dXJuIHtcblx0XHRcdFxuXHRcdH07XG5cdH1cbn0pKCk7Il19
