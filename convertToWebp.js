/* eslint-disable no-console */
/* eslint-disable no-undef */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const inputFolder = './src/images';
const supportedExtensions = ['.jpg', '.jpeg', '.png'];

fs.readdir(inputFolder, (err, files) => {
  if (err) {
    console.error('Ошибка чтения папки:', err);
    return;
  }

  const imagesToConvert = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return supportedExtensions.includes(ext) && ext !== '.svg';
  });

  imagesToConvert.forEach(image => {
    const inputPath = path.join(inputFolder, image);
    const outputPath = path.join(inputFolder, `${path.parse(image).name}.webp`);

    sharp(inputPath)
      .webp({ quality: 90 })
      .toFile(outputPath, (err, info) => {
        if (err) {
          console.error(`Ошибка при конвертации ${image}:`, err);
        } else {
          console.log(`Конвертировано ${image} в ${info.size} байт`);
        }
      });
  });
});
