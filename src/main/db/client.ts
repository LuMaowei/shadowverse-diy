import { get, has } from 'lodash';
import { doShutdown, ipcInvoke } from './channels';
import Logging from '../LogForRenderer';

import type { ClientInterface, ServerInterface } from './types';

const log = Logging().getLogger();

const channels: ServerInterface = new Proxy({} as ServerInterface, {
  get(_target, name) {
    return async (...args: ReadonlyArray<unknown>) =>
      ipcInvoke(String(name), args);
  },
});

async function shutdown(): Promise<void> {
  log.info('Client.shutdown');

  // Stop accepting new SQL jobs, flush outstanding queue
  await doShutdown();

  // Close database
  await channels.close();
}

const dataInterface: ClientInterface = new Proxy(
  {
    shutdown,
  } as ClientInterface,
  {
    get(target, name) {
      return async (...args: ReadonlyArray<unknown>) => {
        if (has(target, name)) {
          // @ts-ignore
          return get(target, name)(...args);
        }

        return get(channels, name)(...args);
      };
    },
  },
);

export default dataInterface;
