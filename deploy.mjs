#!/usr/bin/env node
/**
 * CrossTech site deploy script — deploys EVERYTHING:
 *   hosting (public/) + Firestore rules & indexes + Cloud Functions.
 *
 * Usage (from the website/ folder):
 *   node deploy.mjs                  deploy to the default project (crosstech-1adc3)
 *   node deploy.mjs -P production    deploy to the production alias (crosstech-site)
 *   node deploy.mjs --skip-functions deploy hosting + Firestore only
 *
 * What it does, in order:
 *   1. Verifies the Firebase CLI is available (falls back to `npx firebase`).
 *   2. Installs functions dependencies if missing.
 *   3. Lints and builds the functions (TypeScript -> lib/).
 *   4. Refuses to deploy functions if the build exports nothing — deploying an
 *      empty functions codebase invites the CLI to DELETE live functions.
 *   5. Runs one `firebase deploy --only hosting,firestore,functions`.
 *
 * First functions deploy: requires the Blaze plan, prompts for the SMTP
 * params (SMTP_HOST, SMTP_PORT, SMTP_USER, MAIL_FROM, MAIL_NOTIFY) and the
 * SMTP_PASS secret. No credentials ever live in this repo.
 */
import {spawnSync} from "node:child_process";
import {createRequire} from "node:module";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const fnDir = join(root, "functions");
const args = process.argv.slice(2);
const skipFunctions = args.includes("--skip-functions");
const passthrough = args.filter((a) => a !== "--skip-functions");

const run = (cmd, cmdArgs, opts = {}) => {
  console.log(`\n> ${cmd} ${cmdArgs.join(" ")}`);
  const res = spawnSync(cmd, cmdArgs, {
    stdio: "inherit",
    shell: true, // resolves .cmd shims on Windows
    ...opts,
  });
  if (res.status !== 0) {
    console.error(`\nFAILED (exit ${res.status}): ${cmd} ${cmdArgs.join(" ")}`);
    process.exit(res.status ?? 1);
  }
};

const tryVersion = (cmd, cmdArgs) =>
  spawnSync(cmd, cmdArgs, {shell: true, stdio: "ignore"}).status === 0;

// 1. Locate the Firebase CLI
let firebase = ["firebase"];
if (!tryVersion("firebase", ["--version"])) {
  if (tryVersion("npx", ["--yes", "firebase-tools", "--version"])) {
    firebase = ["npx", "--yes", "firebase-tools"];
    console.log("Firebase CLI not installed globally — using npx firebase-tools.");
  } else {
    console.error(
        "Firebase CLI not found. Install it with: npm install -g firebase-tools",
    );
    process.exit(1);
  }
}

const targets = ["hosting", "firestore"]; // firestore = rules + indexes

// 2–4. Functions: install, lint, build, verify exports
if (skipFunctions) {
  console.log("\n--skip-functions: functions will NOT be deployed.");
} else {
  // Always sync dependencies — package.json may have changed since the
  // last install (npm install is a fast no-op when already up to date).
  console.log("\nSyncing functions dependencies…");
  run("npm", ["install"], {cwd: fnDir});
  run("npm", ["run", "lint"], {cwd: fnDir});
  run("npm", ["run", "build"], {cwd: fnDir});

  const require = createRequire(import.meta.url);
  const exported = Object.keys(require(join(fnDir, "lib", "index.js")));
  if (exported.length === 0) {
    console.error(
        "\nfunctions/lib/index.js exports NOTHING — refusing to deploy " +
        "functions (an empty deploy prompts to delete live functions).\n" +
        "Fix functions/src/index.ts or re-run with --skip-functions.",
    );
    process.exit(1);
  }
  console.log(`\nFunctions to deploy: ${exported.join(", ")}`);
  targets.push("functions");
}

// 5. One deploy for everything
console.log(`\nDeploying: ${targets.join(" + ")}`);
run(firebase[0], [
  ...firebase.slice(1),
  "deploy",
  "--only",
  targets.join(","),
  ...passthrough,
]);

console.log(`
Done. Post-deploy checklist:
  1. Submit the contact form on the live site once.
  2. Confirm the auto-reply arrives AND the internal notification hits the
     inbox; the lead doc should flip to emailSent: true.
  3. If emails arrive TWICE, an old mail process (e.g. a Trigger Email
     extension) is still active in the Firebase console — disable one.
`);
