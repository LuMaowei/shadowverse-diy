import { join } from 'path';
import { ensureDirSync, removeSync } from 'fs-extra';
// @ts-ignore
import type { Database, Statement } from 'better-sqlite3';
// @ts-ignore
import SQL from 'better-sqlite3';
import { isString } from 'lodash';
import type { LogFunctions } from 'electron-log';
import { updateSchema } from './migrations';
import consoleLogger from '../utils/consoleLogger';
import { getSchemaVersion, getUserVersion, setUserVersion } from './util';
import type { ServerInterface } from './types';

let globalInstance: Database | undefined;
let logger = consoleLogger;
let databaseFilePath: string | undefined;

type DatabaseQueryCache = Map<string, Statement<Array<unknown>>>;

const statementCache = new WeakMap<Database, DatabaseQueryCache>();

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

function openAndMigrateDatabase(filePath: string, key: string) {
  let db: Database | undefined;

  try {
    db = new SQL(filePath);
    switchToWAL(db);
    migrateSchemaVersion(db);

    return db;
  } catch (error) {
    logger.error(error);
    if (db) db.close();

    logger.info('migrateDatabase: Migration without cipher change failed');
    throw new Error('migrateDatabase: Migration without cipher change failed');
  }
}

const INVALID_KEY = /[^0-9A-Za-z]/;

function openAndSetUpSQLCipher(filePath: string, { key }: { key: string }) {
  if (INVALID_KEY.exec(key))
    throw new Error(`setupSQLCipher: key '${key}' is not valid`);

  const db = openAndMigrateDatabase(filePath, key);

  // Because foreign key support is not enabled by default!
  db.pragma('foreign_keys = ON');

  return db;
}

async function initialize({
  configDir,
  key,
  logger: suppliedLogger,
}: {
  configDir: string;
  key: string;
  logger: Omit<LogFunctions, 'log'>;
}): Promise<void> {
  if (globalInstance) throw new Error('Cannot initialize more than once!');

  if (!isString(configDir))
    throw new Error('initialize: configDir is required!');

  if (!isString(key)) throw new Error('initialize: key is required!');

  logger = suppliedLogger;

  const dbDir = join(configDir, 'db');
  // https://github.com/isaacs/node-mkdirp#methods
  ensureDirSync(dbDir, { mode: 0o777 });

  databaseFilePath = join(dbDir, 'db.sqlite');

  logger.info(databaseFilePath);

  let db: Database | undefined;

  try {
    db = openAndSetUpSQLCipher(databaseFilePath, { key });

    updateSchema(db, logger);

    globalInstance = db;
  } catch (error) {
    // @ts-ignore
    logger.error('Database startup error:', error.stack);

    if (db) db.close();

    throw error;
  }
}

async function close(): Promise<void> {
  // SQLLite documentation suggests that we run `PRAGMA optimize` right
  // before closing the database connection.
  globalInstance?.pragma('optimize');

  globalInstance?.close();

  globalInstance = undefined;
}

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

function getTableNames(): Promise<any> {
  const db = getInstance();

  return db.prepare("SELECT name FROM sqlite_master WHERE type='table';").all();
}

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
  // 计算偏移量
  const offset = (current - 1) * pageSize;

  // 获取当前页的数据
  const list = getRows(pageSize, offset);

  // 获取总记录数
  const total = getCount();

  // 返回分页数据
  return {
    current,
    pageSize,
    total,
    list,
  };
}

/** ******************************* roles *********************************** */

// 获取职业分页列表
async function getRoles({
  roleKeyword,
  roleName,
  roleColor,
  current = 1,
  pageSize = 20,
}: {
  roleKeyword?: string;
  roleName?: string;
  roleColor?: string;
  current: number;
  pageSize: number;
}): Promise<any> {
  const db = getInstance();

  let sql = `
    SELECT *
    FROM roles
    WHERE 1=1
  `;

  if (roleKeyword) {
    sql += ` AND roleKeyword = $roleKeyword`;
  }

  if (roleName) {
    sql += ` AND roleName LIKE $roleName`;
  }

  if (roleColor) {
    sql += ` AND roleColor = $roleColor`;
  }

  return getPagedData({
    current,
    pageSize,
    getRows: (limit, offset) => {
      return db.prepare(`${sql} LIMIT ? OFFSET ?`).all(limit, offset);
    },
    getCount: () => {
      return db.prepare(`SELECT COUNT(*) FROM (${sql})`).get()['COUNT(*)'];
    },
  });
}

// 新增、修改职业
function setRole({
  id,
  roleKeyword,
  roleName,
  roleColor,
  roleIcon,
  roleAvatar,
  cardBackground,
}: {
  id?: number;
  roleKeyword?: string;
  roleName?: string;
  roleColor?: string;
  roleIcon?: string;
  roleAvatar?: string;
  cardBackground?: string;
}): void {
  const db = getInstance();
  db.prepare(
    `
    INSERT OR REPLACE INTO roles (id, roleKeyword, roleName, roleColor, roleIcon, roleAvatar, cardBackground)
    VALUES ($id, $roleKeyword, $roleName, $roleColor, $roleIcon, $roleAvatar, $cardBackground)
  `,
  ).run({
    id,
    roleKeyword,
    roleName,
    roleColor,
    roleIcon,
    roleAvatar,
    cardBackground,
  });
}

// 删除职业
function deleteRole({ id }: { id: number }) {
  const db = getInstance();
  db.prepare(
    `
    DELETE FROM roles
    WHERE id = $id
  `,
  ).run({ id });
}

const dataInterface: ServerInterface = {
  close,
  removeDB,
  initialize,
  getTableNames,
  getRoles,
  setRole,
  deleteRole,
};

export default dataInterface;
