/**
 * Extract DOM trees from the 348MB PropertySpec into compact per-state files
 * that building agents can read. Strips unnecessary detail, keeps structure.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const SPEC_PATH = join(__dirname, '../../../rcm/extract/specs/jetblue/PropertySpec.json');
const OUT_DIR = join(__dirname, '.specs');

interface RawElement {
  rrwebId: number;
  tagName: string;
  selector: string;
  bbox: { x: number; y: number; width: number; height: number };
  styles: Record<string, string>;
  textContent: string | null;
  isVisible: boolean;
  prunable: boolean;
  children: RawElement[];
}

interface CompactElement {
  tag: string;
  sel?: string; // selector, only if contains useful id/class info
  text?: string; // trimmed textContent, max 100 chars
  prunable?: true;
  display?: string;
  position?: string;
  flexDir?: string;
  w?: string;
  h?: string;
  gap?: string;
  grid?: string;
  children?: CompactElement[];
  repeated?: { count: number; template: CompactElement }; // for repetitive children
}

function compact(el: RawElement): CompactElement {
  const result: CompactElement = { tag: el.tagName };

  // Include selector if it has id or custom element info
  if (el.selector && (el.selector.includes('#') || el.selector.includes('cb-') ||
      el.selector.includes('jb-') || el.selector.includes('mat-') ||
      el.selector.includes('jtp-'))) {
    result.sel = el.selector.split(' > ').pop() || el.selector;
  }

  if (el.textContent?.trim()) {
    result.text = el.textContent.trim().substring(0, 100);
  }
  if (el.prunable) result.prunable = true;

  // Key layout styles
  const s = el.styles;
  if (s.display && s.display !== 'block') result.display = s.display;
  if (s.position && s.position !== 'static') result.position = s.position;
  if (s.flexDirection && s.flexDirection !== 'row') result.flexDir = s.flexDirection;
  if (s.width && s.width !== 'auto') result.w = s.width;
  if (s.height && s.height !== 'auto') result.h = s.height;
  if (s.gap && s.gap !== 'normal') result.gap = s.gap;
  if (s.gridTemplateColumns && s.gridTemplateColumns !== 'none') result.grid = s.gridTemplateColumns;

  if (el.children?.length > 0) {
    // Check for repetitive children (e.g., seat rows, flight items)
    if (el.children.length >= 5 && areChildrenRepetitive(el.children)) {
      result.repeated = {
        count: el.children.length,
        template: compact(el.children[0])
      };
      // Also include first and last child for reference, plus any unique ones
      const uniqueChildren = findUniqueChildren(el.children);
      if (uniqueChildren.length > 0) {
        result.children = uniqueChildren.map(c => compact(c));
      }
    } else {
      result.children = el.children.map(c => compact(c));
    }
  }

  return result;
}

function countElements(el: RawElement): number {
  let count = 1;
  for (const child of (el.children || [])) {
    count += countElements(child);
  }
  return count;
}

function areChildrenRepetitive(children: RawElement[]): boolean {
  if (children.length < 5) return false;
  const firstTag = children[0].tagName;
  const firstChildCount = children[0].children?.length || 0;
  let matching = 0;
  for (const child of children) {
    if (child.tagName === firstTag &&
        Math.abs((child.children?.length || 0) - firstChildCount) <= 2) {
      matching++;
    }
  }
  return matching / children.length > 0.7;
}

function findUniqueChildren(children: RawElement[]): RawElement[] {
  // Return first, last, and any structurally different children
  const unique: RawElement[] = [children[0]];
  const firstChildCount = children[0].children?.length || 0;

  for (let i = 1; i < children.length; i++) {
    const childCount = children[i].children?.length || 0;
    if (Math.abs(childCount - firstChildCount) > 2) {
      unique.push(children[i]);
    }
  }

  if (children.length > 1 && !unique.includes(children[children.length - 1])) {
    unique.push(children[children.length - 1]);
  }

  return unique.length < children.length ? unique : []; // only return if actually compressed
}

// Also produce a human-readable tree outline
function treeOutline(el: RawElement, depth: number = 0, maxDepth: number = 12): string {
  const indent = '  '.repeat(depth);
  const childCount = countElements(el) - 1;
  let tag = el.tagName;

  // Add selector info for custom elements
  if (el.selector?.includes('#')) {
    const id = el.selector.match(/#([a-zA-Z0-9_-]+)/)?.[1];
    if (id) tag += `#${id}`;
  }
  if (el.selector?.match(/^(cb-|jb-|mat-|jtp-)/)) {
    tag = el.selector.split(' > ').pop() || tag;
  }

  let line = `${indent}${tag}`;
  if (el.prunable) line += ' [P]';
  if (el.textContent?.trim()) {
    const text = el.textContent.trim().substring(0, 60);
    line += ` "${text}"`;
  }
  if (childCount > 0) line += ` (${childCount} children)`;

  const s = el.styles;
  const attrs: string[] = [];
  if (s.display === 'flex') attrs.push('flex');
  if (s.display === 'inline-flex') attrs.push('inline-flex');
  if (s.display === 'grid') attrs.push('grid');
  if (s.display === 'inline') attrs.push('inline');
  if (s.display === 'none') attrs.push('hidden');
  if (s.flexDirection === 'column') attrs.push('col');
  if (s.position === 'absolute') attrs.push('abs');
  if (s.position === 'fixed') attrs.push('fixed');
  if (attrs.length) line += ` {${attrs.join(',')}}`;

  line += ` [${s.width}×${s.height}]`;

  let result = line + '\n';

  if (depth < maxDepth && el.children?.length > 0) {
    // Summarize repetitive children
    if (el.children.length >= 5 && areChildrenRepetitive(el.children)) {
      const childEls = countElements(el.children[0]) - 1;
      result += `${indent}  ── ${el.children.length} × ${el.children[0].tagName} (each ${childEls + 1} elements)\n`;
      // Show first child structure
      result += treeOutline(el.children[0], depth + 2, Math.min(maxDepth, depth + 5));
      if (el.children.length > 1) {
        // Check if last is different
        const lastChildEls = countElements(el.children[el.children.length - 1]);
        if (Math.abs(lastChildEls - (childEls + 1)) > 2) {
          result += `${indent}  ── last child different (${lastChildEls} elements):\n`;
          result += treeOutline(el.children[el.children.length - 1], depth + 2, Math.min(maxDepth, depth + 5));
        }
      }
    } else {
      for (const child of el.children) {
        result += treeOutline(child, depth + 1, maxDepth);
      }
    }
  }

  return result;
}

// Main
console.log('Loading PropertySpec (348MB)...');
console.time('load');
const raw = readFileSync(SPEC_PATH, 'utf-8');
console.timeEnd('load');

console.log('Parsing JSON...');
console.time('parse');
const spec = JSON.parse(raw);
console.timeEnd('parse');

const states = spec.states as Array<{ stateId: number; tree: RawElement; page: string; trigger: string }>;
console.log(`Total states: ${states.length}`);

mkdirSync(OUT_DIR, { recursive: true });

// Define which states to extract for each agent group
const stateGroups: Record<string, number[]> = {
  // Flight results page
  'flight-results': [37, 33, 19],
  // Shopping cart + sign in
  'cart-signin': [40, 44],
  // Traveler details form
  'traveler': [47, 70],
  // Seat map (outbound + return)
  'seatmap': [88, 92],
  // Extras + summaries
  'extras': [99, 103],
};

// Extract all states overview
let overview = '# JetBlue Flights Page - PropertySpec State Overview\n\n';
overview += '| StateId | Page | Trigger | Elements | URL |\n';
overview += '|---------|------|---------|----------|-----|\n';
for (const state of states) {
  if (state.stateId < 19) continue; // skip home page states
  const elCount = countElements(state.tree);
  const pagePart = state.page?.split('?')[0] || '';
  overview += `| ${state.stateId} | ${pagePart} | ${state.trigger || ''} | ${elCount} | |\n`;
}
writeFileSync(join(OUT_DIR, 'overview.md'), overview);
console.log('Wrote overview.md');

// Extract each group
for (const [groupName, stateIds] of Object.entries(stateGroups)) {
  console.log(`\nProcessing group: ${groupName}`);

  let groupDoc = `# ${groupName} - DOM Structure Spec\n\n`;
  groupDoc += `States: ${stateIds.join(', ')}\n\n`;

  for (const stateId of stateIds) {
    const state = states.find(s => s.stateId === stateId);
    if (!state) {
      console.log(`  State ${stateId} not found!`);
      continue;
    }

    const elCount = countElements(state.tree);
    console.log(`  State ${stateId}: ${elCount} elements`);

    // Write compact JSON
    const compactTree = compact(state.tree);
    writeFileSync(
      join(OUT_DIR, `${groupName}-state${stateId}.json`),
      JSON.stringify(compactTree, null, 2)
    );

    // Add tree outline to group doc
    groupDoc += `## State ${stateId} (${elCount} elements)\n\n`;
    groupDoc += '```\n';
    groupDoc += treeOutline(state.tree, 0, 8);
    groupDoc += '```\n\n';
  }

  writeFileSync(join(OUT_DIR, `${groupName}.md`), groupDoc);
  console.log(`  Wrote ${groupName}.md + JSON files`);
}

// Also extract full trees for the most important states (deep outline)
const deepStates = [37, 40, 44, 47, 88, 103];
for (const stateId of deepStates) {
  const state = states.find(s => s.stateId === stateId);
  if (!state) continue;

  const deepOutline = treeOutline(state.tree, 0, 20);
  writeFileSync(join(OUT_DIR, `deep-state${stateId}.txt`), deepOutline);
  console.log(`Wrote deep-state${stateId}.txt`);
}

console.log('\nDone! Files written to .specs/');
