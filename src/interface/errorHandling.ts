import { EventsParseError } from './report/hooks/useEventParser';

export type ErrorSource = 'componentDidCatch' | 'router' | 'window-error' | 'unhandledrejection';
export type ErrorSeverity = 'fatal' | 'nonFatal';

interface ErrorLike {
  message?: unknown;
  stack?: unknown;
  name?: unknown;
  filename?: unknown;
  fatal?: unknown;
  severity?: unknown;
  status?: unknown;
  statusText?: unknown;
}

export interface ClassifiedUiError {
  error: Error;
  severity: ErrorSeverity;
  source: ErrorSource;
  message: string;
  stack?: string;
  fingerprint: string;
}

const UNKNOWN_ERROR_MESSAGE = 'An unknown error occurred.';

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const safeStringify = (value: unknown) => {
  try {
    return JSON.stringify(value);
  } catch {
    return undefined;
  }
};

const getObjectErrorMessage = (value: Record<string, unknown>) => {
  if (typeof value.message === 'string' && value.message.trim()) {
    return value.message;
  }

  if (typeof value.status === 'number') {
    const suffix =
      typeof value.statusText === 'string' && value.statusText.trim() ? ` ${value.statusText}` : '';
    return `Request failed with status ${value.status}${suffix}.`;
  }

  const serialized = safeStringify(value);
  if (serialized && serialized !== '{}') {
    return `Unexpected error payload: ${serialized}`;
  }

  return UNKNOWN_ERROR_MESSAGE;
};

export const normalizeThrownError = (thrown: unknown): Error => {
  if (thrown instanceof Error) {
    return thrown;
  }

  if (typeof thrown === 'string') {
    return new Error(thrown);
  }

  if (isObject(thrown)) {
    const errorLike = thrown as ErrorLike;
    const error = new Error(getObjectErrorMessage(thrown));
    if (typeof errorLike.name === 'string' && errorLike.name.trim()) {
      error.name = errorLike.name;
    }
    if (typeof errorLike.stack === 'string' && errorLike.stack.trim()) {
      error.stack = errorLike.stack;
    }
    if (typeof errorLike.filename === 'string' && errorLike.filename.trim()) {
      (error as Error & { filename?: string }).filename = errorLike.filename;
    }
    return error;
  }

  return new Error(UNKNOWN_ERROR_MESSAGE);
};

const getErrorFingerprint = (error: Error, source: ErrorSource) => {
  const firstStackLine = error.stack?.split('\n')[1]?.trim() ?? '';
  return `${source}:${error.name}:${error.message}:${firstStackLine}`;
};

const hasCrossOriginStack = (stack: string) => {
  const paths = stack
    .split('\n')
    // The first line may point to the page the error occurred on rather than
    // the script that caused it, so ignore that to avoid false positives.
    .splice(1)
    .map((line) => line.match(/(https?:\/\/[^/]+)\//))
    .filter((line): line is RegExpMatchArray => Boolean(line));

  if (paths.length === 0) {
    return false;
  }

  return paths.some((path) => path[1] !== window.location.origin);
};

const shouldIgnoreGlobalError = (error: Error) => {
  if (error.message === 'Script error.') {
    return true;
  }

  if (!error.stack) {
    return false;
  }

  return hasCrossOriginStack(error.stack);
};

const isExplicitlyFatalError = (thrown: unknown) => {
  if (!isObject(thrown)) {
    return false;
  }

  return thrown.fatal === true || thrown.severity === 'fatal';
};

const getErrorSeverity = (error: Error, thrown: unknown, source: ErrorSource): ErrorSeverity => {
  if (error instanceof EventsParseError || isExplicitlyFatalError(thrown)) {
    return 'fatal';
  }

  switch (source) {
    case 'componentDidCatch':
    case 'router':
      return 'fatal';
    case 'window-error':
    case 'unhandledrejection':
      return 'nonFatal';
  }
};

export const classifyUiError = (thrown: unknown, source: ErrorSource): ClassifiedUiError | null => {
  const error = normalizeThrownError(thrown);

  if (
    (source === 'window-error' || source === 'unhandledrejection') &&
    shouldIgnoreGlobalError(error)
  ) {
    return null;
  }

  return {
    error,
    severity: getErrorSeverity(error, thrown, source),
    source,
    message: error.message || UNKNOWN_ERROR_MESSAGE,
    stack: error.stack,
    fingerprint: getErrorFingerprint(error, source),
  };
};
