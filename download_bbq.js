import fs from 'fs';
import path from 'path';

const url = 'https://m.media-amazon.com/images/I/71S6tbw3TxL.jpg';
const dest = 'src/assets/images/products/ag_bbq_sauce_original.jpg';

async function download(fetchUrl) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout
  
  try {
    console.log(`Fetching ${fetchUrl} ...`);
    const res = await fetch(fetchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    console.log(`Status: ${res.status}`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }
    
    const buffer = await res.arrayBuffer();
    fs.writeFileSync(dest, Buffer.from(buffer));
    console.log(`Successfully saved to ${dest} (size: ${buffer.byteLength} bytes)`);
    return true;
  } catch (err) {
    clearTimeout(timeoutId);
    console.error(`Error downloading from ${fetchUrl}:`, err.message);
    return false;
  }
}

async function run() {
  const success = await download(url);
  if (!success) {
    // If the main URL returns 404, let's try the fallback URLs
    const fallbacks = [
      'https://m.media-amazon.com/images/I/71S6tbw3TxL._AC_SL1500_.jpg',
      'https://m.media-amazon.com/images/I/71S6tbw3TxL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/71S6tbw3TxL._AC_SX679_.jpg'
    ];
    for (const fallback of fallbacks) {
      console.log(`Trying fallback URL: ${fallback}`);
      const ok = await download(fallback);
      if (ok) {
        console.log("Fallback download succeeded!");
        break;
      }
    }
  }
}

run();
