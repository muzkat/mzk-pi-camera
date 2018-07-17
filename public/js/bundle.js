(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/*! muzkatpie - v1.0.0 - 2018-07-17 */const muzkatApp = require('muzkat-ext-app');

const pt = new muzkatApp('Muzkat Pi Camera', 'mzkPiCameraMain', false);
pt.launchApp();
Ext.define('muzkat.pi.camera.Api', {
    singleton: true,

    getPromise: function (url) {
        return new Ext.Promise(function (resolve, reject) {
            Ext.Ajax.request({
                url: url,
                success: function (response) {
                    resolve(Ext.decode(response.responseText, true));
                },

                failure: function (response) {
                    reject(response.status);
                }
            });
        });
    },

    takePhoto: function () {
        return muzkat.pi.camera.Api.getPromise('/photos/take');
    },

    getPhotos: function () {
        return muzkat.pi.camera.Api.getPromise('/photos');
    }
});
Ext.define('muzkat.pi.camera.Main', {
    extend: 'Ext.container.Container',
    alias: 'widget.mzkPiCameraMain',

    title: 'Muzkat Pi Camera',

    layout: 'center',

    items: [{
        xtype: 'panel',

        width: '80%',
        height: '80%',
        layout: 'fit',

        items: [{
            xtype: 'panel',
            itemId: 'preview',
            layout: 'fit',
            items: [{
                xtype: 'container',
                defaultHtmlHeadline: '<h3>Muzkat Pi Camera</h3>',
                html: '<h3>Muzkat Pi Camera</h3>',
                updateHtmlContent: function (html) {
                    this.setHtml(this.defaultHtmlHeadline + html);
                },
                updateImage: function (imageUrl) {
                    var html = '<img src="/serve/' + imageUrl + '" height="480" width="640">';
                    this.updateHtmlContent(html);
                }
            }],
            dockedItems: [{
                xtype: 'toolbar',
                dock: 'bottom',
                overflowHandler: 'scroller',
                items: []
            }]
        }],

        bbar: [{
            text: 'Take Picture',
            scale: 'medium',
            iconCls: 'x-fa fa-photo',
            handler: function (btn) {
                var mainView = btn.up('mzkPiCameraMain');
                muzkat.pi.camera.Api.takePhoto().then(function (success) {
                    mainView.refreshGui();
                }, function (error) {
                    Ext.toast(error);
                });
            }
        }, {
            text: 'Gallery',
            scale: 'medium',
            iconCls: 'x-fa fa-file-image-o'
        }, {
            xtype: 'tbfill'
        }, {
            text: 'API',
            scale: 'medium',
            iconCls: 'x-fa fa-file-image-o'
        }, {
            text: 'About',
            scale: 'medium',
            iconCls: 'x-fa fa-file-image-o'
        }]
    }],

    initComponent: function () {
        this.callParent(arguments);
        this.refreshGui();
    },

    refreshGui: function () {
        var me = this;
        muzkat.pi.camera.Api.getPhotos().then(function (array) {
            var preview = me.down('#preview');
            if (array.length > 0) {
                array = array.reverse();
                var imgContainer = preview.down('container');
                imgContainer.updateImage(array[0].name);
                var dockedItems = preview.getDockedItems('toolbar[dock="bottom"]');
                dockedItems[0].removeAll();

                Ext.Array.each(array, function (imgObj) {
                    dockedItems[0].add({
                        xtype: 'image',
                        src: '/serve/' + imgObj.name,
                        height: 90,
                        width: 120
                    })
                });
            }
        }, function (error) {
            Ext.toast(error);
        });
    }
});
},{"muzkat-ext-app":2}],2:[function(require,module,exports){
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
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkaXN0L2NvbmNhdC5qcyIsIm5vZGVfbW9kdWxlcy9tdXprYXQtZXh0LWFwcC9hcHAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLyohIG11emthdHBpZSAtIHYxLjAuMCAtIDIwMTgtMDctMTcgKi9jb25zdCBtdXprYXRBcHAgPSByZXF1aXJlKCdtdXprYXQtZXh0LWFwcCcpO1xuXG5jb25zdCBwdCA9IG5ldyBtdXprYXRBcHAoJ011emthdCBQaSBDYW1lcmEnLCAnbXprUGlDYW1lcmFNYWluJywgZmFsc2UpO1xucHQubGF1bmNoQXBwKCk7XG5FeHQuZGVmaW5lKCdtdXprYXQucGkuY2FtZXJhLkFwaScsIHtcbiAgICBzaW5nbGV0b246IHRydWUsXG5cbiAgICBnZXRQcm9taXNlOiBmdW5jdGlvbiAodXJsKSB7XG4gICAgICAgIHJldHVybiBuZXcgRXh0LlByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgRXh0LkFqYXgucmVxdWVzdCh7XG4gICAgICAgICAgICAgICAgdXJsOiB1cmwsXG4gICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoRXh0LmRlY29kZShyZXNwb25zZS5yZXNwb25zZVRleHQsIHRydWUpKTtcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgZmFpbHVyZTogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChyZXNwb25zZS5zdGF0dXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgdGFrZVBob3RvOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBtdXprYXQucGkuY2FtZXJhLkFwaS5nZXRQcm9taXNlKCcvcGhvdG9zL3Rha2UnKTtcbiAgICB9LFxuXG4gICAgZ2V0UGhvdG9zOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBtdXprYXQucGkuY2FtZXJhLkFwaS5nZXRQcm9taXNlKCcvcGhvdG9zJyk7XG4gICAgfVxufSk7XG5FeHQuZGVmaW5lKCdtdXprYXQucGkuY2FtZXJhLk1haW4nLCB7XG4gICAgZXh0ZW5kOiAnRXh0LmNvbnRhaW5lci5Db250YWluZXInLFxuICAgIGFsaWFzOiAnd2lkZ2V0Lm16a1BpQ2FtZXJhTWFpbicsXG5cbiAgICB0aXRsZTogJ011emthdCBQaSBDYW1lcmEnLFxuXG4gICAgbGF5b3V0OiAnY2VudGVyJyxcblxuICAgIGl0ZW1zOiBbe1xuICAgICAgICB4dHlwZTogJ3BhbmVsJyxcblxuICAgICAgICB3aWR0aDogJzgwJScsXG4gICAgICAgIGhlaWdodDogJzgwJScsXG4gICAgICAgIGxheW91dDogJ2ZpdCcsXG5cbiAgICAgICAgaXRlbXM6IFt7XG4gICAgICAgICAgICB4dHlwZTogJ3BhbmVsJyxcbiAgICAgICAgICAgIGl0ZW1JZDogJ3ByZXZpZXcnLFxuICAgICAgICAgICAgbGF5b3V0OiAnZml0JyxcbiAgICAgICAgICAgIGl0ZW1zOiBbe1xuICAgICAgICAgICAgICAgIHh0eXBlOiAnY29udGFpbmVyJyxcbiAgICAgICAgICAgICAgICBkZWZhdWx0SHRtbEhlYWRsaW5lOiAnPGgzPk11emthdCBQaSBDYW1lcmE8L2gzPicsXG4gICAgICAgICAgICAgICAgaHRtbDogJzxoMz5NdXprYXQgUGkgQ2FtZXJhPC9oMz4nLFxuICAgICAgICAgICAgICAgIHVwZGF0ZUh0bWxDb250ZW50OiBmdW5jdGlvbiAoaHRtbCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldEh0bWwodGhpcy5kZWZhdWx0SHRtbEhlYWRsaW5lICsgaHRtbCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB1cGRhdGVJbWFnZTogZnVuY3Rpb24gKGltYWdlVXJsKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBodG1sID0gJzxpbWcgc3JjPVwiL3NlcnZlLycgKyBpbWFnZVVybCArICdcIiBoZWlnaHQ9XCI0ODBcIiB3aWR0aD1cIjY0MFwiPic7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlSHRtbENvbnRlbnQoaHRtbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICBkb2NrZWRJdGVtczogW3tcbiAgICAgICAgICAgICAgICB4dHlwZTogJ3Rvb2xiYXInLFxuICAgICAgICAgICAgICAgIGRvY2s6ICdib3R0b20nLFxuICAgICAgICAgICAgICAgIG92ZXJmbG93SGFuZGxlcjogJ3Njcm9sbGVyJyxcbiAgICAgICAgICAgICAgICBpdGVtczogW11cbiAgICAgICAgICAgIH1dXG4gICAgICAgIH1dLFxuXG4gICAgICAgIGJiYXI6IFt7XG4gICAgICAgICAgICB0ZXh0OiAnVGFrZSBQaWN0dXJlJyxcbiAgICAgICAgICAgIHNjYWxlOiAnbWVkaXVtJyxcbiAgICAgICAgICAgIGljb25DbHM6ICd4LWZhIGZhLXBob3RvJyxcbiAgICAgICAgICAgIGhhbmRsZXI6IGZ1bmN0aW9uIChidG4pIHtcbiAgICAgICAgICAgICAgICB2YXIgbWFpblZpZXcgPSBidG4udXAoJ216a1BpQ2FtZXJhTWFpbicpO1xuICAgICAgICAgICAgICAgIG11emthdC5waS5jYW1lcmEuQXBpLnRha2VQaG90bygpLnRoZW4oZnVuY3Rpb24gKHN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgbWFpblZpZXcucmVmcmVzaEd1aSgpO1xuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBFeHQudG9hc3QoZXJyb3IpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCB7XG4gICAgICAgICAgICB0ZXh0OiAnR2FsbGVyeScsXG4gICAgICAgICAgICBzY2FsZTogJ21lZGl1bScsXG4gICAgICAgICAgICBpY29uQ2xzOiAneC1mYSBmYS1maWxlLWltYWdlLW8nXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIHh0eXBlOiAndGJmaWxsJ1xuICAgICAgICB9LCB7XG4gICAgICAgICAgICB0ZXh0OiAnQVBJJyxcbiAgICAgICAgICAgIHNjYWxlOiAnbWVkaXVtJyxcbiAgICAgICAgICAgIGljb25DbHM6ICd4LWZhIGZhLWZpbGUtaW1hZ2UtbydcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgdGV4dDogJ0Fib3V0JyxcbiAgICAgICAgICAgIHNjYWxlOiAnbWVkaXVtJyxcbiAgICAgICAgICAgIGljb25DbHM6ICd4LWZhIGZhLWZpbGUtaW1hZ2UtbydcbiAgICAgICAgfV1cbiAgICB9XSxcblxuICAgIGluaXRDb21wb25lbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5jYWxsUGFyZW50KGFyZ3VtZW50cyk7XG4gICAgICAgIHRoaXMucmVmcmVzaEd1aSgpO1xuICAgIH0sXG5cbiAgICByZWZyZXNoR3VpOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBtZSA9IHRoaXM7XG4gICAgICAgIG11emthdC5waS5jYW1lcmEuQXBpLmdldFBob3RvcygpLnRoZW4oZnVuY3Rpb24gKGFycmF5KSB7XG4gICAgICAgICAgICB2YXIgcHJldmlldyA9IG1lLmRvd24oJyNwcmV2aWV3Jyk7XG4gICAgICAgICAgICBpZiAoYXJyYXkubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGFycmF5ID0gYXJyYXkucmV2ZXJzZSgpO1xuICAgICAgICAgICAgICAgIHZhciBpbWdDb250YWluZXIgPSBwcmV2aWV3LmRvd24oJ2NvbnRhaW5lcicpO1xuICAgICAgICAgICAgICAgIGltZ0NvbnRhaW5lci51cGRhdGVJbWFnZShhcnJheVswXS5uYW1lKTtcbiAgICAgICAgICAgICAgICB2YXIgZG9ja2VkSXRlbXMgPSBwcmV2aWV3LmdldERvY2tlZEl0ZW1zKCd0b29sYmFyW2RvY2s9XCJib3R0b21cIl0nKTtcbiAgICAgICAgICAgICAgICBkb2NrZWRJdGVtc1swXS5yZW1vdmVBbGwoKTtcblxuICAgICAgICAgICAgICAgIEV4dC5BcnJheS5lYWNoKGFycmF5LCBmdW5jdGlvbiAoaW1nT2JqKSB7XG4gICAgICAgICAgICAgICAgICAgIGRvY2tlZEl0ZW1zWzBdLmFkZCh7XG4gICAgICAgICAgICAgICAgICAgICAgICB4dHlwZTogJ2ltYWdlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNyYzogJy9zZXJ2ZS8nICsgaW1nT2JqLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IDkwLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDEyMFxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAgIEV4dC50b2FzdChlcnJvcik7XG4gICAgICAgIH0pO1xuICAgIH1cbn0pOyIsIi8qKlxuICogRXh0SlMgUHJvdG90eXBlIGtpdCBieSBtdXprYXRcbiAqXG4gKiBAcGFyYW0gbmFtZVxuICogQHBhcmFtIG1haW5Db21wb25lbnRcbiAqIEBwYXJhbSBsb2dpbk5lZWRlZFxuICogQHJldHVybnMge3thcHBEZXNjcmlwdG9yOiB7bmFtZTogKiwgbWFpbkNvbXBvbmVudDogKiwgbG9naW5OZWVkZWQ6ICp9LCBhcHA6IHVuZGVmaW5lZCwgbGF1bmNoQXBwOiBsYXVuY2hBcHAsIGRlZmluZUJhc2VDbGFzczogZGVmaW5lQmFzZUNsYXNzLCBzdGFydDogc3RhcnR9fVxuICovXG5mdW5jdGlvbiBtdXprYXRBcHAobmFtZSwgbWFpbkNvbXBvbmVudCwgbG9naW5OZWVkZWQsIGZpbGUpIHtcblxuICAgIHZhciBhcHBOYW1lID0gbmFtZTtcbiAgICB2YXIgYXBwTWFpbkNvbXBvbmVudCA9IG1haW5Db21wb25lbnQ7XG4gICAgdmFyIGFwcExvZ2luTmVlZGVkID0gbG9naW5OZWVkZWQ7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBhcHA6IHVuZGVmaW5lZCxcbiAgICAgICAgYXBwTmFtZTogYXBwTmFtZSxcbiAgICAgICAgYXBwTWFpbkNvbXBvbmVudDogYXBwTWFpbkNvbXBvbmVudCxcbiAgICAgICAgYXBwTG9naW5OZWVkZWQ6IGFwcExvZ2luTmVlZGVkLFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIGRlc2NyaXB0b3JcbiAgICAgICAgICovXG4gICAgICAgIGxhdW5jaEFwcDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5kZWZpbmVCYXNlQ2xhc3MoKTtcbiAgICAgICAgICAgIHRoaXMuc3RhcnQoKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSBuYW1lXG4gICAgICAgICAqIEBwYXJhbSBtYWluQ29tcG9uZW50XG4gICAgICAgICAqIEBwYXJhbSBsb2dpbk5lZWRlZFxuICAgICAgICAgKi9cbiAgICAgICAgZGVmaW5lQmFzZUNsYXNzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgbWUgPSB0aGlzO1xuICAgICAgICAgICAgRXh0LmRlZmluZShtZS5hcHBOYW1lICsgJy5NYWluQXBwbGljYXRpb24nLCB7XG4gICAgICAgICAgICAgICAgZXh0ZW5kOiAnRXh0LmNvbnRhaW5lci5Db250YWluZXInLFxuICAgICAgICAgICAgICAgIGFsaWFzOiAnd2lkZ2V0LicgKyBtZS5hcHBOYW1lICsgJ01haW4nLFxuICAgICAgICAgICAgICAgIGxheW91dDogJ2ZpdCcsXG5cbiAgICAgICAgICAgICAgICByZXF1ZXN0TG9naW46IG1lLmFwcExvZ2luTmVlZGVkLFxuICAgICAgICAgICAgICAgIG1haW5Db21wb25lbnQ6IG1lLmFwcE1haW5Db21wb25lbnQsXG4gICAgICAgICAgICAgICAgYXBwTmFtZTogbWUuYXBwTmFtZSxcblxuICAgICAgICAgICAgICAgIGZpbGVBcnJheTogW10sXG5cbiAgICAgICAgICAgICAgICBpbml0Q29tcG9uZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpdGVtcyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5yZXF1ZXN0TG9naW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zID0gW3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4dHlwZTogJ2NvbnRhaW5lcicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaHRtbDogJ2xvZ2luIHJlcXVpcmVkLi4uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm1haW5Db21wb25lbnQgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXMgPSBbe3h0eXBlOiB0aGlzLm1haW5Db21wb25lbnR9XVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZpbGVBcnJheS5wdXNoKGZpbGUudXJsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtcyA9IFt7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHh0eXBlOiAnYnV0dG9uJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGF5b3V0OiAnZml0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogJ011emthdCBGcmFtZSB3YXMgbG9hZGVkIHdpdGhvdXQgbW9kdWxlIE9SIHN1cHBsaWVkIHdpdGggYSBtb2R1bGUgdXJsLicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZXI6IGZ1bmN0aW9uIChidG4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtdiA9IGJ0bi51cChhcHBOYW1lICsgJ01haW4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG12LmNoYW5nZUNvbXBvbmVudCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfV07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pdGVtcyA9IGl0ZW1zO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNhbGxQYXJlbnQoYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgY2hhbmdlQ29tcG9uZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBtZSA9IHRoaXM7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9hZFNjcmlwdHModGhpcy5maWxlQXJyYXkpLnRoZW4oZnVuY3Rpb24gKHN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIEV4dC5kZWZlcihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWUucmVtb3ZlQWxsKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWUuYWRkKHt4dHlwZTogZmlsZS5jbXB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIDMwMCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICBsb2FkU2NyaXB0czogZnVuY3Rpb24gKGpzQ3NzQXJyYXkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxvYWRpbmdBcnJheSA9IFtdLCBtZSA9IHRoaXM7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgRXh0LlByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgRXh0LkFycmF5LmVhY2goanNDc3NBcnJheSwgZnVuY3Rpb24gKHVybCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRpbmdBcnJheS5wdXNoKG1lLmxvYWRTY3JpcHQodXJsKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgRXh0LlByb21pc2UuYWxsKGxvYWRpbmdBcnJheSkudGhlbihmdW5jdGlvbiAoc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnYXJ0ZWZhY3RzIHdlcmUgbG9hZGVkIHN1Y2Nlc3NmdWxseScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoJ0Vycm9yIGR1cmluZyBhcnRlZmFjdCBsb2FkaW5nLi4uJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICBsb2FkU2NyaXB0OiBmdW5jdGlvbiAodXJsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgRXh0LlByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgRXh0LkxvYWRlci5sb2FkU2NyaXB0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmw6IHVybCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkxvYWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2codXJsICsgJyB3YXMgbG9hZGVkIHN1Y2Nlc3NmdWxseScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCdMb2FkaW5nIHdhcyBzdWNjZXNzZnVsJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkVycm9yOiBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KCdMb2FkaW5nIHdhcyBub3Qgc3VjY2Vzc2Z1bCBmb3I6ICcgKyB1cmwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqL1xuICAgICAgICBzdGFydDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIG1lID0gdGhpcztcbiAgICAgICAgICAgIHRoaXMuYXBwID0gRXh0LmFwcGxpY2F0aW9uKHtcbiAgICAgICAgICAgICAgICBuYW1lOiBtZS5hcHBOYW1lLFxuICAgICAgICAgICAgICAgIG11emthdEFwcFJlZjogdGhpcyxcbiAgICAgICAgICAgICAgICBtYWluVmlldzogbWUuYXBwTmFtZSArICcuTWFpbkFwcGxpY2F0aW9uJyxcbiAgICAgICAgICAgICAgICBsYXVuY2g6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgRXh0LmxvZyhtZS5hcHBOYW1lICsgJyBib290ZWQhJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG11emthdEFwcDsiXX0=
