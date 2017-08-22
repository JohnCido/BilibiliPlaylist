const manifest = require('./src/manifest.json')
const fs = require('fs.extra')

function archive() {
    fs.copy('production/upload.zip', `archives/${manifest.version}.zip`, { replace: true }, (err) => {
        if (err) {
            throw err;
        }
       
        console.log('Archive completed')
      });
}

archive()