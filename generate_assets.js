const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Minimal valid PNG base64 representation
const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAOSURBVHhe7cEBDQAAAMKg909tDwcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALgNG9gAAVdat8oAAAAASUVORK5CYII=';

const buffer = Buffer.from(base64Png, 'base64');

const files = ['icon.png', 'splash.png', 'adaptive-icon.png', 'favicon.png'];

files.forEach((file) => {
  const filePath = path.join(assetsDir, file);
  fs.writeFileSync(filePath, buffer);
  console.log(`Created asset: ${filePath}`);
});
