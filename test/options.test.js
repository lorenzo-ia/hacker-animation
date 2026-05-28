import assert from 'node:assert/strict';
import test from 'node:test';
import { CliOptionError, parseArgs } from '../src/options.js';

test('parseArgs returns expected defaults', () => {
  assert.deepEqual(parseArgs([]), {
    color: null,
    speed: 'normal',
    duration: null,
    density: 'normal',
    theme: 'hollywood',
    help: false,
    version: false
  });
});

test('parseArgs accepts supported flags', () => {
  assert.deepEqual(parseArgs([
    '--color=cyan',
    '--speed',
    'fast',
    '--density',
    'high',
    '--duration',
    '4.5',
    '--theme',
    'cyber'
  ]), {
    color: 'cyan',
    speed: 'fast',
    duration: 4.5,
    density: 'high',
    theme: 'cyber',
    help: false,
    version: false
  });
});

test('parseArgs accepts help and version aliases', () => {
  assert.equal(parseArgs(['--help']).help, true);
  assert.equal(parseArgs(['-h']).help, true);
  assert.equal(parseArgs(['--version']).version, true);
  assert.equal(parseArgs(['-v']).version, true);
});

test('parseArgs rejects invalid values', () => {
  assert.throws(() => parseArgs(['--color', 'orange']), CliOptionError);
  assert.throws(() => parseArgs(['--speed', 'turbo']), CliOptionError);
  assert.throws(() => parseArgs(['--density', 'max']), CliOptionError);
  assert.throws(() => parseArgs(['--theme', 'matrix']), CliOptionError);
  assert.throws(() => parseArgs(['--duration', '0']), CliOptionError);
  assert.throws(() => parseArgs(['--duration', '-1']), CliOptionError);
  assert.throws(() => parseArgs(['--duration', 'nope']), CliOptionError);
});

test('parseArgs rejects unknown or missing options', () => {
  assert.throws(() => parseArgs(['start']), CliOptionError);
  assert.throws(() => parseArgs(['--unknown']), CliOptionError);
  assert.throws(() => parseArgs(['--color']), CliOptionError);
});
