(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/*! muzkatpie - v1.0.0 - 2020-10-21 */const muzkatApp = require('muzkat-ext-app');

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
 *
 * @param name
 * @param mainComponent
 * @param loginNeeded
 * @param file
 * @returns {{app: undefined, appMainComponent: *, appName: string, appLoginNeeded: *, start: (function(): *), defineBaseClass: (function(): void), launchApp: launchApp}}
 */
function muzkatApp(name, mainComponent, loginNeeded, file) {

    return {
        app: undefined,
        appName: 'mzk',
        appMainComponent: mainComponent,
        appLoginNeeded: loginNeeded,

        /**
         *
         * @returns {*}
         */
        launchApp: function () {
            if (typeof window.Ext !== 'undefined') {
                //this.defineBaseClass(); // TODO async + singleton Api
                this.app = this.start();
                return this.app;
            } else {
                alert('Framework is not available. Application cannot be startet.');
                return false;
            }
        },

        /**
         *
         */
        defineBaseClass: function () {
            var me = this;
            return Ext.define(me.appName + '.MainApplication', {
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
                                text: 'Muzkat Frame was loaded without module OR supplied with a module url.'
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
         * @returns {*}
         */
        start: function () {
            var me = this;
            return Ext.application({
                name: 'mzk',
                mainView: {xtype: me.appMainComponent},
                launch: function () {
                    Ext.log('Mzk wrapper booted!');
                }
            });
        }
    };
}

module.exports = muzkatApp;
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkaXN0L2NvbmNhdC5qcyIsIm5vZGVfbW9kdWxlcy9tdXprYXQtZXh0LWFwcC9hcHAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvKiEgbXV6a2F0cGllIC0gdjEuMC4wIC0gMjAyMC0xMC0yMSAqL2NvbnN0IG11emthdEFwcCA9IHJlcXVpcmUoJ211emthdC1leHQtYXBwJyk7XG5cbmNvbnN0IHB0ID0gbmV3IG11emthdEFwcCgnTXV6a2F0IFBpIENhbWVyYScsICdtemtQaUNhbWVyYU1haW4nLCBmYWxzZSk7XG5wdC5sYXVuY2hBcHAoKTtcbkV4dC5kZWZpbmUoJ211emthdC5waS5jYW1lcmEuQXBpJywge1xuICAgIHNpbmdsZXRvbjogdHJ1ZSxcblxuICAgIGdldFByb21pc2U6IGZ1bmN0aW9uICh1cmwpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBFeHQuUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICBFeHQuQWpheC5yZXF1ZXN0KHtcbiAgICAgICAgICAgICAgICB1cmw6IHVybCxcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShFeHQuZGVjb2RlKHJlc3BvbnNlLnJlc3BvbnNlVGV4dCwgdHJ1ZSkpO1xuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICBmYWlsdXJlOiBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KHJlc3BvbnNlLnN0YXR1cyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICB0YWtlUGhvdG86IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIG11emthdC5waS5jYW1lcmEuQXBpLmdldFByb21pc2UoJy9waG90b3MvdGFrZScpO1xuICAgIH0sXG5cbiAgICBnZXRQaG90b3M6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIG11emthdC5waS5jYW1lcmEuQXBpLmdldFByb21pc2UoJy9waG90b3MnKTtcbiAgICB9XG59KTtcbkV4dC5kZWZpbmUoJ211emthdC5waS5jYW1lcmEuTWFpbicsIHtcbiAgICBleHRlbmQ6ICdFeHQuY29udGFpbmVyLkNvbnRhaW5lcicsXG4gICAgYWxpYXM6ICd3aWRnZXQubXprUGlDYW1lcmFNYWluJyxcblxuICAgIHRpdGxlOiAnTXV6a2F0IFBpIENhbWVyYScsXG5cbiAgICBsYXlvdXQ6ICdjZW50ZXInLFxuXG4gICAgaXRlbXM6IFt7XG4gICAgICAgIHh0eXBlOiAncGFuZWwnLFxuXG4gICAgICAgIHdpZHRoOiAnODAlJyxcbiAgICAgICAgaGVpZ2h0OiAnODAlJyxcbiAgICAgICAgbGF5b3V0OiAnZml0JyxcblxuICAgICAgICBpdGVtczogW3tcbiAgICAgICAgICAgIHh0eXBlOiAncGFuZWwnLFxuICAgICAgICAgICAgaXRlbUlkOiAncHJldmlldycsXG4gICAgICAgICAgICBsYXlvdXQ6ICdmaXQnLFxuICAgICAgICAgICAgaXRlbXM6IFt7XG4gICAgICAgICAgICAgICAgeHR5cGU6ICdjb250YWluZXInLFxuICAgICAgICAgICAgICAgIGRlZmF1bHRIdG1sSGVhZGxpbmU6ICc8aDM+TXV6a2F0IFBpIENhbWVyYTwvaDM+JyxcbiAgICAgICAgICAgICAgICBodG1sOiAnPGgzPk11emthdCBQaSBDYW1lcmE8L2gzPicsXG4gICAgICAgICAgICAgICAgdXBkYXRlSHRtbENvbnRlbnQ6IGZ1bmN0aW9uIChodG1sKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0SHRtbCh0aGlzLmRlZmF1bHRIdG1sSGVhZGxpbmUgKyBodG1sKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHVwZGF0ZUltYWdlOiBmdW5jdGlvbiAoaW1hZ2VVcmwpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGh0bWwgPSAnPGltZyBzcmM9XCIvc2VydmUvJyArIGltYWdlVXJsICsgJ1wiIGhlaWdodD1cIjQ4MFwiIHdpZHRoPVwiNjQwXCI+JztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVIdG1sQ29udGVudChodG1sKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XSxcbiAgICAgICAgICAgIGRvY2tlZEl0ZW1zOiBbe1xuICAgICAgICAgICAgICAgIHh0eXBlOiAndG9vbGJhcicsXG4gICAgICAgICAgICAgICAgZG9jazogJ2JvdHRvbScsXG4gICAgICAgICAgICAgICAgb3ZlcmZsb3dIYW5kbGVyOiAnc2Nyb2xsZXInLFxuICAgICAgICAgICAgICAgIGl0ZW1zOiBbXVxuICAgICAgICAgICAgfV1cbiAgICAgICAgfV0sXG5cbiAgICAgICAgYmJhcjogW3tcbiAgICAgICAgICAgIHRleHQ6ICdUYWtlIFBpY3R1cmUnLFxuICAgICAgICAgICAgc2NhbGU6ICdtZWRpdW0nLFxuICAgICAgICAgICAgaWNvbkNsczogJ3gtZmEgZmEtcGhvdG8nLFxuICAgICAgICAgICAgaGFuZGxlcjogZnVuY3Rpb24gKGJ0bikge1xuICAgICAgICAgICAgICAgIHZhciBtYWluVmlldyA9IGJ0bi51cCgnbXprUGlDYW1lcmFNYWluJyk7XG4gICAgICAgICAgICAgICAgbXV6a2F0LnBpLmNhbWVyYS5BcGkudGFrZVBob3RvKCkudGhlbihmdW5jdGlvbiAoc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICBtYWluVmlldy5yZWZyZXNoR3VpKCk7XG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIEV4dC50b2FzdChlcnJvcik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIHRleHQ6ICdHYWxsZXJ5JyxcbiAgICAgICAgICAgIHNjYWxlOiAnbWVkaXVtJyxcbiAgICAgICAgICAgIGljb25DbHM6ICd4LWZhIGZhLWZpbGUtaW1hZ2UtbydcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgeHR5cGU6ICd0YmZpbGwnXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIHRleHQ6ICdBUEknLFxuICAgICAgICAgICAgc2NhbGU6ICdtZWRpdW0nLFxuICAgICAgICAgICAgaWNvbkNsczogJ3gtZmEgZmEtZmlsZS1pbWFnZS1vJ1xuICAgICAgICB9LCB7XG4gICAgICAgICAgICB0ZXh0OiAnQWJvdXQnLFxuICAgICAgICAgICAgc2NhbGU6ICdtZWRpdW0nLFxuICAgICAgICAgICAgaWNvbkNsczogJ3gtZmEgZmEtZmlsZS1pbWFnZS1vJ1xuICAgICAgICB9XVxuICAgIH1dLFxuXG4gICAgaW5pdENvbXBvbmVudDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmNhbGxQYXJlbnQoYXJndW1lbnRzKTtcbiAgICAgICAgdGhpcy5yZWZyZXNoR3VpKCk7XG4gICAgfSxcblxuICAgIHJlZnJlc2hHdWk6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG1lID0gdGhpcztcbiAgICAgICAgbXV6a2F0LnBpLmNhbWVyYS5BcGkuZ2V0UGhvdG9zKCkudGhlbihmdW5jdGlvbiAoYXJyYXkpIHtcbiAgICAgICAgICAgIHZhciBwcmV2aWV3ID0gbWUuZG93bignI3ByZXZpZXcnKTtcbiAgICAgICAgICAgIGlmIChhcnJheS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgYXJyYXkgPSBhcnJheS5yZXZlcnNlKCk7XG4gICAgICAgICAgICAgICAgdmFyIGltZ0NvbnRhaW5lciA9IHByZXZpZXcuZG93bignY29udGFpbmVyJyk7XG4gICAgICAgICAgICAgICAgaW1nQ29udGFpbmVyLnVwZGF0ZUltYWdlKGFycmF5WzBdLm5hbWUpO1xuICAgICAgICAgICAgICAgIHZhciBkb2NrZWRJdGVtcyA9IHByZXZpZXcuZ2V0RG9ja2VkSXRlbXMoJ3Rvb2xiYXJbZG9jaz1cImJvdHRvbVwiXScpO1xuICAgICAgICAgICAgICAgIGRvY2tlZEl0ZW1zWzBdLnJlbW92ZUFsbCgpO1xuXG4gICAgICAgICAgICAgICAgRXh0LkFycmF5LmVhY2goYXJyYXksIGZ1bmN0aW9uIChpbWdPYmopIHtcbiAgICAgICAgICAgICAgICAgICAgZG9ja2VkSXRlbXNbMF0uYWRkKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHh0eXBlOiAnaW1hZ2UnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3JjOiAnL3NlcnZlLycgKyBpbWdPYmoubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogOTAsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogMTIwXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgICAgRXh0LnRvYXN0KGVycm9yKTtcbiAgICAgICAgfSk7XG4gICAgfVxufSk7IiwiLyoqXG4gKlxuICogQHBhcmFtIG5hbWVcbiAqIEBwYXJhbSBtYWluQ29tcG9uZW50XG4gKiBAcGFyYW0gbG9naW5OZWVkZWRcbiAqIEBwYXJhbSBmaWxlXG4gKiBAcmV0dXJucyB7e2FwcDogdW5kZWZpbmVkLCBhcHBNYWluQ29tcG9uZW50OiAqLCBhcHBOYW1lOiBzdHJpbmcsIGFwcExvZ2luTmVlZGVkOiAqLCBzdGFydDogKGZ1bmN0aW9uKCk6ICopLCBkZWZpbmVCYXNlQ2xhc3M6IChmdW5jdGlvbigpOiB2b2lkKSwgbGF1bmNoQXBwOiBsYXVuY2hBcHB9fVxuICovXG5mdW5jdGlvbiBtdXprYXRBcHAobmFtZSwgbWFpbkNvbXBvbmVudCwgbG9naW5OZWVkZWQsIGZpbGUpIHtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGFwcDogdW5kZWZpbmVkLFxuICAgICAgICBhcHBOYW1lOiAnbXprJyxcbiAgICAgICAgYXBwTWFpbkNvbXBvbmVudDogbWFpbkNvbXBvbmVudCxcbiAgICAgICAgYXBwTG9naW5OZWVkZWQ6IGxvZ2luTmVlZGVkLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcmV0dXJucyB7Kn1cbiAgICAgICAgICovXG4gICAgICAgIGxhdW5jaEFwcDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB3aW5kb3cuRXh0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIC8vdGhpcy5kZWZpbmVCYXNlQ2xhc3MoKTsgLy8gVE9ETyBhc3luYyArIHNpbmdsZXRvbiBBcGlcbiAgICAgICAgICAgICAgICB0aGlzLmFwcCA9IHRoaXMuc3RhcnQoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5hcHA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGFsZXJ0KCdGcmFtZXdvcmsgaXMgbm90IGF2YWlsYWJsZS4gQXBwbGljYXRpb24gY2Fubm90IGJlIHN0YXJ0ZXQuJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKi9cbiAgICAgICAgZGVmaW5lQmFzZUNsYXNzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgbWUgPSB0aGlzO1xuICAgICAgICAgICAgcmV0dXJuIEV4dC5kZWZpbmUobWUuYXBwTmFtZSArICcuTWFpbkFwcGxpY2F0aW9uJywge1xuICAgICAgICAgICAgICAgIGV4dGVuZDogJ0V4dC5jb250YWluZXIuQ29udGFpbmVyJyxcbiAgICAgICAgICAgICAgICBhbGlhczogJ3dpZGdldC4nICsgbWUuYXBwTmFtZSArICdNYWluJyxcbiAgICAgICAgICAgICAgICBsYXlvdXQ6ICdmaXQnLFxuXG4gICAgICAgICAgICAgICAgcmVxdWVzdExvZ2luOiBtZS5hcHBMb2dpbk5lZWRlZCxcbiAgICAgICAgICAgICAgICBtYWluQ29tcG9uZW50OiBtZS5hcHBNYWluQ29tcG9uZW50LFxuICAgICAgICAgICAgICAgIGFwcE5hbWU6IG1lLmFwcE5hbWUsXG5cbiAgICAgICAgICAgICAgICBmaWxlQXJyYXk6IFtdLFxuXG4gICAgICAgICAgICAgICAgaW5pdENvbXBvbmVudDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaXRlbXMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucmVxdWVzdExvZ2luKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtcyA9IFt7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeHR5cGU6ICdjb250YWluZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGh0bWw6ICdsb2dpbiByZXF1aXJlZC4uLidcbiAgICAgICAgICAgICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5tYWluQ29tcG9uZW50ICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zID0gW3t4dHlwZTogdGhpcy5tYWluQ29tcG9uZW50fV1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5maWxlQXJyYXkucHVzaChmaWxlLnVybCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXMgPSBbe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4dHlwZTogJ2J1dHRvbicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxheW91dDogJ2ZpdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICdNdXprYXQgRnJhbWUgd2FzIGxvYWRlZCB3aXRob3V0IG1vZHVsZSBPUiBzdXBwbGllZCB3aXRoIGEgbW9kdWxlIHVybC4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfV07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pdGVtcyA9IGl0ZW1zO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNhbGxQYXJlbnQoYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgY2hhbmdlQ29tcG9uZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBtZSA9IHRoaXM7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9hZFNjcmlwdHModGhpcy5maWxlQXJyYXkpLnRoZW4oZnVuY3Rpb24gKHN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIEV4dC5kZWZlcihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWUucmVtb3ZlQWxsKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWUuYWRkKHt4dHlwZTogZmlsZS5jbXB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIDMwMCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICBsb2FkU2NyaXB0czogZnVuY3Rpb24gKGpzQ3NzQXJyYXkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxvYWRpbmdBcnJheSA9IFtdLCBtZSA9IHRoaXM7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgRXh0LlByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgRXh0LkFycmF5LmVhY2goanNDc3NBcnJheSwgZnVuY3Rpb24gKHVybCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRpbmdBcnJheS5wdXNoKG1lLmxvYWRTY3JpcHQodXJsKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgRXh0LlByb21pc2UuYWxsKGxvYWRpbmdBcnJheSkudGhlbihmdW5jdGlvbiAoc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnYXJ0ZWZhY3RzIHdlcmUgbG9hZGVkIHN1Y2Nlc3NmdWxseScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoJ0Vycm9yIGR1cmluZyBhcnRlZmFjdCBsb2FkaW5nLi4uJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICBsb2FkU2NyaXB0OiBmdW5jdGlvbiAodXJsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgRXh0LlByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgRXh0LkxvYWRlci5sb2FkU2NyaXB0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmw6IHVybCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkxvYWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2codXJsICsgJyB3YXMgbG9hZGVkIHN1Y2Nlc3NmdWxseScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCdMb2FkaW5nIHdhcyBzdWNjZXNzZnVsJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkVycm9yOiBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KCdMb2FkaW5nIHdhcyBub3Qgc3VjY2Vzc2Z1bCBmb3I6ICcgKyB1cmwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHJldHVybnMgeyp9XG4gICAgICAgICAqL1xuICAgICAgICBzdGFydDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIG1lID0gdGhpcztcbiAgICAgICAgICAgIHJldHVybiBFeHQuYXBwbGljYXRpb24oe1xuICAgICAgICAgICAgICAgIG5hbWU6ICdtemsnLFxuICAgICAgICAgICAgICAgIG1haW5WaWV3OiB7eHR5cGU6IG1lLmFwcE1haW5Db21wb25lbnR9LFxuICAgICAgICAgICAgICAgIGxhdW5jaDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBFeHQubG9nKCdNemsgd3JhcHBlciBib290ZWQhJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG11emthdEFwcDsiXX0=
