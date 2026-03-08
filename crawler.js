#!/usr/bin/env bun
/**
 * Generic BFS Crawler for RL Environment
 *
 * Crawls any game's clone using the 5 window APIs (__annotations__, __state__,
 * __setState__, __reset__, __meta__) and produces state_graph.json + screenshots.
 *
 * Fully parallelized: N browsers × M tabs = N*M workers processing a shared
 * BFS work queue. JS single-threaded event loop provides natural thread safety
 * between await points — the states map acts as BFS "coloring".
 *
 * Usage: bun engine/crawler.js games/amazon-add-to-cart [--browsers 6] [--tabs 6]
 */

import { chromium } from "playwright";
import { spawn } from "child_process";
import { mkdir, rm, writeFile, readFile } from "fs/promises";
import { join, resolve } from "path";
import { createHash } from "crypto";

// --- Configuration ---
const ACTION_SETTLE_TIMEOUT = 500;
const NAV_TIMEOUT = 8000;
const MAX_BFS_ACTIONS = 500;

// Parse CLI flags
function parseArgs() {
  const args = process.argv.slice(2);
  let gameDir = null;
  let numBrowsers = 6;
  let tabsPerBrowser = 6;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--browsers" && args[i + 1]) {
      numBrowsers = parseInt(args[++i]);
    } else if (args[i] === "--tabs" && args[i + 1]) {
      tabsPerBrowser = parseInt(args[++i]);
    } else if (!args[i].startsWith("--")) {
      gameDir = args[i];
    }
  }

  return { gameDir, numBrowsers, tabsPerBrowser };
}

// --- Helpers ---

function hashState(pathname, stateObj) {
  const raw = pathname + JSON.stringify(stateObj);
  return createHash("sha256").update(raw).digest("hex").slice(0, 12);
}

async function loadGameJson(gameDir) {
  const gamePath = join(gameDir, "game.json");
  const raw = await readFile(gamePath, "utf-8");
  return JSON.parse(raw);
}

function startDevServer(clonePath, devServerConfig) {
  return new Promise((resolvePromise, reject) => {
    const { command, port, readyPattern } = devServerConfig;
    const parts = command.split(/\s+/);

    const proc = spawn(parts[0], parts.slice(1), {
      cwd: clonePath,
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, PORT: String(port) },
      shell: true,
    });

    let started = false;
    const timeout = setTimeout(() => {
      if (!started) {
        reject(new Error(`Dev server did not become ready within 30s`));
        proc.kill();
      }
    }, 30000);

    const checkOutput = (data) => {
      if (!started && data.toString().includes(readyPattern)) {
        started = true;
        clearTimeout(timeout);
        setTimeout(() => resolvePromise(proc), 1000);
      }
    };

    proc.stdout.on("data", checkOutput);
    proc.stderr.on("data", checkOutput);
    proc.on("error", (err) => { clearTimeout(timeout); reject(err); });
    proc.on("exit", (code) => {
      if (!started) { clearTimeout(timeout); reject(new Error(`Dev server exited with code ${code}`)); }
    });
  });
}

async function getStateKey(page) {
  const pathname = new URL(page.url()).pathname;
  const state = await page.evaluate(() => window.__state__());
  return { pathname, state, stateKey: hashState(pathname, state) };
}

async function captureState(page, stateKey, screenshotsDir) {
  const screenshotPath = join(screenshotsDir, `${stateKey}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: false });

  const annotations = await page.evaluate(() => window.__annotations__());
  const { pathname, state } = await page.evaluate(() => ({
    pathname: window.location.pathname,
    state: window.__state__(),
  }));

  return { stateKey, pathname, state, screenshot: `screenshots/${stateKey}.png`, annotations };
}

async function performAction(page, annotation) {
  const { bbox, action, metadata } = annotation;
  const cx = bbox.x + bbox.width / 2;
  const cy = bbox.y + bbox.height / 2;

  // Scroll element into view if it's below the viewport
  const viewport = page.viewportSize();
  if (viewport && cy > viewport.height) {
    await page.mouse.wheel(0, cy - viewport.height / 2);
    await page.waitForTimeout(300);
    // Re-query bbox after scroll since positions change
    const updatedBbox = await page.evaluate((annId) => {
      const el = document.querySelector(`[data-ann="${annId}"]`);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    }, annotation.id);
    if (updatedBbox) {
      annotation = { ...annotation, bbox: updatedBbox };
      const newCx = updatedBbox.x + updatedBbox.width / 2;
      const newCy = updatedBbox.y + updatedBbox.height / 2;
      return performActionAtCoords(page, action, metadata, newCx, newCy);
    }
  }

  return performActionAtCoords(page, action, metadata, cx, cy);
}

async function performActionAtCoords(page, action, metadata, cx, cy) {
  switch (action) {
    case "click":
      await page.mouse.click(cx, cy);
      break;
    case "type": {
      const text = metadata?.text ?? "";
      await page.mouse.click(cx, cy, { clickCount: 3 });
      await page.keyboard.type(text);
      await page.keyboard.press("Enter");
      break;
    }
    case "select": {
      const value = metadata?.value ?? "";
      await page.evaluate(({ x, y, val }) => {
        const el = document.elementFromPoint(x, y);
        const select = el?.closest("select") || el;
        if (select?.tagName === "SELECT") {
          select.value = val;
          select.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }, { x: cx, y: cy, val: value });
      break;
    }
    case "scroll":
      await page.mouse.move(cx, cy);
      await page.mouse.wheel(0, 200);
      break;
  }
}

async function restoreState(page, baseUrl, pathname, savedState) {
  await page.goto(`${baseUrl}${pathname}`, { waitUntil: "networkidle", timeout: NAV_TIMEOUT }).catch(() => {});
  await page.evaluate((s) => window.__setState__(s), savedState);
  await page.waitForTimeout(200);
}

// --- Worker: try one action, return result ---

async function tryAction(page, baseUrl, workItem) {
  const { stateKey, pathname, savedState, annotation } = workItem;
  try {
    await restoreState(page, baseUrl, pathname, savedState);
    await performAction(page, annotation);
    await page.waitForTimeout(ACTION_SETTLE_TIMEOUT);
    const result = await getStateKey(page);
    return { workItem, result };
  } catch (err) {
    return { workItem, result: null, error: err.message };
  }
}

// --- Main ---

async function main() {
  const { gameDir, numBrowsers, tabsPerBrowser } = parseArgs();
  const totalWorkers = numBrowsers * tabsPerBrowser;

  if (!gameDir) {
    console.error("Usage: bun engine/crawler.js <game-dir> [--browsers N] [--tabs N]");
    process.exit(1);
  }

  const resolvedGameDir = resolve(gameDir);
  const screenshotsDir = join(resolvedGameDir, "screenshots");

  let gameJson;
  try {
    gameJson = await loadGameJson(resolvedGameDir);
  } catch (err) {
    console.error(`Failed to load game.json:`, err.message);
    process.exit(1);
  }

  console.log(`=== BFS Crawler: ${gameJson.name} ===`);
  console.log(`Workers: ${numBrowsers} browsers × ${tabsPerBrowser} tabs = ${totalWorkers}\n`);

  if (!gameJson.clone?.path || !gameJson.clone?.devServer?.command) {
    console.log("No clone configured. Nothing to crawl.");
    process.exit(0);
  }

  const clonePath = resolve(resolvedGameDir, gameJson.clone.path);
  const devServerConfig = gameJson.clone.devServer;
  const port = devServerConfig.port;
  const baseUrl = `http://localhost:${port}`;
  const viewport = gameJson.viewport || { width: 1280, height: 900 };

  await rm(screenshotsDir, { recursive: true, force: true });
  await mkdir(screenshotsDir, { recursive: true });

  // Start dev server
  console.log(`Starting dev server: ${devServerConfig.command} (port ${port})`);
  let devServer;
  try {
    devServer = await startDevServer(clonePath, devServerConfig);
    console.log(`Dev server ready.\n`);
  } catch (err) {
    console.error("Failed to start dev server:", err.message);
    process.exit(1);
  }

  // Launch browser pool
  console.log(`Launching ${numBrowsers} browsers...`);
  const browsers = [];
  const workers = []; // flat array of pages

  for (let b = 0; b < numBrowsers; b++) {
    const browser = await chromium.launch({ headless: true });
    browsers.push(browser);
    for (let t = 0; t < tabsPerBrowser; t++) {
      const ctx = await browser.newContext({ viewport });
      const page = await ctx.newPage();
      await page.goto(baseUrl, { waitUntil: "networkidle", timeout: NAV_TIMEOUT }).catch(() => {});
      workers.push(page);
    }
  }
  console.log(`${workers.length} workers ready.\n`);

  // --- Shared BFS state (thread-safe: JS is single-threaded between awaits) ---
  const states = {};       // stateKey -> stateData (acts as BFS coloring)
  const transitions = {};  // stateKey -> { annotationId -> transition }
  const workQueue = [];    // { stateKey, pathname, savedState, annotation }
  let maxInteractiveAnnotations = 0;
  let totalActionsProcessed = 0;

  const startTime = Date.now();

  try {
    // Capture initial state
    const startPathname = gameJson.tasks?.[0]?.start?.pathname || "/";
    const primary = workers[0];
    await primary.goto(`${baseUrl}${startPathname}`, { waitUntil: "networkidle", timeout: NAV_TIMEOUT }).catch(() => {});
    await primary.waitForTimeout(1500);

    const initial = await getStateKey(primary);
    const initialData = await captureState(primary, initial.stateKey, screenshotsDir);
    states[initial.stateKey] = initialData;
    transitions[initial.stateKey] = {};

    const initInteractive = initialData.annotations.filter((a) => a.interactive);
    maxInteractiveAnnotations = Math.max(maxInteractiveAnnotations, initInteractive.length);

    // Seed work queue with initial state's interactive annotations
    for (const ann of initInteractive) {
      workQueue.push({
        stateKey: initial.stateKey,
        pathname: initial.pathname,
        savedState: initial.state,
        annotation: ann,
      });
    }

    console.log(`--- BFS Start ---`);
    console.log(`Initial: ${initial.stateKey} (${initial.pathname}) - ${initInteractive.length} annotations queued\n`);

    // --- BFS loop: grab batches, process in parallel ---
    while (workQueue.length > 0 && totalActionsProcessed < MAX_BFS_ACTIONS) {
      // Grab up to totalWorkers items
      const batchSize = Math.min(workQueue.length, workers.length, MAX_BFS_ACTIONS - totalActionsProcessed);
      const batch = workQueue.splice(0, batchSize);

      // Dispatch to workers in parallel
      const results = await Promise.all(
        batch.map((item, i) => tryAction(workers[i], baseUrl, item))
      );

      totalActionsProcessed += results.length;

      // --- Process results synchronously (between awaits = atomic) ---
      // Collect newly discovered states that need capturing
      const toCapture = new Map(); // stateKey -> { pathname, state }

      for (const { workItem, result, error } of results) {
        if (error || !result) continue;

        // Record transition
        if (!transitions[workItem.stateKey]) transitions[workItem.stateKey] = {};
        const entry = { nextState: result.stateKey, action: workItem.annotation.action };
        if (workItem.annotation.action === "type" && workItem.annotation.metadata?.text) {
          entry.actionDetail = { text: workItem.annotation.metadata.text };
        } else if (workItem.annotation.action === "select" && workItem.annotation.metadata?.value) {
          entry.actionDetail = { value: workItem.annotation.metadata.value };
        }
        transitions[workItem.stateKey][workItem.annotation.id] = entry;

        // Mark new states for capture (deduplicated within this batch)
        if (!states[result.stateKey] && !toCapture.has(result.stateKey)) {
          toCapture.set(result.stateKey, { pathname: result.pathname, state: result.state });
          // Immediately color it to prevent future batches from re-capturing
          states[result.stateKey] = null; // placeholder
        }
      }

      // --- Capture new states in parallel ---
      if (toCapture.size > 0) {
        const captureEntries = [...toCapture.entries()];

        for (let ci = 0; ci < captureEntries.length; ci += workers.length) {
          const captureBatch = captureEntries.slice(ci, ci + workers.length);

          const captured = await Promise.all(
            captureBatch.map(async ([key, { pathname, state: savedState }], j) => {
              const page = workers[j];
              await restoreState(page, baseUrl, pathname, savedState);
              return captureState(page, key, screenshotsDir);
            })
          );

          // Enqueue new work items from captured states (synchronous)
          for (const stateData of captured) {
            states[stateData.stateKey] = stateData;
            transitions[stateData.stateKey] = transitions[stateData.stateKey] || {};

            const interactive = stateData.annotations.filter((a) => a.interactive);
            maxInteractiveAnnotations = Math.max(maxInteractiveAnnotations, interactive.length);

            for (const ann of interactive) {
              workQueue.push({
                stateKey: stateData.stateKey,
                pathname: stateData.pathname,
                savedState: stateData.state,
                annotation: ann,
              });
            }

            console.log(`  NEW ${stateData.stateKey} (${stateData.pathname}) [${interactive.length} interactive]`);
          }
        }
      }

      // Progress
      const knownCount = Object.keys(states).length;
      const queueLen = workQueue.length;
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`  [${elapsed}s] actions: ${totalActionsProcessed}, states: ${knownCount}, queue: ${queueLen}`);
    }

    // --- Build output ---
    // Filter out placeholder nulls (shouldn't happen, but safety)
    for (const key of Object.keys(states)) {
      if (!states[key]) delete states[key];
    }

    const totalStates = Object.keys(states).length;
    const totalTransitions = Object.values(transitions).reduce(
      (sum, t) => sum + Object.keys(t).length, 0
    );

    const stateGraph = {
      metadata: {
        game: gameJson.name,
        captureDate: new Date().toISOString(),
        engineVersion: "2.0.0",
        totalStates,
        totalTransitions,
        maxInteractiveAnnotations,
        viewport,
      },
      states,
      transitions,
    };

    const outputPath = join(resolvedGameDir, "state_graph.json");
    await writeFile(outputPath, JSON.stringify(stateGraph, null, 2));

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`\n=== Crawl Complete (${elapsed}s) ===`);
    console.log(`States:                    ${totalStates}`);
    console.log(`Transitions:               ${totalTransitions}`);
    console.log(`Max interactive/state:     ${maxInteractiveAnnotations}`);
    console.log(`Actions processed:         ${totalActionsProcessed}`);
    console.log(`Workers:                   ${totalWorkers} (${numBrowsers}×${tabsPerBrowser})`);
    console.log(`Output:                    ${outputPath}`);
  } catch (err) {
    console.error("Crawler error:", err);
    process.exit(1);
  } finally {
    for (const b of browsers) await b.close();
    devServer.kill();
  }
}

main();
