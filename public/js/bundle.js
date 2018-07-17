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
        height: '80%',
        layout: 'fit',

        items: [{
            xtype: 'panel',
            itemId: 'preview',
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
            scale: 'medium',
            iconCls: 'x-fa fa-file-image-o'
        }, {
            xtype: 'tbfill'
        }, {
            text: 'API',
            scale: 'medium',
            iconCls: 'x-fa fa-file-image-o'
        }]
    }],

    initComponent: function () {
        var me = this;
        this.callParent(arguments);
        me.getPhotos().then(function (array) {
            var html = 'Keine Bilder vorhanden';
            if (array.length > 0) {
                var imgName = array[0].name;
                html = '<img src="/serve/' + imgName + '" height="480" width="640">';
            }
            var preview = me.down('#preview')
            preview.setHtml(html);
            var dockedItems = preview.getDockedItems('toolbar[dock="top"]');
            dockedItems[0].removeAll();

            Ext.Array.each(array.reverse(), function (imgObj) {
                dockedItems[0].add({
                    xtype: 'image',
                    src: '/serve/' + imgObj.name,
                    height: 90,
                    width: 120
                })
            });

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvbXV6a2F0LWV4dC1hcHAvYXBwLmpzIiwic3JjL2FwcC5qcyIsInNyYy9temstcGktY2FtZXJhL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8qKlxuICogRXh0SlMgUHJvdG90eXBlIGtpdCBieSBtdXprYXRcbiAqXG4gKiBAcGFyYW0gbmFtZVxuICogQHBhcmFtIG1haW5Db21wb25lbnRcbiAqIEBwYXJhbSBsb2dpbk5lZWRlZFxuICogQHJldHVybnMge3thcHBEZXNjcmlwdG9yOiB7bmFtZTogKiwgbWFpbkNvbXBvbmVudDogKiwgbG9naW5OZWVkZWQ6ICp9LCBhcHA6IHVuZGVmaW5lZCwgbGF1bmNoQXBwOiBsYXVuY2hBcHAsIGRlZmluZUJhc2VDbGFzczogZGVmaW5lQmFzZUNsYXNzLCBzdGFydDogc3RhcnR9fVxuICovXG5mdW5jdGlvbiBtdXprYXRBcHAobmFtZSwgbWFpbkNvbXBvbmVudCwgbG9naW5OZWVkZWQsIGZpbGUpIHtcblxuICAgIHZhciBhcHBOYW1lID0gbmFtZTtcbiAgICB2YXIgYXBwTWFpbkNvbXBvbmVudCA9IG1haW5Db21wb25lbnQ7XG4gICAgdmFyIGFwcExvZ2luTmVlZGVkID0gbG9naW5OZWVkZWQ7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBhcHA6IHVuZGVmaW5lZCxcbiAgICAgICAgYXBwTmFtZTogYXBwTmFtZSxcbiAgICAgICAgYXBwTWFpbkNvbXBvbmVudDogYXBwTWFpbkNvbXBvbmVudCxcbiAgICAgICAgYXBwTG9naW5OZWVkZWQ6IGFwcExvZ2luTmVlZGVkLFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIGRlc2NyaXB0b3JcbiAgICAgICAgICovXG4gICAgICAgIGxhdW5jaEFwcDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5kZWZpbmVCYXNlQ2xhc3MoKTtcbiAgICAgICAgICAgIHRoaXMuc3RhcnQoKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSBuYW1lXG4gICAgICAgICAqIEBwYXJhbSBtYWluQ29tcG9uZW50XG4gICAgICAgICAqIEBwYXJhbSBsb2dpbk5lZWRlZFxuICAgICAgICAgKi9cbiAgICAgICAgZGVmaW5lQmFzZUNsYXNzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgbWUgPSB0aGlzO1xuICAgICAgICAgICAgRXh0LmRlZmluZShtZS5hcHBOYW1lICsgJy5NYWluQXBwbGljYXRpb24nLCB7XG4gICAgICAgICAgICAgICAgZXh0ZW5kOiAnRXh0LmNvbnRhaW5lci5Db250YWluZXInLFxuICAgICAgICAgICAgICAgIGFsaWFzOiAnd2lkZ2V0LicgKyBtZS5hcHBOYW1lICsgJ01haW4nLFxuICAgICAgICAgICAgICAgIGxheW91dDogJ2ZpdCcsXG5cbiAgICAgICAgICAgICAgICByZXF1ZXN0TG9naW46IG1lLmFwcExvZ2luTmVlZGVkLFxuICAgICAgICAgICAgICAgIG1haW5Db21wb25lbnQ6IG1lLmFwcE1haW5Db21wb25lbnQsXG4gICAgICAgICAgICAgICAgYXBwTmFtZTogbWUuYXBwTmFtZSxcblxuICAgICAgICAgICAgICAgIGZpbGVBcnJheTogW10sXG5cbiAgICAgICAgICAgICAgICBpbml0Q29tcG9uZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpdGVtcyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5yZXF1ZXN0TG9naW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zID0gW3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4dHlwZTogJ2NvbnRhaW5lcicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaHRtbDogJ2xvZ2luIHJlcXVpcmVkLi4uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm1haW5Db21wb25lbnQgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXMgPSBbe3h0eXBlOiB0aGlzLm1haW5Db21wb25lbnR9XVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZpbGVBcnJheS5wdXNoKGZpbGUudXJsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtcyA9IFt7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHh0eXBlOiAnYnV0dG9uJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGF5b3V0OiAnZml0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogJ011emthdCBGcmFtZSB3YXMgbG9hZGVkIHdpdGhvdXQgbW9kdWxlIE9SIHN1cHBsaWVkIHdpdGggYSBtb2R1bGUgdXJsLicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZXI6IGZ1bmN0aW9uIChidG4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtdiA9IGJ0bi51cChhcHBOYW1lICsgJ01haW4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG12LmNoYW5nZUNvbXBvbmVudCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfV07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pdGVtcyA9IGl0ZW1zO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNhbGxQYXJlbnQoYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgY2hhbmdlQ29tcG9uZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBtZSA9IHRoaXM7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9hZFNjcmlwdHModGhpcy5maWxlQXJyYXkpLnRoZW4oZnVuY3Rpb24gKHN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIEV4dC5kZWZlcihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWUucmVtb3ZlQWxsKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWUuYWRkKHt4dHlwZTogZmlsZS5jbXB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIDMwMCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICBsb2FkU2NyaXB0czogZnVuY3Rpb24gKGpzQ3NzQXJyYXkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxvYWRpbmdBcnJheSA9IFtdLCBtZSA9IHRoaXM7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgRXh0LlByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgRXh0LkFycmF5LmVhY2goanNDc3NBcnJheSwgZnVuY3Rpb24gKHVybCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRpbmdBcnJheS5wdXNoKG1lLmxvYWRTY3JpcHQodXJsKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgRXh0LlByb21pc2UuYWxsKGxvYWRpbmdBcnJheSkudGhlbihmdW5jdGlvbiAoc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnYXJ0ZWZhY3RzIHdlcmUgbG9hZGVkIHN1Y2Nlc3NmdWxseScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoJ0Vycm9yIGR1cmluZyBhcnRlZmFjdCBsb2FkaW5nLi4uJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICBsb2FkU2NyaXB0OiBmdW5jdGlvbiAodXJsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgRXh0LlByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgRXh0LkxvYWRlci5sb2FkU2NyaXB0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmw6IHVybCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkxvYWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2codXJsICsgJyB3YXMgbG9hZGVkIHN1Y2Nlc3NmdWxseScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCdMb2FkaW5nIHdhcyBzdWNjZXNzZnVsJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkVycm9yOiBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KCdMb2FkaW5nIHdhcyBub3Qgc3VjY2Vzc2Z1bCBmb3I6ICcgKyB1cmwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqL1xuICAgICAgICBzdGFydDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIG1lID0gdGhpcztcbiAgICAgICAgICAgIHRoaXMuYXBwID0gRXh0LmFwcGxpY2F0aW9uKHtcbiAgICAgICAgICAgICAgICBuYW1lOiBtZS5hcHBOYW1lLFxuICAgICAgICAgICAgICAgIG11emthdEFwcFJlZjogdGhpcyxcbiAgICAgICAgICAgICAgICBtYWluVmlldzogbWUuYXBwTmFtZSArICcuTWFpbkFwcGxpY2F0aW9uJyxcbiAgICAgICAgICAgICAgICBsYXVuY2g6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgRXh0LmxvZyhtZS5hcHBOYW1lICsgJyBib290ZWQhJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG11emthdEFwcDsiLCIvKlxuQ3JlYXRlZCBieSBFcmlrIFdvaXRzY2hpZyBAZGV2Ym56XG4qL1xuY29uc3QgbXV6a2F0QXBwID0gcmVxdWlyZSgnbXV6a2F0LWV4dC1hcHAnKTtcblxuY29uc3QgcHQgPSBuZXcgbXV6a2F0QXBwKCdNdXprYXQgUGkgQ2FtZXJhJywgJ216a1BpQ2FtZXJhTWFpbicsIGZhbHNlKTtcbnB0LmxhdW5jaEFwcCgpOyIsIi8qXG5DcmVhdGVkIGJ5IEVyaWsgV29pdHNjaGlnIEBkZXZibnpcbiovXG5FeHQuZGVmaW5lKCdtdXprYXQucGkuY2FtZXJhLk1haW4nLCB7XG4gICAgZXh0ZW5kOiAnRXh0LmNvbnRhaW5lci5Db250YWluZXInLFxuICAgIGFsaWFzOiAnd2lkZ2V0Lm16a1BpQ2FtZXJhTWFpbicsXG5cbiAgICB0aXRsZTogJ011emthdCBQaSBDYW1lcmEnLFxuXG4gICAgbGF5b3V0OiAnY2VudGVyJyxcblxuICAgIGl0ZW1zOiBbe1xuICAgICAgICB4dHlwZTogJ3BhbmVsJyxcbiAgICAgICAgd2lkdGg6ICc4MCUnLFxuICAgICAgICBoZWlnaHQ6ICc4MCUnLFxuICAgICAgICBsYXlvdXQ6ICdmaXQnLFxuXG4gICAgICAgIGl0ZW1zOiBbe1xuICAgICAgICAgICAgeHR5cGU6ICdwYW5lbCcsXG4gICAgICAgICAgICBpdGVtSWQ6ICdwcmV2aWV3JyxcbiAgICAgICAgICAgIGRvY2tlZEl0ZW1zOiBbe1xuICAgICAgICAgICAgICAgIHh0eXBlOiAndG9vbGJhcicsXG4gICAgICAgICAgICAgICAgZG9jazogJ2JvdHRvbScsXG4gICAgICAgICAgICAgICAgb3ZlcmZsb3dIYW5kbGVyOiAnc2Nyb2xsZXInLFxuICAgICAgICAgICAgICAgIGl0ZW1zOiBbXVxuICAgICAgICAgICAgfV1cbiAgICAgICAgfV0sXG5cbiAgICAgICAgYmJhcjogW3tcbiAgICAgICAgICAgIHRleHQ6ICdUYWtlIFBpY3R1cmUnLFxuICAgICAgICAgICAgc2NhbGU6ICdtZWRpdW0nLFxuICAgICAgICAgICAgaWNvbkNsczogJ3gtZmEgZmEtcGhvdG8nLFxuICAgICAgICAgICAgaGFuZGxlcjogZnVuY3Rpb24gKGJ0bikge1xuICAgICAgICAgICAgICAgIHZhciBtYWluVmlldyA9IGJ0bi51cCgnbXprUGlDYW1lcmFNYWluJyk7XG4gICAgICAgICAgICAgICAgaWYgKEV4dC5pc0RlZmluZWQobWFpblZpZXcpICYmIG1haW5WaWV3LmlzQ29tcG9uZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIG1haW5WaWV3LnRha2VQaG90bygpLnRoZW4oZnVuY3Rpb24gKHN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIEV4dC50b2FzdChKU09OLnN0cmluZ2lmeShzdWNjZXNzKSk7XG4gICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgRXh0LnRvYXN0KGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LCB7XG4gICAgICAgICAgICB0ZXh0OiAnR2FsbGVyeScsXG4gICAgICAgICAgICBzY2FsZTogJ21lZGl1bScsXG4gICAgICAgICAgICBpY29uQ2xzOiAneC1mYSBmYS1maWxlLWltYWdlLW8nXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIHh0eXBlOiAndGJmaWxsJ1xuICAgICAgICB9LCB7XG4gICAgICAgICAgICB0ZXh0OiAnQVBJJyxcbiAgICAgICAgICAgIHNjYWxlOiAnbWVkaXVtJyxcbiAgICAgICAgICAgIGljb25DbHM6ICd4LWZhIGZhLWZpbGUtaW1hZ2UtbydcbiAgICAgICAgfV1cbiAgICB9XSxcblxuICAgIGluaXRDb21wb25lbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG1lID0gdGhpcztcbiAgICAgICAgdGhpcy5jYWxsUGFyZW50KGFyZ3VtZW50cyk7XG4gICAgICAgIG1lLmdldFBob3RvcygpLnRoZW4oZnVuY3Rpb24gKGFycmF5KSB7XG4gICAgICAgICAgICB2YXIgaHRtbCA9ICdLZWluZSBCaWxkZXIgdm9yaGFuZGVuJztcbiAgICAgICAgICAgIGlmIChhcnJheS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIGltZ05hbWUgPSBhcnJheVswXS5uYW1lO1xuICAgICAgICAgICAgICAgIGh0bWwgPSAnPGltZyBzcmM9XCIvc2VydmUvJyArIGltZ05hbWUgKyAnXCIgaGVpZ2h0PVwiNDgwXCIgd2lkdGg9XCI2NDBcIj4nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHByZXZpZXcgPSBtZS5kb3duKCcjcHJldmlldycpXG4gICAgICAgICAgICBwcmV2aWV3LnNldEh0bWwoaHRtbCk7XG4gICAgICAgICAgICB2YXIgZG9ja2VkSXRlbXMgPSBwcmV2aWV3LmdldERvY2tlZEl0ZW1zKCd0b29sYmFyW2RvY2s9XCJ0b3BcIl0nKTtcbiAgICAgICAgICAgIGRvY2tlZEl0ZW1zWzBdLnJlbW92ZUFsbCgpO1xuXG4gICAgICAgICAgICBFeHQuQXJyYXkuZWFjaChhcnJheS5yZXZlcnNlKCksIGZ1bmN0aW9uIChpbWdPYmopIHtcbiAgICAgICAgICAgICAgICBkb2NrZWRJdGVtc1swXS5hZGQoe1xuICAgICAgICAgICAgICAgICAgICB4dHlwZTogJ2ltYWdlJyxcbiAgICAgICAgICAgICAgICAgICAgc3JjOiAnL3NlcnZlLycgKyBpbWdPYmoubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiA5MCxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDEyMFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAgIEV4dC50b2FzdChlcnJvcik7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICB0YWtlUGhvdG86IGZ1bmN0aW9uICh1cmwpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBFeHQuUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICBFeHQuQWpheC5yZXF1ZXN0KHtcbiAgICAgICAgICAgICAgICB1cmw6ICcvcGhvdG9zL3Rha2UnLFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKEV4dC5kZWNvZGUocmVzcG9uc2UucmVzcG9uc2VUZXh0LCB0cnVlKSk7XG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIGZhaWx1cmU6IGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QocmVzcG9uc2Uuc3RhdHVzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGdldFBob3RvczogZnVuY3Rpb24gKHVybCkge1xuICAgICAgICByZXR1cm4gbmV3IEV4dC5Qcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIEV4dC5BamF4LnJlcXVlc3Qoe1xuICAgICAgICAgICAgICAgIHVybDogJy9waG90b3MnLFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKEV4dC5kZWNvZGUocmVzcG9uc2UucmVzcG9uc2VUZXh0LCB0cnVlKSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBmYWlsdXJlOiBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KHJlc3BvbnNlLnN0YXR1cyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn0pOyJdfQ==
