const fs = require('fs');
const path = require('path');

const publicUploads = path.join(__dirname, '..', 'public', 'uploads');
const pagesDir = path.join(__dirname, '..', 'new_pages_raw');
const htmlFiles = fs.readdirSync(pagesDir);

let createdCount = 0;
let missingFiles = [];

for (const file of htmlFiles) {
  const content = fs.readFileSync(path.join(pagesDir, file), 'utf8');
  const matches = content.matchAll(/\/uploads\/([^\s"'<>]+)/g);
  for (const m of matches) {
    const relPath = m[1];
    if (relPath.includes('/')) {
      const fullTarget = path.join(publicUploads, relPath);
      const filename = path.basename(relPath);
      const flatSource = path.join(publicUploads, filename);

      fs.mkdirSync(path.dirname(fullTarget), { recursive: true });

      if (!fs.existsSync(fullTarget)) {
        if (fs.existsSync(flatSource)) {
          fs.copyFileSync(flatSource, fullTarget);
          createdCount++;
        } else {
          missingFiles.push({ relPath, url: 'https://www.yonogameszone.com/uploads/' + relPath });
        }
      }
    }
  }
}

console.log(`Copied ${createdCount} slider assets into their exact subdirectories.`);
console.log(`Missing files count: ${missingFiles.length}`);
if (missingFiles.length > 0) {
  fs.writeFileSync('missing_slider_assets.json', JSON.stringify(missingFiles, null, 2));
}
