const express = require('express'),
    PiCamera = require('pi-camera'),
    cam = require('./services');

const app = express();

app.use('/serve', express.static('public'));

app.get('/', function (req, res) {

    const pictureFolder = './public/';
    const pictureExtension = '.jpg';

    let c = cam();
    let files = c.searchRecursive(pictureFolder, pictureExtension);

    const filesForAll = [{name: 'nothing to see'}];
    let fileOnly = '';
    files.forEach(function (filepath, index, array) {
        filepath = String(filepath);
        console.log(filepath);
//	if(path.startsWith('/opt/www/main/public/'){
        fileOnly = filepath.replace('/opt/www/main/public/', '');
        filesForAll.push({name: fileOnly});
//
    });

    res.send(filesForAll);
});

app.get('/photos/take', function (req, res) {

    const cam = new PiCamera({
        mode: 'photo',
        output: `${ __dirname }/public/`,
        width: 640,
        height: 480,
        nopreview: true,
    });

    const filePath = cam.get('output'),
        nowDate = new Date(),
        dateString = nowDate.getTime(),
        filePrefix = 'snap_' + dateString,
        fileSuffix = '.jpg',
        fileName = filePrefix + fileSuffix,
        outputPath = filePath + fileName;

    cam.set('output', outputPath);

    cam.snap()
        .then((result) => {
            res.send('captured: ' + outputPath);
        })
        .catch((error) => {
            res.send('oups');
        });

});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});

