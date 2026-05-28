import assert from 'node:assert/strict';
import test from 'node:test';
import { createLoadingEvent, renderLoadingFrame } from '../src/animation.js';

const palette = {
  main: '',
  accent: '',
  dim: ''
};

const output = {
  columns: 140
};

test('createLoadingEvent sizes file batches by density', () => {
  const low = createLoadingEvent('low');
  const normal = createLoadingEvent('normal');
  const high = createLoadingEvent('high');

  assert.ok(low.files.length >= 3 && low.files.length <= 5);
  assert.ok(normal.files.length >= 5 && normal.files.length <= 8);
  assert.ok(high.files.length >= 8 && high.files.length <= 13);
});

test('renderLoadingFrame walks through loading phases', () => {
  const event = {
    id: 'ABC123',
    module: 'cipher',
    files: ['/vault/cipher/manifest.json'],
    currentFile: 0,
    fileProgress: 100,
    loadedFiles: 0,
    phase: 'files',
    pauseTicks: 0,
    errorIndex: -1,
    errorRecovered: false,
    completed: false
  };

  const fileFrame = renderLoadingFrame({ output, palette, event });
  assert.match(fileFrame.lines.join('\n'), /\[FILE 01\/01\]/);
  assert.match(fileFrame.lines.join('\n'), /\[OK\]/);
  assert.equal(event.phase, 'complete');

  const doneFrame = renderLoadingFrame({ output, palette, event });
  assert.match(doneFrame.lines.join('\n'), /\[DONE\]/);
  assert.equal(doneFrame.done, true);
});

test('renderLoadingFrame returns in-place file progress for incomplete files', () => {
  const event = {
    id: 'ABC123',
    module: 'cipher',
    files: ['/vault/cipher/manifest.json'],
    currentFile: 0,
    fileProgress: 0,
    loadedFiles: 0,
    phase: 'files',
    pauseTicks: 0,
    errorIndex: -1,
    errorRecovered: false,
    completed: false
  };

  const frame = renderLoadingFrame({ output, palette, event });

  assert.equal(frame.lines.length, 0);
  assert.match(frame.inlineLine, /\[FILE 01\/01\]/);
  assert.equal(frame.replaceInline, false);
});

test('renderLoadingFrame can emit simulated error and retry lines', () => {
  const event = {
    id: 'ABC123',
    module: 'cipher',
    files: ['/vault/cipher/payload.bin'],
    currentFile: 0,
    fileProgress: 60,
    loadedFiles: 0,
    phase: 'files',
    pauseTicks: 0,
    errorIndex: 0,
    errorRecovered: false,
    completed: false
  };

  const frame = renderLoadingFrame({ output, palette, event });
  const text = frame.lines.join('\n');

  assert.match(text, /\[ERR\]/);
  assert.match(text, /\[RETRY\]/);
  assert.equal(event.errorRecovered, true);
  assert.equal(frame.replaceInline, true);
});
