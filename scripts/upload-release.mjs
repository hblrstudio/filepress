#!/usr/bin/env node
/**
 * Upload release artifacts to Vercel Blob and update web/public/version.json.
 * Called by GitHub Actions on tag push.
 *
 * Required env vars:
 *   BLOB_READ_WRITE_TOKEN  — from Vercel project settings
 *   VERSION                — tag name, e.g. "v1.1.0"
 */

import { put } from "@vercel/blob";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, "..");

const version = (process.env.VERSION ?? "").replace(/^v/, "");
if (!version) {
  console.error("VERSION env var is required (e.g. v1.1.0)");
  process.exit(1);
}

async function upload(filename, localPath) {
  const data = readFileSync(localPath);
  const blob = await put(`releases/${version}/${filename}`, data, {
    access: "private",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  console.log(`✓ ${filename} → ${blob.url}`);
  return blob.url;
}

const macUrl = await upload(
  "FilePress.dmg",
  join(root, "artifacts", "FilePress.dmg")
);
const winUrl = await upload(
  "FilePress.exe",
  join(root, "artifacts", "FilePress.exe")
);

const versionJson = { version, mac_url: macUrl, win_url: winUrl, notes: "" };
const outPath = join(root, "web", "public", "version.json");
writeFileSync(outPath, JSON.stringify(versionJson, null, 2) + "\n");
console.log(`✓ Updated ${outPath}`);
