import sharp from 'sharp';
import fs from 'fs';

async function createIconsFromFavicon() {
  const sizes = [16, 32, 48, 128];
  const directories = ['extension/icons', 'firefox-extension/icons'];
  
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  for (const size of sizes) {
    for (const dir of directories) {
      await sharp('public/favicon.png')
        .resize(size, size)
        .png()
        .toFile(`${dir}/icon${size}.png`);
    }
  }
  
  console.log('Icons created from favicon!');
}

createIconsFromFavicon().catch(console.error);