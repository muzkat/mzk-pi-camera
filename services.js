const path = require('path'),
    PiCamera = require('pi-camera'),
    fs = require('fs'),
    Promise = require('promise');
;

const pictureExtension = '.jpg';


function mzkPiCamera() {
    return {
        searchRecursive: function (dir, pattern) {
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
                    results = results.concat(mzkPiCamera().searchRecursive(dirInner, pattern));
                }

                // If path is a file and ends with pattern then push it onto results
                if (stat.isFile() && dirInner.endsWith(pattern)) {
                    results.push(dirInner);
                }
            });

            return results;
        },
        takePicture: function () {
            const cam = new PiCamera({
                mode: 'photo',
                output: `${ __dirname }/public/`,
                width: 640,
                height: 480,
                nopreview: true,
            });

            return new Promise(function (resolve, reject) {
                const filePath = cam.get('output');
                let nowDate = new Date(),
                    dateString = nowDate.getTime(),
                    filePrefix = 'snap_' + dateString,
                    fileSuffix = pictureExtension,
                    fileName = filePrefix + fileSuffix,
                    outputPath = filePath + fileName;

                cam.set('output', outputPath);

                cam.snap()
                    .then((result) => {
                        resolve({captured: outputPath})
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        }
    }
}

module.exports = mzkPiCamera;