const fs = require('fs');
const path = require('path');
const sqip = require('sqip');

const makePlaceholder = filename => {
  const file = sqip({
    filename: `./img/${filename}`,
    numberOfPrimitives: 10,
  });

  const newFilename = filename.replace('jpg', 'svg');

  fs.writeFile(path.join('img', newFilename), newFilename, err => {
    if (err) throw err;
    console.log(`${filename} has been saved!`);
  });
};

fs.readdir('./img/', (err, files) => {
  files
    .filter(file => file.endsWith('jpg'))
    .forEach(file => makePlaceholder(file));
});
