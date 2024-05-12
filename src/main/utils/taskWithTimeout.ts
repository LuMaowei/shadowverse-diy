import { explodePromise } from './explodePromise';
import Logging from './LogForRenderer';
import toLogFormat from './errors';

export const SECOND = 1000;
const MINUTE = SECOND * 60;
const log = Logging().getLogger();

type TaskType = {
  id: string;
  startedAt: number | undefined;
  suspend(): void;
  resume(): void;
};

const tasks = new Set<TaskType>();
let shouldStartTimers = true;

export function suspendTasksWithTimeout(): void {
  shouldStartTimers = false;
  // eslint-disable-next-line no-restricted-syntax
  for (const task of tasks) {
    task.suspend();
  }
}

export function resumeTasksWithTimeout(): void {
  log.info(`TaskWithTimeout: resuming ${tasks.size} tasks`);
  shouldStartTimers = true;
  // eslint-disable-next-line no-restricted-syntax
  for (const task of tasks) {
    task.resume();
  }
}

export function reportLongRunningTasks(): void {
  const now = Date.now();
  // eslint-disable-next-line no-restricted-syntax
  for (const task of tasks) {
    if (task.startedAt === undefined) {
      // eslint-disable-next-line no-continue
      continue;
    }

    const duration = Math.max(0, now - task.startedAt);
    if (duration > MINUTE) {
      log.warn(
        `TaskWithTimeout: ${task.id} has been running for ${duration}ms`,
      );
    }
  }
}

export default function createTaskWithTimeout<T, Args extends Array<unknown>>(
  task: (...args: Args) => Promise<T>,
  id: string,
  options: { timeout?: number } = {},
): (...args: Args) => Promise<T> {
  const timeout = options.timeout || 30 * MINUTE;

  const timeoutError = new Error(`${id || ''} task did not complete in time.`);

  return async (...args: Args) => {
    let complete = false;
    // eslint-disable-next-line no-undef
    let timer: NodeJS.Timeout | undefined;

    const { promise: timerPromise, reject } = explodePromise<never>();

    const startTimer = () => {
      // eslint-disable-next-line no-use-before-define
      stopTimer();

      if (complete) {
        return;
      }

      // eslint-disable-next-line no-use-before-define
      entry.startedAt = Date.now();
      timer = setTimeout(() => {
        if (complete) {
          log.warn(
            `TaskWithTimeout: ${id} task timed out, but was already complete`,
          );
          return;
        }
        complete = true;
        // eslint-disable-next-line no-use-before-define
        tasks.delete(entry);
        log.error(toLogFormat(timeoutError));
        reject(timeoutError);
      }, timeout);
    };

    const stopTimer = () => {
      // eslint-disable-next-line no-unused-expressions
      timer && clearTimeout(timer);
      timer = undefined;
    };

    const entry: TaskType = {
      id,
      startedAt: undefined,
      suspend: () => {
        log.warn(`TaskWithTimeout: ${id} task suspended`);
        stopTimer();
      },
      resume: () => {
        log.warn(`TaskWithTimeout: ${id} task resumed`);
        startTimer();
      },
    };

    tasks.add(entry);
    if (shouldStartTimers) startTimer();

    let result: unknown;

    const run = async (): Promise<void> => {
      result = await task(...args);
    };

    try {
      await Promise.race([run(), timerPromise]);

      return result as T;
    } finally {
      complete = true;
      tasks.delete(entry);
      stopTimer();
    }
  };
}
