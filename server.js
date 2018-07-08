const express = require('express'),
    PiCamera = require('pi-camera'),
    path = require('path'),
    fs = require('fs');

const app = express();

app.use('/serve', express.static('public'));

app.get('/', function (req, res) {
    const searchRecursive = function (dir, pattern) {
        // This is where we store pattern matches of all files inside the directory
        let results = [];

        // Read contents of directory
        fs.readdirSync(dir).forEach(function (dirInner) {
            // Obtain absolute path
            dirInner = path.resolve(dir, dirInner);

            // Get stats to determine if path is a directory or a file
            const stat = fs.statSync(dirInner);

            // If path is a directory, scan it and combine results
            if (stat.isDirectory()) {
                results = results.concat(searchRecursive(dirInner, pattern));
            }

            // If path is a file and ends with pattern then push it onto results
            if (stat.isFile() && dirInner.endsWith(pattern)) {
                results.push(dirInner);
            }
        });

        return results;
    };

    const files = searchRecursive('./public/', '.jpg');

    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function (searchString, position) {
            position = position || 0;
            return this.indexOf(searchString, position) === position;
        };
    }

    const filesForAll = [];
    let fileOnly = "";
    files.forEach(function (filepath, index, array) {
        filepath = String(filepath);
        console.log(filepath);
//	if(path.startsWith('/opt/www/main/public/'){
        fileOnly = filepath.replace('/opt/www/main/public/', '');
        console.log(fileOnly);
        filesForAll.push(fileOnly);
//	}
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

