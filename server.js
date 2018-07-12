const express = require('express'),
    cam = require('./services');

const app = express();

app.use('/serve', express.static('public'));

app.get('/', function (req, res) {
    res.send({
        appId: 'mzkPiCamera',
        sysId: 'muzkat-dev',
        version: '0.0.1'
    });
});

const pictureExtension = '.jpg';
const pictureFolder = './public/';

app.get('/photos', function (req, res) {

    let c = cam();
    let files = c.searchRecursive(pictureFolder, pictureExtension);

    let filesForAll = [{name: 'nothing to see'}];

    if (files.length > 0) {
        filesForAll = [];
        let fileOnly = '';

        files.forEach(function (filepath, index, array) {
            filepath = String(filepath);
            console.log(filepath);
            fileOnly = filepath.replace('/opt/www/main/public/', '');
            filesForAll.push({name: fileOnly});
        });
    }

    res.send(filesForAll);
});

app.get('/photos/take', function (req, res) {
    let c = cam();
    c.takePicture().then(function (success) {
        res.send(success);
    }, function (error) {
        res.send(error);
    });
});

app.listen(3000, function () {
    console.log('Muzkat Pi Camera listening on port 3000.');
});

