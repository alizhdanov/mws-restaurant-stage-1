const fs = require('fs');
const path = require('path');
const sqip = require('sqip');
const critical = require('critical');

///////////////////////////////////
// create lazy thumbnails
//////////////////////////////////

const makePlaceholder = filename => {
  const file = sqip({
    filename: `./img/${filename}`,
    numberOfPrimitives: 10,
  });

  const newFilename = filename.replace('jpg', 'svg');

  fs.writeFile(path.join('img', newFilename), file.final_svg, 'utf-8', err => {
    if (err) throw err;
    console.log(`${filename} has been saved!`);
  });
};

fs.readdir('./img/', (err, files) => {
  files
    .filter(file => file.endsWith('jpg'))
    .forEach(file => makePlaceholder(file));
});

///////////////////////////////////
// generate critical css
//////////////////////////////////

critical.generate({
  inline: true,
  base: '.',
  src: './index_src.html',
  dest: './index.html',
  width: 1300,
  height: 900,
});

critical.generate({
  inline: true,
  base: '.',
  src: './restaurant_src.html',
  dest: './restaurant.html',
  width: 1300,
  height: 900,
});
