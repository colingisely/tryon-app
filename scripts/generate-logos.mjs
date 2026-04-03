#!/usr/bin/env node
/**
 * Generate logo PNGs for Stripe checkout, invoices, and Shopify store.
 *
 * Outputs:
 *   public/logo-icon-128.png      — 128x128 gem only (Stripe icon, Shopify favicon)
 *   public/logo-icon-512.png      — 512x512 gem only (high-res)
 *   public/logo-horizontal.png    — gem + "REFLEXY" horizontal (Stripe checkout, Shopify)
 *   public/logo-horizontal-dark.png — same but for dark backgrounds
 */

import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

// Read the gem SVG (remove animation for static PNG)
const gemSvg = readFileSync(join(publicDir, 'reflexy-gem.svg'), 'utf-8')
  .replace(/<animateTransform[^/]*\/>/g, '') // remove animations
  .replace(/width="32"/, 'width="512"')
  .replace(/height="32"/, 'height="512"');

// "REFLEXY" wordmark as SVG text (Bricolage Grotesque style approximation)
function createHorizontalSvg(textColor = '#1A1025', bgColor = 'transparent') {
  const w = 600, h = 160;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    ${bgColor !== 'transparent' ? `<rect width="${w}" height="${h}" fill="${bgColor}" rx="0"/>` : ''}
    <!-- Gem -->
    <svg x="20" y="10" width="140" height="140" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="F1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#C4B8E4" stop-opacity=".90"/><stop offset="100%" stop-color="#7050A0" stop-opacity=".70"/></linearGradient>
        <linearGradient id="F2" x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#B8AEDD" stop-opacity=".70"/><stop offset="100%" stop-color="#4A2880" stop-opacity=".55"/></linearGradient>
        <linearGradient id="F3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#9070C0" stop-opacity=".55"/><stop offset="100%" stop-color="#2B1250" stop-opacity=".80"/></linearGradient>
        <linearGradient id="F4" x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#D0C4EC" stop-opacity=".80"/><stop offset="100%" stop-color="#5A38A0" stop-opacity=".60"/></linearGradient>
        <linearGradient id="Tbl" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#E8E2F8" stop-opacity=".95"/><stop offset="100%" stop-color="#B090D8" stop-opacity=".80"/></linearGradient>
        <linearGradient id="P1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0CC89E" stop-opacity=".38"/><stop offset="100%" stop-color="#0CC89E" stop-opacity=".05"/></linearGradient>
        <linearGradient id="P2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#7ADAC8" stop-opacity=".25"/><stop offset="100%" stop-color="#0CC89E" stop-opacity=".03"/></linearGradient>
        <linearGradient id="Str" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#C4B8E4" stop-opacity=".55"/><stop offset="50%" stop-color="#B8AEDD" stop-opacity=".35"/><stop offset="100%" stop-color="#7050A0" stop-opacity=".25"/></linearGradient>
        <filter id="Glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <polygon points="50,78 28,50 3,50 50,97"  fill="url(#P1)" opacity=".80"/>
      <polygon points="50,78 72,50 97,50 50,97" fill="url(#P2)" opacity=".80"/>
      <polygon points="50,22 28,50 3,50 50,3"   fill="url(#F1)"/>
      <polygon points="50,22 72,50 97,50 50,3"  fill="url(#F4)"/>
      <polygon points="3,50  50,22 28,50"        fill="url(#F2)"/>
      <polygon points="97,50 50,22 72,50"        fill="url(#F3)"/>
      <polygon points="50,22 72,50 50,78 28,50" fill="url(#Tbl)" filter="url(#Glow)"/>
      <circle cx="50" cy="50" r="2.5" fill="#EDE8F6" opacity=".95" filter="url(#Glow)"/>
      <polygon points="50,3 97,50 50,97 3,50"   fill="none" stroke="url(#Str)" stroke-width=".45"/>
      <polygon points="50,22 72,50 50,78 28,50" fill="none" stroke="#C4B8E4" stroke-width=".4" opacity=".25"/>
      <line x1="50" y1="3"  x2="50" y2="22" stroke="#C4B8E4" stroke-width=".35" opacity=".45"/>
      <line x1="3"  y1="50" x2="28" y2="50" stroke="#C4B8E4" stroke-width=".35" opacity=".35"/>
      <line x1="97" y1="50" x2="72" y2="50" stroke="#C4B8E4" stroke-width=".35" opacity=".35"/>
      <line x1="50" y1="22" x2="28" y2="50" stroke="#C4B8E4" stroke-width=".30" opacity=".28"/>
      <line x1="50" y1="22" x2="72" y2="50" stroke="#C4B8E4" stroke-width=".30" opacity=".28"/>
      <line x1="50" y1="78" x2="28" y2="50" stroke="#0CC89E" stroke-width=".25" opacity=".22"/>
      <line x1="50" y1="78" x2="72" y2="50" stroke="#0CC89E" stroke-width=".25" opacity=".22"/>
    </svg>
    <!-- Wordmark -->
    <text x="180" y="105" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="52" letter-spacing="12" fill="${textColor}">REFLEXY</text>
  </svg>`;
}

async function main() {
  console.log('Generating logo PNGs...\n');

  // 1. Icon 128x128
  await sharp(Buffer.from(gemSvg))
    .resize(128, 128)
    .png()
    .toFile(join(publicDir, 'logo-icon-128.png'));
  console.log('✅ logo-icon-128.png (128x128)');

  // 2. Icon 512x512
  await sharp(Buffer.from(gemSvg))
    .resize(512, 512)
    .png()
    .toFile(join(publicDir, 'logo-icon-512.png'));
  console.log('✅ logo-icon-512.png (512x512)');

  // 3. Horizontal — light bg (for Stripe checkout white bg)
  const horizLight = createHorizontalSvg('#1A1025', 'transparent');
  await sharp(Buffer.from(horizLight))
    .resize(600, 160)
    .png()
    .toFile(join(publicDir, 'logo-horizontal.png'));
  console.log('✅ logo-horizontal.png (600x160, dark text)');

  // 4. Horizontal — dark bg (for dark contexts)
  const horizDark = createHorizontalSvg('#EDEBF5', 'transparent');
  await sharp(Buffer.from(horizDark))
    .resize(600, 160)
    .png()
    .toFile(join(publicDir, 'logo-horizontal-dark.png'));
  console.log('✅ logo-horizontal-dark.png (600x160, light text)');

  console.log('\n🎉 All logos generated in /public/');
}

main().catch(console.error);
