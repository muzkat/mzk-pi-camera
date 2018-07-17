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
                dock: 'top',
                items: [{
                    text: 'Docked to the top'
                }]
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

            Ext.Array.each(array, function (imgObj) {
                dockedItems[0].add({
                    xtype: 'img',
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