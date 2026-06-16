import fs from 'fs';
import https from 'https';
import path from 'path';

const url = 'https://m.media-amazon.com/images/I/71S6tbw3TxL.jpg';
const dest = 'src/assets/images/products/ag_bbq_sauce_original.jpg';

function downloadWithHttps(imgUrl, destPath) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.5 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    };
    
    https.get(imgUrl, options, (res) => {
      console.log(`Response status for ${imgUrl}: ${res.statusCode}`);
      if (res.statusCode === 301 || res.statusCode === 302) {
        console.log(`Redirecting to ${res.headers.location}`);
        downloadWithHttps(res.headers.location, destPath).then(resolve).catch(reject);
        return;
      }
      
      if (res.statusCode !== 200) {
        reject(new Error(`Status code: ${res.statusCode}`));
        return;
      }
      
      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`Download completed for ${destPath}`);
        resolve();
      });
      
      fileStream.on('error', (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function run() {
  try {
    await downloadWithHttps(url, dest);
    console.log("Successfully downloaded with https module!");
  } catch (err) {
    console.error("Failed to download primary URL:", err.message);
    // Try without .jpg suffix or with alternative amazon media prefixes if it fails
    // Some amazon images only have ._AC_... patterns. Let us try some fallback URLs if we get a 404.
    const fallbacks = [
      'https://m.media-amazon.com/images/I/71S6tbw3TxL._AC_SL1500_.jpg',
      'https://m.media-amazon.com/images/I/71S6tbw3TxL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/71S6tbw3TxL._AC_SX679_.jpg',
      'https://m.media-amazon.com/images/I/71S6tbw3TxL.jpg'
    ];
    for (const fallback of fallbacks) {
      try {
        console.log(`Trying fallback: ${fallback}`);
        await downloadWithHttps(fallback, dest);
        console.log("Successfully downloaded fallback!");
        return;
      } catch (e) {
        console.error(`Fallback failed: ${fallback} with`, e.message);
      }
    }
  }
}

run();
