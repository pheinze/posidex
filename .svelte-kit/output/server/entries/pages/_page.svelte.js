import { p as push, e as escape_html, c as attr_class, b as attr, d as store_get, u as unsubscribe_stores, f as bind_props, a as pop, i as ensure_array_like, j as stringify, k as copy_payload, l as assign_payload, m as attr_style, n as maybe_selected } from "../../chunks/index2.js";
import { C as CONSTANTS, i as icons, t as themeIcons } from "../../chunks/constants.js";
import { Decimal } from "decimal.js";
import { u as uiStore } from "../../chunks/uiStore.js";
import { d as derived, w as writable, g as get } from "../../chunks/index.js";
import deepmerge from "deepmerge";
import { IntlMessageFormat } from "intl-messageformat";
import { z as fallback } from "../../chunks/utils2.js";
import { marked } from "marked";
import { u as updateTradeStore, c as clearResults, t as tradeStore } from "../../chunks/tradeStore.js";
function html(value) {
  var html2 = String(value ?? "");
  var open = "<!---->";
  return open + html2 + "<!---->";
}
function delve(obj, fullKey) {
  if (fullKey == null)
    return void 0;
  if (fullKey in obj) {
    return obj[fullKey];
  }
  const keys = fullKey.split(".");
  let result = obj;
  for (let p = 0; p < keys.length; p++) {
    if (typeof result === "object") {
      if (p > 0) {
        const partialKey = keys.slice(p, keys.length).join(".");
        if (partialKey in result) {
          result = result[partialKey];
          break;
        }
      }
      result = result[keys[p]];
    } else {
      result = void 0;
    }
  }
  return result;
}
const lookupCache = {};
const addToCache = (path, locale2, message) => {
  if (!message)
    return message;
  if (!(locale2 in lookupCache))
    lookupCache[locale2] = {};
  if (!(path in lookupCache[locale2]))
    lookupCache[locale2][path] = message;
  return message;
};
const lookup = (path, refLocale) => {
  if (refLocale == null)
    return void 0;
  if (refLocale in lookupCache && path in lookupCache[refLocale]) {
    return lookupCache[refLocale][path];
  }
  const locales = getPossibleLocales(refLocale);
  for (let i = 0; i < locales.length; i++) {
    const locale2 = locales[i];
    const message = getMessageFromDictionary(locale2, path);
    if (message) {
      return addToCache(path, refLocale, message);
    }
  }
  return void 0;
};
let dictionary;
const $dictionary = writable({});
function getLocaleDictionary(locale2) {
  return dictionary[locale2] || null;
}
function hasLocaleDictionary(locale2) {
  return locale2 in dictionary;
}
function getMessageFromDictionary(locale2, id) {
  if (!hasLocaleDictionary(locale2)) {
    return null;
  }
  const localeDictionary = getLocaleDictionary(locale2);
  const match = delve(localeDictionary, id);
  return match;
}
function getClosestAvailableLocale(refLocale) {
  if (refLocale == null)
    return void 0;
  const relatedLocales = getPossibleLocales(refLocale);
  for (let i = 0; i < relatedLocales.length; i++) {
    const locale2 = relatedLocales[i];
    if (hasLocaleDictionary(locale2)) {
      return locale2;
    }
  }
  return void 0;
}
function addMessages(locale2, ...partials) {
  delete lookupCache[locale2];
  $dictionary.update((d) => {
    d[locale2] = deepmerge.all([d[locale2] || {}, ...partials]);
    return d;
  });
}
derived(
  [$dictionary],
  ([dictionary2]) => Object.keys(dictionary2)
);
$dictionary.subscribe((newDictionary) => dictionary = newDictionary);
const queue = {};
function createLocaleQueue(locale2) {
  queue[locale2] = /* @__PURE__ */ new Set();
}
function removeLoaderFromQueue(locale2, loader) {
  queue[locale2].delete(loader);
  if (queue[locale2].size === 0) {
    delete queue[locale2];
  }
}
function getLocaleQueue(locale2) {
  return queue[locale2];
}
function getLocalesQueues(locale2) {
  return getPossibleLocales(locale2).map((localeItem) => {
    const localeQueue = getLocaleQueue(localeItem);
    return [localeItem, localeQueue ? [...localeQueue] : []];
  }).filter(([, localeQueue]) => localeQueue.length > 0);
}
function hasLocaleQueue(locale2) {
  if (locale2 == null)
    return false;
  return getPossibleLocales(locale2).some(
    (localeQueue) => {
      var _a;
      return (_a = getLocaleQueue(localeQueue)) == null ? void 0 : _a.size;
    }
  );
}
function loadLocaleQueue(locale2, localeQueue) {
  const allLoadersPromise = Promise.all(
    localeQueue.map((loader) => {
      removeLoaderFromQueue(locale2, loader);
      return loader().then((partial) => partial.default || partial);
    })
  );
  return allLoadersPromise.then((partials) => addMessages(locale2, ...partials));
}
const activeFlushes = {};
function flush(locale2) {
  if (!hasLocaleQueue(locale2)) {
    if (locale2 in activeFlushes) {
      return activeFlushes[locale2];
    }
    return Promise.resolve();
  }
  const queues = getLocalesQueues(locale2);
  activeFlushes[locale2] = Promise.all(
    queues.map(
      ([localeName, localeQueue]) => loadLocaleQueue(localeName, localeQueue)
    )
  ).then(() => {
    if (hasLocaleQueue(locale2)) {
      return flush(locale2);
    }
    delete activeFlushes[locale2];
  });
  return activeFlushes[locale2];
}
function registerLocaleLoader(locale2, loader) {
  if (!getLocaleQueue(locale2))
    createLocaleQueue(locale2);
  const localeQueue = getLocaleQueue(locale2);
  if (getLocaleQueue(locale2).has(loader))
    return;
  if (!hasLocaleDictionary(locale2)) {
    $dictionary.update((d) => {
      d[locale2] = {};
      return d;
    });
  }
  localeQueue.add(loader);
}
var __getOwnPropSymbols$2 = Object.getOwnPropertySymbols;
var __hasOwnProp$2 = Object.prototype.hasOwnProperty;
var __propIsEnum$2 = Object.prototype.propertyIsEnumerable;
var __objRest$1 = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp$2.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols$2)
    for (var prop of __getOwnPropSymbols$2(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum$2.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
const defaultFormats = {
  number: {
    scientific: { notation: "scientific" },
    engineering: { notation: "engineering" },
    compactLong: { notation: "compact", compactDisplay: "long" },
    compactShort: { notation: "compact", compactDisplay: "short" }
  },
  date: {
    short: { month: "numeric", day: "numeric", year: "2-digit" },
    medium: { month: "short", day: "numeric", year: "numeric" },
    long: { month: "long", day: "numeric", year: "numeric" },
    full: { weekday: "long", month: "long", day: "numeric", year: "numeric" }
  },
  time: {
    short: { hour: "numeric", minute: "numeric" },
    medium: { hour: "numeric", minute: "numeric", second: "numeric" },
    long: {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      timeZoneName: "short"
    },
    full: {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      timeZoneName: "short"
    }
  }
};
function defaultMissingKeyHandler({ locale: locale2, id }) {
  console.warn(
    `[svelte-i18n] The message "${id}" was not found in "${getPossibleLocales(
      locale2
    ).join('", "')}".${hasLocaleQueue(getCurrentLocale()) ? `

Note: there are at least one loader still registered to this locale that wasn't executed.` : ""}`
  );
}
const defaultOptions = {
  fallbackLocale: null,
  loadingDelay: 200,
  formats: defaultFormats,
  warnOnMissingMessages: true,
  handleMissingMessage: void 0,
  ignoreTag: true
};
const options = defaultOptions;
function getOptions() {
  return options;
}
function init(opts) {
  const _a = opts, { formats } = _a, rest = __objRest$1(_a, ["formats"]);
  let initialLocale = opts.fallbackLocale;
  if (opts.initialLocale) {
    try {
      if (IntlMessageFormat.resolveLocale(opts.initialLocale)) {
        initialLocale = opts.initialLocale;
      }
    } catch (e) {
      console.warn(
        `[svelte-i18n] The initial locale "${opts.initialLocale}" is not a valid locale.`
      );
    }
  }
  if (rest.warnOnMissingMessages) {
    delete rest.warnOnMissingMessages;
    if (rest.handleMissingMessage == null) {
      rest.handleMissingMessage = defaultMissingKeyHandler;
    } else {
      console.warn(
        '[svelte-i18n] The "warnOnMissingMessages" option is deprecated. Please use the "handleMissingMessage" option instead.'
      );
    }
  }
  Object.assign(options, rest, { initialLocale });
  if (formats) {
    if ("number" in formats) {
      Object.assign(options.formats.number, formats.number);
    }
    if ("date" in formats) {
      Object.assign(options.formats.date, formats.date);
    }
    if ("time" in formats) {
      Object.assign(options.formats.time, formats.time);
    }
  }
  return $locale.set(initialLocale);
}
const $isLoading = writable(false);
var __defProp$1 = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$1 = Object.getOwnPropertySymbols;
var __hasOwnProp$1 = Object.prototype.hasOwnProperty;
var __propIsEnum$1 = Object.prototype.propertyIsEnumerable;
var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$1 = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$1.call(b, prop))
      __defNormalProp$1(a, prop, b[prop]);
  if (__getOwnPropSymbols$1)
    for (var prop of __getOwnPropSymbols$1(b)) {
      if (__propIsEnum$1.call(b, prop))
        __defNormalProp$1(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
let current;
const internalLocale = writable(null);
function getSubLocales(refLocale) {
  return refLocale.split("-").map((_, i, arr) => arr.slice(0, i + 1).join("-")).reverse();
}
function getPossibleLocales(refLocale, fallbackLocale = getOptions().fallbackLocale) {
  const locales = getSubLocales(refLocale);
  if (fallbackLocale) {
    return [.../* @__PURE__ */ new Set([...locales, ...getSubLocales(fallbackLocale)])];
  }
  return locales;
}
function getCurrentLocale() {
  return current != null ? current : void 0;
}
internalLocale.subscribe((newLocale) => {
  current = newLocale != null ? newLocale : void 0;
  if (typeof window !== "undefined" && newLocale != null) {
    document.documentElement.setAttribute("lang", newLocale);
  }
});
const set = (newLocale) => {
  if (newLocale && getClosestAvailableLocale(newLocale) && hasLocaleQueue(newLocale)) {
    const { loadingDelay } = getOptions();
    let loadingTimer;
    if (typeof window !== "undefined" && getCurrentLocale() != null && loadingDelay) {
      loadingTimer = window.setTimeout(
        () => $isLoading.set(true),
        loadingDelay
      );
    } else {
      $isLoading.set(true);
    }
    return flush(newLocale).then(() => {
      internalLocale.set(newLocale);
    }).finally(() => {
      clearTimeout(loadingTimer);
      $isLoading.set(false);
    });
  }
  return internalLocale.set(newLocale);
};
const $locale = __spreadProps(__spreadValues$1({}, internalLocale), {
  set
});
const getLocaleFromNavigator = () => {
  if (typeof window === "undefined")
    return null;
  return window.navigator.language || window.navigator.languages[0];
};
const monadicMemoize = (fn) => {
  const cache = /* @__PURE__ */ Object.create(null);
  const memoizedFn = (arg) => {
    const cacheKey = JSON.stringify(arg);
    if (cacheKey in cache) {
      return cache[cacheKey];
    }
    return cache[cacheKey] = fn(arg);
  };
  return memoizedFn;
};
var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
const getIntlFormatterOptions = (type, name) => {
  const { formats } = getOptions();
  if (type in formats && name in formats[type]) {
    return formats[type][name];
  }
  throw new Error(`[svelte-i18n] Unknown "${name}" ${type} format.`);
};
const createNumberFormatter = monadicMemoize(
  (_a) => {
    var _b = _a, { locale: locale2, format } = _b, options2 = __objRest(_b, ["locale", "format"]);
    if (locale2 == null) {
      throw new Error('[svelte-i18n] A "locale" must be set to format numbers');
    }
    if (format) {
      options2 = getIntlFormatterOptions("number", format);
    }
    return new Intl.NumberFormat(locale2, options2);
  }
);
const createDateFormatter = monadicMemoize(
  (_c) => {
    var _d = _c, { locale: locale2, format } = _d, options2 = __objRest(_d, ["locale", "format"]);
    if (locale2 == null) {
      throw new Error('[svelte-i18n] A "locale" must be set to format dates');
    }
    if (format) {
      options2 = getIntlFormatterOptions("date", format);
    } else if (Object.keys(options2).length === 0) {
      options2 = getIntlFormatterOptions("date", "short");
    }
    return new Intl.DateTimeFormat(locale2, options2);
  }
);
const createTimeFormatter = monadicMemoize(
  (_e) => {
    var _f = _e, { locale: locale2, format } = _f, options2 = __objRest(_f, ["locale", "format"]);
    if (locale2 == null) {
      throw new Error(
        '[svelte-i18n] A "locale" must be set to format time values'
      );
    }
    if (format) {
      options2 = getIntlFormatterOptions("time", format);
    } else if (Object.keys(options2).length === 0) {
      options2 = getIntlFormatterOptions("time", "short");
    }
    return new Intl.DateTimeFormat(locale2, options2);
  }
);
const getNumberFormatter = (_g = {}) => {
  var _h = _g, {
    locale: locale2 = getCurrentLocale()
  } = _h, args = __objRest(_h, [
    "locale"
  ]);
  return createNumberFormatter(__spreadValues({ locale: locale2 }, args));
};
const getDateFormatter = (_i = {}) => {
  var _j = _i, {
    locale: locale2 = getCurrentLocale()
  } = _j, args = __objRest(_j, [
    "locale"
  ]);
  return createDateFormatter(__spreadValues({ locale: locale2 }, args));
};
const getTimeFormatter = (_k = {}) => {
  var _l = _k, {
    locale: locale2 = getCurrentLocale()
  } = _l, args = __objRest(_l, [
    "locale"
  ]);
  return createTimeFormatter(__spreadValues({ locale: locale2 }, args));
};
const getMessageFormatter = monadicMemoize(
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  (message, locale2 = getCurrentLocale()) => new IntlMessageFormat(message, locale2, getOptions().formats, {
    ignoreTag: getOptions().ignoreTag
  })
);
const formatMessage = (id, options2 = {}) => {
  var _a, _b, _c, _d;
  let messageObj = options2;
  if (typeof id === "object") {
    messageObj = id;
    id = messageObj.id;
  }
  const {
    values,
    locale: locale2 = getCurrentLocale(),
    default: defaultValue
  } = messageObj;
  if (locale2 == null) {
    throw new Error(
      "[svelte-i18n] Cannot format a message without first setting the initial locale."
    );
  }
  let message = lookup(id, locale2);
  if (!message) {
    message = (_d = (_c = (_b = (_a = getOptions()).handleMissingMessage) == null ? void 0 : _b.call(_a, { locale: locale2, id, defaultValue })) != null ? _c : defaultValue) != null ? _d : id;
  } else if (typeof message !== "string") {
    console.warn(
      `[svelte-i18n] Message with id "${id}" must be of type "string", found: "${typeof message}". Gettin its value through the "$format" method is deprecated; use the "json" method instead.`
    );
    return message;
  }
  if (!values) {
    return message;
  }
  let result = message;
  try {
    result = getMessageFormatter(message, locale2).format(values);
  } catch (e) {
    if (e instanceof Error) {
      console.warn(
        `[svelte-i18n] Message "${id}" has syntax error:`,
        e.message
      );
    }
  }
  return result;
};
const formatTime = (t, options2) => {
  return getTimeFormatter(options2).format(t);
};
const formatDate = (d, options2) => {
  return getDateFormatter(options2).format(d);
};
const formatNumber = (n, options2) => {
  return getNumberFormatter(options2).format(n);
};
const getJSON = (id, locale2 = getCurrentLocale()) => {
  return lookup(id, locale2);
};
const $format = derived([$locale, $dictionary], () => formatMessage);
derived([$locale], () => formatTime);
derived([$locale], () => formatDate);
derived([$locale], () => formatNumber);
derived([$locale, $dictionary], () => getJSON);
const app$2 = { "title": "Posidex", "journalButton": "Journal", "changelogTitle": "Changelog", "closeChangelogAriaLabel": "Close Changelog" };
const dashboard$1 = { "presetLoad": "Load Preset...", "savePresetTitle": "Save current inputs as preset", "savePresetAriaLabel": "Save Preset", "deletePresetTitle": "Delete selected preset", "resetButton": "Reset", "themeSwitcherAriaLabel": "Switch Theme", "totalTradeMetrics": "Total Trade Metrics", "totalTradeMetricsTooltip": "Overview of the most important key figures for the entire trade.", "riskPerTradeCurrency": "Risk per Trade (Currency)", "riskPerTradeCurrencyTooltip": "The absolute amount of money you risk at most.", "totalFees": "Total Fees", "totalFeesTooltip": "The estimated total cost for this trade.", "maxPotentialProfit": "Max. Potential Profit", "maxPotentialProfitTooltip": "The maximum net profit if the entire position were closed at the best TP.", "weightedRR": "Weighted R/R", "weightedRRTooltip": "The average risk-reward ratio of all partial sales.", "totalNetProfit": "Total Net Profit", "totalNetProfitTooltip": "The accumulated net profit from all partial sales.", "soldPosition": "Sold Position", "soldPositionTooltip": "The total percentage of the position sold.", "takeProfit": "Take Profit", "netProfit": "Net Profit", "netProfitTooltip": "The estimated profit for this partial sale.", "priceChange": "Price Change", "priceChangeTooltip": "The percentage price movement from entry.", "returnOnCapital": "Return on Capital", "returnOnCapitalTooltip": "The percentage profit in relation to the capital.", "partialVolume": "Partial Volume", "partialVolumeTooltip": "The quantity of units for this partial sale.", "tradeNotesPlaceholder": "Notes on the trade...", "addTradeToJournal": "Add Trade to Journal", "showInstructionsTitle": "Show Instructions", "showInstructionsAriaLabel": "Show Instructions", "savedFeedback": "Saved!", "generalInputs": { "header": "General", "longButton": "Long", "shortButton": "Short", "leveragePlaceholder": "Leverage (e.g. 10x)", "feesPlaceholder": "Fees per Trade (%)" }, "portfolioInputs": { "header": "Portfolio", "accountSizePlaceholder": "Account Size", "riskPerTradePlaceholder": "Risk per Trade (%)" }, "tradeSetupInputs": { "header": "Trade Setup", "symbolPlaceholder": "Symbol (e.g. BTCUSDT)", "fetchPriceTitle": "Fetch Live Price", "fetchPriceAriaLabel": "Fetch Live Price", "entryPricePlaceholder": "Entry Price", "atrStopLossLabel": "ATR Stop-Loss", "manualStopLossPlaceholder": "Manual Stop Loss", "atrValuePlaceholder": "ATR Value", "multiplierPlaceholder": "Multiplier" }, "takeProfitRow": { "winLabel": "win:", "rrLabel": "R/R:", "pricePlaceholder": "Price", "lockButtonTitle": "Lock/Unlock Percentage", "removeButtonTitle": "Remove this target" }, "takeProfitTargets": { "header": "Take-Profit Targets (Partial)", "tooltip": "Here you can see the calculated key figures for each of your partial take-profit targets.", "addTargetTitle": "Add another target" }, "summaryResults": { "header": "Summary", "positionSizeLabel": "Position Size", "lockPositionSizeTitle": "Lock/Unlock Position Size", "lockPositionSizeAriaLabel": "Lock/Unlock Position Size", "copyPositionSizeAriaLabel": "Copy Position Size", "copiedFeedback": "Copied!", "maxNetLossLabel": "Max. Net Loss", "maxNetLossTooltip": "The maximum amount you can lose on this trade, including all fees.", "requiredMarginLabel": "Required Margin", "requiredMarginTooltip": "The capital blocked from your account for this trade.", "estimatedLiquidationPriceLabel": "Est. Liquidation Price", "estimatedLiquidationPriceTooltip": "Estimated price at which your position will be liquidated.", "breakEvenPriceLabel": "Break-Even Price", "breakEvenPriceTooltip": "The price at which your trade makes zero profit/loss, considering fees." }, "customModal": { "promptPlaceholder": "Input...", "yesButton": "Yes", "noButton": "No", "okButton": "OK" }, "visualBar": { "header": "Visual Analysis", "netProfitLabel": "Net Profit:", "rrLabel": "R/R:" }, "promptForData": "Please enter the required trade data to start the calculation.", "instructionsTitle": "Instructions: Dashboard" };
const journal$1 = { "title": "Trade Journal", "closeJournalAriaLabel": "Close Journal", "searchSymbolPlaceholder": "Search Symbol...", "filterAll": "All", "filterOpen": "Open", "filterWon": "Won", "filterLost": "Lost", "date": "Date", "symbol": "Symbol", "type": "Type", "entry": "Entry", "sl": "SL", "rr": "R/R", "status": "Status", "notes": "Notes", "action": "Action", "noTradesYet": "No trades in the journal yet.", "clickToExpand": "Click to expand", "delete": "Delete", "performancePerSymbol": "Performance per Symbol", "trades": "Trades", "profitPercent": "Profit %", "totalPL": "Total P/L", "noData": "No Data", "exportCsvTitle": "Export as CSV", "export": "Export", "import": "Import", "clearJournalTitle": "Clear entire journal", "clearAll": "Clear All", "showJournalInstructionsTitle": "Show Journal Instructions", "showJournalInstructionsAriaLabel": "Show Journal Instructions" };
const seo$1 = { "title": "Posidex - Trading Position Size & Risk Calculator", "description": "Posidex is a comprehensive trading calculator for position sizing, risk management, and take-profit targets. Optimize your trades with real-time calculations and visual analysis.", "keywords": "trading calculator, position size, risk management, take profit, crypto trading, forex trading, stock trading, trading tools, financial calculator, trade optimizer" };
const languages$1 = { "german": "German", "english": "English" };
const en = {
  app: app$2,
  dashboard: dashboard$1,
  journal: journal$1,
  seo: seo$1,
  languages: languages$1
};
const en$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  app: app$2,
  dashboard: dashboard$1,
  default: en,
  journal: journal$1,
  languages: languages$1,
  seo: seo$1
}, Symbol.toStringTag, { value: "Module" }));
const app$1 = { "title": "Posidex", "journalButton": "Journal", "changelogTitle": "Changelog", "closeChangelogAriaLabel": "Changelog schließen" };
const dashboard = { "presetLoad": "Preset laden...", "savePresetTitle": "Aktuelle Eingaben als Preset speichern", "savePresetAriaLabel": "Preset speichern", "deletePresetTitle": "Ausgewähltes Preset löschen", "resetButton": "Zurücksetzen", "themeSwitcherAriaLabel": "Theme wechseln", "totalTradeMetrics": "Gesamt-Trade Metriken", "totalTradeMetricsTooltip": "Übersicht über die wichtigsten Kennzahlen für den gesamten Trade.", "riskPerTradeCurrency": "Risiko pro Trade (Währung)", "riskPerTradeCurrencyTooltip": "Der absolute Geldbetrag, den du maximal riskierst.", "totalFees": "Gesamte Gebühren", "totalFeesTooltip": "Die geschätzten Gesamtkosten für diesen Trade.", "maxPotentialProfit": "Max. potenzieller Gewinn", "maxPotentialProfitTooltip": "Der maximale Netto-Gewinn, wenn die gesamte Position zum besten TP geschlossen würde.", "weightedRR": "Gewichtetes R/R", "weightedRRTooltip": "Das durchschnittliche Chance-Risiko-Verhältnis aller Teilverkäufe.", "totalNetProfit": "Gesamt Netto-Gewinn", "totalNetProfitTooltip": "Der kumulierte Netto-Gewinn aus allen Teilverkäufen.", "soldPosition": "Verkaufte Position", "soldPositionTooltip": "Der Gesamtprozentsatz der verkauften Position.", "takeProfit": "Take Profit", "netProfit": "Netto-Gewinn", "netProfitTooltip": "Der geschätzte Gewinn für diesen Teilverkauf.", "priceChange": "Preisänderung", "priceChangeTooltip": "Die prozentuale Preisbewegung vom Einstieg.", "returnOnCapital": "Rendite auf Kapital", "returnOnCapitalTooltip": "Der prozentuale Gewinn im Verhältnis zum Kapital.", "partialVolume": "Teilverkauf Volumen", "partialVolumeTooltip": "Die Menge der Einheiten für diesen Teilverkauf.", "tradeNotesPlaceholder": "Notizen zum Trade...", "addTradeToJournal": "Trade zum Journal hinzufügen", "showInstructionsTitle": "Anleitung anzeigen", "showInstructionsAriaLabel": "Anleitung anzeigen", "savedFeedback": "Gespeichert!", "generalInputs": { "header": "Allgemein", "longButton": "Long", "shortButton": "Short", "leveragePlaceholder": "Hebel (z.B. 10x)", "feesPlaceholder": "Gebühren pro Trade (%)" }, "portfolioInputs": { "header": "Portfolio", "accountSizePlaceholder": "Konto Guthaben", "riskPerTradePlaceholder": "Risiko je Trade (%)" }, "tradeSetupInputs": { "header": "Trade Setup", "symbolPlaceholder": "Symbol (z.B. BTCUSDT)", "fetchPriceTitle": "Live-Preis holen", "fetchPriceAriaLabel": "Live-Preis holen", "entryPricePlaceholder": "Kaufpreis", "atrStopLossLabel": "ATR Stop-Loss", "manualStopLossPlaceholder": "Manueller Stopp Loss", "atrValuePlaceholder": "ATR Wert", "multiplierPlaceholder": "Multiplikator" }, "takeProfitRow": { "winLabel": "win:", "rrLabel": "R/R:", "pricePlaceholder": "Preis", "lockButtonTitle": "Prozentsatz sperren/entsperren", "removeButtonTitle": "Dieses Ziel entfernen" }, "takeProfitTargets": { "header": "Take-Profit Ziele (Partiell)", "tooltip": "Hier siehst du die berechneten Kennzahlen für jeden deiner partiellen Take-Profit-Ziele.", "addTargetTitle": "Weiteres Ziel hinzufügen" }, "summaryResults": { "header": "Zusammenfassung", "positionSizeLabel": "Positionsgröße", "lockPositionSizeTitle": "Positionsgröße sperren/entsperren", "lockPositionSizeAriaLabel": "Positionsgröße sperren/entsperren", "copyPositionSizeAriaLabel": "Positionsgröße kopieren", "copiedFeedback": "Kopiert!", "maxNetLossLabel": "Max. Verlust (Netto)", "maxNetLossTooltip": "Der maximale Betrag, den du bei diesem Trade verlieren kannst, einschließlich aller Gebühren.", "requiredMarginLabel": "Benötigte Margin", "requiredMarginTooltip": "Das Kapital, das von deinem Konto für diesen Trade blockiert wird.", "estimatedLiquidationPriceLabel": "Gesch. Liquidationspreis", "estimatedLiquidationPriceTooltip": "Geschätzter Preis, bei dem deine Position liquidiert wird.", "breakEvenPriceLabel": "Break-Even Preis", "breakEvenPriceTooltip": "Der Kurs, bei dem dein Trade unter Berücksichtigung der Gebühren null Gewinn/Verlust macht." }, "customModal": { "promptPlaceholder": "Eingabe...", "yesButton": "Ja", "noButton": "Nein", "okButton": "OK" }, "visualBar": { "header": "Visuelle Analyse", "netProfitLabel": "Netto-Gewinn:", "rrLabel": "R/R:" }, "promptForData": "Bitte geben Sie die erforderlichen Handelsdaten ein, um die Berechnung zu starten.", "instructionsTitle": "Anleitung: Dashboard" };
const journal = { "title": "Trade Journal", "closeJournalAriaLabel": "Journal schließen", "searchSymbolPlaceholder": "Symbol suchen...", "filterAll": "Alle", "filterOpen": "Offen", "filterWon": "Gewonnen", "filterLost": "Verloren", "date": "Datum", "symbol": "Symbol", "type": "Typ", "entry": "Einstieg", "sl": "SL", "rr": "R/R", "status": "Status", "notes": "Notizen", "action": "Aktion", "noTradesYet": "Noch keine Trades im Journal vorhanden.", "clickToExpand": "Klicken zum Ausklappen", "delete": "Löschen", "performancePerSymbol": "Performance pro Symbol", "trades": "Trades", "profitPercent": "Gewinn %", "totalPL": "Gesamt P/L", "noData": "Keine Daten", "exportCsvTitle": "Als CSV exportieren", "export": "Exportieren", "import": "Importieren", "clearJournalTitle": "Ganzes Journal leeren", "clearAll": "Alles löschen", "showJournalInstructionsTitle": "Journal Anleitung anzeigen", "showJournalInstructionsAriaLabel": "Journal Anleitung anzeigen" };
const seo = { "title": "Posidex - Trading Positionsgröße & Risikorechner", "description": "Posidex ist ein umfassender Trading-Rechner für Positionsgrößenbestimmung, Risikomanagement und Take-Profit-Ziele. Optimiere deine Trades mit Echtzeitberechnungen und visueller Analyse.", "keywords": "Trading Rechner, Positionsgröße, Risikomanagement, Take Profit, Krypto Trading, Forex Trading, Aktien Trading, Trading Tools, Finanzrechner, Trade Optimierer" };
const languages = { "german": "Deutsch", "english": "Englisch" };
const de = {
  app: app$1,
  dashboard,
  journal,
  seo,
  languages
};
const de$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  app: app$1,
  dashboard,
  default: de,
  journal,
  languages,
  seo
}, Symbol.toStringTag, { value: "Module" }));
registerLocaleLoader("en", () => Promise.resolve(en$1));
registerLocaleLoader("de", () => Promise.resolve(de$1));
function getSafeLocale(getter) {
  try {
    return getter();
  } catch (e) {
    console.error("Error getting locale:", e);
    return void 0;
  }
}
const storedLocale = typeof localStorage !== "undefined" ? localStorage.getItem("locale") : null;
let initialLocaleValue;
if (storedLocale && (storedLocale === "en" || storedLocale === "de")) {
  initialLocaleValue = storedLocale;
} else {
  const browserLocale = getSafeLocale(getLocaleFromNavigator);
  if (browserLocale && browserLocale.startsWith("de")) {
    initialLocaleValue = "de";
  } else if (browserLocale && browserLocale.startsWith("en")) {
    initialLocaleValue = "en";
  } else {
    initialLocaleValue = "en";
  }
}
init({
  fallbackLocale: "en",
  initialLocale: initialLocaleValue
});
const locale = writable(initialLocaleValue);
locale.subscribe((value) => {
  if (value) {
    $locale.set(value);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("locale", value);
    }
  }
});
function GeneralInputs($$payload, $$props) {
  push();
  var $$store_subs;
  let tradeType = $$props["tradeType"];
  let leverage = $$props["leverage"];
  let fees = $$props["fees"];
  $$payload.out.push(`<div><h2 class="section-header" id="trade-type-label">${escape_html(store_get($$store_subs ??= {}, "$_", $format)("dashboard.generalInputs.header"))}</h2> <div class="grid grid-cols-1 gap-4 mb-4"><div class="trade-type-switch p-1 rounded-lg flex" role="radiogroup" aria-labelledby="trade-type-label"><button${attr_class("long w-1/2", void 0, { "active": tradeType === CONSTANTS.TRADE_TYPE_LONG })} role="radio"${attr("aria-checked", tradeType === CONSTANTS.TRADE_TYPE_LONG)}>${escape_html(store_get($$store_subs ??= {}, "$_", $format)("dashboard.generalInputs.longButton"))}</button> <button${attr_class("short w-1/2", void 0, { "active": tradeType === CONSTANTS.TRADE_TYPE_SHORT })} role="radio"${attr("aria-checked", tradeType === CONSTANTS.TRADE_TYPE_SHORT)}>${escape_html(store_get($$store_subs ??= {}, "$_", $format)("dashboard.generalInputs.shortButton"))}</button></div> <div class="grid grid-cols-2 gap-4"><input type="text" inputmode="decimal"${attr("value", leverage)} class="input-field w-full h-full px-4 py-2 rounded-md"${attr("placeholder", store_get($$store_subs ??= {}, "$_", $format)("dashboard.generalInputs.leveragePlaceholder"))}/> <input type="text" inputmode="decimal"${attr("value", fees)} class="input-field w-full px-4 py-2 rounded-md"${attr("placeholder", store_get($$store_subs ??= {}, "$_", $format)("dashboard.generalInputs.feesPlaceholder"))}/></div></div></div>`);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  bind_props($$props, { tradeType, leverage, fees });
  pop();
}
function PortfolioInputs($$payload, $$props) {
  push();
  var $$store_subs;
  let accountSize = $$props["accountSize"];
  let riskPercentage = $$props["riskPercentage"];
  $$payload.out.push(`<div><h2 class="section-header !mt-6">${escape_html(store_get($$store_subs ??= {}, "$_", $format)("dashboard.portfolioInputs.header"))}</h2> <div class="grid grid-cols-2 gap-4"><input type="text" inputmode="decimal"${attr("value", accountSize)} class="input-field w-full px-4 py-2 rounded-md"${attr("placeholder", store_get($$store_subs ??= {}, "$_", $format)("dashboard.portfolioInputs.accountSizePlaceholder"))}/> <input type="text" inputmode="decimal"${attr("value", riskPercentage)} class="input-field w-full px-4 py-2 rounded-md"${attr("placeholder", store_get($$store_subs ??= {}, "$_", $format)("dashboard.portfolioInputs.riskPerTradePlaceholder"))}/></div></div>`);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  bind_props($$props, { accountSize, riskPercentage });
  pop();
}
function parseDecimal(value) {
  if (value === null || value === void 0 || value === "") return new Decimal(0);
  const stringValue = String(value).replace(",", ".");
  if (isNaN(stringValue) || stringValue.trim() === "") return new Decimal(0);
  return new Decimal(stringValue);
}
function TradeSetupInputs($$payload, $$props) {
  push();
  var $$store_subs;
  let symbol = $$props["symbol"];
  let entryPrice = $$props["entryPrice"];
  let useAtrSl = $$props["useAtrSl"];
  let atrValue = $$props["atrValue"];
  let atrMultiplier = $$props["atrMultiplier"];
  let stopLossPrice = $$props["stopLossPrice"];
  let atrFormulaDisplay = $$props["atrFormulaDisplay"];
  let showAtrFormulaDisplay = $$props["showAtrFormulaDisplay"];
  let isPriceFetching = $$props["isPriceFetching"];
  let symbolSuggestions = $$props["symbolSuggestions"];
  let showSymbolSuggestions = $$props["showSymbolSuggestions"];
  $$payload.out.push(`<div><h2 class="section-header">${escape_html(store_get($$store_subs ??= {}, "$_", $format)("dashboard.tradeSetupInputs.header"))}</h2> <div class="relative mb-4 symbol-input-container"><input type="text"${attr("value", symbol)} class="input-field w-full px-4 py-2 rounded-md pr-10"${attr("placeholder", store_get($$store_subs ??= {}, "$_", $format)("dashboard.tradeSetupInputs.symbolPlaceholder"))} autocomplete="off"/> <button type="button"${attr_class(`price-fetch-btn absolute top-1/2 right-2 -translate-y-1/2 ${stringify(isPriceFetching ? "animate-spin" : "")}`)}${attr("title", store_get($$store_subs ??= {}, "$_", $format)("dashboard.tradeSetupInputs.fetchPriceTitle"))}${attr("aria-label", store_get($$store_subs ??= {}, "$_", $format)("dashboard.tradeSetupInputs.fetchPriceAriaLabel"))}>${html(icons.fetch)}</button> `);
  if (showSymbolSuggestions) {
    $$payload.out.push("<!--[-->");
    const each_array = ensure_array_like(symbolSuggestions);
    $$payload.out.push(`<div class="absolute top-full left-0 w-full rounded-md shadow-lg mt-1 overflow-hidden border border-[var(--border-color)] z-20 bg-[var(--bg-secondary)]"><!--[-->`);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let s = each_array[$$index];
      $$payload.out.push(`<div class="suggestion-item p-2 cursor-pointer hover:bg-[var(--accent-color)] hover:text-white" role="button" tabindex="0">${escape_html(s)}</div>`);
    }
    $$payload.out.push(`<!--]--></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--></div> <input type="text" inputmode="decimal"${attr("value", entryPrice)} class="input-field w-full px-4 py-2 rounded-md mb-4"${attr("placeholder", store_get($$store_subs ??= {}, "$_", $format)("dashboard.tradeSetupInputs.entryPricePlaceholder"))}/> <div class="p-2 rounded-lg mb-4" style="background-color: var(--bg-tertiary);"><div class="flex justify-end mb-2"><label class="flex items-center cursor-pointer"><span class="mr-2 text-sm">${escape_html(store_get($$store_subs ??= {}, "$_", $format)("dashboard.tradeSetupInputs.atrStopLossLabel"))}</span> <input type="checkbox"${attr("checked", useAtrSl, true)} class="sr-only peer" role="switch"${attr("aria-checked", useAtrSl)}/> <div class="atr-toggle-track relative w-11 h-6 peer-focus:outline-none rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:border after:rounded-full after:h-5 after:w-5"></div></label></div> `);
  if (!useAtrSl) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div><input type="text" inputmode="decimal"${attr("value", stopLossPrice)} class="input-field w-full px-4 py-2 rounded-md"${attr("placeholder", store_get($$store_subs ??= {}, "$_", $format)("dashboard.tradeSetupInputs.manualStopLossPlaceholder"))}/></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`<div class="grid grid-cols-2 gap-2"><input type="text" inputmode="decimal"${attr("value", atrValue)} class="input-field w-full px-4 py-2 rounded-md"${attr("placeholder", store_get($$store_subs ??= {}, "$_", $format)("dashboard.tradeSetupInputs.atrValuePlaceholder"))}/> <input type="text" inputmode="decimal"${attr("value", atrMultiplier)} class="input-field w-full px-4 py-2 rounded-md"${attr("placeholder", store_get($$store_subs ??= {}, "$_", $format)("dashboard.tradeSetupInputs.multiplierPlaceholder"))}/></div> `);
    if (showAtrFormulaDisplay) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<div class="text-center text-xs text-sky-300 mt-2">${escape_html(atrFormulaDisplay)}</div>`);
    } else {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]-->`);
  }
  $$payload.out.push(`<!--]--></div></div>`);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  bind_props($$props, {
    symbol,
    entryPrice,
    useAtrSl,
    atrValue,
    atrMultiplier,
    stopLossPrice,
    atrFormulaDisplay,
    showAtrFormulaDisplay,
    isPriceFetching,
    symbolSuggestions,
    showSymbolSuggestions
  });
  pop();
}
function TakeProfitRow($$payload, $$props) {
  push();
  var $$store_subs;
  let index = $$props["index"];
  let price = $$props["price"];
  let percent = $$props["percent"];
  let isLocked = $$props["isLocked"];
  let tpDetail = fallback($$props["tpDetail"], void 0);
  $$payload.out.push(`<div class="tp-row flex items-center gap-2 p-2 rounded-lg" style="background-color: var(--bg-tertiary);"><div class="flex-grow"><div class="flex justify-between items-center mb-1"><label class="tp-label text-xs text-slate-400"${attr("for", `tp-price-${stringify(index)}`)}>TP ${escape_html(index + 1)}</label> `);
  if (tpDetail) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="text-xs text-slate-500 text-right"><span class="mr-2">${escape_html(store_get($$store_subs ??= {}, "$_", $format)("dashboard.takeProfitRow.winLabel"))} <span class="text-green-400">+$${escape_html(tpDetail.netProfit.toFixed(2))}</span></span> <span>${escape_html(store_get($$store_subs ??= {}, "$_", $format)("dashboard.takeProfitRow.rrLabel"))} <span${attr_class(tpDetail.riskRewardRatio.gte(2) ? "text-green-400" : tpDetail.riskRewardRatio.gte(1.5) ? "text-yellow-400" : "text-red-400")}>${escape_html(tpDetail.riskRewardRatio.toFixed(2))}</span></span></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--></div> <div class="grid grid-cols-2 gap-2"><input type="text" inputmode="decimal"${attr("value", price)} class="tp-price input-field w-full px-4 py-2 rounded-md"${attr("placeholder", store_get($$store_subs ??= {}, "$_", $format)("dashboard.takeProfitRow.pricePlaceholder"))}${attr("id", `tp-price-${stringify(index)}`)}/> <input type="text" inputmode="decimal"${attr("value", percent)}${attr_class("tp-percent input-field w-full px-4 py-2 rounded-md", void 0, { "locked-input": isLocked })}${attr("disabled", isLocked, true)} placeholder="%"${attr("id", `tp-percent-${stringify(index)}`)}/></div></div> <button class="lock-tp-btn btn-lock-icon p-1 self-center"${attr("title", store_get($$store_subs ??= {}, "$_", $format)("dashboard.takeProfitRow.lockButtonTitle"))} tabindex="-1">`);
  if (isLocked) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`${html(icons.lockClosed)}`);
  } else {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`${html(icons.lockOpen)}`);
  }
  $$payload.out.push(`<!--]--></button> <button class="remove-tp-btn text-red-500 hover:text-red-400 p-1 self-center"${attr("title", store_get($$store_subs ??= {}, "$_", $format)("dashboard.takeProfitRow.removeButtonTitle"))} tabindex="-1">${html(icons.remove)}</button></div>`);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  bind_props($$props, { index, price, percent, isLocked, tpDetail });
  pop();
}
const apiService = {
  async fetchBinancePrice(symbol) {
    const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
    if (!response.ok) throw new Error(`Symbol nicht gefunden oder API-Fehler (${response.status})`);
    const data = await response.json();
    return new Decimal(data.price);
  }
};
const modalState = writable({
  title: "",
  message: "",
  type: "alert",
  defaultValue: "",
  isOpen: false,
  resolve: null
});
const modalManager = {
  show(title, message, type, defaultValue = "") {
    return new Promise((resolve) => {
      {
        console.warn("Modal cannot be shown in SSR environment.");
        resolve(false);
        return;
      }
    });
  },
  _handleModalConfirm(result) {
    const currentModalState = get(modalState);
    if (currentModalState.resolve) {
      currentModalState.resolve(result);
    }
    modalState.set({ ...currentModalState, isOpen: false, resolve: null });
  },
  subscribe: modalState.subscribe
};
const calculator = {
  calculateBaseMetrics(values, tradeType) {
    const riskAmount = values.accountSize.times(values.riskPercentage.div(100));
    const riskPerUnit = values.entryPrice.minus(values.stopLossPrice).abs();
    if (riskPerUnit.isZero()) return null;
    const positionSize = riskAmount.div(riskPerUnit);
    const orderVolume = positionSize.times(values.entryPrice);
    const requiredMargin = values.leverage.gt(0) ? orderVolume.div(values.leverage) : orderVolume;
    const entryFee = orderVolume.times(values.fees.div(100));
    const slExitFee = positionSize.times(values.stopLossPrice).times(values.fees.div(100));
    const netLoss = riskAmount.plus(entryFee).plus(slExitFee);
    const feeFactor = values.fees.div(100);
    const breakEvenPrice = tradeType === CONSTANTS.TRADE_TYPE_LONG ? values.entryPrice.times(feeFactor.plus(1)).div(new Decimal(1).minus(feeFactor)) : values.entryPrice.times(new Decimal(1).minus(feeFactor)).div(feeFactor.plus(1));
    const liquidationPrice = values.leverage.gt(0) ? tradeType === CONSTANTS.TRADE_TYPE_LONG ? values.entryPrice.times(new Decimal(1).minus(new Decimal(1).div(values.leverage))) : values.entryPrice.times(new Decimal(1).plus(new Decimal(1).div(values.leverage))) : new Decimal(0);
    return { positionSize, requiredMargin, netLoss, breakEvenPrice, liquidationPrice, entryFee, riskAmount };
  },
  calculateIndividualTp(tpPrice, currentTpPercent, baseMetrics, values, index) {
    const { positionSize, requiredMargin, riskAmount } = baseMetrics;
    const gainPerUnit = tpPrice.minus(values.entryPrice).abs();
    const positionPart = positionSize.times(currentTpPercent.div(100));
    const grossProfitPart = gainPerUnit.times(positionPart);
    const tpExitFeePart = positionPart.times(tpPrice).times(values.fees.div(100));
    const entryFeePart = positionPart.times(values.entryPrice).times(values.fees.div(100));
    const netProfit = grossProfitPart.minus(entryFeePart).minus(tpExitFeePart);
    const riskForPart = riskAmount.times(currentTpPercent.div(100));
    const riskRewardRatio = riskForPart.gt(0) ? netProfit.div(riskForPart) : new Decimal(0);
    const priceChangePercent = values.entryPrice.gt(0) ? tpPrice.minus(values.entryPrice).div(values.entryPrice).times(100) : new Decimal(0);
    const returnOnCapital = requiredMargin.gt(0) && currentTpPercent.gt(0) ? netProfit.div(requiredMargin.times(currentTpPercent.div(100))).times(100) : new Decimal(0);
    return { netProfit, riskRewardRatio, priceChangePercent, returnOnCapital, partialVolume: positionPart, index, percentSold: new Decimal(0) };
  },
  calculateTotalMetrics(targets, baseMetrics, values, tradeType) {
    const { positionSize, entryFee, riskAmount } = baseMetrics;
    let totalNetProfit = new Decimal(0);
    let weightedRRSum = new Decimal(0);
    let totalFees = new Decimal(0);
    targets.forEach((tp, index) => {
      if (tp.price.gt(0) && tp.percent.gt(0)) {
        const { netProfit, riskRewardRatio } = this.calculateIndividualTp(tp.price, tp.percent, baseMetrics, values, index);
        totalNetProfit = totalNetProfit.plus(netProfit);
        const entryFeePart = positionSize.times(tp.percent.div(100)).times(values.entryPrice).times(values.fees.div(100));
        const exitFeePart = positionSize.times(tp.percent.div(100)).times(tp.price).times(values.fees.div(100));
        totalFees = totalFees.plus(entryFeePart).plus(exitFeePart);
        weightedRRSum = weightedRRSum.plus(riskRewardRatio.times(tp.percent.div(100)));
      }
    });
    const validTpPrices = targets.filter((t) => t.price.gt(0)).map((t) => t.price);
    let maxPotentialProfit = new Decimal(0);
    if (validTpPrices.length > 0) {
      const bestTpPrice = tradeType === CONSTANTS.TRADE_TYPE_LONG ? Decimal.max(...validTpPrices) : Decimal.min(...validTpPrices);
      const gainPerUnitFull = bestTpPrice.minus(values.entryPrice).abs();
      const grossProfitFull = gainPerUnitFull.times(positionSize);
      const exitFeeFull = positionSize.times(bestTpPrice).times(values.fees.div(100));
      maxPotentialProfit = grossProfitFull.minus(entryFee).minus(exitFeeFull);
    }
    const totalRR = values.totalPercentSold.gt(0) ? weightedRRSum.div(values.totalPercentSold.div(100)) : new Decimal(0);
    return { totalNetProfit, totalRR, totalFees, maxPotentialProfit, riskAmount };
  },
  calculatePerformanceStats(journalData) {
    const closedTrades = journalData.filter((t) => t.status === "Won" || t.status === "Lost");
    if (closedTrades.length === 0) return null;
    const sortedClosedTrades = [...closedTrades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const wonTrades = closedTrades.filter((t) => t.status === "Won");
    const lostTrades = closedTrades.filter((t) => t.status === "Lost");
    const totalTrades = closedTrades.length;
    const winRate = totalTrades > 0 ? wonTrades.length / totalTrades * 100 : 0;
    const totalProfit = wonTrades.reduce((sum, t) => sum.plus(new Decimal(t.totalNetProfit || 0)), new Decimal(0));
    const totalLoss = lostTrades.reduce((sum, t) => sum.plus(new Decimal(t.riskAmount || 0)), new Decimal(0));
    const profitFactor = totalLoss.gt(0) ? totalProfit.dividedBy(totalLoss) : totalProfit.gt(0) ? new Decimal(Infinity) : new Decimal(0);
    const avgRR = totalTrades > 0 ? closedTrades.reduce((sum, t) => sum.plus(new Decimal(t.totalRR || 0)), new Decimal(0)).dividedBy(totalTrades) : new Decimal(0);
    const avgWin = wonTrades.length > 0 ? totalProfit.dividedBy(wonTrades.length) : new Decimal(0);
    const avgLossOnly = lostTrades.length > 0 ? totalLoss.dividedBy(lostTrades.length) : new Decimal(0);
    const winLossRatio = avgLossOnly.gt(0) ? avgWin.dividedBy(avgLossOnly) : new Decimal(0);
    const largestProfit = wonTrades.length > 0 ? Decimal.max(0, ...wonTrades.map((t) => new Decimal(t.totalNetProfit || 0))) : new Decimal(0);
    const largestLoss = lostTrades.length > 0 ? Decimal.max(0, ...lostTrades.map((t) => new Decimal(t.riskAmount || 0))) : new Decimal(0);
    let totalRMultiples = new Decimal(0);
    let tradesWithRisk = 0;
    closedTrades.forEach((trade) => {
      if (trade.riskAmount && new Decimal(trade.riskAmount).gt(0)) {
        const rMultiple = trade.status === "Won" ? new Decimal(trade.totalNetProfit || 0).dividedBy(new Decimal(trade.riskAmount)) : new Decimal(-1);
        totalRMultiples = totalRMultiples.plus(rMultiple);
        tradesWithRisk++;
      }
    });
    const avgRMultiple = tradesWithRisk > 0 ? totalRMultiples.dividedBy(tradesWithRisk) : new Decimal(0);
    let cumulativeProfit = new Decimal(0), peakEquity = new Decimal(0), maxDrawdown = new Decimal(0);
    sortedClosedTrades.forEach((trade) => {
      cumulativeProfit = trade.status === "Won" ? cumulativeProfit.plus(new Decimal(trade.totalNetProfit || 0)) : cumulativeProfit.minus(new Decimal(trade.riskAmount || 0));
      if (cumulativeProfit.gt(peakEquity)) peakEquity = cumulativeProfit;
      const drawdown = peakEquity.minus(cumulativeProfit);
      if (drawdown.gt(maxDrawdown)) maxDrawdown = drawdown;
    });
    const recoveryFactor = maxDrawdown.gt(0) ? cumulativeProfit.dividedBy(maxDrawdown) : new Decimal(0);
    const lossRate = totalTrades > 0 ? lostTrades.length / totalTrades * 100 : 0;
    const expectancy = new Decimal(winRate / 100).times(avgWin).minus(new Decimal(lossRate / 100).times(avgLossOnly));
    let totalProfitLong = new Decimal(0), totalLossLong = new Decimal(0), totalProfitShort = new Decimal(0), totalLossShort = new Decimal(0);
    closedTrades.forEach((trade) => {
      if (trade.tradeType === CONSTANTS.TRADE_TYPE_LONG) {
        if (trade.status === "Won") totalProfitLong = totalProfitLong.plus(new Decimal(trade.totalNetProfit || 0));
        else totalLossLong = totalLossLong.plus(new Decimal(trade.riskAmount || 0));
      } else {
        if (trade.status === "Won") totalProfitShort = totalProfitShort.plus(new Decimal(trade.totalNetProfit || 0));
        else totalLossShort = totalLossShort.plus(new Decimal(trade.riskAmount || 0));
      }
    });
    let longestWinningStreak = 0, currentWinningStreak = 0, longestLosingStreak = 0, currentLosingStreak = 0, currentStreakText = "N/A";
    sortedClosedTrades.forEach((trade) => {
      if (trade.status === "Won") {
        currentWinningStreak++;
        currentLosingStreak = 0;
        if (currentWinningStreak > longestWinningStreak) longestWinningStreak = currentWinningStreak;
      } else {
        currentLosingStreak++;
        currentWinningStreak = 0;
        if (currentLosingStreak > longestLosingStreak) longestLosingStreak = currentLosingStreak;
      }
    });
    if (sortedClosedTrades.length > 0) {
      const lastIsWin = sortedClosedTrades[sortedClosedTrades.length - 1].status === "Won";
      let streak = 0;
      for (let i = sortedClosedTrades.length - 1; i >= 0; i--) {
        if (lastIsWin && sortedClosedTrades[i].status === "Won" || !lastIsWin && sortedClosedTrades[i].status === "Lost") streak++;
        else break;
      }
      currentStreakText = `${lastIsWin ? "W" : "L"}${streak}`;
    }
    return { totalTrades, winRate, profitFactor, expectancy, avgRMultiple, avgRR, avgWin, avgLossOnly, winLossRatio, largestProfit, largestLoss, maxDrawdown, recoveryFactor, currentStreakText, longestWinningStreak, longestLosingStreak, totalProfitLong, totalLossLong, totalProfitShort, totalLossShort };
  },
  calculateSymbolPerformance(journalData) {
    const closedTrades = journalData.filter((t) => t.status === "Won" || t.status === "Lost");
    const symbolPerformance = {};
    closedTrades.forEach((trade) => {
      if (!trade.symbol) return;
      if (!symbolPerformance[trade.symbol]) {
        symbolPerformance[trade.symbol] = { totalTrades: 0, wonTrades: 0, totalProfitLoss: new Decimal(0) };
      }
      symbolPerformance[trade.symbol].totalTrades++;
      if (trade.status === "Won") {
        symbolPerformance[trade.symbol].wonTrades++;
        symbolPerformance[trade.symbol].totalProfitLoss = symbolPerformance[trade.symbol].totalProfitLoss.plus(new Decimal(trade.totalNetProfit || 0));
      } else {
        symbolPerformance[trade.symbol].totalProfitLoss = symbolPerformance[trade.symbol].totalProfitLoss.minus(new Decimal(trade.riskAmount || 0));
      }
    });
    return symbolPerformance;
  }
};
async function loadInstruction(name) {
  const currentLocale = get(locale);
  const filePath = `/instructions/${name}.${currentLocale}.md`;
  try {
    const modules = /* @__PURE__ */ Object.assign({ "/src/instructions/changelog.de.md": () => import("../../chunks/changelog.de.js").then((m) => m["default"]), "/src/instructions/changelog.en.md": () => import("../../chunks/changelog.en.js").then((m) => m["default"]), "/src/instructions/dashboard.de.md": () => import("../../chunks/dashboard.de.js").then((m) => m["default"]), "/src/instructions/dashboard.en.md": () => import("../../chunks/dashboard.en.js").then((m) => m["default"]), "/src/instructions/journal.de.md": () => import("../../chunks/journal.de.js").then((m) => m["default"]), "/src/instructions/journal.en.md": () => import("../../chunks/journal.en.js").then((m) => m["default"]) });
    const modulePath = `/src${filePath}`;
    if (!modules[modulePath]) {
      throw new Error(`Markdown file not found: ${modulePath}`);
    }
    const markdownContent = await modules[modulePath]();
    const htmlContent = await marked(markdownContent);
    const firstLine = markdownContent.split("\n")[0];
    const titleMatch = firstLine.match(/^#\s*(.*)/);
    const title = titleMatch ? titleMatch[1] : "";
    return { html: htmlContent, title };
  } catch (error) {
    console.error(`Failed to load or parse markdown for ${name} in ${currentLocale}:`, error);
    return { html: `<p>Error loading instructions.</p>`, title: "Error" };
  }
}
const uiManager = {
  showReadme: async (type) => {
    const instruction = await loadInstruction(type);
    let titleKey;
    if (type === "dashboard") {
      titleKey = "dashboard.instructionsTitle";
    } else if (type === "journal") {
      titleKey = "journal.showJournalInstructionsTitle";
    } else {
      titleKey = "app.changelogTitle";
    }
    const translatedTitle = get($format)(titleKey);
    modalManager.show(translatedTitle, instruction.html, "alert");
  }
};
function updateVisualBar(values, targets) {
  const visualBarContent = [];
  const markers = [];
  const validTargetPrices = targets.map((t) => parseDecimal(t.price)).filter((p) => p.gt(0));
  const allPrices = [parseDecimal(values.entryPrice), parseDecimal(values.stopLossPrice), ...validTargetPrices];
  if (allPrices.some((p) => p.lte(0))) return { visualBarContent, markers };
  const highestPrice = Decimal.max(...allPrices);
  const lowestPrice = Decimal.min(...allPrices);
  const totalRange = highestPrice.minus(lowestPrice);
  if (totalRange.lte(0)) return { visualBarContent, markers };
  const slPos = parseDecimal(values.stopLossPrice).minus(lowestPrice).dividedBy(totalRange).times(100);
  const entryPos = parseDecimal(values.entryPrice).minus(lowestPrice).dividedBy(totalRange).times(100);
  if (values.tradeType === CONSTANTS.TRADE_TYPE_LONG) {
    visualBarContent.push({ type: "loss-zone", style: { left: `${slPos}%`, width: `${entryPos.minus(slPos)}%` } });
    visualBarContent.push({ type: "gain-zone", style: { left: `${entryPos}%`, width: `${new Decimal(100).minus(entryPos)}%` } });
  } else {
    visualBarContent.push({ type: "gain-zone", style: { left: "0", width: `${entryPos}%` } });
    visualBarContent.push({ type: "loss-zone", style: { left: `${entryPos}%`, width: `${slPos.minus(entryPos)}%` } });
  }
  markers.push({ pos: slPos, label: "SL", isEntry: false });
  markers.push({ pos: entryPos, label: "Einstieg", isEntry: true });
  targets.forEach((tp, i) => {
    if (values.tradeType === CONSTANTS.TRADE_TYPE_LONG && parseDecimal(tp.price).gt(parseDecimal(values.entryPrice)) || values.tradeType === CONSTANTS.TRADE_TYPE_SHORT && parseDecimal(tp.price).lt(parseDecimal(values.entryPrice))) {
      const tpPos = parseDecimal(tp.price).minus(lowestPrice).dividedBy(totalRange).times(100);
      markers.push({ pos: tpPos, label: `TP${i + 1}`, isEntry: false, index: i });
    }
  });
  return { visualBarContent, markers };
}
function loadJournalFromLocalStorage() {
  return [];
}
const journalStore = writable(loadJournalFromLocalStorage());
journalStore.subscribe((value) => {
});
const app = {
  calculator,
  // Expose calculator for use in Svelte components
  uiManager,
  init: () => {
  },
  calculateAndDisplay: () => {
    uiStore.hideError();
    const currentAppState = get(tradeStore);
    const getAndValidateInputs = () => {
      const values2 = {
        accountSize: parseDecimal(currentAppState.accountSize),
        riskPercentage: parseDecimal(currentAppState.riskPercentage),
        entryPrice: parseDecimal(currentAppState.entryPrice),
        leverage: parseDecimal(currentAppState.leverage || CONSTANTS.DEFAULT_LEVERAGE),
        fees: parseDecimal(currentAppState.fees || CONSTANTS.DEFAULT_FEES),
        symbol: currentAppState.symbol || "",
        useAtrSl: currentAppState.useAtrSl,
        atrValue: parseDecimal(currentAppState.atrValue),
        atrMultiplier: parseDecimal(currentAppState.atrMultiplier || CONSTANTS.DEFAULT_ATR_MULTIPLIER),
        stopLossPrice: parseDecimal(currentAppState.stopLossPrice),
        targets: currentAppState.targets.map((t) => ({ price: parseDecimal(t.price), percent: parseDecimal(t.percent), isLocked: t.isLocked })),
        totalPercentSold: new Decimal(0)
      };
      const requiredFieldMap = {
        accountSize: values2.accountSize,
        riskPercentage: values2.riskPercentage,
        entryPrice: values2.entryPrice
      };
      if (values2.useAtrSl) {
        requiredFieldMap.atrValue = values2.atrValue;
        requiredFieldMap.atrMultiplier = values2.atrMultiplier;
      } else {
        requiredFieldMap.stopLossPrice = values2.stopLossPrice;
      }
      const emptyFields = Object.keys(requiredFieldMap).filter((field) => requiredFieldMap[field].isZero());
      if (emptyFields.length > 0) {
        return { status: CONSTANTS.STATUS_INCOMPLETE };
      }
      if (values2.useAtrSl) {
        if (values2.entryPrice.gt(0) && values2.atrValue.gt(0) && values2.atrMultiplier.gt(0)) {
          const operator = currentAppState.tradeType === CONSTANTS.TRADE_TYPE_LONG ? "-" : "+";
          values2.stopLossPrice = currentAppState.tradeType === CONSTANTS.TRADE_TYPE_LONG ? values2.entryPrice.minus(values2.atrValue.times(values2.atrMultiplier)) : values2.entryPrice.plus(values2.atrValue.times(values2.atrMultiplier));
          updateTradeStore((state) => ({ ...state, showAtrFormulaDisplay: true, atrFormulaText: `SL = ${values2.entryPrice.toFixed(4)} ${operator} (${values2.atrValue} × ${values2.atrMultiplier}) = ${values2.stopLossPrice.toFixed(4)}` }));
        } else if (values2.atrValue.gt(0) && values2.atrMultiplier.gt(0)) {
          return { status: CONSTANTS.STATUS_INCOMPLETE };
        }
      } else {
        updateTradeStore((state) => ({ ...state, showAtrFormulaDisplay: false, atrFormulaText: "" }));
      }
      if (values2.accountSize.lte(0) || values2.riskPercentage.lte(0) || values2.entryPrice.lte(0) || values2.stopLossPrice.lte(0)) {
        return { status: CONSTANTS.STATUS_INCOMPLETE };
      }
      if (currentAppState.tradeType === CONSTANTS.TRADE_TYPE_LONG && values2.entryPrice.lte(values2.stopLossPrice)) {
        return { status: CONSTANTS.STATUS_INVALID, message: "Long: Stop-Loss muss unter dem Kaufpreis liegen.", fields: ["stopLossPrice", "entryPrice"] };
      }
      if (currentAppState.tradeType === CONSTANTS.TRADE_TYPE_SHORT && values2.entryPrice.gte(values2.stopLossPrice)) {
        return { status: CONSTANTS.STATUS_INVALID, message: "Short: Stop-Loss muss über dem Verkaufspreis liegen.", fields: ["stopLossPrice", "entryPrice"] };
      }
      for (const tp of values2.targets) {
        if (tp.price.gt(0)) {
          if (currentAppState.tradeType === CONSTANTS.TRADE_TYPE_LONG) {
            if (tp.price.lte(values2.stopLossPrice)) {
              return { status: CONSTANTS.STATUS_INVALID, message: `Long: Take-Profit Ziel ${tp.price.toFixed(4)} muss über dem Stop-Loss liegen.`, fields: ["targets"] };
            }
            if (tp.price.lte(values2.entryPrice)) {
              return { status: CONSTANTS.STATUS_INVALID, message: `Long: Take-Profit Ziel ${tp.price.toFixed(4)} muss über dem Einstiegspreis liegen.`, fields: ["targets"] };
            }
          } else {
            if (tp.price.gte(values2.stopLossPrice)) {
              return { status: CONSTANTS.STATUS_INVALID, message: `Short: Take-Profit Ziel ${tp.price.toFixed(4)} muss unter dem Stop-Loss liegen.`, fields: ["targets"] };
            }
            if (tp.price.gte(values2.entryPrice)) {
              return { status: CONSTANTS.STATUS_INVALID, message: `Short: Take-Profit Ziel ${tp.price.toFixed(4)} muss unter dem Einstiegspreis liegen.`, fields: ["targets"] };
            }
          }
        }
      }
      values2.totalPercentSold = values2.targets.reduce((sum, t) => sum.plus(t.percent), new Decimal(0));
      if (values2.totalPercentSold.gt(100)) {
        return { status: CONSTANTS.STATUS_INVALID, message: `Die Summe der Verkaufsprozente (${values2.totalPercentSold.toFixed(0)}%) darf 100% nicht überschreiten.`, fields: [] };
      }
      return { status: CONSTANTS.STATUS_VALID, data: values2 };
    };
    const validationResult = getAndValidateInputs();
    if (validationResult.status === CONSTANTS.STATUS_INVALID) {
      uiStore.showError(validationResult.message || "");
      clearResults();
      return;
    }
    if (validationResult.status === CONSTANTS.STATUS_INCOMPLETE) {
      clearResults(true);
      return;
    }
    let values = validationResult.data;
    let baseMetrics;
    if (currentAppState.isPositionSizeLocked && currentAppState.lockedPositionSize && currentAppState.lockedPositionSize.gt(0)) {
      const riskPerUnit = values.entryPrice.minus(values.stopLossPrice).abs();
      if (riskPerUnit.lte(0)) {
        uiStore.showError("Stop-Loss muss einen gültigen Abstand zum Einstiegspreis haben.");
        clearResults();
        return;
      }
      const riskAmount = riskPerUnit.times(currentAppState.lockedPositionSize);
      const newRiskPercentage = values.accountSize.isZero() ? new Decimal(0) : riskAmount.div(values.accountSize).times(100);
      updateTradeStore((state) => ({ ...state, riskPercentage: newRiskPercentage.toFixed(2) }));
      values.riskPercentage = newRiskPercentage;
      baseMetrics = calculator.calculateBaseMetrics(values, currentAppState.tradeType);
      if (baseMetrics) baseMetrics.positionSize = currentAppState.lockedPositionSize;
    } else {
      baseMetrics = calculator.calculateBaseMetrics(values, currentAppState.tradeType);
    }
    if (!baseMetrics || baseMetrics.positionSize.lte(0)) {
      clearResults();
      if (currentAppState.isPositionSizeLocked) app.togglePositionSizeLock(false);
      return;
    }
    updateTradeStore((state) => ({
      ...state,
      positionSize: baseMetrics.positionSize.toFixed(4),
      requiredMargin: baseMetrics.requiredMargin.toFixed(2),
      netLoss: `-${baseMetrics.netLoss.toFixed(2)}`,
      liquidationPrice: baseMetrics.liquidationPrice.toFixed(values.entryPrice.decimalPlaces()),
      breakEvenPrice: baseMetrics.breakEvenPrice.toFixed(values.entryPrice.decimalPlaces())
    }));
    const calculatedTpDetails = [];
    values.targets.forEach((tp, index) => {
      if (tp.price.gt(0) && tp.percent.gt(0)) {
        const details = calculator.calculateIndividualTp(tp.price, tp.percent, baseMetrics, values, index);
        if (currentAppState.tradeType === "long" && tp.price.gt(values.entryPrice) || currentAppState.tradeType === "short" && tp.price.lt(values.entryPrice)) {
          calculatedTpDetails.push(details);
        }
      }
    });
    updateTradeStore((state) => ({ ...state, calculatedTpDetails }));
    const totalMetrics = calculator.calculateTotalMetrics(values.targets, baseMetrics, values, currentAppState.tradeType);
    if (values.totalPercentSold.gt(0)) {
      updateTradeStore((state) => ({
        ...state,
        totalRR: totalMetrics.totalRR.toFixed(2),
        totalNetProfit: `+${totalMetrics.totalNetProfit.toFixed(2)}`,
        totalPercentSold: `${values.totalPercentSold}%`,
        riskAmountCurrency: `-${totalMetrics.riskAmount.toFixed(2)}`,
        totalFees: totalMetrics.totalFees.toFixed(2),
        maxPotentialProfit: `+${totalMetrics.maxPotentialProfit.toFixed(2)}`,
        showTotalMetricsGroup: true
      }));
    } else {
      updateTradeStore((state) => ({ ...state, showTotalMetricsGroup: false }));
    }
    updateTradeStore((state) => ({ ...state, currentTradeData: { ...values, ...baseMetrics, ...totalMetrics, tradeType: currentAppState.tradeType, status: "Open", calculatedTpDetails } }));
  },
  getJournal: () => {
    return [];
  },
  saveJournal: (d) => {
    return;
  },
  addTrade: () => {
    const currentAppState = get(tradeStore);
    if (!currentAppState.currentTradeData.positionSize || currentAppState.currentTradeData.positionSize.lte(0)) {
      uiStore.showError("Kann keinen ungültigen Trade speichern.");
      return;
    }
    const journalData = app.getJournal();
    journalData.push({ ...currentAppState.currentTradeData, notes: currentAppState.tradeNotes, id: Date.now(), date: (/* @__PURE__ */ new Date()).toISOString() });
    journalStore.set(journalData);
    uiStore.showFeedback("save");
  },
  updateTradeStatus: (id, newStatus) => {
    const journalData = app.getJournal();
    const tradeIndex = journalData.findIndex((t) => t.id == id);
    if (tradeIndex !== -1) {
      journalData[tradeIndex].status = newStatus;
      journalStore.set(journalData);
    }
  },
  deleteTrade: (id) => {
    const d = app.getJournal().filter((t) => t.id != id);
    journalStore.set(d);
  },
  async clearJournal() {
    const journal2 = app.getJournal();
    if (journal2.length === 0) {
      uiStore.showError("Das Journal ist bereits leer.");
      return;
    }
    if (await modalManager.show("Journal leeren", "Möchten Sie wirklich das gesamte Journal unwiderruflich löschen?", "confirm")) {
      journalStore.set([]);
      uiStore.showFeedback("save", 2e3);
    }
  },
  getInputsAsObject: () => {
    const currentAppState = get(tradeStore);
    return {
      accountSize: currentAppState.accountSize,
      riskPercentage: currentAppState.riskPercentage,
      leverage: currentAppState.leverage,
      fees: currentAppState.fees,
      tradeType: currentAppState.tradeType,
      useAtrSl: currentAppState.useAtrSl,
      atrMultiplier: currentAppState.atrMultiplier,
      symbol: currentAppState.symbol,
      targets: currentAppState.targets,
      selectedPreset: currentAppState.selectedPreset
    };
  },
  saveSettings: () => {
    return;
  },
  loadSettings: () => {
    return;
  },
  savePreset: async () => {
    return;
  },
  deletePreset: async () => {
    return;
  },
  loadPreset: (presetName) => {
    return;
  },
  populatePresetLoader: () => {
    return;
  },
  exportToCSV: () => {
    return;
  },
  importFromCSV: (file) => {
    return;
  },
  handleFetchPrice: async () => {
    const currentAppState = get(tradeStore);
    const symbol = currentAppState.symbol.toUpperCase().replace("/", "");
    if (!symbol) {
      uiStore.showError("Bitte geben Sie ein Symbol ein.");
      return;
    }
    updateTradeStore((state) => ({ ...state, isPriceFetching: true }));
    try {
      const price = await apiService.fetchBinancePrice(symbol);
      updateTradeStore((state) => ({ ...state, entryPrice: price.toDP(4).toString() }));
      uiStore.showFeedback("copy", 700);
      app.calculateAndDisplay();
    } catch (error) {
      uiStore.showError(error.message);
    } finally {
      updateTradeStore((state) => ({ ...state, isPriceFetching: false }));
    }
  },
  togglePositionSizeLock: (forceState) => {
    const currentAppState = get(tradeStore);
    const shouldBeLocked = forceState !== void 0 ? forceState : !currentAppState.isPositionSizeLocked;
    if (shouldBeLocked && (!currentAppState.positionSize || parseDecimal(currentAppState.positionSize).lte(0))) {
      uiStore.showError("Positionsgröße kann nicht gesperrt werden, solange sie ungültig ist.");
      return;
    }
    updateTradeStore((state) => ({
      ...state,
      isPositionSizeLocked: shouldBeLocked,
      lockedPositionSize: shouldBeLocked ? parseDecimal(currentAppState.positionSize) : null
    }));
    app.calculateAndDisplay();
  },
  addTakeProfitRow: (price = "", percent = "", isLocked = false) => {
    updateTradeStore((state) => ({
      ...state,
      targets: [...state.targets, { price, percent, isLocked }]
    }));
  },
  adjustTpPercentages: (changedIndex) => {
    const currentAppState = get(tradeStore);
    const targets = [...currentAppState.targets];
    let sumOfLocked = new Decimal(0);
    const unlockedIndices = [];
    targets.forEach((target, i) => {
      if (target.isLocked) {
        sumOfLocked = sumOfLocked.plus(parseDecimal(target.percent));
      } else {
        unlockedIndices.push(i);
      }
    });
    let remainingPercent = new Decimal(100).minus(sumOfLocked);
    if (remainingPercent.lt(0)) {
      uiStore.showError("Gesperrter Prozentsatz übersteigt 100%. Bitte anpassen.");
      return;
    }
    if (unlockedIndices.length > 0 && changedIndex !== null && !targets[changedIndex].isLocked) {
      let changedValue = parseDecimal(targets[changedIndex].percent);
      if (changedValue.gt(remainingPercent)) {
        changedValue = remainingPercent;
        targets[changedIndex].percent = changedValue.toFixed(0);
      }
      const otherUnlocked = unlockedIndices.filter((i) => i !== changedIndex);
      if (otherUnlocked.length > 0) {
        const sumToDistribute = remainingPercent.minus(changedValue);
        let sumOfOthers = otherUnlocked.reduce((acc, idx) => acc.plus(parseDecimal(targets[idx].percent)), new Decimal(0));
        if (sumOfOthers.isZero()) {
          const evenSplit = sumToDistribute.div(unlockedIndices.length - 1);
          otherUnlocked.forEach((idx) => targets[idx].percent = evenSplit.toFixed(0));
        } else {
          otherUnlocked.forEach((idx) => {
            const currentVal = parseDecimal(targets[idx].percent);
            const proportion = currentVal.div(sumOfOthers);
            targets[idx].percent = sumToDistribute.times(proportion).toFixed(0);
          });
        }
      }
    } else if (unlockedIndices.length > 0) {
      const evenSplit = remainingPercent.div(unlockedIndices.length);
      unlockedIndices.forEach((i) => targets[i].percent = evenSplit.toFixed(0));
    }
    updateTradeStore((state) => ({ ...state, targets }));
  }
};
function TakeProfitTargets($$payload, $$props) {
  push();
  var $$store_subs;
  let targets = $$props["targets"];
  let calculatedTpDetails = fallback($$props["calculatedTpDetails"], () => [], true);
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    const each_array = ensure_array_like(targets);
    $$payload2.out.push(`<section class="mt-4 md:col-span-2"><h2 class="section-header"><span>${escape_html(store_get($$store_subs ??= {}, "$_", $format)("dashboard.takeProfitTargets.header"))}</span> <div class="flex items-center gap-2"><div class="tooltip"><div class="tooltip-icon">?</div><span class="tooltiptext">${escape_html(store_get($$store_subs ??= {}, "$_", $format)("dashboard.takeProfitTargets.tooltip"))}</span></div> <button id="add-tp-btn" class="btn-icon-accent"${attr("title", store_get($$store_subs ??= {}, "$_", $format)("dashboard.takeProfitTargets.addTargetTitle"))} tabindex="-1">${html(icons.add)}</button></div></h2> <div id="take-profit-list" class="grid grid-cols-1 md:grid-cols-3 gap-4"><!--[-->`);
    for (let i = 0, $$length = each_array.length; i < $$length; i++) {
      let target = each_array[i];
      const tpDetail = calculatedTpDetails.find((d) => d.index === i);
      TakeProfitRow($$payload2, {
        index: i,
        tpDetail,
        get price() {
          return target.price;
        },
        set price($$value) {
          target.price = $$value;
          $$settled = false;
        },
        get percent() {
          return target.percent;
        },
        set percent($$value) {
          target.percent = $$value;
          $$settled = false;
        },
        get isLocked() {
          return target.isLocked;
        },
        set isLocked($$value) {
          target.isLocked = $$value;
          $$settled = false;
        }
      });
    }
    $$payload2.out.push(`<!--]--></div></section>`);
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  bind_props($$props, { targets, calculatedTpDetails });
  pop();
}
function CustomModal($$payload, $$props) {
  push();
  var $$store_subs;
  let modalState2 = {
    title: "",
    message: "",
    type: "alert",
    defaultValue: "",
    isOpen: false
  };
  modalManager.subscribe((state) => {
    modalState2 = state;
  });
  if (modalState2.isOpen) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div${attr_class("modal-overlay svelte-1acjfjz", void 0, { "visible": modalState2.isOpen })}><div class="modal-content svelte-1acjfjz"><h3 class="text-xl font-bold mb-4">${escape_html(modalState2.title)}</h3> <div class="mb-4 max-h-[70vh] overflow-y-auto pr-2">${html(modalState2.message)}</div> `);
    if (modalState2.type === "prompt") {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<input type="text" class="input-field w-full px-3 py-2 rounded-md mb-4"${attr("placeholder", store_get($$store_subs ??= {}, "$_", $format)("dashboard.customModal.promptPlaceholder"))}${attr("value", modalState2.defaultValue)}/>`);
    } else {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]--> <div class="flex justify-end gap-4">`);
    if (modalState2.type === "confirm") {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<button class="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg">${escape_html(store_get($$store_subs ??= {}, "$_", $format)("dashboard.customModal.yesButton"))}</button> <button class="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg">${escape_html(store_get($$store_subs ??= {}, "$_", $format)("dashboard.customModal.noButton"))}</button>`);
    } else {
      $$payload.out.push("<!--[!-->");
      $$payload.out.push(`<button class="btn-modal-ok font-bold py-2 px-4 rounded-lg">${escape_html(store_get($$store_subs ??= {}, "$_", $format)("dashboard.customModal.okButton"))}</button>`);
    }
    $$payload.out.push(`<!--]--></div></div></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]-->`);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
function VisualBar($$payload, $$props) {
  push();
  var $$store_subs;
  let entryPrice = $$props["entryPrice"];
  let stopLossPrice = $$props["stopLossPrice"];
  let tradeType = $$props["tradeType"];
  let targets = $$props["targets"];
  let calculatedTpDetails = $$props["calculatedTpDetails"];
  let visualBarData = { visualBarContent: [], markers: [] };
  {
    visualBarData = updateVisualBar({ entryPrice, stopLossPrice, tradeType }, targets);
  }
  const each_array = ensure_array_like(visualBarData.visualBarContent);
  const each_array_1 = ensure_array_like(visualBarData.markers);
  $$payload.out.push(`<section class="visual-bar-container md:col-span-2 svelte-181idyl"><h2 class="section-header text-center !mb-4">${escape_html(store_get($$store_subs ??= {}, "$_", $format)("dashboard.visualBar.header"))}</h2> <div class="visual-bar svelte-181idyl" role="img" aria-label="Trade visualization bar"><!--[-->`);
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let item = each_array[$$index];
    $$payload.out.push(`<div${attr_class(item.type, "svelte-181idyl")}${attr_style(`left: ${stringify(item.style.left)}; width: ${stringify(item.style.width)};`)}></div>`);
  }
  $$payload.out.push(`<!--]--> <!--[-->`);
  for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
    let marker = each_array_1[i];
    const tpDetail = calculatedTpDetails.find((d) => d.index === marker.index);
    $$payload.out.push(`<div${attr_class(`bar-marker ${stringify(marker.isEntry ? "entry-marker" : "")} ${stringify(marker.index !== void 0 ? "tp-marker" : "")}`, "svelte-181idyl")}${attr_style(`left: ${stringify(marker.pos)}%;`)} role="button" tabindex="0"><span style="transform: translateX(-50%);" class="svelte-181idyl">${escape_html(marker.label)}</span> `);
    if (tpDetail) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<div class="tp-tooltip svelte-181idyl"><div class="tp-tooltip-line svelte-181idyl">${escape_html(store_get($$store_subs ??= {}, "$_", $format)("dashboard.visualBar.netProfitLabel"))} <span class="text-green-400 svelte-181idyl">+$${escape_html(tpDetail.netProfit.toFixed(2))}</span></div> <div class="tp-tooltip-line svelte-181idyl">${escape_html(store_get($$store_subs ??= {}, "$_", $format)("dashboard.visualBar.rrLabel"))} <span${attr_class(
        tpDetail.riskRewardRatio.gte(2) ? "text-green-400" : tpDetail.riskRewardRatio.gte(1.5) ? "text-yellow-400" : "text-red-400",
        "svelte-181idyl"
      )}>${escape_html(tpDetail.riskRewardRatio.toFixed(2))}</span></div></div>`);
    } else {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]--></div>`);
  }
  $$payload.out.push(`<!--]--></div></section>`);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  bind_props($$props, {
    entryPrice,
    stopLossPrice,
    tradeType,
    targets,
    calculatedTpDetails
  });
  pop();
}
function SummaryResults($$payload, $$props) {
  push();
  var $$store_subs;
  let isPositionSizeLocked = $$props["isPositionSizeLocked"];
  let showCopyFeedback = $$props["showCopyFeedback"];
  let positionSize = $$props["positionSize"];
  let netLoss = $$props["netLoss"];
  let requiredMargin = $$props["requiredMargin"];
  let liquidationPrice = $$props["liquidationPrice"];
  let breakEvenPrice = $$props["breakEvenPrice"];
  $$payload.out.push(`<div class="result-group"><h2 class="section-header">${escape_html(store_get($$store_subs ??= {}, "$_", $format)("dashboard.summaryResults.header"))}</h2> <div class="result-item"><div class="result-label">${escape_html(store_get($$store_subs ??= {}, "$_", $format)("dashboard.summaryResults.positionSizeLabel"))} <button id="lock-position-size-btn" class="copy-btn ml-2"${attr("title", store_get($$store_subs ??= {}, "$_", $format)("dashboard.summaryResults.lockPositionSizeTitle"))}${attr("aria-label", store_get($$store_subs ??= {}, "$_", $format)("dashboard.summaryResults.lockPositionSizeAriaLabel"))}>`);
  if (isPositionSizeLocked) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`${html(icons.lockClosed)}`);
  } else {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`${html(icons.lockOpen)}`);
  }
  $$payload.out.push(`<!--]--></button> <button id="copy-btn" class="copy-btn"${attr("aria-label", store_get($$store_subs ??= {}, "$_", $format)("dashboard.summaryResults.copyPositionSizeAriaLabel"))}>${html(icons.copy)}</button> `);
  if (showCopyFeedback) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<span id="copy-feedback" class="copy-feedback visible">${escape_html(store_get($$store_subs ??= {}, "$_", $format)("dashboard.summaryResults.copiedFeedback"))}</span>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--></div> <span id="positionSize" class="result-value text-lg text-green-400">${escape_html(positionSize)}</span></div> <div class="result-item"><div class="result-label">${escape_html(store_get($$store_subs ??= {}, "$_", $format)("dashboard.summaryResults.maxNetLossLabel"))}<div class="tooltip"><div class="tooltip-icon">?</div><span class="tooltiptext">${escape_html(store_get($$store_subs ??= {}, "$_", $format)("dashboard.summaryResults.maxNetLossTooltip"))}</span></div></div><span id="netLoss" class="result-value text-red-400">${escape_html(netLoss)}</span></div> <div class="result-item"><div class="result-label">${escape_html(store_get($$store_subs ??= {}, "$_", $format)("dashboard.summaryResults.requiredMarginLabel"))}<div class="tooltip"><div class="tooltip-icon">?</div><span class="tooltiptext">${escape_html(store_get($$store_subs ??= {}, "$_", $format)("dashboard.summaryResults.requiredMarginTooltip"))}</span></div></div><span id="requiredMargin" class="result-value">${escape_html(requiredMargin)}</span></div> <div class="result-item"><span class="result-label">${escape_html(store_get($$store_subs ??= {}, "$_", $format)("dashboard.summaryResults.estimatedLiquidationPriceLabel"))}<div class="tooltip"><div class="tooltip-icon">?</div><span class="tooltiptext">${escape_html(store_get($$store_subs ??= {}, "$_", $format)("dashboard.summaryResults.estimatedLiquidationPriceTooltip"))}</span></div></span> <span id="liquidationPrice" class="result-value text-warning-color">${escape_html(liquidationPrice)}</span></div> <div class="result-item"><span class="result-label">${escape_html(store_get($$store_subs ??= {}, "$_", $format)("dashboard.summaryResults.breakEvenPriceLabel"))}<div class="tooltip"><div class="tooltip-icon">?</div><span class="tooltiptext">${escape_html(store_get($$store_subs ??= {}, "$_", $format)("dashboard.summaryResults.breakEvenPriceTooltip"))}</span></div></span><span id="breakEvenPrice" class="result-value text-sky-400">${escape_html(breakEvenPrice)}</span></div></div>`);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  bind_props($$props, {
    isPositionSizeLocked,
    showCopyFeedback,
    positionSize,
    netLoss,
    requiredMargin,
    liquidationPrice,
    breakEvenPrice
  });
  pop();
}
function LanguageSwitcher($$payload, $$props) {
  push();
  var $$store_subs;
  $$payload.out.push(`<div class="flex items-center justify-center gap-2"><button${attr_class("w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all duration-200 svelte-1t9my1b", void 0, {
    "border-2": store_get($$store_subs ??= {}, "$locale", locale) === "de",
    "border-[var(--accent-color)]": store_get($$store_subs ??= {}, "$locale", locale) === "de",
    "border-transparent": store_get($$store_subs ??= {}, "$locale", locale) !== "de",
    "opacity-50": store_get($$store_subs ??= {}, "$locale", locale) !== "de",
    "hover:opacity-100": store_get($$store_subs ??= {}, "$locale", locale) !== "de"
  })}${attr("title", store_get($$store_subs ??= {}, "$_", $format)("languages.german"))}>🇩🇪</button> <button${attr_class("w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all duration-200 svelte-1t9my1b", void 0, {
    "border-2": store_get($$store_subs ??= {}, "$locale", locale) === "en",
    "border-[var(--accent-color)]": store_get($$store_subs ??= {}, "$locale", locale) === "en",
    "border-transparent": store_get($$store_subs ??= {}, "$locale", locale) !== "en",
    "opacity-50": store_get($$store_subs ??= {}, "$locale", locale) !== "en",
    "hover:opacity-100": store_get($$store_subs ??= {}, "$locale", locale) !== "en"
  })}${attr("title", store_get($$store_subs ??= {}, "$_", $format)("languages.english"))}>🇬🇧</button></div>`);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
function _page($$payload, $$props) {
  push();
  var $$store_subs;
  let currentAppState, themeTitle;
  let changelogContent = "";
  currentAppState = store_get($$store_subs ??= {}, "$tradeStore", tradeStore);
  if (store_get($$store_subs ??= {}, "$uiStore", uiStore).showChangelogModal && changelogContent === "") {
    loadInstruction("changelog").then((content) => {
      changelogContent = content.html;
    });
  }
  {
    if (!store_get($$store_subs ??= {}, "$uiStore", uiStore).isInitializing) {
      currentAppState.accountSize, currentAppState.riskPercentage, currentAppState.entryPrice, currentAppState.stopLossPrice, currentAppState.leverage, currentAppState.fees, currentAppState.symbol, currentAppState.atrValue, currentAppState.atrMultiplier, currentAppState.useAtrSl, currentAppState.tradeType, currentAppState.targets;
      if (currentAppState.accountSize !== void 0 && currentAppState.riskPercentage !== void 0 && currentAppState.entryPrice !== void 0 && currentAppState.leverage !== void 0 && currentAppState.fees !== void 0 && currentAppState.symbol !== void 0 && currentAppState.atrValue !== void 0 && currentAppState.atrMultiplier !== void 0 && currentAppState.useAtrSl !== void 0 && currentAppState.tradeType !== void 0 && currentAppState.targets !== void 0) {
        app.calculateAndDisplay();
      }
    }
  }
  themeTitle = store_get($$store_subs ??= {}, "$uiStore", uiStore).currentTheme.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    const each_array = ensure_array_like(currentAppState.availablePresets);
    const each_array_1 = ensure_array_like(currentAppState.calculatedTpDetails);
    const each_array_2 = ensure_array_like(store_get($$store_subs ??= {}, "$journalStore", journalStore).filter((trade) => trade.symbol.toLowerCase().includes(currentAppState.journalSearchQuery.toLowerCase()) && (currentAppState.journalFilterStatus === "all" || trade.status === currentAppState.journalFilterStatus)));
    const each_array_3 = ensure_array_like(Object.entries(app.calculator.calculateSymbolPerformance(store_get($$store_subs ??= {}, "$journalStore", journalStore))));
    $$payload2.out.push(`<main class="my-8 w-full max-w-4xl mx-auto calculator-wrapper rounded-2xl shadow-2xl p-6 sm:p-8 fade-in"><div class="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4"><div class="flex justify-between items-center w-full md:w-auto"><h1 class="text-2xl sm:text-3xl font-bold">${escape_html(store_get($$store_subs ??= {}, "$_", $format)("app.title"))}</h1> <button id="view-journal-btn-mobile" class="text-sm md:hidden bg-[var(--btn-accent-bg)] hover:bg-[var(--btn-accent-hover)] text-[var(--btn-accent-text)] font-bold py-2 px-4 rounded-lg"${attr("title", store_get($$store_subs ??= {}, "$_", $format)("app.journalButtonTitle"))}>${escape_html(store_get($$store_subs ??= {}, "$_", $format)("app.journalButton"))}</button></div> <div class="flex items-center flex-wrap justify-end gap-2 w-full md:w-auto"><div class="flex items-center flex-wrap justify-end gap-2 md:order-1"><select id="preset-loader" class="input-field px-3 py-2 rounded-md text-sm">`);
    $$payload2.select_value = currentAppState.selectedPreset;
    $$payload2.out.push(`<option value=""${maybe_selected($$payload2, "")}>${escape_html(store_get($$store_subs ??= {}, "$_", $format)("dashboard.presetLoad"))}</option><!--[-->`);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let presetName = each_array[$$index];
      $$payload2.out.push(`<option${attr("value", presetName)}${maybe_selected($$payload2, presetName)}>${escape_html(presetName)}</option>`);
    }
    $$payload2.out.push(`<!--]-->`);
    $$payload2.select_value = void 0;
    $$payload2.out.push(`</select> <button id="save-preset-btn" class="text-sm bg-[var(--btn-default-bg)] hover:bg-[var(--btn-default-hover-bg)] text-[var(--btn-default-text)] font-bold py-2.5 px-2.5 rounded-lg"${attr("title", store_get($$store_subs ??= {}, "$_", $format)("dashboard.savePresetTitle"))}${attr("aria-label", store_get($$store_subs ??= {}, "$_", $format)("dashboard.savePresetAriaLabel"))}>${html(icons.save)}</button> <button id="delete-preset-btn" class="text-sm bg-[var(--btn-danger-bg)] hover:bg-[var(--btn-danger-hover-bg)] text-[var(--btn-danger-text)] font-bold py-2.5 px-2.5 rounded-lg disabled:cursor-not-allowed"${attr("title", store_get($$store_subs ??= {}, "$_", $format)("dashboard.deletePresetTitle"))}${attr("disabled", !currentAppState.selectedPreset, true)}>${html(icons.delete)}</button> <button id="reset-btn" class="text-sm bg-[var(--btn-default-bg)] hover:bg-[var(--btn-default-hover-bg)] text-[var(--btn-default-text)] font-bold py-2.5 px-2.5 rounded-lg flex items-center gap-2"${attr("title", store_get($$store_subs ??= {}, "$_", $format)("dashboard.resetButtonTitle"))}>${html(icons.broom)}</button> <button id="theme-switcher" class="text-sm bg-[var(--btn-default-bg)] hover:bg-[var(--btn-default-hover-bg)] text-[var(--btn-default-text)] font-bold py-2 px-2.5 rounded-lg"${attr("aria-label", store_get($$store_subs ??= {}, "$_", $format)("dashboard.themeSwitcherAriaLabel"))}${attr("title", themeTitle)}>${html(themeIcons[store_get($$store_subs ??= {}, "$uiStore", uiStore).currentTheme])}</button></div> <button id="view-journal-btn-desktop" class="hidden md:inline-block text-sm bg-[var(--btn-accent-bg)] hover:bg-[var(--btn-accent-hover)] text-[var(--btn-accent-text)] font-bold py-2 px-4 rounded-lg md:order-2"${attr("title", store_get($$store_subs ??= {}, "$_", $format)("app.journalButtonTitle"))}>${escape_html(store_get($$store_subs ??= {}, "$_", $format)("app.journalButton"))}</button></div></div> <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4"><div>`);
    GeneralInputs($$payload2, {
      get tradeType() {
        return currentAppState.tradeType;
      },
      set tradeType($$value) {
        currentAppState.tradeType = $$value;
        $$settled = false;
      },
      get leverage() {
        return currentAppState.leverage;
      },
      set leverage($$value) {
        currentAppState.leverage = $$value;
        $$settled = false;
      },
      get fees() {
        return currentAppState.fees;
      },
      set fees($$value) {
        currentAppState.fees = $$value;
        $$settled = false;
      }
    });
    $$payload2.out.push(`<!----> `);
    PortfolioInputs($$payload2, {
      get accountSize() {
        return currentAppState.accountSize;
      },
      set accountSize($$value) {
        currentAppState.accountSize = $$value;
        $$settled = false;
      },
      get riskPercentage() {
        return currentAppState.riskPercentage;
      },
      set riskPercentage($$value) {
        currentAppState.riskPercentage = $$value;
        $$settled = false;
      }
    });
    $$payload2.out.push(`<!----></div> `);
    TradeSetupInputs($$payload2, {
      atrFormulaDisplay: currentAppState.atrFormulaText,
      showAtrFormulaDisplay: currentAppState.showAtrFormulaDisplay,
      isPriceFetching: currentAppState.isPriceFetching,
      symbolSuggestions: currentAppState.symbolSuggestions,
      showSymbolSuggestions: currentAppState.showSymbolSuggestions,
      get symbol() {
        return currentAppState.symbol;
      },
      set symbol($$value) {
        currentAppState.symbol = $$value;
        $$settled = false;
      },
      get entryPrice() {
        return currentAppState.entryPrice;
      },
      set entryPrice($$value) {
        currentAppState.entryPrice = $$value;
        $$settled = false;
      },
      get useAtrSl() {
        return currentAppState.useAtrSl;
      },
      set useAtrSl($$value) {
        currentAppState.useAtrSl = $$value;
        $$settled = false;
      },
      get atrValue() {
        return currentAppState.atrValue;
      },
      set atrValue($$value) {
        currentAppState.atrValue = $$value;
        $$settled = false;
      },
      get atrMultiplier() {
        return currentAppState.atrMultiplier;
      },
      set atrMultiplier($$value) {
        currentAppState.atrMultiplier = $$value;
        $$settled = false;
      },
      get stopLossPrice() {
        return currentAppState.stopLossPrice;
      },
      set stopLossPrice($$value) {
        currentAppState.stopLossPrice = $$value;
        $$settled = false;
      }
    });
    $$payload2.out.push(`<!----></div> `);
    TakeProfitTargets($$payload2, {
      calculatedTpDetails: currentAppState.calculatedTpDetails,
      get targets() {
        return currentAppState.targets;
      },
      set targets($$value) {
        currentAppState.targets = $$value;
        $$settled = false;
      }
    });
    $$payload2.out.push(`<!----> `);
    if (store_get($$store_subs ??= {}, "$uiStore", uiStore).showErrorMessage) {
      $$payload2.out.push("<!--[-->");
      $$payload2.out.push(`<div id="error-message" class="text-[var(--danger-color)] text-center text-sm font-medium mt-4 md:col-span-2">${escape_html(store_get($$store_subs ??= {}, "$_", $format)(store_get($$store_subs ??= {}, "$uiStore", uiStore).errorMessage))}</div>`);
    } else {
      $$payload2.out.push("<!--[!-->");
    }
    $$payload2.out.push(`<!--]--> <section id="results" class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-8"><div>`);
    SummaryResults($$payload2, {
      isPositionSizeLocked: currentAppState.isPositionSizeLocked,
      showCopyFeedback: store_get($$store_subs ??= {}, "$uiStore", uiStore).showCopyFeedback,
      positionSize: currentAppState.positionSize,
      netLoss: currentAppState.netLoss,
      requiredMargin: currentAppState.requiredMargin,
      liquidationPrice: currentAppState.liquidationPrice,
      breakEvenPrice: currentAppState.breakEvenPrice
    });
    $$payload2.out.push(`<!----> `);
    if (currentAppState.showTotalMetricsGroup) {
      $$payload2.out.push("<!--[-->");
      $$payload2.out.push(`<div id="total-metrics-group" class="result-group"><h2 class="section-header">${escape_html(store_get($$store_subs ??= {}, "$_", $format)("dashboard.totalTradeMetrics"))}<div class="tooltip"><div class="tooltip-icon">?</div><span class="tooltiptext">${escape_html(store_get($$store_subs ??= {}, "$_", $format)("dashboard.totalTradeMetricsTooltip"))}</span></div></h2> <div class="result-item"><span class="result-label">${escape_html(store_get($$store_subs ??= {}, "$_", $format)("dashboard.riskPerTradeCurrency"))}<div class="tooltip"><div class="tooltip-icon">?</div><span class="tooltiptext">${escape_html(store_get($$store_subs ??= {}, "$_", $format)("dashboard.riskPerTradeCurrencyTooltip"))}</span></div></span><span id="riskAmountCurrency" class="result-value text-[var(--danger-color)]">${escape_html(currentAppState.riskAmountCurrency)}</span></div> <div class="result-item"><span class="result-label">${escape_html(store_get($$store_subs ??= {}, "$_", $format)("dashboard.totalFees"))}<div class="tooltip"><div class="tooltip-icon">?</div><span class="tooltiptext">${escape_html(store_get($$store_subs ??= {}, "$_", $format)("dashboard.totalFeesTooltip"))}</span></div></span><span id="totalFees" class="result-value">${escape_html(currentAppState.totalFees)}</span></div> <div class="result-item"><span class="result-label">${escape_html(store_get($$store_subs ??= {}, "$_", $format)("dashboard.maxPotentialProfit"))}<div class="tooltip"><div class="tooltip-icon">?</div><span class="tooltiptext">${escape_html(store_get($$store_subs ??= {}, "$_", $format)("dashboard.maxPotentialProfitTooltip"))}</span></div></span><span id="maxPotentialProfit" class="result-value text-green-400">${escape_html(currentAppState.maxPotentialProfit)}</span></div> <div class="result-item"><span class="result-label">${escape_html(store_get($$store_subs ??= {}, "$_", $format)("dashboard.weightedRR"))}<div class="tooltip"><div class="tooltip-icon">?</div><span class="tooltiptext">${escape_html(store_get($$store_subs ??= {}, "$_", $format)("dashboard.weightedRRTooltip"))}</span></div></span><span id="totalRR" class="result-value">${escape_html(currentAppState.totalRR)}</span></div> <div class="result-item"><span class="result-label">${escape_html(store_get($$store_subs ??= {}, "$_", $format)("dashboard.totalNetProfit"))}<div class="tooltip"><div class="tooltip-icon">?</div><span class="tooltiptext">${escape_html(store_get($$store_subs ??= {}, "$_", $format)("dashboard.totalNetProfitTooltip"))}</span></div></span><span id="totalNetProfit" class="result-value text-green-400">${escape_html(currentAppState.totalNetProfit)}</span></div> <div class="result-item"><span class="result-label">${escape_html(store_get($$store_subs ??= {}, "$_", $format)("dashboard.soldPosition"))}<div class="tooltip"><div class="tooltip-icon">?</div><span class="tooltiptext">${escape_html(store_get($$store_subs ??= {}, "$_", $format)("dashboard.soldPositionTooltip"))}</span></div></span><span id="totalPercentSold" class="result-value">${escape_html(currentAppState.totalPercentSold)}</span></div></div>`);
    } else {
      $$payload2.out.push("<!--[!-->");
    }
    $$payload2.out.push(`<!--]--></div> <div id="tp-results-container"><!--[-->`);
    for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
      let tpDetail = each_array_1[$$index_1];
      $$payload2.out.push(`<div class="result-group !mt-0 md:!mt-6"><h2 class="section-header">${escape_html(store_get($$store_subs ??= {}, "$_", $format)("dashboard.takeProfit"))} ${escape_html(tpDetail.index + 1)} (${escape_html(tpDetail.percentSold.toFixed(0))}%)</h2> <div class="result-item"><span class="result-label">Risk/Reward Ratio</span><span${attr_class(`result-value ${stringify(tpDetail.riskRewardRatio.gte(2) ? "text-green-400" : tpDetail.riskRewardRatio.gte(1.5) ? "text-yellow-400" : "text-red-400")}`)}>${escape_html(tpDetail.riskRewardRatio.toFixed(2))}</span></div> <div class="result-item"><span class="result-label">${escape_html(store_get($$store_subs ??= {}, "$_", $format)("dashboard.netProfit"))}<div class="tooltip"><div class="tooltip-icon">?</div><span class="tooltiptext">${escape_html(store_get($$store_subs ??= {}, "$_", $format)("dashboard.netProfitTooltip"))}</span></div></span><span class="result-value text-green-400">+${escape_html(tpDetail.netProfit.toFixed(2))}</span></div> <div class="result-item"><span class="result-label">${escape_html(store_get($$store_subs ??= {}, "$_", $format)("dashboard.priceChange"))}<div class="tooltip"><div class="tooltip-icon">?</div><span class="tooltiptext">${escape_html(store_get($$store_subs ??= {}, "$_", $format)("dashboard.priceChangeTooltip"))}</span></div></span><span${attr_class(`result-value ${stringify(tpDetail.priceChangePercent.gt(0) ? "text-green-400" : tpDetail.priceChangePercent.lt(0) ? "text-red-400" : "")}`)}>${escape_html(tpDetail.priceChangePercent.toFixed(2))}%</span></div> <div class="result-item"><span class="result-label">${escape_html(store_get($$store_subs ??= {}, "$_", $format)("dashboard.returnOnCapital"))}<div class="tooltip"><div class="tooltip-icon">?</div><span class="tooltiptext">${escape_html(store_get($$store_subs ??= {}, "$_", $format)("dashboard.returnOnCapitalTooltip"))}</span></div></span><span${attr_class(`result-value ${stringify(tpDetail.returnOnCapital.gt(0) ? "text-green-400" : tpDetail.returnOnCapital.lt(0) ? "text-red-400" : "")}`)}>${escape_html(tpDetail.returnOnCapital.toFixed(2))}%</span></div> <div class="result-item"><span class="result-label">${escape_html(store_get($$store_subs ??= {}, "$_", $format)("dashboard.partialVolume"))}<div class="tooltip"><div class="tooltip-icon">?</div><span class="tooltiptext">${escape_html(store_get($$store_subs ??= {}, "$_", $format)("dashboard.partialVolumeTooltip"))}</span></div></span><span class="result-value">${escape_html(tpDetail.partialVolume.toFixed(4))}</span></div></div>`);
    }
    $$payload2.out.push(`<!--]--></div> `);
    VisualBar($$payload2, {
      entryPrice: currentAppState.entryPrice,
      stopLossPrice: currentAppState.stopLossPrice,
      tradeType: currentAppState.tradeType,
      targets: currentAppState.targets,
      calculatedTpDetails: currentAppState.calculatedTpDetails
    });
    $$payload2.out.push(`<!----> <footer class="md:col-span-2"><textarea id="tradeNotes" class="input-field w-full px-4 py-2 rounded-md mb-4" rows="2"${attr("placeholder", store_get($$store_subs ??= {}, "$_", $format)("dashboard.tradeNotesPlaceholder"))}>`);
    const $$body = escape_html(currentAppState.tradeNotes);
    if ($$body) {
      $$payload2.out.push(`${$$body}`);
    }
    $$payload2.out.push(`</textarea> <div class="flex items-center gap-4"><button id="save-journal-btn" class="w-full font-bold py-3 px-4 rounded-lg btn-primary-action"${attr("disabled", currentAppState.positionSize === "-", true)}>${escape_html(store_get($$store_subs ??= {}, "$_", $format)("dashboard.addTradeToJournal"))}</button> <button id="show-dashboard-readme-btn" class="font-bold p-3 rounded-lg btn-secondary-action"${attr("title", store_get($$store_subs ??= {}, "$_", $format)("dashboard.showInstructionsTitle"))}${attr("aria-label", store_get($$store_subs ??= {}, "$_", $format)("dashboard.showInstructionsAriaLabel"))}>${html(icons.book)}</button> `);
    if (store_get($$store_subs ??= {}, "$uiStore", uiStore).showSaveFeedback) {
      $$payload2.out.push("<!--[-->");
      $$payload2.out.push(`<span id="save-feedback"${attr_class("save-feedback", void 0, {
        "visible": store_get($$store_subs ??= {}, "$uiStore", uiStore).showSaveFeedback
      })}>${escape_html(store_get($$store_subs ??= {}, "$_", $format)("dashboard.savedFeedback"))}</span>`);
    } else {
      $$payload2.out.push("<!--[!-->");
    }
    $$payload2.out.push(`<!--]--></div> <div class="mt-4">`);
    LanguageSwitcher($$payload2);
    $$payload2.out.push(`<!----></div></footer></section></main> <footer class="w-full max-w-4xl mx-auto text-center py-4 text-sm text-gray-500">Version 0.92b - <button class="text-link">Changelog</button></footer> <div id="journal-modal"${attr_class("modal-overlay", void 0, {
      "visible": store_get($$store_subs ??= {}, "$uiStore", uiStore).showJournalModal,
      "opacity-100": store_get($$store_subs ??= {}, "$uiStore", uiStore).showJournalModal
    })}><div class="modal-content w-full h-full max-w-6xl"><div class="flex justify-between items-center mb-4"><h2 class="text-2xl font-bold">${escape_html(store_get($$store_subs ??= {}, "$_", $format)("journal.title"))}</h2><button id="close-journal-btn" class="text-3xl"${attr("aria-label", store_get($$store_subs ??= {}, "$_", $format)("journal.closeJournalAriaLabel"))}>×</button></div> <div id="journal-stats" class="journal-stats"></div> <div class="flex gap-4 my-4"><input type="text" id="journal-search" class="input-field w-full px-3 py-2 rounded-md"${attr("placeholder", store_get($$store_subs ??= {}, "$_", $format)("journal.searchSymbolPlaceholder"))}${attr("value", currentAppState.journalSearchQuery)}/><select id="journal-filter" class="input-field px-3 py-2 rounded-md">`);
    $$payload2.select_value = currentAppState.journalFilterStatus;
    $$payload2.out.push(`<option value="all"${maybe_selected($$payload2, "all")}>${escape_html(store_get($$store_subs ??= {}, "$_", $format)("journal.filterAll"))}</option><option value="Open"${maybe_selected($$payload2, "Open")}>${escape_html(store_get($$store_subs ??= {}, "$_", $format)("journal.filterOpen"))}</option><option value="Won"${maybe_selected($$payload2, "Won")}>${escape_html(store_get($$store_subs ??= {}, "$_", $format)("journal.filterWon"))}</option><option value="Lost"${maybe_selected($$payload2, "Lost")}>${escape_html(store_get($$store_subs ??= {}, "$_", $format)("journal.filterLost"))}</option>`);
    $$payload2.select_value = void 0;
    $$payload2.out.push(`</select></div> <div class="max-h-[calc(100vh-20rem)] overflow-auto"><table class="journal-table"><thead><tr><th>${escape_html(store_get($$store_subs ??= {}, "$_", $format)("journal.date"))}</th><th>${escape_html(store_get($$store_subs ??= {}, "$_", $format)("journal.symbol"))}</th><th>${escape_html(store_get($$store_subs ??= {}, "$_", $format)("journal.type"))}</th><th>${escape_html(store_get($$store_subs ??= {}, "$_", $format)("journal.entry"))}</th><th>${escape_html(store_get($$store_subs ??= {}, "$_", $format)("journal.sl"))}</th><th>${escape_html(store_get($$store_subs ??= {}, "$_", $format)("journal.rr"))}</th><th>${escape_html(store_get($$store_subs ??= {}, "$_", $format)("journal.status"))}</th><th>${escape_html(store_get($$store_subs ??= {}, "$_", $format)("journal.notes"))}</th><th>${escape_html(store_get($$store_subs ??= {}, "$_", $format)("journal.action"))}</th></tr></thead><tbody><!--[-->`);
    for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
      let trade = each_array_2[$$index_2];
      $$payload2.out.push(`<tr><td>${escape_html(new Date(trade.date).toLocaleString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      }))}</td><td>${escape_html(trade.symbol || "-")}</td><td${attr_class(trade.tradeType === CONSTANTS.TRADE_TYPE_LONG ? "text-green-400" : "text-red-400")}>${escape_html(trade.tradeType.charAt(0).toUpperCase() + trade.tradeType.slice(1))}</td><td>${escape_html(trade.entryPrice.toFixed(4))}</td><td>${escape_html(trade.stopLossPrice.toFixed(4))}</td><td${attr_class(trade.totalRR.gte(2) ? "text-green-400" : trade.totalRR.gte(1.5) ? "text-yellow-400" : "text-red-400")}>${escape_html(trade.totalRR.toFixed(2))}</td><td><select class="status-select input-field p-1"${attr("data-id", trade.id)}><option value="Open"${maybe_selected($$payload2, "Open")}${attr("selected", trade.status === "Open", true)}>${escape_html(store_get($$store_subs ??= {}, "$_", $format)("journal.filterOpen"))}</option><option value="Won"${maybe_selected($$payload2, "Won")}${attr("selected", trade.status === "Won", true)}>${escape_html(store_get($$store_subs ??= {}, "$_", $format)("journal.filterWon"))}</option><option value="Lost"${maybe_selected($$payload2, "Lost")}${attr("selected", trade.status === "Lost", true)}>${escape_html(store_get($$store_subs ??= {}, "$_", $format)("journal.filterLost"))}</option></select></td><td class="notes-cell"${attr("title", store_get($$store_subs ??= {}, "$_", $format)("journal.clickToExpand"))}>${escape_html(trade.notes || "")}</td><td class="text-center"><button class="delete-trade-btn text-red-500 hover:text-red-400 p-1 rounded-full"${attr("data-id", trade.id)}${attr("title", store_get($$store_subs ??= {}, "$_", $format)("journal.delete"))}>${html(icons.delete)}</button></td></tr>`);
    }
    $$payload2.out.push(`<!--]-->`);
    if (store_get($$store_subs ??= {}, "$journalStore", journalStore).filter((trade) => trade.symbol.toLowerCase().includes(currentAppState.journalSearchQuery.toLowerCase()) && (currentAppState.journalFilterStatus === "all" || trade.status === currentAppState.journalFilterStatus)).length === 0) {
      $$payload2.out.push("<!--[-->");
      $$payload2.out.push(`<tr><td colspan="9" class="text-center text-slate-500 py-8">${escape_html(store_get($$store_subs ??= {}, "$_", $format)("journal.noTradesYet"))}</td></tr>`);
    } else {
      $$payload2.out.push("<!--[!-->");
    }
    $$payload2.out.push(`<!--]--></tbody></table></div> <h3 class="text-xl font-bold mt-6 mb-4">${escape_html(store_get($$store_subs ??= {}, "$_", $format)("journal.performancePerSymbol"))}</h3> <div id="symbol-performance-stats" class="max-h-48 overflow-y-auto border border-[var(--border-color)] rounded-md p-2"><table class="journal-table w-full"><thead><tr><th>${escape_html(store_get($$store_subs ??= {}, "$_", $format)("journal.symbol"))}</th><th>${escape_html(store_get($$store_subs ??= {}, "$_", $format)("journal.trades"))}</th><th>${escape_html(store_get($$store_subs ??= {}, "$_", $format)("journal.profitPercent"))}</th><th>${escape_html(store_get($$store_subs ??= {}, "$_", $format)("journal.totalPL"))}</th></tr></thead><tbody id="symbol-performance-table-body"><!--[-->`);
    for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
      let [symbol, data] = each_array_3[$$index_3];
      $$payload2.out.push(`<tr><td>${escape_html(symbol)}</td><td>${escape_html(data.totalTrades)}</td><td>${escape_html((data.totalTrades > 0 ? data.wonTrades / data.totalTrades * 100 : 0).toFixed(1))}%</td><td${attr_class(data.totalProfitLoss.gt(0) ? "text-green-400" : data.totalProfitLoss.lt(0) ? "text-red-400" : "")}>${escape_html(data.totalProfitLoss.toFixed(2))}</td></tr>`);
    }
    $$payload2.out.push(`<!--]-->`);
    if (Object.keys(app.calculator.calculateSymbolPerformance(store_get($$store_subs ??= {}, "$journalStore", journalStore))).length === 0) {
      $$payload2.out.push("<!--[-->");
      $$payload2.out.push(`<tr><td colspan="4" class="text-center text-slate-500 py-4">${escape_html(store_get($$store_subs ??= {}, "$_", $format)("journal.noData"))}</td></tr>`);
    } else {
      $$payload2.out.push("<!--[!-->");
    }
    $$payload2.out.push(`<!--]--></tbody></table></div> <div class="flex items-center gap-4 mt-4"><button id="export-csv-btn" class="bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"${attr("title", store_get($$store_subs ??= {}, "$_", $format)("journal.exportCsvTitle"))}>${html(icons.export)}<span>${escape_html(store_get($$store_subs ??= {}, "$_", $format)("journal.export"))}</span></button> <input type="file" id="import-csv-input" accept=".csv" class="hidden"/> <button id="import-csv-btn" class="bg-blue-700 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">${html(icons.import)}<span>${escape_html(store_get($$store_subs ??= {}, "$_", $format)("journal.import"))}</span></button> <button id="clear-journal-btn" class="bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"${attr("title", store_get($$store_subs ??= {}, "$_", $format)("journal.clearJournalTitle"))}>${html(icons.delete)}<span>${escape_html(store_get($$store_subs ??= {}, "$_", $format)("journal.clearAll"))}</span></button> <button id="show-journal-readme-btn" class="bg-slate-600 hover:bg-slate-500 text-white font-bold p-2.5 rounded-lg"${attr("title", store_get($$store_subs ??= {}, "$_", $format)("journal.showJournalInstructionsTitle"))}${attr("aria-label", store_get($$store_subs ??= {}, "$_", $format)("journal.showJournalInstructionsAriaLabel"))}>${html(icons.book)}</button></div></div></div> `);
    CustomModal($$payload2);
    $$payload2.out.push(`<!----> <div id="changelog-modal"${attr_class("modal-overlay", void 0, {
      "visible": store_get($$store_subs ??= {}, "$uiStore", uiStore).showChangelogModal,
      "opacity-100": store_get($$store_subs ??= {}, "$uiStore", uiStore).showChangelogModal
    })}><div class="modal-content w-full h-full max-w-6xl"><div class="flex justify-between items-center mb-4"><h2 class="text-2xl font-bold">${escape_html(store_get($$store_subs ??= {}, "$_", $format)("app.changelogTitle"))}</h2> <button id="close-changelog-btn" class="text-3xl"${attr("aria-label", store_get($$store_subs ??= {}, "$_", $format)("app.closeChangelogAriaLabel"))}>×</button></div> <div id="changelog-content" class="prose dark:prose-invert max-h-[calc(100vh-10rem)] overflow-y-auto">${html(changelogContent)}</div></div></div>`);
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
export {
  _page as default
};
