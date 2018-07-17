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
            initComponent: function () {
                var me = this;
                this.callParent(arguments);
                var mainView = me.up('mzkPiCameraMain');
                if (Ext.isDefined(mainView)) {
                    mainView.getPhotos().then(function (array) {
                        var html = 'Keine Bilder vorhanden';
                        if (array.length > 0) {
                            var imgName = array[0].name;
                            html = '<img src="/serve/' + imgName + '">';
                        }
                        me.setHtml(html);
                    }, function (error) {
                        Ext.toast(error);
                    });
                }
            },
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
        }],

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
    }]
});