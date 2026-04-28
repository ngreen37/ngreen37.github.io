#!/usr/bin/env node

/* ==========================================================
   PJCC Flair Checker
   ----------------------------------------------------------
   Reads a CSS or SCSS file and reports rule violations.
   Run from the repo root:

     node tools/flair-checker.js path/to/file.scss

   Exit code 0 = clean, 1 = violations found.
   ========================================================== */

const fs = require('fs');
const path = require('path');

// ----- THE RULES -----------------------------------------------------
// Edit these lists to match your project.

// Royal Chess palette — the only hex colors allowed.
const ALLOWED_HEX = [
  '#2D1B69', '#5B2D8E', '#F5C518', '#FFE566',
  '#1A8FE3', '#0f0c1a', '#1c1540', '#ddd6f3',
  '#0a0714', '#3d2b8a', '#c4b5fd', '#9b87c0',
  '#6b5a8e', '#12093a', '#a78bfa', '#160e30',
  '#080610', '#2d2060', '#e2e8f0', '#4a3870',
  '#080808', '#000000', '#ffffff', '#cccccc',
  '#00ff41', '#030a02',
].map(c => c.toLowerCase());

// Properties that should never appear in new flair.
const BANNED_PROPERTIES = [
  'filter: blur',          // performance hit on mobile
  'backdrop-filter',       // spotty mobile support
];

// Phrases that signal off-brand suggestions.
const BANNED_KEYWORDS = [
  'parallax',
  'cursor-trail',
];

// ----- THE CHECKER ---------------------------------------------------

function check(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(2);
  }

  const text = fs.readFileSync(filePath, 'utf8');
  const lines = text.split('\n');
  const violations = [];

  lines.forEach((line, i) => {
    const lineNum = i + 1;
    const lower = line.toLowerCase();

    // Rule 1: every hex color must be on the allowed list.
    const hexMatches = line.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
    hexMatches.forEach(hex => {
      if (!ALLOWED_HEX.includes(hex.toLowerCase())) {
        violations.push({
          line: lineNum,
          rule: 'off-palette color',
          detail: hex,
          text: line.trim(),
        });
      }
    });

    // Rule 2: banned properties.
    BANNED_PROPERTIES.forEach(prop => {
      if (lower.includes(prop)) {
        violations.push({
          line: lineNum,
          rule: 'banned property',
          detail: prop,
          text: line.trim(),
        });
      }
    });

    // Rule 3: banned keywords (class names, comments, anywhere).
    BANNED_KEYWORDS.forEach(word => {
      if (lower.includes(word)) {
        violations.push({
          line: lineNum,
          rule: 'banned keyword',
          detail: word,
          text: line.trim(),
        });
      }
    });
  });

  // ----- REPORT ------------------------------------------------------
  if (violations.length === 0) {
    console.log(`PASS — ${filePath} (${lines.length} lines clean)`);
    process.exit(0);
  }

  console.log(`FAIL — ${violations.length} violation(s) in ${filePath}\n`);
  violations.forEach(v => {
    console.log(`  line ${v.line}  [${v.rule}: ${v.detail}]`);
    console.log(`    ${v.text}\n`);
  });
  process.exit(1);
}

// ----- ENTRY POINT ---------------------------------------------------
const target = process.argv[2];
if (!target) {
  console.error('Usage: node flair-checker.js <path-to-css-or-scss>');
  process.exit(2);
}
check(path.resolve(target));