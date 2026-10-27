#!/usr/bin/env node
/* eslint-env node */
/**
 * Pre-publish safety check for EAS Update (OTA).
 *
 * Verifies that app.json, the committed native projects (bare workflow) and eas.json agree on
 * update URL, runtime version and channels, so an OTA can only reach compatible binaries.
 *
 * Usage:
 *   node scripts/check-ota-config.js                 # validate config only
 *   node scripts/check-ota-config.js preview         # validate before publishing to "preview"
 *   CONFIRM_PRODUCTION_OTA=yes node scripts/check-ota-config.js production
 *
 * Exits non-zero on any problem. Prints no secrets.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const errors = [];

function check(condition, okMessage, failMessage) {
  if (condition) {
    console.log(`  \u2714 ${okMessage}`);
  } else {
    errors.push(failMessage);
    console.log(`  \u2716 ${failMessage}`);
  }
}

const ALLOWED_CHANNELS = ['development', 'preview', 'production'];
const targetChannel = process.argv[2];

console.log('\nEAS Update configuration check\n');

// ── app.json ────────────────────────────────────────────────────────────────
const app = JSON.parse(read('app.json')).expo;
const projectId = app?.extra?.eas?.projectId;
const expectedUrl = `https://u.expo.dev/${projectId}`;
const runtimeVersion = app.runtimeVersion;

check(!!projectId, `EAS projectId present (owner: ${app.owner})`, 'app.json: extra.eas.projectId missing');
check(
  typeof runtimeVersion === 'string' && runtimeVersion.trim().length > 0,
  `runtimeVersion = "${runtimeVersion}"`,
  'app.json: runtimeVersion must be an explicit string (bare workflow)'
);
check(app.updates?.url === expectedUrl, 'app.json updates.url matches projectId', 'app.json: updates.url does not match projectId');
check(app.updates?.enabled !== false, 'app.json updates enabled', 'app.json: updates.enabled is false');
check(
  !app.ios?.runtimeVersion && !app.android?.runtimeVersion,
  'no platform-specific runtimeVersion overrides',
  'app.json: platform-specific runtimeVersion overrides found; keep a single top-level value'
);

// ── Android (committed native project) ──────────────────────────────────────
const manifest = read('android/app/src/main/AndroidManifest.xml');
const meta = (name) => {
  const m = manifest.match(new RegExp(`android:name="${name.replace(/\./g, '\\.')}"\\s+android:value="([^"]*)"`));
  return m ? m[1] : undefined;
};
const androidRuntime = meta('expo.modules.updates.EXPO_RUNTIME_VERSION');
check(meta('expo.modules.updates.ENABLED') === 'true', 'Android: updates ENABLED', 'Android: expo.modules.updates.ENABLED is not "true"');
check(meta('expo.modules.updates.EXPO_UPDATE_URL') === expectedUrl, 'Android: update URL matches', 'Android: EXPO_UPDATE_URL mismatch');
check(
  androidRuntime === '${expoRuntimeVersion}' || androidRuntime === runtimeVersion,
  'Android: runtime version sourced from app.json',
  `Android: EXPO_RUNTIME_VERSION (${androidRuntime}) does not match app.json`
);
check(
  (meta('expo.modules.updates.UPDATES_CONFIGURATION_REQUEST_HEADERS_KEY') || '').includes('expo-channel-name'),
  'Android: channel header configured',
  'Android: channel request header missing'
);

// ── iOS (committed native project) ──────────────────────────────────────────
const plist = read('ios/UWOConnect/Supporting/Expo.plist');
const plistString = (key) => {
  const m = plist.match(new RegExp(`<key>${key}</key>\\s*<string>([^<]*)</string>`));
  return m ? m[1] : undefined;
};
check(/<key>EXUpdatesEnabled<\/key>\s*<true\/>/.test(plist), 'iOS: updates enabled', 'iOS: EXUpdatesEnabled is not true');
check(plistString('EXUpdatesURL') === expectedUrl, 'iOS: update URL matches', 'iOS: EXUpdatesURL mismatch');
check(
  plistString('EXUpdatesRuntimeVersion') === runtimeVersion,
  'iOS: runtime version matches app.json',
  `iOS: EXUpdatesRuntimeVersion (${plistString('EXUpdatesRuntimeVersion')}) does not match app.json`
);

// ── eas.json channels ───────────────────────────────────────────────────────
const eas = JSON.parse(read('eas.json'));
for (const profile of ALLOWED_CHANNELS) {
  const ch = eas.build?.[profile]?.channel;
  check(ch === profile, `eas.json build.${profile}.channel = "${ch}"`, `eas.json: build.${profile}.channel should be "${profile}" (found ${ch})`);
}

// ── Target channel guard ────────────────────────────────────────────────────
if (targetChannel) {
  check(
    ALLOWED_CHANNELS.includes(targetChannel),
    `Target channel is known: ${targetChannel} (runtime ${runtimeVersion})`,
    `Unknown channel "${targetChannel}". Allowed: ${ALLOWED_CHANNELS.join(', ')}`
  );
  if (targetChannel === 'production') {
    check(
      process.env.CONFIRM_PRODUCTION_OTA === 'yes',
      'Production publish explicitly confirmed',
      'Publishing to PRODUCTION requires CONFIRM_PRODUCTION_OTA=yes (validate on "preview" first).'
    );
  }
}

if (errors.length) {
  console.log(`\n\u2716 ${errors.length} problem(s) found. Do NOT publish.\n`);
  process.exit(1);
}
console.log('\n\u2714 OTA configuration is consistent.\n');
console.log('  Reminder: any native change (new/upgraded native module, permissions, app.json native');
console.log('  fields, Podfile/Gradle changes, Expo SDK upgrade) REQUIRES bumping "runtimeVersion"');
console.log('  in app.json + ios/UWOConnect/Supporting/Expo.plist and shipping a new store build.\n');
