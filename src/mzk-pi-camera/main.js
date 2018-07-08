/*
Created by Erik Woitschig @devbnz
*/
Ext.define('muzkat.pi.camera.Main', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.mzkPiCameraMain',

    title: 'Muzkat Pi Camera',

    layout: 'fit',

    items: [{

    }],

    bbar: [{
        text: 'Take Picture',
        iconCls: 'x-fa fa-photo'
    }, {
        text: 'Gallery',
        iconCls: 'x-fa fa-file-image-o'
    },{
        xtype: 'tbfill'
    }]
});