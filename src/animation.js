const RESET = '\x1b[0m';
const CLEAR_SCREEN = '\x1b[2J\x1b[H';
const CLEAR_LINE = '\x1b[2K';
const MOVE_HOME = '\x1b[H';
const HIDE_CURSOR = '\x1b[?25l';
const SHOW_CURSOR = '\x1b[?25h';
const BOLD = '\x1b[1m';

const PALETTES = {
  green: { main: '\x1b[38;5;46m', accent: '\x1b[38;5;118m', dim: '\x1b[38;5;28m' },
  cyan: { main: '\x1b[38;5;51m', accent: '\x1b[38;5;87m', dim: '\x1b[38;5;30m' },
  blue: { main: '\x1b[38;5;39m', accent: '\x1b[38;5;75m', dim: '\x1b[38;5;24m' },
  red: { main: '\x1b[38;5;196m', accent: '\x1b[38;5;203m', dim: '\x1b[38;5;52m' },
  purple: { main: '\x1b[38;5;141m', accent: '\x1b[38;5;177m', dim: '\x1b[38;5;54m' },
  yellow: { main: '\x1b[38;5;226m', accent: '\x1b[38;5;220m', dim: '\x1b[38;5;58m' },
  white: { main: '\x1b[38;5;255m', accent: '\x1b[38;5;250m', dim: '\x1b[38;5;244m' }
};

const SPEED_PROFILES = {
  slow: { frameMs: 130, jitter: 90 },
  normal: { frameMs: 75, jitter: 45 },
  fast: { frameMs: 34, jitter: 24 }
};

const DENSITY_PROFILES = {
  low: [1, 2],
  normal: [2, 4],
  high: [4, 8]
};

const CYBER_DENSITY_PROFILES = {
  low: { modules: 4, network: 4, logs: 5 },
  normal: { modules: 6, network: 6, logs: 7 },
  high: { modules: 8, network: 8, logs: 9 }
};

const CYBER_SPEED_MS = {
  slow: 520,
  normal: 260,
  fast: 120
};

const LOADING_BATCH_SIZES = {
  low: [3, 5],
  normal: [5, 8],
  high: [8, 13]
};

const COMMANDS = [
  'scan --ports {portA}-{portB} --target {host}',
  'trace-route --mask {hex4} --hop-limit {n}',
  'decrypt --cipher aes-256 --chunk {hex8}',
  'mount /vault/{module} --read-only',
  'probe kernel.{module}.vector --sample-rate {n}k',
  'compile payload/{module}.wasm --dry-run',
  'sync cache://{host}/{module} --verify',
  'patch memory.page[{hex4}] --checksum {hex8}',
  'query auth.mesh --principal {user}',
  'stream packet.log --filter sig:{hex4}',
  'negotiate tunnel --region {region} --ttl {n}',
  'index fragments --bucket {module}-{hex4}'
];

const LOGS = [
  'handshake accepted from {host}:{port}',
  'entropy window stabilized at {percent}%',
  'rotating session key {hex8}',
  'shadow route mapped through node {host}',
  'buffer page {hex4} validated',
  'signature fragment {hex8} matched',
  'telemetry stream compressed {percent}%',
  'sandbox mirror warmed in {n}ms',
  'zero-trust gate returned status {status}',
  'packet burst normalized across {n} shards',
  'checksum drift corrected: {hex8}',
  'access vector scored {percent}/100'
];

const MODULES = ['nova', 'cipher', 'ghost', 'vector', 'atlas', 'proxy', 'neon', 'omega', 'delta'];
const USERS = ['root', 'operator', 'analyst', 'system', 'daemon', 'bob', 'dog'];
const REGIONS = ['sa-east', 'us-west', 'eu-north', 'ap-south', 'moon-base', 'doghouse'];
const STATUSES = ['OK', 'READY', 'LOCKED', 'SYNC', 'TRACE', 'WARN'];
const FILE_PATHS = [
  '/vault/{module}/manifest.json',
  '/vault/{module}/payload-{hex4}.bin',
  '/cache/{region}/{module}.idx',
  '/tmp/{module}/trace-{hex4}.log',
  '/opt/shadow/{module}/kernel.map',
  '/mnt/ghost/{module}/packet-{hex4}.pcap',
  '/srv/{module}/checksum-{hex8}.sig',
  '/var/spool/{module}/fragment-{hex4}.dat',
  '/home/{user}/.cache/{module}/block-{hex4}',
  '/net/{host}/{module}/stream-{hex4}.buf'
];
const ERROR_REASONS = [
  'checksum mismatch',
  'permission shadowed',
  'packet gap detected',
  'signature expired',
  'read timeout',
  'index drift',
  'unwashed dishes'
];
const CHARSET = '0123456789ABCDEF';

export async function runAnimation(options, io = {}) {
  if (options.theme === 'cyber') {
    return runCyberPanel(options, io);
  }

  return runHollywoodAnimation(options, io);
}

async function runHollywoodAnimation(options, io = {}) {
  const output = io.output ?? process.stdout;
  const colorName = options.color === 'random' ? randomPaletteName() : options.color;
  const palette = PALETTES[colorName] ?? PALETTES.green;
  const profile = SPEED_PROFILES[options.speed] ?? SPEED_PROFILES.normal;
  const density = DENSITY_PROFILES[options.density] ?? DENSITY_PROFILES.normal;
  const state = {
    tick: 0,
    progress: randomInt(4, 22),
    loadingEvent: null,
    nextLoadingAt: randomInt(4, 9)
  };

  output.write(`${CLEAR_SCREEN}${HIDE_CURSOR}`);
  output.write(`${palette.main}${BOLD}hacker-animation${RESET} ${palette.dim}theme=hollywood color=${colorName} speed=${options.speed} density=${options.density}${RESET}\n\n`);

  return new Promise((resolve) => {
    let frameTimer;
    let durationTimer;
    let inlineActive = false;
    let stopped = false;

    const stop = () => {
      if (stopped) {
        return;
      }
      stopped = true;
      clearTimeout(frameTimer);
      clearTimeout(durationTimer);
      process.off('SIGINT', stop);
      if (inlineActive) {
        output.write('\n');
        inlineActive = false;
      }
      output.write(`${RESET}${SHOW_CURSOR}\n`);
      resolve();
    };

    const writeLoadingFrame = (frame) => {
      if (frame.replaceInline || (frame.lines.length > 0 && inlineActive)) {
        output.write(`\r${CLEAR_LINE}`);
        inlineActive = false;
      }

      for (const line of frame.lines) {
        output.write(`${line}\n`);
      }

      if (frame.inlineLine) {
        output.write(`\r${CLEAR_LINE}${frame.inlineLine}`);
        inlineActive = true;
      }
    };

    const renderNextFrame = () => {
      if (stopped) {
        return;
      }

      let delay = profile.frameMs + randomInt(0, profile.jitter);

      if (!state.loadingEvent && state.tick >= state.nextLoadingAt) {
        state.loadingEvent = createLoadingEvent(options.density);
      }

      if (state.loadingEvent) {
        const frame = renderLoadingFrame({ output, palette, event: state.loadingEvent });
        writeLoadingFrame(frame);

        delay += frame.pauseMs;

        if (frame.done) {
          state.loadingEvent = null;
          state.nextLoadingAt = state.tick + randomInt(12, 24);
        }
      } else {
        if (inlineActive) {
          output.write('\n');
          inlineActive = false;
        }

        const lines = randomInt(density[0], density[1]);
        for (let index = 0; index < lines; index += 1) {
          output.write(`${renderLine({ output, palette, state })}\n`);
        }
      }

      state.tick += 1;

      frameTimer = setTimeout(renderNextFrame, delay);
    };

    process.once('SIGINT', stop);

    if (options.duration !== null) {
      durationTimer = setTimeout(stop, options.duration * 1000);
    }

    renderNextFrame();
  });
}

async function runCyberPanel(options, io = {}) {
  const output = io.output ?? process.stdout;
  const colorName = options.color === 'random' ? randomPaletteName() : options.color;
  const palette = PALETTES[colorName] ?? PALETTES.green;
  const frameMs = CYBER_SPEED_MS[options.speed] ?? CYBER_SPEED_MS.normal;
  const state = createCyberState(options.density);

  output.write(`${CLEAR_SCREEN}${HIDE_CURSOR}`);

  return new Promise((resolve) => {
    let frameTimer;
    let durationTimer;
    let stopped = false;

    const stop = () => {
      if (stopped) {
        return;
      }
      stopped = true;
      clearTimeout(frameTimer);
      clearTimeout(durationTimer);
      process.off('SIGINT', stop);
      output.write(`${RESET}${SHOW_CURSOR}\n`);
      resolve();
    };

    const renderNextFrame = () => {
      if (stopped) {
        return;
      }

      advanceCyberState(state, options.density);
      output.write(`${MOVE_HOME}${renderCyberPanel({
        state,
        palette,
        colorName,
        speed: options.speed,
        density: options.density,
        width: output.columns ?? 96,
        height: output.rows ?? 28
      })}`);

      frameTimer = setTimeout(renderNextFrame, frameMs);
    };

    process.once('SIGINT', stop);

    if (options.duration !== null) {
      durationTimer = setTimeout(stop, options.duration * 1000);
    }

    renderNextFrame();
  });
}

export function renderLine({ output, palette, state }) {
  const roll = Math.random();
  const timestamp = new Date().toISOString().slice(11, 23);

  if (roll < 0.28) {
    return fitLine(`${palette.dim}${timestamp}${RESET} ${palette.accent}$${RESET} ${palette.main}${fillTemplate(randomItem(COMMANDS))}${RESET}`, output);
  }

  if (roll < 0.58) {
    const status = randomItem(STATUSES);
    const statusColor = status === 'WARN' ? '\x1b[38;5;214m' : palette.accent;
    return fitLine(`${palette.dim}${timestamp}${RESET} ${statusColor}[${status}]${RESET} ${fillTemplate(randomItem(LOGS))}`, output);
  }

  if (roll < 0.78) {
    state.progress = Math.min(99, state.progress + randomInt(1, 9));
    if (state.progress >= 99) {
      state.progress = randomInt(3, 15);
    }
    return fitLine(`${palette.dim}${timestamp}${RESET} ${palette.main}${progressBar(state.progress, palette)}${RESET} ${state.progress}% ${palette.dim}${randomHex(24)}${RESET}`, output);
  }

  if (roll < 0.92) {
    return fitLine(`${palette.dim}${timestamp}${RESET} ${palette.accent}${randomHex(16)}${RESET} ${palette.dim}${randomHex(16)} ${randomHex(16)} ${randomHex(16)}${RESET}`, output);
  }

  return fitLine(`${palette.dim}${timestamp}${RESET} \x1b[38;5;196m[ALERT]\x1b[0m ${palette.main}${fillTemplate('countermeasure {module}.{hex4} armed in {n}ms')}${RESET}`, output);
}

export function createLoadingEvent(densityName = 'normal') {
  const batchRange = LOADING_BATCH_SIZES[densityName] ?? LOADING_BATCH_SIZES.normal;
  const totalFiles = randomInt(batchRange[0], batchRange[1]);
  const module = randomItem(MODULES);
  const files = Array.from({ length: totalFiles }, () => fillTemplate(randomItem(FILE_PATHS)));
  const shouldError = Math.random() < 0.55;

  return {
    id: randomHex(6),
    module,
    files,
    currentFile: 0,
    fileProgress: 0,
    loadedFiles: 0,
    phase: 'boot',
    pauseTicks: randomInt(2, 4),
    errorIndex: shouldError ? randomInt(0, totalFiles - 1) : -1,
    errorRecovered: false,
    completed: false
  };
}

export function renderLoadingFrame({ output, palette, event }) {
  const timestamp = new Date().toISOString().slice(11, 23);
  const lines = [];
  let inlineLine = null;
  let replaceInline = false;
  let pauseMs = 160;
  let done = false;

  if (event.phase === 'boot') {
    lines.push(fitLine(`${palette.dim}${timestamp}${RESET} ${palette.accent}[LOAD]${RESET} opening bundle ${palette.main}${event.module}/${event.id}${RESET}`, output));
    inlineLine = fitLine(`${palette.dim}${timestamp}${RESET} ${palette.accent}[WAIT]${RESET} resolving ${event.files.length} staged files ${spinner(event.pauseTicks)}`, output);
    event.phase = 'pause';
    pauseMs = 520;
    return { lines, inlineLine, replaceInline, pauseMs, done };
  }

  if (event.phase === 'pause') {
    inlineLine = fitLine(`${palette.dim}${timestamp}${RESET} ${palette.accent}[WAIT]${RESET} mapping virtual blocks ${spinner(event.pauseTicks)} ${palette.dim}${randomHex(12)}${RESET}`, output);
    event.pauseTicks -= 1;
    pauseMs = 420;

    if (event.pauseTicks <= 0) {
      event.phase = 'files';
    }

    return { lines, inlineLine, replaceInline, pauseMs, done };
  }

  if (event.phase === 'files') {
    const file = event.files[event.currentFile];
    event.fileProgress = Math.min(100, event.fileProgress + randomInt(18, 42));

    if (event.currentFile === event.errorIndex && !event.errorRecovered && event.fileProgress >= 55) {
      replaceInline = true;
      lines.push(fitLine(`${palette.dim}${timestamp}${RESET} \x1b[38;5;196m[ERR]\x1b[0m ${file} ${palette.dim}${randomItem(ERROR_REASONS)}${RESET}`, output));
      lines.push(fitLine(`${palette.dim}${timestamp}${RESET} \x1b[38;5;214m[RETRY]\x1b[0m reloading shard ${randomHex(4)} with fallback mirror`, output));
      event.errorRecovered = true;
      event.fileProgress = randomInt(8, 24);
      pauseMs = 700;
      return { lines, inlineLine, replaceInline, pauseMs, done };
    }

    const fileLine = fitLine(`${palette.dim}${timestamp}${RESET} ${palette.accent}[FILE ${String(event.currentFile + 1).padStart(2, '0')}/${String(event.files.length).padStart(2, '0')}]${RESET} ${loadingBar(event.fileProgress, palette)} ${String(event.fileProgress).padStart(3, ' ')}% ${file}`, output);

    if (event.fileProgress >= 100) {
      replaceInline = true;
      lines.push(fileLine);
      event.loadedFiles += 1;
      lines.push(fitLine(`${palette.dim}${timestamp}${RESET} ${palette.accent}[OK]${RESET} loaded ${palette.main}${file}${RESET}`, output));
      event.currentFile += 1;
      event.fileProgress = 0;
      pauseMs = 240;

      if (event.currentFile >= event.files.length) {
        event.phase = 'complete';
      }
    } else {
      inlineLine = fileLine;
    }

    return { lines, inlineLine, replaceInline, pauseMs, done };
  }

  replaceInline = true;
  lines.push(fitLine(`${palette.dim}${timestamp}${RESET} ${palette.accent}[DONE]${RESET} loaded ${event.loadedFiles}/${event.files.length} files into ${palette.main}${event.module}/${event.id}${RESET}`, output));
  lines.push(fitLine(`${palette.dim}${timestamp}${RESET} ${palette.accent}[RESUME]${RESET} returning to live terminal stream ${palette.dim}${randomHex(16)}${RESET}`, output));
  event.completed = true;
  pauseMs = 360;
  done = true;

  return { lines, inlineLine, replaceInline, pauseMs, done };
}

export function createCyberState(densityName = 'normal') {
  const profile = CYBER_DENSITY_PROFILES[densityName] ?? CYBER_DENSITY_PROFILES.normal;
  const modules = shuffle(MODULES).slice(0, profile.modules).map((name) => ({
    name,
    progress: randomInt(18, 96),
    status: randomItem(['SYNC', 'READY', 'TRACE', 'LOAD'])
  }));

  const network = Array.from({ length: profile.network }, () => ({
    host: randomHost(),
    status: randomItem(['OK', 'TRACE', 'WARN', 'SYNC']),
    latency: randomInt(12, 240)
  }));

  return {
    tick: 0,
    node: `${randomItem(MODULES)}-${randomHex(4)}`,
    focus: randomItem(['packet mesh', 'vault mirror', 'kernel map', 'signal graph']),
    modules,
    network,
    telemetry: {
      cpu: randomInt(28, 89),
      signal: randomInt(62, 99),
      entropy: randomInt(35, 98),
      latency: randomInt(18, 210),
      rx: randomInt(120, 960),
      tx: randomInt(90, 720)
    },
    history: {
      cpu: seedHistory(28, 89, 38),
      signal: seedHistory(62, 99, 38),
      entropy: seedHistory(35, 98, 38),
      latency: seedHistory(18, 210, 38),
      rx: seedHistory(120, 960, 38),
      tx: seedHistory(90, 720, 38)
    },
    load: {
      file: fillTemplate(randomItem(FILE_PATHS)),
      progress: randomInt(5, 48),
      status: 'LOADING',
      shard: randomHex(4),
      mirror: randomItem(REGIONS)
    },
    logs: [
      '[SYNC] panel boot sequence locked',
      '[OK] virtual telemetry bus online',
      '[TRACE] watching synthetic packet mesh'
    ]
  };
}

export function advanceCyberState(state, densityName = 'normal') {
  const profile = CYBER_DENSITY_PROFILES[densityName] ?? CYBER_DENSITY_PROFILES.normal;
  state.tick += 1;
  state.telemetry.cpu = clamp(state.telemetry.cpu + randomInt(-7, 9), 8, 99);
  state.telemetry.signal = clamp(state.telemetry.signal + randomInt(-4, 5), 30, 99);
  state.telemetry.entropy = clamp(state.telemetry.entropy + randomInt(-8, 10), 10, 99);
  state.telemetry.latency = clamp(state.telemetry.latency + randomInt(-18, 24), 8, 320);
  state.telemetry.rx = clamp(state.telemetry.rx + randomInt(-85, 110), 20, 1200);
  state.telemetry.tx = clamp(state.telemetry.tx + randomInt(-70, 96), 12, 980);
  pushHistory(state.history.cpu, state.telemetry.cpu, 60);
  pushHistory(state.history.signal, state.telemetry.signal, 60);
  pushHistory(state.history.entropy, state.telemetry.entropy, 60);
  pushHistory(state.history.latency, state.telemetry.latency, 60);
  pushHistory(state.history.rx, state.telemetry.rx, 60);
  pushHistory(state.history.tx, state.telemetry.tx, 60);

  for (const module of state.modules) {
    module.progress = clamp(module.progress + randomInt(-4, 10), 5, 100);
    if (module.progress >= 100 || Math.random() < 0.09) {
      module.status = randomItem(['SYNC', 'READY', 'TRACE', 'LOAD', 'WARN']);
      module.progress = module.progress >= 100 ? randomInt(18, 44) : module.progress;
    }
  }

  for (const node of state.network) {
    node.latency = clamp(node.latency + randomInt(-26, 35), 5, 360);
    if (Math.random() < 0.16) {
      node.status = randomItem(['OK', 'TRACE', 'WARN', 'SYNC']);
    }
  }

  state.load.progress = clamp(state.load.progress + randomInt(6, 19), 0, 100);
  if (state.load.progress >= 100) {
    pushCyberLog(state, `[OK] loaded ${state.load.file}`, profile.logs);
    state.load = {
      file: fillTemplate(randomItem(FILE_PATHS)),
      progress: randomInt(1, 22),
      status: 'LOADING',
      shard: randomHex(4),
      mirror: randomItem(REGIONS)
    };
  } else if (Math.random() < 0.08) {
    state.load.status = 'RETRY';
    pushCyberLog(state, `[WARN] retrying ${state.load.file}`, profile.logs);
  } else {
    state.load.status = 'LOADING';
  }

  if (Math.random() < 0.22) {
    pushCyberLog(state, randomCyberLog(), profile.logs);
  }
}

export function renderCyberPanel({ state, palette, colorName, speed, density, width = 96, height = 28 }) {
  const panelWidth = clamp(width, 72, 220);
  const panelHeight = clamp(height, 18, 60);
  const gap = 1;
  const leftWidth = Math.floor((panelWidth - gap) * 0.42);
  const rightWidth = panelWidth - gap - leftWidth;
  const timestamp = formatCyberClock(state.tick);
  const header = renderBox({
    title: ` hacker-animation :: cyber :: ${state.node} `,
    width: panelWidth,
    height: 3,
    rows: [
      `${palette.accent}${BOLD}${state.focus.toUpperCase()}${RESET}  ${metricChip('clock', timestamp, palette)} ${metricChip('color', colorName, palette)} ${metricChip('speed', speed, palette)} ${metricChip('density', density, palette)} ${metricChip('rx', `${state.telemetry.rx ?? 0}kb/s`, palette)} ${metricChip('tx', `${state.telemetry.tx ?? 0}kb/s`, palette)}`
    ],
    palette
  });
  const logHeight = clamp(Math.floor(panelHeight * 0.28), 6, 12);
  const bodyHeight = Math.max(7, panelHeight - header.length - logHeight);
  const topHeight = clamp(Math.floor(bodyHeight * 0.58), 4, bodyHeight - 3);
  const lowerHeight = bodyHeight - topHeight;
  const modules = renderBox({
    title: ' modules ',
    width: leftWidth,
    height: topHeight,
    rows: modulePanelRows(state, leftWidth - 2, palette),
    palette
  });
  const telemetry = renderBox({
    title: ' telemetry graphs ',
    width: rightWidth,
    height: topHeight,
    rows: telemetryPanelRows(state, rightWidth - 2, palette),
    palette
  });
  const network = renderBox({
    title: ' network mesh ',
    width: leftWidth,
    height: lowerHeight,
    rows: networkPanelRows(state, leftWidth - 2, palette),
    palette
  });
  const load = renderBox({
    title: ' load queue ',
    width: rightWidth,
    height: lowerHeight,
    rows: loadPanelRows(state, rightWidth - 2, palette),
    palette
  });
  const logs = renderBox({
    title: ' live log ',
    width: panelWidth,
    height: logHeight,
    rows: state.logs.slice(-(logHeight - 2)).map(logColor),
    palette
  });
  const lines = [
    ...header,
    ...joinColumns(modules, telemetry, gap),
    ...joinColumns(network, load, gap),
    ...logs
  ];

  while (lines.length < panelHeight) {
    lines.push(blankLine(panelWidth));
  }

  return `${lines.slice(0, panelHeight).map((line) => `${CLEAR_LINE}${line}`).join('\n')}${RESET}`;
}

function renderBox({ title, width, height, rows, palette }) {
  const safeHeight = Math.max(3, height);
  const innerWidth = Math.max(1, width - 2);
  const contentRows = rows.slice(0, safeHeight - 2);
  while (contentRows.length < safeHeight - 2) {
    contentRows.push('');
  }

  return [
    boxBorder('top', width, palette, title),
    ...contentRows.map((row) => boxLine(row, innerWidth, palette)),
    boxBorder('bottom', width, palette)
  ];
}

function boxBorder(position, width, palette, title = '') {
  const leftCorner = position === 'top' ? '╭' : '╰';
  const rightCorner = position === 'top' ? '╮' : '╯';
  const line = '─';

  if (!title) {
    return `${palette.dim}${leftCorner}${line.repeat(width - 2)}${rightCorner}${RESET}`;
  }

  const safeTitle = clipVisible(title, Math.max(0, width - 4));
  const left = Math.floor((width - 2 - visibleLength(safeTitle)) / 2);
  const right = width - 2 - visibleLength(safeTitle) - left;
  return `${palette.dim}${leftCorner}${line.repeat(left)}${palette.accent}${safeTitle}${palette.dim}${line.repeat(right)}${rightCorner}${RESET}`;
}

function boxLine(content, innerWidth, palette) {
  return `${palette.dim}│${RESET}${padVisible(clipVisible(content, innerWidth), innerWidth)}${palette.dim}│${RESET}`;
}

function blankLine(width) {
  return ' '.repeat(width);
}

function joinColumns(left, right, gap) {
  const rowCount = Math.max(left.length, right.length);
  const leftWidth = visibleLength(left[0] ?? '');
  const rightWidth = visibleLength(right[0] ?? '');
  const rows = [];

  for (let index = 0; index < rowCount; index += 1) {
    rows.push(`${left[index] ?? blankLine(leftWidth)}${' '.repeat(gap)}${right[index] ?? blankLine(rightWidth)}`);
  }

  return rows;
}

function modulePanelRows(state, width, palette) {
  const barWidth = clamp(Math.floor(width * 0.26), 8, 18);
  return state.modules.map((module, index) => {
    const status = `${statusColor(module.status)}${module.status.padEnd(5)}${RESET}`;
    const load = meterBar(module.progress, barWidth, palette);
    const id = `${String(index + 1).padStart(2, '0')}`;
    const name = module.name.padEnd(8);
    return `${palette.dim}${id}${RESET} ${status} ${name} ${load} ${String(module.progress).padStart(3)}% ${sparkline(state.tick + index, 8)}`;
  });
}

function telemetryPanelRows(state, width, palette) {
  const history = state.history ?? {};
  const graphWidth = clamp(width - 26, 12, 64);
  return [
    metricGraphRow('CPU', state.telemetry.cpu ?? 0, '%', history.cpu, graphWidth, palette, 0, 100),
    metricGraphRow('SIGNAL', state.telemetry.signal ?? 0, '%', history.signal, graphWidth, palette, 0, 100),
    metricGraphRow('ENTROPY', state.telemetry.entropy ?? 0, '%', history.entropy, graphWidth, palette, 0, 100),
    metricGraphRow('LATENCY', state.telemetry.latency ?? 0, 'ms', history.latency, graphWidth, palette, 0, 320),
    metricGraphRow('RX', state.telemetry.rx ?? 0, 'kb/s', history.rx, graphWidth, palette, 0, 1200),
    metricGraphRow('TX', state.telemetry.tx ?? 0, 'kb/s', history.tx, graphWidth, palette, 0, 1000)
  ];
}

function networkPanelRows(state, width, palette) {
  const compact = width < 42;
  const hostWidth = compact ? 12 : 15;
  const barWidth = compact ? 4 : clamp(Math.floor(width * 0.18), 6, 12);
  return state.network.map((node, index) => {
    const latencyScore = clamp(Math.round(100 - (node.latency / 360) * 100), 1, 100);
    const status = `${statusColor(node.status)}${node.status.padEnd(5)}${RESET}`;
    const host = padVisible(clipVisible(node.host, hostWidth), hostWidth);
    return `${palette.dim}${String(index + 1).padStart(2, '0')}${RESET} ${status} ${host} ${String(node.latency).padStart(3)}ms ${meterBar(latencyScore, barWidth, palette)}`;
  });
}

function loadPanelRows(state, width, palette) {
  const graphWidth = clamp(width - 20, 12, 60);
  return [
    `${statusColor(state.load.status)}${state.load.status.padEnd(7)}${RESET} ${meterBar(state.load.progress, graphWidth, palette)} ${String(state.load.progress).padStart(3)}%`,
    `${palette.accent}file${RESET}   ${clipVisible(state.load.file, Math.max(1, width - 7))}`,
    `${palette.accent}shard${RESET}  ${state.load.shard}    ${palette.accent}mirror${RESET} ${state.load.mirror}`,
    `${palette.accent}route${RESET}  ${randomRouteLabel(state)}`
  ];
}

function metricGraphRow(label, value, unit, historyValues, graphWidth, palette, min, max) {
  const numeric = `${String(Math.round(value)).padStart(4)}${unit}`;
  return `${palette.accent}${label.padEnd(7)}${RESET} ${numeric.padStart(8)} ${historyGraph(historyValues ?? [value], graphWidth, palette, min, max)}`;
}

function metricChip(label, value, palette) {
  return `${palette.dim}${label}${RESET}:${palette.main}${value}${RESET}`;
}

function meterBar(percent, width, palette) {
  const safePercent = clamp(percent, 0, 100);
  const filled = Math.round((safePercent / 100) * width);
  return `${palette.main}[${palette.accent}${'█'.repeat(filled)}${palette.dim}${'░'.repeat(width - filled)}${palette.main}]${RESET}`;
}

function historyGraph(values, width, palette, min, max) {
  const chars = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
  const window = values.slice(-width);
  const range = Math.max(1, max - min);
  const graph = window.map((value) => {
    const scaled = clamp(Math.round(((value - min) / range) * (chars.length - 1)), 0, chars.length - 1);
    return chars[scaled];
  }).join('');
  return `${palette.main}${padVisible(graph, width)}${RESET}`;
}

function randomRouteLabel(state) {
  const left = state.network[state.tick % state.network.length]?.host ?? randomHost();
  const right = state.network[(state.tick + 2) % state.network.length]?.host ?? randomHost();
  return `${left} -> ${right}`;
}

function statusColor(status) {
  if (status === 'WARN' || status === 'RETRY') {
    return '\x1b[38;5;214m';
  }

  if (status === 'ERR') {
    return '\x1b[38;5;196m';
  }

  if (status === 'READY' || status === 'OK') {
    return '\x1b[38;5;82m';
  }

  return '\x1b[38;5;87m';
}

function logColor(log) {
  if (log.includes('[WARN]')) {
    return `\x1b[38;5;214m${log}${RESET}`;
  }

  if (log.includes('[ERR]')) {
    return `\x1b[38;5;196m${log}${RESET}`;
  }

  if (log.includes('[OK]')) {
    return `\x1b[38;5;82m${log}${RESET}`;
  }

  return log;
}

function sparkline(tick, width = 12) {
  const points = ['_', '-', '=', '#', '=', '-', '_'];
  return Array.from({ length: width }, (_, index) => points[(tick + index) % points.length]).join('');
}

function formatCyberClock(tick) {
  const seconds = Math.floor(tick / 4);
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

function seedHistory(min, max, length) {
  return Array.from({ length }, () => randomInt(min, max));
}

function pushHistory(values, value, limit) {
  values.push(value);
  while (values.length > limit) {
    values.shift();
  }
}

function pushCyberLog(state, log, limit) {
  state.logs.push(log);
  while (state.logs.length > limit) {
    state.logs.shift();
  }
}

function randomCyberLog() {
  return randomItem([
    `[TRACE] rerouted packet mesh through ${randomHost()}`,
    `[SYNC] telemetry frame ${randomHex(6)} committed`,
    `[OK] module ${randomItem(MODULES)} heartbeat stable`,
    `[WARN] mirror ${randomItem(REGIONS)} latency spike`,
    `[TRACE] entropy pool rotated ${randomHex(8)}`
  ]);
}

function shuffle(values) {
  return [...values].sort(() => Math.random() - 0.5);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function visibleLength(value) {
  return stripAnsi(value).length;
}

function padVisible(value, width) {
  const padding = Math.max(0, width - visibleLength(value));
  return `${value}${' '.repeat(padding)}`;
}

function clipVisible(value, width) {
  if (visibleLength(value) <= width) {
    return value;
  }

  let result = '';
  let visibleCount = 0;
  for (let index = 0; index < value.length && visibleCount < width - 1; index += 1) {
    if (value[index] === '\x1b') {
      const end = value.indexOf('m', index);
      if (end === -1) {
        break;
      }
      result += value.slice(index, end + 1);
      index = end;
      continue;
    }

    result += value[index];
    visibleCount += 1;
  }

  return `${result}${RESET}`;
}

function fitLine(line, output) {
  const width = Math.max(40, output.columns ?? 96);
  const visible = stripAnsi(line);
  if (visible.length <= width) {
    return line;
  }

  let result = '';
  let visibleCount = 0;
  for (let index = 0; index < line.length && visibleCount < width - 1; index += 1) {
    if (line[index] === '\x1b') {
      const end = line.indexOf('m', index);
      if (end === -1) {
        break;
      }
      result += line.slice(index, end + 1);
      index = end;
      continue;
    }

    result += line[index];
    visibleCount += 1;
  }

  return `${result}${RESET}`;
}

function stripAnsi(value) {
  return value.replace(/\x1b\[[0-9;?]*m/g, '');
}

function progressBar(percent, palette) {
  const width = 18;
  const filled = Math.max(1, Math.round((percent / 100) * width));
  return `[${palette.accent}${'#'.repeat(filled)}${palette.dim}${'.'.repeat(width - filled)}${palette.main}]`;
}

function loadingBar(percent, palette) {
  const width = 14;
  const filled = Math.max(1, Math.round((percent / 100) * width));
  return `${palette.main}[${palette.accent}${'='.repeat(filled)}${filled < width ? '>' : ''}${palette.dim}${'.'.repeat(Math.max(0, width - filled - 1))}${palette.main}]${RESET}`;
}

function spinner(tick) {
  return ['|', '/', '-', '\\'][Math.abs(tick) % 4];
}

function fillTemplate(template) {
  return template
    .replaceAll('{portA}', String(randomInt(20, 3000)))
    .replaceAll('{portB}', String(randomInt(3001, 9999)))
    .replaceAll('{port}', String(randomInt(20, 9999)))
    .replaceAll('{host}', randomHost())
    .replaceAll('{hex4}', randomHex(4))
    .replaceAll('{hex8}', randomHex(8))
    .replaceAll('{module}', randomItem(MODULES))
    .replaceAll('{user}', randomItem(USERS))
    .replaceAll('{region}', randomItem(REGIONS))
    .replaceAll('{status}', randomItem(STATUSES))
    .replaceAll('{percent}', String(randomInt(41, 99)))
    .replaceAll('{n}', String(randomInt(12, 980)));
}

function randomHost() {
  return `${randomInt(10, 250)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 254)}`;
}

function randomHex(length) {
  let value = '';
  for (let index = 0; index < length; index += 1) {
    value += CHARSET[randomInt(0, CHARSET.length - 1)];
  }
  return value;
}

function randomPaletteName() {
  const names = Object.keys(PALETTES);
  return randomItem(names);
}

function randomItem(values) {
  return values[randomInt(0, values.length - 1)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
