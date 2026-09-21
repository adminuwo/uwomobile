const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '../node_modules/expo-dev-menu/ios/DevMenuViewController.swift');

if (fs.existsSync(targetFile)) {
  let content = fs.readFileSync(targetFile, 'utf8');
  if (content.includes('let isSimulator = TARGET_IPHONE_SIMULATOR > 0')) {
    content = content.replace(
      'let isSimulator = TARGET_IPHONE_SIMULATOR > 0',
      '#if targetEnvironment(simulator)\n    let isSimulator = true\n    #else\n    let isSimulator = false\n    #endif'
    );
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('[patch] Successfully patched expo-dev-menu/ios/DevMenuViewController.swift for Xcode 16+');
  } else {
    console.log('[patch] expo-dev-menu/ios/DevMenuViewController.swift already patched or not using TARGET_IPHONE_SIMULATOR');
  }
} else {
  console.log('[patch] expo-dev-menu/ios/DevMenuViewController.swift not found, skipping');
}
