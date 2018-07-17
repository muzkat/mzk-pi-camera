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
    extend: 'Ext.container.Container',
    alias: 'widget.mzkPiCameraMain',

    title: 'Muzkat Pi Camera',

    layout: 'center',

    items: [{
        xtype: 'panel',
        width: '80%',
        layout: 'fit',

        items: [{
            xtype: 'container',
            itemId: 'preview'
        }],

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
        }]
    }],

    initComponent: function () {
        var me = this;
        this.callParent(arguments);
        me.getPhotos().then(function (array) {
            var html = 'Keine Bilder vorhanden';
            if (array.length > 0) {
                var imgName = array[0].name;
                html = '<img src="/serve/' + imgName + '">';
            }
            me.down('#preview').setHtml(html);
        }, function (error) {
            Ext.toast(error);
        });
    },

    takePhoto: function (url) {
        return new Ext.Promise(function (resolve, reject) {
            Ext.Ajax.request({
                url: '/photos/take',
                success: function (response) {
                    resolve(Ext.decode(response.responseText, true));
                },

                failure: function (response) {
                    reject(response.status);
                }
            });
        });
    },

    getPhotos: function (url) {
        return new Ext.Promise(function (resolve, reject) {
            Ext.Ajax.request({
                url: '/photos',
                success: function (response) {
                    resolve(Ext.decode(response.responseText, true));
                },
                failure: function (response) {
                    reject(response.status);
                }
            });
        });
    }
});
},{}]},{},[2,3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvbXV6a2F0LWV4dC1hcHAvYXBwLmpzIiwic3JjL2FwcC5qcyIsInNyYy9temstcGktY2FtZXJhL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLyoqXG4gKiBFeHRKUyBQcm90b3R5cGUga2l0IGJ5IG11emthdFxuICpcbiAqIEBwYXJhbSBuYW1lXG4gKiBAcGFyYW0gbWFpbkNvbXBvbmVudFxuICogQHBhcmFtIGxvZ2luTmVlZGVkXG4gKiBAcmV0dXJucyB7e2FwcERlc2NyaXB0b3I6IHtuYW1lOiAqLCBtYWluQ29tcG9uZW50OiAqLCBsb2dpbk5lZWRlZDogKn0sIGFwcDogdW5kZWZpbmVkLCBsYXVuY2hBcHA6IGxhdW5jaEFwcCwgZGVmaW5lQmFzZUNsYXNzOiBkZWZpbmVCYXNlQ2xhc3MsIHN0YXJ0OiBzdGFydH19XG4gKi9cbmZ1bmN0aW9uIG11emthdEFwcChuYW1lLCBtYWluQ29tcG9uZW50LCBsb2dpbk5lZWRlZCwgZmlsZSkge1xuXG4gICAgdmFyIGFwcE5hbWUgPSBuYW1lO1xuICAgIHZhciBhcHBNYWluQ29tcG9uZW50ID0gbWFpbkNvbXBvbmVudDtcbiAgICB2YXIgYXBwTG9naW5OZWVkZWQgPSBsb2dpbk5lZWRlZDtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGFwcDogdW5kZWZpbmVkLFxuICAgICAgICBhcHBOYW1lOiBhcHBOYW1lLFxuICAgICAgICBhcHBNYWluQ29tcG9uZW50OiBhcHBNYWluQ29tcG9uZW50LFxuICAgICAgICBhcHBMb2dpbk5lZWRlZDogYXBwTG9naW5OZWVkZWQsXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0gZGVzY3JpcHRvclxuICAgICAgICAgKi9cbiAgICAgICAgbGF1bmNoQXBwOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLmRlZmluZUJhc2VDbGFzcygpO1xuICAgICAgICAgICAgdGhpcy5zdGFydCgpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIG5hbWVcbiAgICAgICAgICogQHBhcmFtIG1haW5Db21wb25lbnRcbiAgICAgICAgICogQHBhcmFtIGxvZ2luTmVlZGVkXG4gICAgICAgICAqL1xuICAgICAgICBkZWZpbmVCYXNlQ2xhc3M6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBtZSA9IHRoaXM7XG4gICAgICAgICAgICBFeHQuZGVmaW5lKG1lLmFwcE5hbWUgKyAnLk1haW5BcHBsaWNhdGlvbicsIHtcbiAgICAgICAgICAgICAgICBleHRlbmQ6ICdFeHQuY29udGFpbmVyLkNvbnRhaW5lcicsXG4gICAgICAgICAgICAgICAgYWxpYXM6ICd3aWRnZXQuJyArIG1lLmFwcE5hbWUgKyAnTWFpbicsXG4gICAgICAgICAgICAgICAgbGF5b3V0OiAnZml0JyxcblxuICAgICAgICAgICAgICAgIHJlcXVlc3RMb2dpbjogbWUuYXBwTG9naW5OZWVkZWQsXG4gICAgICAgICAgICAgICAgbWFpbkNvbXBvbmVudDogbWUuYXBwTWFpbkNvbXBvbmVudCxcbiAgICAgICAgICAgICAgICBhcHBOYW1lOiBtZS5hcHBOYW1lLFxuXG4gICAgICAgICAgICAgICAgZmlsZUFycmF5OiBbXSxcblxuICAgICAgICAgICAgICAgIGluaXRDb21wb25lbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGl0ZW1zID0gW107XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnJlcXVlc3RMb2dpbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXMgPSBbe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHh0eXBlOiAnY29udGFpbmVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBodG1sOiAnbG9naW4gcmVxdWlyZWQuLi4nXG4gICAgICAgICAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMubWFpbkNvbXBvbmVudCAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtcyA9IFt7eHR5cGU6IHRoaXMubWFpbkNvbXBvbmVudH1dXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZmlsZUFycmF5LnB1c2goZmlsZS51cmwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zID0gW3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHR5cGU6ICdidXR0b24nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXlvdXQ6ICdmaXQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiAnTXV6a2F0IEZyYW1lIHdhcyBsb2FkZWQgd2l0aG91dCBtb2R1bGUgT1Igc3VwcGxpZWQgd2l0aCBhIG1vZHVsZSB1cmwuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlcjogZnVuY3Rpb24gKGJ0bikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG12ID0gYnRuLnVwKGFwcE5hbWUgKyAnTWFpbicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbXYuY2hhbmdlQ29tcG9uZW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLml0ZW1zID0gaXRlbXM7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2FsbFBhcmVudChhcmd1bWVudHMpO1xuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICBjaGFuZ2VDb21wb25lbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1lID0gdGhpcztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2FkU2NyaXB0cyh0aGlzLmZpbGVBcnJheSkudGhlbihmdW5jdGlvbiAoc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgRXh0LmRlZmVyKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZS5yZW1vdmVBbGwoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZS5hZGQoe3h0eXBlOiBmaWxlLmNtcH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgMzAwKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIGxvYWRTY3JpcHRzOiBmdW5jdGlvbiAoanNDc3NBcnJheSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbG9hZGluZ0FycmF5ID0gW10sIG1lID0gdGhpcztcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBFeHQuUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBFeHQuQXJyYXkuZWFjaChqc0Nzc0FycmF5LCBmdW5jdGlvbiAodXJsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9hZGluZ0FycmF5LnB1c2gobWUubG9hZFNjcmlwdCh1cmwpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBFeHQuUHJvbWlzZS5hbGwobG9hZGluZ0FycmF5KS50aGVuKGZ1bmN0aW9uIChzdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdhcnRlZmFjdHMgd2VyZSBsb2FkZWQgc3VjY2Vzc2Z1bGx5Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoJycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdCgnRXJyb3IgZHVyaW5nIGFydGVmYWN0IGxvYWRpbmcuLi4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIGxvYWRTY3JpcHQ6IGZ1bmN0aW9uICh1cmwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBFeHQuUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBFeHQuTG9hZGVyLmxvYWRTY3JpcHQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybDogdXJsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uTG9hZDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh1cmwgKyAnIHdhcyBsb2FkZWQgc3VjY2Vzc2Z1bGx5Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoJ0xvYWRpbmcgd2FzIHN1Y2Nlc3NmdWwnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uRXJyb3I6IGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoJ0xvYWRpbmcgd2FzIG5vdCBzdWNjZXNzZnVsIGZvcjogJyArIHVybCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICovXG4gICAgICAgIHN0YXJ0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgbWUgPSB0aGlzO1xuICAgICAgICAgICAgdGhpcy5hcHAgPSBFeHQuYXBwbGljYXRpb24oe1xuICAgICAgICAgICAgICAgIG5hbWU6IG1lLmFwcE5hbWUsXG4gICAgICAgICAgICAgICAgbXV6a2F0QXBwUmVmOiB0aGlzLFxuICAgICAgICAgICAgICAgIG1haW5WaWV3OiBtZS5hcHBOYW1lICsgJy5NYWluQXBwbGljYXRpb24nLFxuICAgICAgICAgICAgICAgIGxhdW5jaDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBFeHQubG9nKG1lLmFwcE5hbWUgKyAnIGJvb3RlZCEnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbXV6a2F0QXBwOyIsIi8qXG5DcmVhdGVkIGJ5IEVyaWsgV29pdHNjaGlnIEBkZXZibnpcbiovXG5jb25zdCBtdXprYXRBcHAgPSByZXF1aXJlKCdtdXprYXQtZXh0LWFwcCcpO1xuXG5jb25zdCBwdCA9IG5ldyBtdXprYXRBcHAoJ011emthdCBQaSBDYW1lcmEnLCAnbXprUGlDYW1lcmFNYWluJywgZmFsc2UpO1xucHQubGF1bmNoQXBwKCk7IiwiLypcbkNyZWF0ZWQgYnkgRXJpayBXb2l0c2NoaWcgQGRldmJuelxuKi9cbkV4dC5kZWZpbmUoJ211emthdC5waS5jYW1lcmEuTWFpbicsIHtcbiAgICBleHRlbmQ6ICdFeHQuY29udGFpbmVyLkNvbnRhaW5lcicsXG4gICAgYWxpYXM6ICd3aWRnZXQubXprUGlDYW1lcmFNYWluJyxcblxuICAgIHRpdGxlOiAnTXV6a2F0IFBpIENhbWVyYScsXG5cbiAgICBsYXlvdXQ6ICdjZW50ZXInLFxuXG4gICAgaXRlbXM6IFt7XG4gICAgICAgIHh0eXBlOiAncGFuZWwnLFxuICAgICAgICB3aWR0aDogJzgwJScsXG4gICAgICAgIGxheW91dDogJ2ZpdCcsXG5cbiAgICAgICAgaXRlbXM6IFt7XG4gICAgICAgICAgICB4dHlwZTogJ2NvbnRhaW5lcicsXG4gICAgICAgICAgICBpdGVtSWQ6ICdwcmV2aWV3J1xuICAgICAgICB9XSxcblxuICAgICAgICBiYmFyOiBbe1xuICAgICAgICAgICAgdGV4dDogJ1Rha2UgUGljdHVyZScsXG4gICAgICAgICAgICBpY29uQ2xzOiAneC1mYSBmYS1waG90bycsXG4gICAgICAgICAgICBoYW5kbGVyOiBmdW5jdGlvbiAoYnRuKSB7XG4gICAgICAgICAgICAgICAgdmFyIG1haW5WaWV3ID0gYnRuLnVwKCdtemtQaUNhbWVyYU1haW4nKTtcbiAgICAgICAgICAgICAgICBpZiAoRXh0LmlzRGVmaW5lZChtYWluVmlldykgJiYgbWFpblZpZXcuaXNDb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgbWFpblZpZXcudGFrZVBob3RvKCkudGhlbihmdW5jdGlvbiAoc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgRXh0LnRvYXN0KEpTT04uc3RyaW5naWZ5KHN1Y2Nlc3MpKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBFeHQudG9hc3QoZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIHRleHQ6ICdHYWxsZXJ5JyxcbiAgICAgICAgICAgIGljb25DbHM6ICd4LWZhIGZhLWZpbGUtaW1hZ2UtbydcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgeHR5cGU6ICd0YmZpbGwnXG4gICAgICAgIH1dXG4gICAgfV0sXG5cbiAgICBpbml0Q29tcG9uZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBtZSA9IHRoaXM7XG4gICAgICAgIHRoaXMuY2FsbFBhcmVudChhcmd1bWVudHMpO1xuICAgICAgICBtZS5nZXRQaG90b3MoKS50aGVuKGZ1bmN0aW9uIChhcnJheSkge1xuICAgICAgICAgICAgdmFyIGh0bWwgPSAnS2VpbmUgQmlsZGVyIHZvcmhhbmRlbic7XG4gICAgICAgICAgICBpZiAoYXJyYXkubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHZhciBpbWdOYW1lID0gYXJyYXlbMF0ubmFtZTtcbiAgICAgICAgICAgICAgICBodG1sID0gJzxpbWcgc3JjPVwiL3NlcnZlLycgKyBpbWdOYW1lICsgJ1wiPic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBtZS5kb3duKCcjcHJldmlldycpLnNldEh0bWwoaHRtbCk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgICAgRXh0LnRvYXN0KGVycm9yKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIHRha2VQaG90bzogZnVuY3Rpb24gKHVybCkge1xuICAgICAgICByZXR1cm4gbmV3IEV4dC5Qcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIEV4dC5BamF4LnJlcXVlc3Qoe1xuICAgICAgICAgICAgICAgIHVybDogJy9waG90b3MvdGFrZScsXG4gICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoRXh0LmRlY29kZShyZXNwb25zZS5yZXNwb25zZVRleHQsIHRydWUpKTtcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgZmFpbHVyZTogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChyZXNwb25zZS5zdGF0dXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgZ2V0UGhvdG9zOiBmdW5jdGlvbiAodXJsKSB7XG4gICAgICAgIHJldHVybiBuZXcgRXh0LlByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgRXh0LkFqYXgucmVxdWVzdCh7XG4gICAgICAgICAgICAgICAgdXJsOiAnL3Bob3RvcycsXG4gICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoRXh0LmRlY29kZShyZXNwb25zZS5yZXNwb25zZVRleHQsIHRydWUpKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGZhaWx1cmU6IGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QocmVzcG9uc2Uuc3RhdHVzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxufSk7Il19
