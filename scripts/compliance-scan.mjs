#!/usr/bin/env node

/**
 * OP_Client-Companion Compliance & Determinism Scan
 *
 * Guardrails enforced (heuristic, static checks):
 * 1. No clinical interpretation / diagnosis / crisis-detection logic.
 * 2. No non-deterministic APIs (Math.random, Date.now, new Date()) in core code.
 * 3. Presence of `submitted_at_utc` usage in backend code.
 * 4. Offline queue constraints (max 50, queue-related files).
 *
 * Exit code:
 *  - 0 = all checks passed
 *  - 1 = one or more violations
 */

import fs from 'fs';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

/**
 * CONFIG
 * Adjust these as your repo structure evolves.
 */
const CONFIG = {
  // Folders to scan for main app code (frontend + backend)
  codeRoots: [
    'backend',
    'web',
    'mobile',
    'src',
    'app/client-companion/src',
    'app/client-companion/components',
    'app/client-companion/redux',
    'app/client-companion/sagas',
  ].map((p) => path.join(__dirname, '..', p)),

  // File extensions to scan
  exts: ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'],

  // Treat these paths as tests (less strict determinism)
  testPathPatterns: [/__tests__/, /tests?/, /\.test\./, /\.spec\./],

  // Words/phrases we never want in source code
  forbiddenClinicalPatterns: [
    /diagnos(e|is|tic)/i,
    /clinical interpretation/i,
    /treatment plan/i,
    /prognosis/i,
    /risk assessment/i,
    /suicid(e|al)/i,
    /self[-\s]?harm/i,
    /crisis (detection|alert|monitoring)/i,
    /emergency (escalation|hotline)/i,
  ],

  // Non-deterministic API patterns (banned in core logic)
  nondeterministicPatterns: [
    /Math\.random\s*\(/,
    /Date\.now\s*\(/,
    /new\s+Date\s*\(/,
  ],

  // Heuristic for offline queue files
  queuePathPatterns: [/queue/i, /offline/i, /sync/i],
  queueLimitValue: 50,
};

/**
 * Utility: recursively list files with allowed extensions.
 */
function listFiles(dir, exts) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...listFiles(fullPath, exts));
    } else {
      if (exts.includes(path.extname(entry.name))) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

function isTestFile(filePath) {
  return CONFIG.testPathPatterns.some((re) => re.test(filePath));
}

function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}

/**
 * Check 1: Forbidden clinical / crisis terms in source code.
 */
function checkForbiddenClinicalTerms(files) {
  const violations = [];

  for (const file of files) {
    const content = readFileSafe(file);
    for (const re of CONFIG.forbiddenClinicalPatterns) {
      const match = content.match(re);
      if (match) {
        violations.push({
          type: 'FORBIDDEN_CLINICAL_TERM',
          file,
          pattern: re.toString(),
          excerpt: match[0],
        });
      }
    }
  }

  return violations;
}

/**
 * Check 2: Non-deterministic APIs in core code (non-test files).
 */
function checkNondeterministicApis(files) {
  const violations = [];

  for (const file of files) {
    if (isTestFile(file)) continue; // allow in tests, if needed
    const content = readFileSafe(file);

    for (const re of CONFIG.nondeterministicPatterns) {
      const match = content.match(re);
      if (match) {
        violations.push({
          type: 'NONDETERMINISTIC_API',
          file,
          pattern: re.toString(),
          excerpt: match[0],
          note: 'Use injected time/random or deterministic stubs, not global calls.',
        });
      }
    }
  }

  return violations;
}

/**
 * Check 3: Ensure submitted_at_utc appears in backend-ish code.
 * This is heuristic: we just ensure the symbol exists somewhere.
 */
function checkSubmittedAtUtcPresence(files) {
  const backendFiles = files.filter((f) =>
    /backend|server|api|routes|controllers/i.test(f),
  );
  if (backendFiles.length === 0) {
    return [];
  }
  const allContent = backendFiles.map(readFileSafe).join('\n');

  const found = /submitted_at_utc/.test(allContent);

  if (!found) {
    return [
      {
        type: 'MISSING_SUBMITTED_AT_UTC',
        file: '(multiple backend files)',
        pattern: 'submitted_at_utc',
        note: 'Heuristic: expected to find `submitted_at_utc` in backend routes/models. If you renamed this, update the compliance-scan config.',
      },
    ];
  }
  return [];
}

/**
 * Check 4: Offline queue heuristic (max 50).
 * Look for queue-related files and verify a constant near 50.
 */
function checkOfflineQueueLimit(files) {
  const queueFiles = files.filter((f) =>
    CONFIG.queuePathPatterns.some((re) => re.test(f)),
  );

  if (queueFiles.length === 0) {
    // If no queue files exist yet, don't fail.
    return [];
  }

  const queueStorageIndicators = [
    /queue\s*:\s*\[/,
    /queue\s*=\s*\[/,
    /queueItems/i,
    /offlineQueue/i,
    /persist/i,
    /storage/i,
    /encrypt/i,
  ];

  const queueFilesContent = queueFiles.map(readFileSafe).join('\n');
  const hasQueueStorage = queueStorageIndicators.some((re) => re.test(queueFilesContent));
  if (!hasQueueStorage) {
    // Skip limit enforcement until a real queue storage implementation exists.
    return [];
  }

  const violations = [];
  let foundLimit = false;

  for (const file of queueFiles) {
    const content = readFileSafe(file);

    // Look for simple patterns like MAX_QUEUE_SIZE = 50 or maxQueueSize: 50
    const limitRegexes = [
      /MAX_QUEUE_SIZE\s*=\s*50/,
      /maxQueueSize\s*[:=]\s*50/,
      /queueLimit\s*[:=]\s*50/,
    ];

    if (limitRegexes.some((re) => re.test(content))) {
      foundLimit = true;
    }
  }

  if (!foundLimit) {
    violations.push({
      type: 'MISSING_QUEUE_LIMIT',
      file: '(queue-related files)',
      pattern: `queueLimit == ${CONFIG.queueLimitValue}`,
      note: `Heuristic: expected to find a queue limit of ${CONFIG.queueLimitValue} near offline/queue files.`,
    });
  }

  return violations;
}

/**
 * Pretty-print violations and exit with appropriate status.
 */
function reportAndExit(violations) {
  if (violations.length === 0) {
    console.log('✅ Compliance scan passed: no violations found.');
    process.exit(0);
  }

  console.error('❌ Compliance scan failed. Violations:');
  for (const v of violations) {
    console.error('---');
    console.error(`Type:    ${v.type}`);
    console.error(`File:    ${v.file}`);
    if (v.pattern) console.error(`Pattern: ${v.pattern}`);
     if (v.excerpt) console.error(`Excerpt: ${JSON.stringify(v.excerpt)}`);
    if (v.note) console.error(`Note:    ${v.note}`);
  }

  console.error('---');
  console.error(
    'Please fix the above issues or update scripts/compliance-scan.mjs if the rules have changed.',
  );
  process.exit(1);
}

/**
 * MAIN
 */
function main() {
  const allFiles = CONFIG.codeRoots
    .filter((root) => fs.existsSync(root))
    .flatMap((root) => listFiles(root, CONFIG.exts));

  if (allFiles.length === 0) {
    console.log(
      'ℹ️ No code files found under configured roots. Adjust CONFIG.codeRoots if needed.',
    );
    process.exit(0);
  }

  let violations = [];
  violations = violations.concat(checkForbiddenClinicalTerms(allFiles));
  violations = violations.concat(checkNondeterministicApis(allFiles));
  violations = violations.concat(checkSubmittedAtUtcPresence(allFiles));
  violations = violations.concat(checkOfflineQueueLimit(allFiles));

  reportAndExit(violations);
}

if (import.meta.url === url.pathToFileURL(process.argv[1]).href) {
  main();
}
