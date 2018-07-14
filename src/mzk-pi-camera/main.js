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

    getAjax: function (url) {
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