/*
Created by Erik Woitschig @devbnz
*/
const path = require('path'),
    fs = require('fs');

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
        }
    }
}

module.exports = mzkPiCamera;