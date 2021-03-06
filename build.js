const fs = require('fs');
const path = require('path');
const sqip = require('sqip');

///////////////////////////////////
// create lazy thumbnails
//////////////////////////////////

const makePlaceholder = filename => {
  const file = sqip({
    filename: `./src/img/${filename}`,
    numberOfPrimitives: 10,
  });

  const newFilename = filename.replace('jpg', 'svg');

  fs.writeFile(path.join('img', newFilename), file.final_svg, 'utf-8', err => {
    if (err) throw err;
    console.log(`${filename} has been saved!`);
  });
};

fs.readdir('./src/img/', (err, files) => {
  files
    .filter(file => file.endsWith('jpg'))
    .forEach(file => makePlaceholder(file));
});
