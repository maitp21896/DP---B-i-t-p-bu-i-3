// Bundles a test-only trainer component fixture outside the checkout/public routes.
import { build } from "esbuild";
import { writeFile, copyFile } from "node:fs/promises";
await build({
  entryPoints: ["tests/fixtures/trainer-preview.tsx"],
  bundle: true,
  platform: "browser",
  jsx: "automatic",
  outfile: "/tmp/glow-nature-trainer-fixture.js",
  tsconfig: "tsconfig.json",
  define: { "process.env.NODE_ENV": '"production"' },
});
await copyFile("app/globals.css", "/tmp/glow-nature-fixture.css");
await writeFile(
  "/tmp/glow-nature-trainer-fixture.html",
  '<!doctype html><html lang="vi"><meta charset="utf-8"><title>Trainer UI Test Fixture — not live data</title><link rel="stylesheet" href="./glow-nature-fixture.css"><div id="root"></div><script src="./glow-nature-trainer-fixture.js"></script></html>',
);
