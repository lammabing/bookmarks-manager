import sharp from 'sharp';

async function resizeFavicon() {
  try {
    await sharp('public/favicon.png')
      .resize(64, 64)
      .png({
        quality: 80,
        compressionLevel: 9
      })
      .toFile('public/favicon-optimized.png');
    
    console.log('Favicon resized and optimized');
  } catch (err) {
    console.error('Error processing favicon:', err);
  }
}

resizeFavicon();