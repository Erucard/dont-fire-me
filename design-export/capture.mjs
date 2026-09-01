// Captures every screen replica in screens/ to png/ at 3x device scale
// (iPhone retina resolution) using the locally installed Edge/Chrome.
// Re-run any time:  node capture.mjs
import puppeteer from 'puppeteer-core';
import { existsSync, mkdirSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { pathToFileURL } from 'url';

const CANDIDATE_BROWSERS = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
];
const executablePath = CANDIDATE_BROWSERS.find(existsSync);
if (!executablePath) {
  console.error('No Edge/Chrome found in the usual places.');
  process.exit(1);
}

const here = resolve('.');
const outDir = resolve(here, 'png');
mkdirSync(outDir, { recursive: true });

// component sheet renders at the app's max width; phone screens at iPhone width
const WIDE = ['11-components'];

const browser = await puppeteer.launch({ executablePath, headless: true });
const page = await browser.newPage();

const files = readdirSync(resolve(here, 'screens')).filter((f) => f.endsWith('.html')).sort();
for (const file of files) {
  const name = file.replace(/\.html$/, '');
  const width = WIDE.includes(name) ? 540 : 375;
  await page.setViewport({ width, height: 812, deviceScaleFactor: 3 });
  await page.goto(pathToFileURL(resolve(here, 'screens', file)).href, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 300));
  const out = resolve(outDir, name + '.png');
  await page.screenshot({ path: out, fullPage: true });
  console.log('captured', name + '.png');
}

await browser.close();
console.log('done →', outDir);
