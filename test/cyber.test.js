import assert from 'node:assert/strict';
import test from 'node:test';
import { createCyberState, renderCyberPanel } from '../src/animation.js';

const palette = {
  main: '',
  accent: '',
  dim: ''
};

function stripAnsi(value) {
  return value.replace(/\x1b\[[0-9;?]*[A-Za-z]/g, '');
}

test('createCyberState builds panel data by density', () => {
  const low = createCyberState('low');
  const normal = createCyberState('normal');
  const high = createCyberState('high');

  assert.equal(low.modules.length, 4);
  assert.equal(normal.modules.length, 6);
  assert.equal(high.modules.length, 8);
  assert.equal(low.network.length, 4);
  assert.equal(normal.network.length, 6);
  assert.equal(high.network.length, 8);
});

test('renderCyberPanel renders a fixed-width cyber dashboard', () => {
  const state = {
    tick: 12,
    node: 'atlas-7F2A',
    focus: 'packet mesh',
    modules: [
      { name: 'cipher', progress: 75, status: 'SYNC' },
      { name: 'ghost', progress: 42, status: 'WARN' }
    ],
    network: [
      { host: '10.42.8.12', status: 'OK', latency: 31 },
      { host: '172.16.2.8', status: 'TRACE', latency: 102 }
    ],
    telemetry: {
      cpu: 71,
      signal: 94,
      entropy: 62,
      latency: 44
    },
    load: {
      file: '/vault/cipher/manifest.json',
      progress: 58,
      status: 'LOADING',
      shard: 'BEEF',
      mirror: 'sa-east'
    },
    logs: [
      '[OK] virtual telemetry bus online',
      '[WARN] mirror latency spike'
    ]
  };

  const panel = renderCyberPanel({
    state,
    palette,
    colorName: 'cyan',
    speed: 'fast',
    density: 'normal',
    width: 90,
    height: 20
  });
  const lines = panel.split('\n');

  assert.equal(lines.length, 20);
  assert.match(stripAnsi(panel), /hacker-animation :: cyber/);
  assert.match(stripAnsi(panel), /modules/);
  assert.match(stripAnsi(panel), /network mesh/);
  assert.match(stripAnsi(panel), /telemetry graphs/);
  assert.match(stripAnsi(panel), /load queue/);
  assert.ok(lines.every((line) => stripAnsi(line).length <= 90));
});
