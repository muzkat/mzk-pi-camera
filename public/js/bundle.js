(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/**
 * ExtJS Prototype kit by muzkat
 *
 * @param name
 * @param mainComponent
 * @param loginNeeded
 * @returns {{appDescriptor: {name: *, mainComponent: *, loginNeeded: *}, app: undefined, launchApp: launchApp, defineBaseClass: defineBaseClass, start: start}}
 */
function muzkatApp(name, mainComponent, loginNeeded, file) {

    var appName = name;
    var appMainComponent = mainComponent;
    var appLoginNeeded = loginNeeded;

    return {
        app: undefined,
        appName: appName,
        appMainComponent: appMainComponent,
        appLoginNeeded: appLoginNeeded,
        /**
         *
         * @param descriptor
         */
        launchApp: function () {
            this.defineBaseClass();
            this.start();
        },
        /**
         *
         * @param name
         * @param mainComponent
         * @param loginNeeded
         */
        defineBaseClass: function () {
            var me = this;
            Ext.define(me.appName + '.MainApplication', {
                extend: 'Ext.container.Container',
                alias: 'widget.' + me.appName + 'Main',
                layout: 'fit',

                requestLogin: me.appLoginNeeded,
                mainComponent: me.appMainComponent,
                appName: me.appName,

                fileArray: [],

                initComponent: function () {
                    var items = [];
                    if (this.requestLogin) {
                        items = [{
                            xtype: 'container',
                            html: 'login required...'
                        }]
                    } else {
                        if (this.mainComponent !== false) {
                            items = [{xtype: this.mainComponent}]
                        } else {
                            this.fileArray.push(file.url);
                            items = [{
                                xtype: 'button',
                                layout: 'fit',
                                text: 'Muzkat Frame was loaded without module OR supplied with a module url.',
                                handler: function (btn) {
                                    var mv = btn.up(appName + 'Main');
                                    mv.changeComponent();
                                }
                            }];
                        }
                    }
                    this.items = items;
                    this.callParent(arguments);
                },

                changeComponent: function () {
                    var me = this;
                    this.loadScripts(this.fileArray).then(function (success) {
                        Ext.defer(function () {
                            me.removeAll();
                            me.add({xtype: file.cmp});
                        }, 300);
                    });
                },

                loadScripts: function (jsCssArray) {
                    var loadingArray = [], me = this;
                    return new Ext.Promise(function (resolve, reject) {
                        Ext.Array.each(jsCssArray, function (url) {
                            loadingArray.push(me.loadScript(url));
                        });

                        Ext.Promise.all(loadingArray).then(function (success) {
                                console.log('artefacts were loaded successfully');
                                resolve('');
                            },
                            function (error) {
                                reject('Error during artefact loading...');
                            });
                    });
                },

                loadScript: function (url) {
                    return new Ext.Promise(function (resolve, reject) {
                        Ext.Loader.loadScript({
                            url: url,
                            onLoad: function () {
                                console.log(url + ' was loaded successfully');
                                resolve('Loading was successful');
                            },
                            onError: function (error) {
                                reject('Loading was not successful for: ' + url);
                            }
                        });
                    });
                }
            });
        },
        /**
         *
         */
        start: function () {
            var me = this;
            this.app = Ext.application({
                name: me.appName,
                muzkatAppRef: this,
                mainView: me.appName + '.MainApplication',
                launch: function () {
                    Ext.log(me.appName + ' booted!');
                }
            });
        }
    };
}

module.exports = muzkatApp;
},{}],2:[function(require,module,exports){
/*
Created by Erik Woitschig @devbnz
*/
const muzkatApp = require('muzkat-ext-app');

const pt = new muzkatApp('Muzkat Pi Camera', 'mzkPiCameraMain', false);
pt.launchApp();
},{"muzkat-ext-app":1}],3:[function(require,module,exports){
/*
Created by Erik Woitschig @devbnz
*/
Ext.define('muzkat.pi.camera.Main', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.mzkPiCameraMain',

    title: 'Muzkat Pi Camera',

    layout: 'fit',

    items: [{}],

    bbar: [{
        text: 'Take Picture',
        iconCls: 'x-fa fa-photo',
        handler: function (btn) {
            var mainView = btn.up('mzkPiCameraMain');
            if (Ext.isDefined(mainView) && mainView.isComponent) {
                mainView.takePhoto().then(function (success) {
                    Ext.toast(JSON.stringify(success));
                }, function (error) {
                    Ext.toast(error);
                });
            }
        }
    }, {
        text: 'Gallery',
        iconCls: 'x-fa fa-file-image-o'
    }, {
        xtype: 'tbfill'
    }],

    takePhoto: function (url) {
        return new Ext.Promise(function (resolve, reject) {
            Ext.Ajax.request({
                url: '/photos/take',

                success: function (response) {
                    resolve(Ext.decode(response.responseText, true));
                },

                failure: function (response) {
                    // Use the provided "reject" method to deliver error message.
                    //
                    reject(response.status);
                }
            });
        });
    }
});
},{}]},{},[2,3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvbXV6a2F0LWV4dC1hcHAvYXBwLmpzIiwic3JjL2FwcC5qcyIsInNyYy9temstcGktY2FtZXJhL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvKipcbiAqIEV4dEpTIFByb3RvdHlwZSBraXQgYnkgbXV6a2F0XG4gKlxuICogQHBhcmFtIG5hbWVcbiAqIEBwYXJhbSBtYWluQ29tcG9uZW50XG4gKiBAcGFyYW0gbG9naW5OZWVkZWRcbiAqIEByZXR1cm5zIHt7YXBwRGVzY3JpcHRvcjoge25hbWU6ICosIG1haW5Db21wb25lbnQ6ICosIGxvZ2luTmVlZGVkOiAqfSwgYXBwOiB1bmRlZmluZWQsIGxhdW5jaEFwcDogbGF1bmNoQXBwLCBkZWZpbmVCYXNlQ2xhc3M6IGRlZmluZUJhc2VDbGFzcywgc3RhcnQ6IHN0YXJ0fX1cbiAqL1xuZnVuY3Rpb24gbXV6a2F0QXBwKG5hbWUsIG1haW5Db21wb25lbnQsIGxvZ2luTmVlZGVkLCBmaWxlKSB7XG5cbiAgICB2YXIgYXBwTmFtZSA9IG5hbWU7XG4gICAgdmFyIGFwcE1haW5Db21wb25lbnQgPSBtYWluQ29tcG9uZW50O1xuICAgIHZhciBhcHBMb2dpbk5lZWRlZCA9IGxvZ2luTmVlZGVkO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgYXBwOiB1bmRlZmluZWQsXG4gICAgICAgIGFwcE5hbWU6IGFwcE5hbWUsXG4gICAgICAgIGFwcE1haW5Db21wb25lbnQ6IGFwcE1haW5Db21wb25lbnQsXG4gICAgICAgIGFwcExvZ2luTmVlZGVkOiBhcHBMb2dpbk5lZWRlZCxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSBkZXNjcmlwdG9yXG4gICAgICAgICAqL1xuICAgICAgICBsYXVuY2hBcHA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuZGVmaW5lQmFzZUNsYXNzKCk7XG4gICAgICAgICAgICB0aGlzLnN0YXJ0KCk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0gbmFtZVxuICAgICAgICAgKiBAcGFyYW0gbWFpbkNvbXBvbmVudFxuICAgICAgICAgKiBAcGFyYW0gbG9naW5OZWVkZWRcbiAgICAgICAgICovXG4gICAgICAgIGRlZmluZUJhc2VDbGFzczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIG1lID0gdGhpcztcbiAgICAgICAgICAgIEV4dC5kZWZpbmUobWUuYXBwTmFtZSArICcuTWFpbkFwcGxpY2F0aW9uJywge1xuICAgICAgICAgICAgICAgIGV4dGVuZDogJ0V4dC5jb250YWluZXIuQ29udGFpbmVyJyxcbiAgICAgICAgICAgICAgICBhbGlhczogJ3dpZGdldC4nICsgbWUuYXBwTmFtZSArICdNYWluJyxcbiAgICAgICAgICAgICAgICBsYXlvdXQ6ICdmaXQnLFxuXG4gICAgICAgICAgICAgICAgcmVxdWVzdExvZ2luOiBtZS5hcHBMb2dpbk5lZWRlZCxcbiAgICAgICAgICAgICAgICBtYWluQ29tcG9uZW50OiBtZS5hcHBNYWluQ29tcG9uZW50LFxuICAgICAgICAgICAgICAgIGFwcE5hbWU6IG1lLmFwcE5hbWUsXG5cbiAgICAgICAgICAgICAgICBmaWxlQXJyYXk6IFtdLFxuXG4gICAgICAgICAgICAgICAgaW5pdENvbXBvbmVudDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaXRlbXMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucmVxdWVzdExvZ2luKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtcyA9IFt7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeHR5cGU6ICdjb250YWluZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGh0bWw6ICdsb2dpbiByZXF1aXJlZC4uLidcbiAgICAgICAgICAgICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5tYWluQ29tcG9uZW50ICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zID0gW3t4dHlwZTogdGhpcy5tYWluQ29tcG9uZW50fV1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5maWxlQXJyYXkucHVzaChmaWxlLnVybCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXMgPSBbe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4dHlwZTogJ2J1dHRvbicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxheW91dDogJ2ZpdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICdNdXprYXQgRnJhbWUgd2FzIGxvYWRlZCB3aXRob3V0IG1vZHVsZSBPUiBzdXBwbGllZCB3aXRoIGEgbW9kdWxlIHVybC4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVyOiBmdW5jdGlvbiAoYnRuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbXYgPSBidG4udXAoYXBwTmFtZSArICdNYWluJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtdi5jaGFuZ2VDb21wb25lbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1dO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXRlbXMgPSBpdGVtcztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jYWxsUGFyZW50KGFyZ3VtZW50cyk7XG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIGNoYW5nZUNvbXBvbmVudDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbWUgPSB0aGlzO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvYWRTY3JpcHRzKHRoaXMuZmlsZUFycmF5KS50aGVuKGZ1bmN0aW9uIChzdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBFeHQuZGVmZXIoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lLnJlbW92ZUFsbCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lLmFkZCh7eHR5cGU6IGZpbGUuY21wfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAzMDApO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgbG9hZFNjcmlwdHM6IGZ1bmN0aW9uIChqc0Nzc0FycmF5KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBsb2FkaW5nQXJyYXkgPSBbXSwgbWUgPSB0aGlzO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEV4dC5Qcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIEV4dC5BcnJheS5lYWNoKGpzQ3NzQXJyYXksIGZ1bmN0aW9uICh1cmwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2FkaW5nQXJyYXkucHVzaChtZS5sb2FkU2NyaXB0KHVybCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIEV4dC5Qcm9taXNlLmFsbChsb2FkaW5nQXJyYXkpLnRoZW4oZnVuY3Rpb24gKHN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2FydGVmYWN0cyB3ZXJlIGxvYWRlZCBzdWNjZXNzZnVsbHknKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgnJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KCdFcnJvciBkdXJpbmcgYXJ0ZWZhY3QgbG9hZGluZy4uLicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgbG9hZFNjcmlwdDogZnVuY3Rpb24gKHVybCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEV4dC5Qcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIEV4dC5Mb2FkZXIubG9hZFNjcmlwdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiB1cmwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Mb2FkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHVybCArICcgd2FzIGxvYWRlZCBzdWNjZXNzZnVsbHknKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgnTG9hZGluZyB3YXMgc3VjY2Vzc2Z1bCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25FcnJvcjogZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdCgnTG9hZGluZyB3YXMgbm90IHN1Y2Nlc3NmdWwgZm9yOiAnICsgdXJsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKi9cbiAgICAgICAgc3RhcnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBtZSA9IHRoaXM7XG4gICAgICAgICAgICB0aGlzLmFwcCA9IEV4dC5hcHBsaWNhdGlvbih7XG4gICAgICAgICAgICAgICAgbmFtZTogbWUuYXBwTmFtZSxcbiAgICAgICAgICAgICAgICBtdXprYXRBcHBSZWY6IHRoaXMsXG4gICAgICAgICAgICAgICAgbWFpblZpZXc6IG1lLmFwcE5hbWUgKyAnLk1haW5BcHBsaWNhdGlvbicsXG4gICAgICAgICAgICAgICAgbGF1bmNoOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIEV4dC5sb2cobWUuYXBwTmFtZSArICcgYm9vdGVkIScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBtdXprYXRBcHA7IiwiLypcbkNyZWF0ZWQgYnkgRXJpayBXb2l0c2NoaWcgQGRldmJuelxuKi9cbmNvbnN0IG11emthdEFwcCA9IHJlcXVpcmUoJ211emthdC1leHQtYXBwJyk7XG5cbmNvbnN0IHB0ID0gbmV3IG11emthdEFwcCgnTXV6a2F0IFBpIENhbWVyYScsICdtemtQaUNhbWVyYU1haW4nLCBmYWxzZSk7XG5wdC5sYXVuY2hBcHAoKTsiLCIvKlxuQ3JlYXRlZCBieSBFcmlrIFdvaXRzY2hpZyBAZGV2Ym56XG4qL1xuRXh0LmRlZmluZSgnbXV6a2F0LnBpLmNhbWVyYS5NYWluJywge1xuICAgIGV4dGVuZDogJ0V4dC5wYW5lbC5QYW5lbCcsXG4gICAgYWxpYXM6ICd3aWRnZXQubXprUGlDYW1lcmFNYWluJyxcblxuICAgIHRpdGxlOiAnTXV6a2F0IFBpIENhbWVyYScsXG5cbiAgICBsYXlvdXQ6ICdmaXQnLFxuXG4gICAgaXRlbXM6IFt7fV0sXG5cbiAgICBiYmFyOiBbe1xuICAgICAgICB0ZXh0OiAnVGFrZSBQaWN0dXJlJyxcbiAgICAgICAgaWNvbkNsczogJ3gtZmEgZmEtcGhvdG8nLFxuICAgICAgICBoYW5kbGVyOiBmdW5jdGlvbiAoYnRuKSB7XG4gICAgICAgICAgICB2YXIgbWFpblZpZXcgPSBidG4udXAoJ216a1BpQ2FtZXJhTWFpbicpO1xuICAgICAgICAgICAgaWYgKEV4dC5pc0RlZmluZWQobWFpblZpZXcpICYmIG1haW5WaWV3LmlzQ29tcG9uZW50KSB7XG4gICAgICAgICAgICAgICAgbWFpblZpZXcudGFrZVBob3RvKCkudGhlbihmdW5jdGlvbiAoc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICBFeHQudG9hc3QoSlNPTi5zdHJpbmdpZnkoc3VjY2VzcykpO1xuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBFeHQudG9hc3QoZXJyb3IpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICB0ZXh0OiAnR2FsbGVyeScsXG4gICAgICAgIGljb25DbHM6ICd4LWZhIGZhLWZpbGUtaW1hZ2UtbydcbiAgICB9LCB7XG4gICAgICAgIHh0eXBlOiAndGJmaWxsJ1xuICAgIH1dLFxuXG4gICAgdGFrZVBob3RvOiBmdW5jdGlvbiAodXJsKSB7XG4gICAgICAgIHJldHVybiBuZXcgRXh0LlByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgRXh0LkFqYXgucmVxdWVzdCh7XG4gICAgICAgICAgICAgICAgdXJsOiAnL3Bob3Rvcy90YWtlJyxcblxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKEV4dC5kZWNvZGUocmVzcG9uc2UucmVzcG9uc2VUZXh0LCB0cnVlKSk7XG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIGZhaWx1cmU6IGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBVc2UgdGhlIHByb3ZpZGVkIFwicmVqZWN0XCIgbWV0aG9kIHRvIGRlbGl2ZXIgZXJyb3IgbWVzc2FnZS5cbiAgICAgICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KHJlc3BvbnNlLnN0YXR1cyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn0pOyJdfQ==
