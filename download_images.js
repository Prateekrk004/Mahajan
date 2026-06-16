import fs from 'fs';
import path from 'path';

const destDir = 'src/assets/images/products';
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const imagesToDownload = [
  {
    name: "AG BBQ Sauce Original 18oz",
    url: "https://m.media-amazon.com/images/I/71S6tbw3TxL.jpg",
    dest: "ag_bbq_sauce_original.jpg"
  },
  {
    name: "American Garden - Pancake Syrup",
    url: "https://assets.hyperpure.com/data/images/products/7ec2acc42dd32bf89910d7b42bc5af2f.png",
    dest: "american_garden_pancake_syrup.png"
  },
  {
    name: "W S SAUCE ELMAC",
    url: "https://5.imimg.com/data5/SELLER/Default/2025/4/500840417/QU/GI/CK/3137969/elmac-200g-worcestershire-sauce-500x500.jpg",
    dest: "elmac_w_s_sauce.jpg"
  }
];

async function download(url, destPath) {
  console.log(`Downloading ${url} ...`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }
  const buffer = await response.arrayBuffer();
  fs.writeFileSync(destPath, Buffer.from(buffer));
  console.log(`Saved to ${destPath}`);
}

async function main() {
  for (const img of imagesToDownload) {
    const destPath = path.join(destDir, img.dest);
    try {
      await download(img.url, destPath);
      console.log(`SUCCESS: ${img.name} downloaded successfully.`);
    } catch (err) {
      console.error(`ERROR downloading ${img.name}:`, err);
    }
  }
}

main();
