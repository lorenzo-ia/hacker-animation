import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('animation module does not invoke system commands', () => {
  const source = readFileSync(new URL('../src/animation.js', import.meta.url), 'utf8');

  assert.doesNotMatch(source, /node:child_process|child_process|spawn\(|exec\(/);
});
