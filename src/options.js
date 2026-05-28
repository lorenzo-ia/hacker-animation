export const COLORS = ['green', 'cyan', 'blue', 'red', 'purple', 'yellow', 'white', 'random'];
export const SPEEDS = ['slow', 'normal', 'fast'];
export const DENSITIES = ['low', 'normal', 'high'];
export const THEMES = ['hollywood', 'cyber'];

const OPTION_NAMES = new Set(['color', 'speed', 'duration', 'density', 'theme']);

export class CliOptionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CliOptionError';
  }
}

export function parseArgs(argv) {
  const options = {
    color: null,
    speed: 'normal',
    duration: null,
    density: 'normal',
    theme: 'hollywood',
    help: false,
    version: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--help' || arg === '-h') {
      options.help = true;
      continue;
    }

    if (arg === '--version' || arg === '-v') {
      options.version = true;
      continue;
    }

    if (!arg.startsWith('--')) {
      throw new CliOptionError(`Argumento inesperado: ${arg}`);
    }

    const [rawName, inlineValue] = arg.slice(2).split(/=(.*)/s, 2);
    if (!OPTION_NAMES.has(rawName)) {
      throw new CliOptionError(`Opcao desconhecida: --${rawName}`);
    }

    const value = inlineValue ?? argv[index + 1];
    if (value === undefined || value === '') {
      throw new CliOptionError(`A opcao --${rawName} precisa de um valor.`);
    }

    if (inlineValue === undefined) {
      index += 1;
    }

    options[rawName] = value;
  }

  validateOptions(options);
  return options;
}

export function validateOptions(options) {
  if (options.color !== null && !COLORS.includes(options.color)) {
    throw new CliOptionError(`Cor invalida: ${options.color}. Use uma destas: ${COLORS.join(', ')}.`);
  }

  if (!SPEEDS.includes(options.speed)) {
    throw new CliOptionError(`Velocidade invalida: ${options.speed}. Use: ${SPEEDS.join(', ')}.`);
  }

  if (!DENSITIES.includes(options.density)) {
    throw new CliOptionError(`Densidade invalida: ${options.density}. Use: ${DENSITIES.join(', ')}.`);
  }

  if (!THEMES.includes(options.theme)) {
    throw new CliOptionError(`Tema invalido: ${options.theme}. Use: ${THEMES.join(', ')}.`);
  }

  if (options.duration !== null) {
    const duration = Number(options.duration);
    if (!Number.isFinite(duration) || duration <= 0) {
      throw new CliOptionError('A duracao precisa ser um numero maior que zero.');
    }
    options.duration = duration;
  }
}
