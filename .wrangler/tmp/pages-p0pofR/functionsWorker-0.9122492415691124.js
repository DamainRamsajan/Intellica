var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ../../../home/codespace/.npm/_npx/c943b712072b77c4/node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// ../../../home/codespace/.npm/_npx/c943b712072b77c4/node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  static {
    __name(this, "PerformanceEntry");
  }
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
var PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
  static {
    __name(this, "PerformanceMark");
  }
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
var PerformanceMeasure = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceMeasure");
  }
  entryType = "measure";
};
var PerformanceResourceTiming = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceResourceTiming");
  }
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
var PerformanceObserverEntryList = class {
  static {
    __name(this, "PerformanceObserverEntryList");
  }
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
var Performance = class {
  static {
    __name(this, "Performance");
  }
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
var PerformanceObserver = class {
  static {
    __name(this, "PerformanceObserver");
  }
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// ../../../home/codespace/.npm/_npx/c943b712072b77c4/node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
if (!("__unenv__" in performance)) {
  const proto = Performance.prototype;
  for (const key of Object.getOwnPropertyNames(proto)) {
    if (key !== "constructor" && !(key in performance)) {
      const desc = Object.getOwnPropertyDescriptor(proto, key);
      if (desc) {
        Object.defineProperty(performance, key, desc);
      }
    }
  }
}
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// ../../../home/codespace/.npm/_npx/c943b712072b77c4/node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// ../../../home/codespace/.npm/_npx/c943b712072b77c4/node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {
}, { __unenv__: true });

// ../../../home/codespace/.npm/_npx/c943b712072b77c4/node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// ../../../home/codespace/.npm/_npx/c943b712072b77c4/node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;

// ../../../home/codespace/.npm/_npx/c943b712072b77c4/node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// ../../../home/codespace/.npm/_npx/c943b712072b77c4/node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint") });

// ../../../home/codespace/.npm/_npx/c943b712072b77c4/node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// ../../../home/codespace/.npm/_npx/c943b712072b77c4/node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream = class {
  static {
    __name(this, "ReadStream");
  }
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
};

// ../../../home/codespace/.npm/_npx/c943b712072b77c4/node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream = class {
  static {
    __name(this, "WriteStream");
  }
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir3, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count3, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {
    }
    cb && typeof cb === "function" && cb();
    return false;
  }
};

// ../../../home/codespace/.npm/_npx/c943b712072b77c4/node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION = "22.14.0";

// ../../../home/codespace/.npm/_npx/c943b712072b77c4/node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class _Process extends EventEmitter {
  static {
    __name(this, "Process");
  }
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  // --- event emitter ---
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  // --- stdio (lazy initializers) ---
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  // --- cwd ---
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  // --- dummy props and getters ---
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION}`;
  }
  get versions() {
    return { node: NODE_VERSION };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  // --- noop methods ---
  ref() {
  }
  unref() {
  }
  // --- unimplemented methods ---
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  // --- attached interfaces ---
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
  // --- undefined props ---
  mainModule = void 0;
  domain = void 0;
  // optional
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  // internals
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};

// ../../../home/codespace/.npm/_npx/c943b712072b77c4/node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var workerdProcess = getBuiltinModule("node:process");
var unenvProcess = new Process({
  env: globalProcess.env,
  hrtime,
  // `nextTick` is available from workerd process v1
  nextTick: workerdProcess.nextTick
});
var { exit, features, platform } = workerdProcess;
var {
  _channel,
  _debugEnd,
  _debugProcess,
  _disconnect,
  _events,
  _eventsCount,
  _exiting,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _handleQueue,
  _kill,
  _linkedBinding,
  _maxListeners,
  _pendingMessage,
  _preload_modules,
  _rawDebug,
  _send,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  arch,
  argv,
  argv0,
  assert: assert2,
  availableMemory,
  binding,
  channel,
  chdir,
  config,
  connected,
  constrainedMemory,
  cpuUsage,
  cwd,
  debugPort,
  disconnect,
  dlopen,
  domain,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exitCode,
  finalization,
  getActiveResourcesInfo,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getMaxListeners,
  getuid,
  hasUncaughtExceptionCaptureCallback,
  hrtime: hrtime3,
  initgroups,
  kill,
  listenerCount,
  listeners,
  loadEnvFile,
  mainModule,
  memoryUsage,
  moduleLoadList,
  nextTick,
  off,
  on,
  once,
  openStdin,
  permission,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  reallyExit,
  ref,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  send,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setMaxListeners,
  setSourceMapsEnabled,
  setuid,
  setUncaughtExceptionCaptureCallback,
  sourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  throwDeprecation,
  title,
  traceDeprecation,
  umask,
  unref,
  uptime,
  version,
  versions
} = unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;

// ../../../home/codespace/.npm/_npx/c943b712072b77c4/node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// ../site/training/arc42/course/board-core.js
var DAY = 864e5;
var WINDOW = 3 * DAY;
var day = /* @__PURE__ */ __name((now) => new Date(now).toISOString().slice(0, 10), "day");
function weekKey(now) {
  const d = new Date(now), dow = (d.getUTCDay() + 6) % 7;
  return day(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - dow));
}
__name(weekKey, "weekKey");

// ../worker/board-api.js
var SCHEMA = [
  `CREATE TABLE IF NOT EXISTS learners (
    id TEXT PRIMARY KEY, handle TEXT NOT NULL UNIQUE COLLATE NOCASE, created INTEGER NOT NULL,
    total INTEGER NOT NULL DEFAULT 0, week_key TEXT NOT NULL DEFAULT '', week_pts INTEGER NOT NULL DEFAULT 0,
    prev_pts INTEGER NOT NULL DEFAULT 0, best_week INTEGER NOT NULL DEFAULT 0,
    streak INTEGER NOT NULL DEFAULT 0, best_streak INTEGER NOT NULL DEFAULT 0, overall INTEGER NOT NULL DEFAULT 0,
    recall INTEGER NOT NULL DEFAULT 0, build INTEGER NOT NULL DEFAULT 0, reviews INTEGER NOT NULL DEFAULT 0, consistency INTEGER NOT NULL DEFAULT 0,
    updated INTEGER NOT NULL DEFAULT 0)`,
  "CREATE INDEX IF NOT EXISTS learners_total ON learners (total DESC)",
  "CREATE INDEX IF NOT EXISTS learners_week ON learners (week_key, week_pts DESC)"
];
var HANDLE = /^[A-Za-z][A-Za-z0-9 _.-]{2,19}$/;
var RESERVED = /(admin|official|moderator|intellica|staff|support)/i;
var json = /* @__PURE__ */ __name((o, status = 200, cache = "no-store") => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": cache, "x-content-type-options": "nosniff" } }), "json");
var bad = /* @__PURE__ */ __name((m, s = 400) => json({ error: m }, s), "bad");
var hex = /* @__PURE__ */ __name((n) => [...crypto.getRandomValues(new Uint8Array(n))].map((b) => b.toString(16).padStart(2, "0")).join(""), "hex");
var int = /* @__PURE__ */ __name((v, max) => {
  const n = Math.floor(Number(v));
  return Number.isFinite(n) ? Math.max(0, Math.min(max, n)) : 0;
}, "int");
var ready = null;
var ensure = /* @__PURE__ */ __name((db) => ready || (ready = db.batch(SCHEMA.map((s) => db.prepare(s))).catch((e) => {
  ready = null;
  throw e;
})), "ensure");
var BOARDS = {
  week: { col: "week_pts", where: "week_key = ?", args: /* @__PURE__ */ __name((k) => [k], "args") },
  all: { col: "total", where: "1 = 1", args: /* @__PURE__ */ __name(() => [], "args") }
};
var row = /* @__PURE__ */ __name((r, col) => ({ handle: r.handle, pts: r[col], streak: r.streak, overall: r.overall }), "row");
async function top(db, kind, key) {
  const b = BOARDS[kind];
  const { results } = await db.prepare(`SELECT handle, ${b.col}, streak, overall FROM learners WHERE ${b.where} AND ${b.col} > 0 ORDER BY ${b.col} DESC, created ASC LIMIT 10`).bind(...b.args(key)).all();
  return results.map((r) => row(r, b.col));
}
__name(top, "top");
async function around(db, kind, key, me) {
  const b = BOARDS[kind], mine = me[b.col];
  const rank = 1 + (await db.prepare(`SELECT COUNT(*) AS n FROM learners WHERE ${b.where} AND ${b.col} > ?`).bind(...b.args(key), mine).first()).n;
  const above = (await db.prepare(`SELECT handle, ${b.col}, streak, overall FROM learners WHERE ${b.where} AND ${b.col} > ? ORDER BY ${b.col} ASC, created DESC LIMIT 2`).bind(...b.args(key), mine).all()).results.map((r) => row(r, b.col)).reverse();
  const below = (await db.prepare(`SELECT handle, ${b.col}, streak, overall FROM learners WHERE ${b.where} AND ${b.col} <= ? AND id != ? ORDER BY ${b.col} DESC, created ASC LIMIT 2`).bind(...b.args(key), mine, me.id).all()).results.map((r) => row(r, b.col));
  const next = above.length ? above[above.length - 1] : null;
  return { rank, pts: mine, around: [...above, { handle: me.handle, pts: mine, you: true }, ...below], toPass: next ? next.pts - mine + 1 : 0, passing: next ? next.handle : null };
}
__name(around, "around");
async function view(db, me, now) {
  const key = weekKey(now);
  const learners = (await db.prepare("SELECT COUNT(*) AS n FROM learners").first()).n;
  const m = me.week_key === key ? me : { ...me, week_pts: 0 };
  return { handle: me.handle, learners, week: await around(db, "week", key, m), all: await around(db, "all", key, m), weekKey: key };
}
__name(view, "view");
async function board(db, now) {
  const key = weekKey(now);
  const learners = (await db.prepare("SELECT COUNT(*) AS n FROM learners").first()).n;
  return json({ learners, weekKey: key, week: await top(db, "week", key), all: await top(db, "all", key), at: now }, 200, "public, max-age=30");
}
__name(board, "board");
async function join(db, env2, body, now) {
  const handle4 = String(body.handle || "").trim().replace(/\s+/g, " ");
  if (!HANDLE.test(handle4) || RESERVED.test(handle4)) return bad("Choose a handle of 3 to 20 letters, numbers, spaces, dots, dashes or underscores, starting with a letter.");
  if (!env2.BOARD_PROOF || body.proof !== env2.BOARD_PROOF) return bad("This browser does not hold a valid access code.", 403);
  const id = hex(16);
  try {
    await db.prepare("INSERT INTO learners (id, handle, created) VALUES (?, ?, ?)").bind(id, handle4, now).run();
  } catch {
    return bad("That handle is taken. Try another.", 409);
  }
  return json({ token: id, handle: handle4 });
}
__name(join, "join");
var learner = /* @__PURE__ */ __name((db, token) => /^[0-9a-f]{32}$/.test(token || "") ? db.prepare("SELECT * FROM learners WHERE id = ?").bind(token).first() : null, "learner");
async function sync(db, me, snap, now) {
  const key = weekKey(now), s = snap && typeof snap === "object" ? snap : {};
  const current = s.weekKey === key;
  const next = {
    total: int(s.total, 1e7),
    week_pts: current ? int(s.week, 1e6) : 0,
    prev_pts: int(s.prev, 1e6),
    best_week: int(s.best, 1e6),
    streak: int(s.streak, 3650),
    best_streak: int(s.bestStreak, 3650),
    overall: int(s.overall, 100),
    recall: int(s.recall, 100),
    build: int(s.build, 100),
    reviews: int(s.reviews, 100),
    consistency: int(s.consistency, 100)
  };
  await db.prepare("UPDATE learners SET total=?, week_key=?, week_pts=?, prev_pts=?, best_week=?, streak=?, best_streak=?, overall=?, recall=?, build=?, reviews=?, consistency=?, updated=? WHERE id=?").bind(next.total, key, next.week_pts, next.prev_pts, next.best_week, next.streak, next.best_streak, next.overall, next.recall, next.build, next.reviews, next.consistency, now, me.id).run();
  return json(await view(db, { ...me, ...next, week_key: key }, now));
}
__name(sync, "sync");
async function handle({ request, env: env2 }) {
  const db = env2.DB;
  const url = new URL(request.url);
  const route = url.pathname.replace(/^\/api\/board\/?/, "").replace(/\/$/, "");
  const now = Date.now();
  if (!db) return request.method === "GET" && route === "" ? json({ learners: 0, week: [], all: [] }, 200, "public, max-age=60") : bad("The board is not set up yet.", 503);
  try {
    await ensure(db);
    if (request.method === "GET" && route === "") return await board(db, now);
    if (request.method === "POST" && route === "join") return await join(db, env2, await request.json(), now);
    const auth = (request.headers.get("authorization") || "").replace(/^Bearer /, "");
    const me = await learner(db, auth);
    if (!me) return bad("Not signed in to the board.", 401);
    if (request.method === "GET" && route === "me") return json(await view(db, me, now));
    if (request.method === "POST" && route === "sync") return await sync(db, me, (await request.json()).snapshot, now);
    if (request.method === "DELETE" && route === "me") {
      await db.prepare("DELETE FROM learners WHERE id = ?").bind(me.id).run();
      return json({ deleted: true });
    }
    return bad("Not found.", 404);
  } catch (e) {
    return bad("The board is busy. Your progress is saved on this device.", 503);
  }
}
__name(handle, "handle");

// ../worker/proof.js
var PROOF = "QhA6QOxz2tm56hf9ItAOWoioj47w3rjuOpGdVFCnayA";

// api/board/[[route]].js
var onRequest = /* @__PURE__ */ __name((ctx) => handle({ request: ctx.request, env: { ...ctx.env, BOARD_PROOF: PROOF } }), "onRequest");

// ../worker/pay-api.js
var BANK = { name: "Royal Bank (Trinidad and Tobago) Limited", branch: "St Augustine Shopping Centre, St Augustine", account: "110000005001825" };
var OFFERS = {
  arc42: { ttd: 899, usd: 129, title: "arc42 in a Day, online course", welcome: "/training/arc42/course/welcome/", learn: "/training/arc42/course/learn/" },
  cybersecurity: { ttd: 2799, usd: 399, title: "Cybersecurity for the Agentic Era, online course", welcome: "/training/cybersecurity/course/welcome/", learn: "/training/cybersecurity/course/learn/" }
};
async function courseKeyFor(masterB64u, course) {
  if (course === "arc42") return masterB64u;
  const raw = Uint8Array.from(atob(masterB64u.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
  const k = await crypto.subtle.importKey("raw", raw, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", k, new TextEncoder().encode("course:" + course)));
  return btoa(String.fromCharCode(...sig)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
__name(courseKeyFor, "courseKeyFor");
var MAX_IMAGE = 12e5;
var MAX_TRIES = 5;
var MAX_AGE_DAYS = 7;
var SCHEMA2 = [
  `CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, ref TEXT NOT NULL, course TEXT NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL,
    amount REAL NOT NULL, status TEXT NOT NULL, created INTEGER NOT NULL, decided INTEGER, note TEXT)`,
  `CREATE TABLE IF NOT EXISTS receipts (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id TEXT NOT NULL, hash TEXT NOT NULL, txn TEXT,
    image TEXT, read TEXT, verdict TEXT, reasons TEXT, created INTEGER NOT NULL)`,
  "CREATE INDEX IF NOT EXISTS receipts_hash ON receipts (hash)"
];
var json2 = /* @__PURE__ */ __name((o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" } }), "json");
var bad2 = /* @__PURE__ */ __name((m, s = 400) => json2({ error: m }, s), "bad");
var NAME = /^[^<>{}\\\u0000-\u001f]{2,60}$/u;
var EMAIL = /^[^\s@<>]{1,64}@[^\s@<>]{1,190}\.[^\s@<>]{2,}$/;
var hex2 = /* @__PURE__ */ __name((u8) => [...u8].map((b) => b.toString(16).padStart(2, "0")).join(""), "hex");
var newId = /* @__PURE__ */ __name(() => hex2(crypto.getRandomValues(new Uint8Array(16))), "newId");
var newRef = /* @__PURE__ */ __name(() => "IC-" + [...crypto.getRandomValues(new Uint8Array(6))].map((b) => "ABCDEFGHJKMNPQRSTUVWXYZ23456789"[b % 31]).join(""), "newRef");
var sha256 = /* @__PURE__ */ __name(async (u8) => hex2(new Uint8Array(await crypto.subtle.digest("SHA-256", u8))), "sha256");
var utf8b64u = /* @__PURE__ */ __name((s) => btoa(String.fromCharCode(...new TextEncoder().encode(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""), "utf8b64u");
var digits = /* @__PURE__ */ __name((s) => String(s ?? "").replace(/\D/g, ""), "digits");
var norm = /* @__PURE__ */ __name((s) => String(s ?? "").toUpperCase().replace(/[^A-Z0-9]/g, ""), "norm");
function judge(f, order, now) {
  const why = [];
  if (!f || typeof f !== "object") return { pass: false, reasons: ["Could not read the receipt"], txn: null };
  const amt = Number(String(f.amount ?? "").replace(/[^0-9.]/g, ""));
  if (!(amt >= order.amount && amt <= order.amount * 2)) why.push(`Amount ${f.amount ?? "not found"} (needs ${order.amount})`);
  const cur = norm(f.currency);
  if (cur && !/^(TTD|TT|TTS|\$)$/.test(cur) && !cur.includes("TT")) why.push(`Currency ${f.currency}`);
  const acct = digits(f.to_account), full = BANK.account;
  if (!(acct.includes(full) || acct.length >= 4 && acct.slice(-4) === full.slice(-4))) why.push("Receiving account does not match");
  const t = Date.parse(f.date);
  if (!Number.isFinite(t)) why.push("Date not found");
  else if (t < order.created - 2 * 864e5 || t < now - MAX_AGE_DAYS * 864e5 || t > now + 2 * 864e5) why.push("Date is outside the last week");
  const txn = norm(f.txn);
  if (txn.length < 6) why.push("No transaction number found");
  if (f.looks_edited === true) why.push("Looks edited");
  return { pass: why.length === 0, reasons: why, refSeen: norm(f.reference).includes(norm(order.ref)), txn: txn.length >= 6 ? txn : null };
}
__name(judge, "judge");
var PROMPT = `You read bank transfer or deposit receipts. Reply with ONE JSON object and nothing else, with keys:
amount (number, the amount transferred), currency (string), to_account (string, the receiving account number exactly as printed, masked digits allowed),
date (YYYY-MM-DD), reference (string, the description/reference typed by the sender, or ""), txn (string, the bank's transaction/confirmation number), looks_edited (true only if the image clearly looks altered, else false).
Use null for anything you cannot read. Do not guess.`;
async function readReceipt(env2, bytes) {
  if (!env2.AI) return null;
  const run = /* @__PURE__ */ __name(() => env2.AI.run("@cf/meta/llama-3.2-11b-vision-instruct", { prompt: PROMPT, image: [...bytes], max_tokens: 400 }), "run");
  let out;
  try {
    out = await run();
  } catch (e) {
    if (!/agree|5016/i.test(String(e && e.message))) return null;
    try {
      await env2.AI.run("@cf/meta/llama-3.2-11b-vision-instruct", { prompt: "agree" });
      out = await run();
    } catch {
      return null;
    }
  }
  const text = typeof out === "string" ? out : out && (out.response ?? out.description ?? "");
  const m = typeof text === "object" ? text : (String(text).match(/\{[\s\S]*\}/) || [])[0];
  try {
    return typeof m === "object" ? m : JSON.parse(m);
  } catch {
    return null;
  }
}
__name(readReceipt, "readReceipt");
var ready2 = null;
var ensure2 = /* @__PURE__ */ __name((db) => ready2 || (ready2 = db.batch(SCHEMA2.map((s) => db.prepare(s))).catch((e) => {
  ready2 = null;
  throw e;
})), "ensure");
var orderOf = /* @__PURE__ */ __name((db, id) => /^[0-9a-f]{32}$/.test(id || "") ? db.prepare("SELECT * FROM orders WHERE id = ?").bind(id).first() : null, "orderOf");
async function createOrder(db, body, now) {
  const offer = OFFERS[body.course];
  if (!offer) return bad2("This course is not on sale online yet.", 404);
  const name = String(body.name || "").trim().replace(/\s+/g, " "), email = String(body.email || "").trim();
  if (!NAME.test(name)) return bad2("Enter your name (2 to 60 characters). It is printed on your lessons and certificate.");
  if (!EMAIL.test(email)) return bad2("Enter a valid email address.");
  const id = newId(), ref2 = newRef();
  await db.prepare("INSERT INTO orders (id, ref, course, name, email, amount, status, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(id, ref2, body.course, name, email, offer.ttd, "awaiting", now).run();
  return json2({ id, ref: ref2, amount: offer.ttd, bank: BANK });
}
__name(createOrder, "createOrder");
async function receipt(db, env2, id, bytes, now) {
  const order = await orderOf(db, id);
  if (!order) return bad2("We could not find that order.", 404);
  if (order.status === "paid") return json2({ status: "paid" });
  if (!bytes.length || bytes.length > MAX_IMAGE) return bad2("That photo is too large or empty. Try again.", 413);
  const tries = (await db.prepare("SELECT COUNT(*) AS n FROM receipts WHERE order_id = ?").bind(id).first()).n;
  if (tries >= MAX_TRIES) return json2({ status: "review", note: "Too many tries. We will check it by hand." });
  const hash = await sha256(bytes);
  const dupe = await db.prepare("SELECT order_id FROM receipts WHERE hash = ? AND order_id != ?").bind(hash, id).first();
  if (dupe) return bad2("That receipt was already used for another order.", 409);
  const read = await readReceipt(env2, bytes);
  const v = judge(read, order, now);
  let reasons = v.reasons;
  if (v.pass && v.txn) {
    const used = await db.prepare("SELECT order_id FROM receipts WHERE txn = ? AND order_id != ? AND verdict = 'pass'").bind(v.txn, id).first();
    if (used) {
      v.pass = false;
      reasons = ["That transaction number was already used"];
    }
  }
  await db.prepare("INSERT INTO receipts (order_id, hash, txn, image, read, verdict, reasons, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(id, hash, v.txn, btoa(String.fromCharCode(...bytes)), JSON.stringify(read), v.pass ? "pass" : "hold", JSON.stringify(reasons), now).run();
  if (v.pass) {
    await db.prepare("UPDATE orders SET status = 'paid', decided = ?, note = 'auto' WHERE id = ?").bind(now, id).run();
    return json2({ status: "paid" });
  }
  await db.prepare("UPDATE orders SET status = 'review' WHERE id = ? AND status != 'paid'").bind(id).run();
  return json2({ status: "review" });
}
__name(receipt, "receipt");
async function claim(db, S, id) {
  const o = await orderOf(db, id);
  if (!o) return bad2("We could not find that order.", 404);
  if (o.status === "rejected") return bad2("We could not confirm this payment. Please message us on WhatsApp.", 403);
  if (o.status !== "paid") return json2({ status: o.status, ref: o.ref }, 202);
  return json2({ status: "paid", code: utf8b64u(JSON.stringify({ v: 1, b: o.name, k: await courseKeyFor(S.courseKey, o.course) })), name: o.name, course: o.course, learn: OFFERS[o.course].learn });
}
__name(claim, "claim");
var same = /* @__PURE__ */ __name((a, b) => a.length === b.length && [...a].reduce((x, c, i) => x | c.charCodeAt(0) ^ b.charCodeAt(i), 0) === 0, "same");
async function admin(db, S, request, route, now) {
  const key = request.headers.get("x-admin-key") || "";
  if (!S.adminKey || !same(key, S.adminKey)) return bad2("Not allowed.", 401);
  if (request.method === "GET" && route === "admin/list") {
    const rows = (await db.prepare("SELECT o.id, o.ref, o.name, o.email, o.amount, o.status, o.created, o.note, (SELECT reasons FROM receipts r WHERE r.order_id = o.id ORDER BY r.id DESC LIMIT 1) AS reasons, (SELECT read FROM receipts r WHERE r.order_id = o.id ORDER BY r.id DESC LIMIT 1) AS read, (SELECT id FROM receipts r WHERE r.order_id = o.id ORDER BY r.id DESC LIMIT 1) AS receipt FROM orders o WHERE o.status != 'awaiting' ORDER BY (o.status = 'review') DESC, o.created DESC LIMIT 100").all()).results;
    return json2({ orders: rows });
  }
  if (request.method === "GET" && route === "admin/image") {
    const r = await db.prepare("SELECT image FROM receipts WHERE id = ?").bind(Number(new URL(request.url).searchParams.get("id"))).first();
    return r ? json2({ image: "data:image/jpeg;base64," + r.image }) : bad2("No image.", 404);
  }
  if (request.method === "POST" && route === "admin/decide") {
    const b = await request.json(), o = await orderOf(db, b.id);
    if (!o) return bad2("No such order.", 404);
    await db.prepare("UPDATE orders SET status = ?, decided = ?, note = ? WHERE id = ?").bind(b.approve ? "paid" : "rejected", now, "owner", o.id).run();
    return json2({ ok: true });
  }
  return bad2("Not found.", 404);
}
__name(admin, "admin");
async function handle2({ request, env: env2, now = Date.now() }) {
  const url = new URL(request.url), route = url.pathname.replace(/^\/api\/pay\/?/, "").replace(/\/$/, "");
  if (request.method === "GET" && route === "region") return json2({ tt: (request.cf && request.cf.country) === "TT" || request.headers.get("cf-ipcountry") === "TT" });
  const db = env2.DB, S = env2.SECRETS;
  if (!db || !S || !S.courseKey) return bad2("Online buying is not switched on yet. Please message us on WhatsApp.", 503);
  try {
    await ensure2(db);
    if (route.startsWith("admin/")) return await admin(db, S, request, route, now);
    if (request.method === "POST" && route === "order") return await createOrder(db, await request.json(), now);
    if (request.method === "POST" && route === "receipt") return await receipt(db, env2, url.searchParams.get("o"), new Uint8Array(await request.arrayBuffer()), now);
    if (request.method === "GET" && route === "claim") return await claim(db, S, url.searchParams.get("o") || "");
    return bad2("Not found.", 404);
  } catch {
    return bad2("Something went wrong. Please try again in a moment, or message us on WhatsApp.", 503);
  }
}
__name(handle2, "handle");

// ../worker/cert-api.js
var ISSUABLE = { arc42: { lessons: 19, sections: 12, checks: 6, questions: 34 }, cybersecurity: { lessons: 25, sections: 25, checks: 5, questions: 75 } };
var SCHEMA3 = [
  `CREATE TABLE IF NOT EXISTS certs (
    id TEXT PRIMARY KEY, course TEXT NOT NULL, name TEXT NOT NULL, issued INTEGER NOT NULL, record TEXT NOT NULL)`
];
var json3 = /* @__PURE__ */ __name((o, status = 200, cache = "no-store") => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": cache, "x-content-type-options": "nosniff" } }), "json");
var bad3 = /* @__PURE__ */ __name((m, s = 400) => json3({ error: m }, s), "bad");
var ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
var newId2 = /* @__PURE__ */ __name(() => "IC-" + [...crypto.getRandomValues(new Uint8Array(12))].map((b) => ALPHABET[b % 32]).join(""), "newId");
var int2 = /* @__PURE__ */ __name((v) => {
  const n = Math.floor(Number(v));
  return Number.isFinite(n) && n >= 0 && n <= 1e5 ? n : 0;
}, "int");
var NAME2 = /^[^<>{}\\\u0000-\u001f]{2,60}$/u;
async function proofFor(env2, course) {
  if (course === "arc42" || !env2.SECRETS || !env2.SECRETS.courseKey) return course === "arc42" ? env2.BOARD_PROOF : null;
  const key = await courseKeyFor(env2.SECRETS.courseKey, course);
  const h = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode("board-v1:" + key)));
  return btoa(String.fromCharCode(...h)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
__name(proofFor, "proofFor");
var ready3 = null;
var ensure3 = /* @__PURE__ */ __name((db) => ready3 || (ready3 = db.batch(SCHEMA3.map((s) => db.prepare(s))).catch((e) => {
  ready3 = null;
  throw e;
})), "ensure");
async function issue(db, env2, body, now) {
  const rule = ISSUABLE[body.course];
  if (!rule) return bad3("This course does not issue certificates yet.", 404);
  const want = await proofFor(env2, body.course);
  if (!want || body.proof !== want) return bad3("This browser does not hold a valid access code.", 403);
  const name = String(body.name || "").trim().replace(/\s+/g, " ");
  if (!NAME2.test(name)) return bad3("Enter the name to print on the certificate (2 to 60 characters).");
  const r = body.record || {};
  const rec = { lessons: int2(r.lessons), lessonsTotal: rule.lessons, sections: int2(r.sections), sectionsTotal: rule.sections, checks: int2(r.checks), checksTotal: rule.checks, mastered: int2(r.mastered), questions: rule.questions };
  if (rec.lessons < rule.lessons || rec.sections < rule.sections || rec.checks < rule.checks || rec.mastered < Math.ceil(0.7 * rule.questions)) return bad3("The course record does not meet the criteria yet.", 422);
  const id = newId2();
  await db.prepare("INSERT INTO certs (id, course, name, issued, record) VALUES (?, ?, ?, ?, ?)").bind(id, body.course, name, now, JSON.stringify(rec)).run();
  return json3({ id, issued: now });
}
__name(issue, "issue");
async function lookup(db, id) {
  if (!/^IC-[2-9A-HJ-NP-Z]{12}$/.test(id)) return bad3("That is not a credential ID.", 404);
  const r = await db.prepare("SELECT * FROM certs WHERE id = ?").bind(id).first();
  if (!r) return bad3("No certificate has this ID.", 404);
  return json3({ id: r.id, course: r.course, name: r.name, issued: r.issued, record: JSON.parse(r.record) }, 200, "public, max-age=300");
}
__name(lookup, "lookup");
async function handle3({ request, env: env2 }) {
  const db = env2.DB;
  const route = new URL(request.url).pathname.replace(/^\/api\/cert\/?/, "").replace(/\/$/, "");
  if (!db) return bad3("Certificates are not set up yet.", 503);
  try {
    await ensure3(db);
    if (request.method === "POST" && route === "issue") return await issue(db, env2, await request.json(), Date.now());
    if (request.method === "GET" && route) return await lookup(db, route);
    return bad3("Not found.", 404);
  } catch {
    return bad3("Certificates are busy. Please try again in a moment.", 503);
  }
}
__name(handle3, "handle");

// ../worker/secrets.js
var SECRETS = { "courseKey": "Ry-1dhA-qWvVPsJQyFKVpaERSf0SylUR0hfRztXI_GU", "adminKey": "MdEGCfTHddm06iqMHSS3s0mN" };

// api/cert/[[route]].js
var onRequest2 = /* @__PURE__ */ __name((ctx) => handle3({ request: ctx.request, env: { ...ctx.env, BOARD_PROOF: PROOF, SECRETS } }), "onRequest");

// api/pay/[[route]].js
var onRequest3 = /* @__PURE__ */ __name((ctx) => handle2({ request: ctx.request, env: { ...ctx.env, SECRETS } }), "onRequest");

// ../.wrangler/tmp/pages-p0pofR/functionsRoutes-0.6937941900319454.mjs
var routes = [
  {
    routePath: "/api/board/:route*",
    mountPath: "/api/board",
    method: "",
    middlewares: [],
    modules: [onRequest]
  },
  {
    routePath: "/api/cert/:route*",
    mountPath: "/api/cert",
    method: "",
    middlewares: [],
    modules: [onRequest2]
  },
  {
    routePath: "/api/pay/:route*",
    mountPath: "/api/pay",
    method: "",
    middlewares: [],
    modules: [onRequest3]
  }
];

// ../../../home/codespace/.npm/_npx/c943b712072b77c4/node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count3 = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count3--;
          if (count3 === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count3++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count3)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../../../home/codespace/.npm/_npx/c943b712072b77c4/node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function getOriginalPathPrefix(requestPath, normalizedPrefix) {
  let end = 0;
  for (let index = 0; index < normalizedPrefix.length; index++) {
    end++;
    if (normalizedPrefix[index] === "/") {
      while (requestPath[end] === "/") {
        end++;
      }
    }
  }
  return requestPath.slice(0, end);
}
__name(getOriginalPathPrefix, "getOriginalPathPrefix");
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  const normalizedRequestPath = requestPath.replace(/\/+/g, "/");
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath) || routeMatcher(normalizedRequestPath);
    const originalMountMatch = mountMatcher(requestPath);
    const mountMatchResult = originalMountMatch || mountMatcher(normalizedRequestPath);
    if (matchResult && mountMatchResult) {
      const path = originalMountMatch ? originalMountMatch.path : getOriginalPathPrefix(requestPath, mountMatchResult.path);
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env2, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context2 = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env: env2,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context2);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env2["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error3) {
      if (isFailOpen) {
        const response = await env2["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error3;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
export {
  pages_template_worker_default as default
};
