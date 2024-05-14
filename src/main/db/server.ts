import { join } from 'path';
import { ensureDirSync, removeSync } from 'fs-extra';
import type { Database, Statement } from 'better-sqlite3';
import SQL from 'better-sqlite3';
import { isString } from 'lodash';
import type { LogFunctions } from 'electron-log';
import updateSchema from './migrations';
import consoleLogger from '../utils/consoleLogger';
import { getSchemaVersion, getUserVersion, setUserVersion } from './util';
import type { ServerInterface } from './types';

let globalInstance: Database | undefined;
let logger = consoleLogger;
let databaseFilePath: string | undefined;

type DatabaseQueryCache = Map<string, Statement<Array<unknown>>>;

const statementCache = new WeakMap<Database, DatabaseQueryCache>();

// 创建并缓存预编译的sql语句
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function prepare<T extends unknown[] | {}>(
  db: Database,
  query: string,
): Statement<T> {
  let dbCache = statementCache.get(db);
  if (!dbCache) {
    dbCache = new Map();
    statementCache.set(db, dbCache);
  }

  let result = dbCache.get(query) as Statement<T>;
  if (!result) {
    result = db.prepare<T>(query);
    dbCache.set(query, result);
  }

  return result;
}

function switchToWAL(db: Database): void {
  // https://sqlite.org/wal.html
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = FULL');
  db.pragma('fullfsync = ON');
}

function migrateSchemaVersion(db: Database) {
  const userVersion = getUserVersion(db);

  if (userVersion > 0) return;

  const schemaVersion = getSchemaVersion(db);
  const newUserVersion = schemaVersion;
  logger.info(
    'migrateSchemaVersion: Migrating from schema_version ' +
      `${schemaVersion} to user_version ${newUserVersion}`,
  );

  setUserVersion(db, newUserVersion);
}

function openAndMigrateDatabase(filePath: string) {
  let db: Database | undefined;

  try {
    db = new SQL(filePath);
    switchToWAL(db);
    migrateSchemaVersion(db);
    db.pragma('foreign_keys = ON');
    return db;
  } catch (error) {
    logger.error(error);
    if (db) db.close();

    logger.info('migrateDatabase: Migration without cipher change failed');
    throw new Error('migrateDatabase: Migration without cipher change failed');
  }
}

async function initialize({
  configDir,
  logger: suppliedLogger,
}: {
  configDir: string;
  logger: Omit<LogFunctions, 'log'>;
}): Promise<void> {
  if (globalInstance) throw new Error('Cannot initialize more than once!');

  if (!isString(configDir))
    throw new Error('initialize: configDir is required!');

  logger = suppliedLogger;

  const dbDir = join(configDir, 'db');
  // https://github.com/isaacs/node-mkdirp#methods
  ensureDirSync(dbDir, { mode: 0o777 });

  databaseFilePath = join(dbDir, 'db.sqlite');

  logger.info(databaseFilePath);

  let db: Database | undefined;

  try {
    db = openAndMigrateDatabase(databaseFilePath);

    updateSchema(db, logger);

    globalInstance = db;
  } catch (error) {
    // @ts-ignore
    logger.error('Database startup error:', error.stack);

    if (db) db.close();

    throw error;
  }
}

// 关闭数据库
async function close(): Promise<void> {
  // SQLLite documentation suggests that we run `PRAGMA optimize` right
  // before closing the database connection.
  globalInstance?.pragma('optimize');

  globalInstance?.close();

  globalInstance = undefined;
}

// 关闭并清空数据库文件
async function removeDB(): Promise<void> {
  if (globalInstance) {
    try {
      globalInstance.close();
    } catch (error) {
      // @ts-ignore
      logger.error('removeDB: Failed to close database:', error.stack);
    }
    globalInstance = undefined;
  }

  if (!databaseFilePath)
    throw new Error(
      'removeDB: Cannot erase database without a databaseFilePath!',
    );

  logger.warn('removeDB: Removing all database files');
  removeSync(databaseFilePath);
  removeSync(`${databaseFilePath}-shm`);
  removeSync(`${databaseFilePath}-wal`);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getInstance(): Database {
  if (!globalInstance) {
    throw new Error('getInstance: globalInstance not set!');
  }

  return globalInstance;
}

// 获取符合antd-pro-table分页化数据结构的数据
async function getPagedData({
  current,
  pageSize,
  getRows,
  getCount,
}: {
  current: number;
  pageSize: number;
  getRows: (limit: number, offset: number) => any[];
  getCount: () => number;
}) {
  const offset = (current - 1) * pageSize;
  const data = getRows(pageSize, offset);
  const total = getCount();

  return {
    success: true,
    total,
    data,
  };
}

/** ******************************* roles *********************************** */

// 获取职业分页列表
async function getRoles({
  name,
  label,
  current = 1,
  pageSize = 10,
}: {
  name?: string;
  label?: string;
  current?: number;
  pageSize?: number;
}): Promise<any> {
  const db = getInstance();

  let sql = `
    SELECT *
    FROM roles
    WHERE 1=1
  `;

  if (name) {
    sql += ` AND name = $name`;
  }

  if (label) {
    sql += ` AND label LIKE $label`;
  }

  return getPagedData({
    current,
    pageSize,
    getRows: (limit, offset) => {
      return db
        .prepare(`${sql} LIMIT ? OFFSET ?`)
        .all(limit, offset, { name, label });
    },
    getCount: () => {
      // @ts-ignore
      return db.prepare(`SELECT COUNT(*) FROM (${sql})`).get({ name, label })[
        'COUNT(*)'
      ];
    },
  });
}

// 新增、修改职业
function setRole({
  id,
  name,
  label,
  checkIcon,
  gem,
  emblem,
  cardBackground,
}: DB.Role): void {
  const db = getInstance();
  db.prepare(
    `
    INSERT OR REPLACE INTO roles (id, name, label, checkIcon, gem, emblem, cardBackground)
    VALUES ($id, $name, $label, $checkIcon, $gem, $emblem, $cardBackground)
  `,
  ).run({
    id,
    name,
    label,
    checkIcon,
    gem,
    emblem,
    cardBackground,
  });
}

// 删除职业
function deleteRole({ id }: { id?: number }) {
  const db = getInstance();
  db.prepare(
    `
    DELETE FROM roles
    WHERE id = $id
  `,
  ).run({ id });
}

/** ******************************* types *********************************** */

async function getTypes({
  name,
  label,
  current = 1,
  pageSize = 10,
}: {
  name?: string;
  label?: string;
  current?: number;
  pageSize?: number;
}): Promise<any> {
  const db = getInstance();

  let sql = `
    SELECT *
    FROM types
    WHERE 1=1
  `;

  if (name) {
    sql += ` AND name = $name`;
  }

  if (label) {
    sql += ` AND label LIKE $label`;
  }

  return getPagedData({
    current,
    pageSize,
    getRows: (limit, offset) => {
      return db
        .prepare(`${sql} LIMIT ? OFFSET ?`)
        .all(limit, offset, { name, label });
    },
    getCount: () => {
      // @ts-ignore
      return db.prepare(`SELECT COUNT(*) FROM (${sql})`).get({ name, label })[
        'COUNT(*)'
      ];
    },
  });
}

function setType({ id, name, label }: DB.Type): void {
  const db = getInstance();
  db.prepare(
    `
    INSERT OR REPLACE INTO types (id, name, label)
    VALUES ($id, $name, $label)
  `,
  ).run({
    id,
    name,
    label,
  });
}

function deleteType({ id }: { id?: number }) {
  const db = getInstance();
  db.prepare(
    `
    DELETE FROM types
    WHERE id = $id
  `,
  ).run({ id });
}

/** ******************************* rarities *********************************** */

async function getRarities({
  name,
  label,
  current = 1,
  pageSize = 10,
}: {
  name?: string;
  label?: string;
  current?: number;
  pageSize?: number;
}): Promise<any> {
  const db = getInstance();

  let sql = `
    SELECT *
    FROM rarities
    WHERE 1=1
  `;

  if (name) {
    sql += ` AND name = $name`;
  }

  if (label) {
    sql += ` AND label LIKE $label`;
  }

  return getPagedData({
    current,
    pageSize,
    getRows: (limit, offset) => {
      return db
        .prepare(`${sql} LIMIT ? OFFSET ?`)
        .all(limit, offset, { name, label });
    },
    getCount: () => {
      // @ts-ignore
      return db.prepare(`SELECT COUNT(*) FROM (${sql})`).get({ name, label })[
        'COUNT(*)'
      ];
    },
  });
}

function setRarity({ id, name, label }: DB.Type): void {
  const db = getInstance();
  db.prepare(
    `
    INSERT OR REPLACE INTO rarities (id, name, label)
    VALUES ($id, $name, $label)
  `,
  ).run({
    id,
    name,
    label,
  });
}

function deleteRarity({ id }: { id?: number }) {
  const db = getInstance();
  db.prepare(
    `
    DELETE FROM rarities
    WHERE id = $id
  `,
  ).run({ id });
}

const dataInterface: ServerInterface = {
  close,
  removeDB,
  initialize,
  getRoles,
  setRole,
  deleteRole,
  getTypes,
  setType,
  deleteType,
  getRarities,
  setRarity,
  deleteRarity,
};

export default dataInterface;
