import { readFileSync } from 'node:fs';
import readline from 'node:readline/promises';
import { COLORS, CliOptionError, parseArgs } from './options.js';
import { getHelp } from './help.js';
import { runAnimation } from './animation.js';

const FALLBACK_COLOR = 'green';

export async function runCli(argv, io = {}) {
  const input = io.input ?? process.stdin;
  const output = io.output ?? process.stdout;
  const error = io.error ?? process.stderr;
  const version = getPackageVersion();

  let options;
  try {
    options = parseArgs(argv);
  } catch (parseError) {
    if (parseError instanceof CliOptionError) {
      error.write(`${parseError.message}\n\n${getHelp(version)}`);
      return 1;
    }
    throw parseError;
  }

  if (options.help) {
    output.write(getHelp(version));
    return 0;
  }

  if (options.version) {
    output.write(`${version}\n`);
    return 0;
  }

  if (!options.color) {
    options.color = await askForColor({ input, output });
  }

  await runAnimation(options, { output });
  return 0;
}

export function getPackageVersion() {
  const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  return packageJson.version;
}

export async function askForColor({ input, output }) {
  if (!input.isTTY || !output.isTTY) {
    return FALLBACK_COLOR;
  }

  const choices = COLORS.map((color, index) => `${index + 1}) ${color}`).join('  ');
  const rl = readline.createInterface({ input, output });

  try {
    while (true) {
      const answer = (await rl.question(`Escolha a cor (${choices}) [1]: `)).trim().toLowerCase();
      if (answer === '') {
        return FALLBACK_COLOR;
      }

      const numericChoice = Number(answer);
      if (Number.isInteger(numericChoice) && numericChoice >= 1 && numericChoice <= COLORS.length) {
        return COLORS[numericChoice - 1];
      }

      if (COLORS.includes(answer)) {
        return answer;
      }

      output.write(`Cor invalida. Use uma destas: ${COLORS.join(', ')}.\n`);
    }
  } finally {
    rl.close();
  }
}
