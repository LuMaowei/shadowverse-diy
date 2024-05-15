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

/** ******************************* 职业 *********************************** */

// 获取职业分页列表
async function getRoles({
  name,
  label,
  current = 1,
  pageSize = 10,
  pagination = true,
}: {
  name?: string;
  label?: string;
  current?: number;
  pageSize?: number;
  pagination?: boolean;
}): Promise<any> {
  const db = getInstance();

  let sql = `
    SELECT *
    FROM roles
    WHERE 1=1
  `;

  const params = { name, label };

  if (name) {
    sql += ` AND name = $name`;
  }

  if (label) {
    sql += ` AND label LIKE $label`;
    params.label = `%${label}%`;
  }

  if (pagination) {
    return getPagedData({
      current,
      pageSize,
      getRows: (limit, offset) => {
        return db.prepare(`${sql} LIMIT ? OFFSET ?`).all(limit, offset, params);
      },
      getCount: () => {
        // @ts-ignore
        return db.prepare(`SELECT COUNT(*) FROM (${sql})`).get(params)[
          'COUNT(*)'
        ];
      },
    });
  }
  return db.prepare(`${sql}`).all(params);
}

// 新增、修改职业
function setRole({
  id,
  name,
  label,
  avatar,
  gem,
  emblem,
  background,
}: DB.Role): void {
  const db = getInstance();

  if (id) {
    db.prepare(
      `
        UPDATE roles SET name = $name, label = $label, avatar = $avatar, gem = $gem, emblem = $emblem, background = $background
        WHERE id = $id
      `,
    ).run({
      id,
      name,
      label,
      avatar,
      gem,
      emblem,
      background,
    });
  } else {
    db.prepare(
      `
    INSERT INTO roles (name, label, avatar, gem, emblem, background)
    VALUES ($name, $label, $avatar, $gem, $emblem, $background)
  `,
    ).run({
      id,
      name,
      label,
      avatar,
      gem,
      emblem,
      background,
    });
  }
}

// 删除职业
function deleteRole({ id }: { id?: number }) {
  const db = getInstance();

  const card = db
    .prepare(
      `
        SELECT * FROM cards
        WHERE roleId = $id
        LIMIT 1
      `,
    )
    .get({ id });

  if (card) {
    return;
  }

  db.prepare(
    `
    DELETE FROM roles
    WHERE id = $id
  `,
  ).run({ id });
}

/** ******************************* 卡片类型 *********************************** */

async function getTypes({
  name,
  label,
  current = 1,
  pageSize = 10,
  pagination = true,
}: {
  name?: string;
  label?: string;
  current?: number;
  pageSize?: number;
  pagination?: boolean;
}): Promise<any> {
  const db = getInstance();

  let sql = `
    SELECT *
    FROM types
    WHERE 1=1
  `;

  const params = { name, label };

  if (name) {
    sql += ` AND name = $name`;
  }

  if (label) {
    sql += ` AND label LIKE $label`;
    params.label = `%${label}%`;
  }

  if (pagination) {
    return getPagedData({
      current,
      pageSize,
      getRows: (limit, offset) => {
        return db.prepare(`${sql} LIMIT ? OFFSET ?`).all(limit, offset, params);
      },
      getCount: () => {
        // @ts-ignore
        return db.prepare(`SELECT COUNT(*) FROM (${sql})`).get(params)[
          'COUNT(*)'
        ];
      },
    });
  }
  return db.prepare(`${sql}`).all(params);
}

function setType({ id, name, label }: DB.Type): void {
  const db = getInstance();
  if (id) {
    db.prepare(
      `
      UPDATE types
      SET name = $name, label = $label
      WHERE id = $id
    `,
    ).run({
      id,
      name,
      label,
    });
  } else {
    const info = db
      .prepare(
        `
        INSERT INTO types (name, label)
        VALUES ($name, $label)
        `,
      )
      .run({
        name,
        label,
      });

    const newTypeId = info.lastInsertRowid;
    const rarities = db.prepare('SELECT id FROM rarities').all() as DB.Rarity[];

    rarities.forEach((rarity) => {
      db.prepare(
        'INSERT INTO frames (typeId, rarityId, frame) VALUES (?, ?, ?)',
      ).run(newTypeId, rarity.id, '');
    });
  }
}

function deleteType({ id }: { id?: number }) {
  const db = getInstance();

  const tables = ['frames', 'cards'];

  for (let i = 0; i < tables.length; i += 1) {
    // 检查当前表中是否存在roleId为传入id的数据
    const data = db
      .prepare(
        `
      SELECT * FROM ${tables[i]}
      WHERE typeId = $id
      LIMIT 1
      `,
      )
      .get({ id });

    if (data) {
      return;
    }
  }

  db.prepare(
    `
    DELETE FROM types
    WHERE id = $id
  `,
  ).run({ id });
}

/** ******************************* 稀有度 *********************************** */

async function getRarities({
  name,
  label,
  current = 1,
  pageSize = 10,
  pagination = true,
}: {
  name?: string;
  label?: string;
  current?: number;
  pageSize?: number;
  pagination?: boolean;
}): Promise<any> {
  const db = getInstance();

  let sql = `
    SELECT *
    FROM rarities
    WHERE 1=1
  `;

  const params = { name, label };

  if (name) {
    sql += ` AND name = $name`;
  }

  if (label) {
    sql += ` AND label LIKE $label`;
    params.label = `%${label}%`;
  }

  if (pagination) {
    return getPagedData({
      current,
      pageSize,
      getRows: (limit, offset) => {
        return db.prepare(`${sql} LIMIT ? OFFSET ?`).all(limit, offset, params);
      },
      getCount: () => {
        // @ts-ignore
        return db.prepare(`SELECT COUNT(*) FROM (${sql})`).get(params)[
          'COUNT(*)'
        ];
      },
    });
  }
  return db.prepare(`${sql}`).all(params);
}

function setRarity({ id, name, label }: DB.Rarity): void {
  const db = getInstance();
  if (id) {
    db.prepare(
      `
      UPDATE rarities
      SET name = $name, label = $label
      WHERE id = $id
    `,
    ).run({
      id,
      name,
      label,
    });
  } else {
    const info = db
      .prepare(
        `
        INSERT INTO rarities (name, label)
        VALUES ($name, $label)
        `,
      )
      .run({
        name,
        label,
      });

    const newRarityId = info.lastInsertRowid;
    const types = db.prepare('SELECT id FROM types').all() as DB.Type[];

    types.forEach((type) => {
      db.prepare(
        'INSERT INTO frames (rarityId, typeId, frame) VALUES (?, ?, ?)',
      ).run(newRarityId, type.id, '');
    });
  }
}

function deleteRarity({ id }: { id?: number }) {
  const db = getInstance();

  const tables = ['frames', 'cards'];

  for (let i = 0; i < tables.length; i += 1) {
    // 检查当前表中是否存在roleId为传入id的数据
    const data = db
      .prepare(
        `
      SELECT * FROM ${tables[i]}
      WHERE rarityId = $id
      LIMIT 1
      `,
      )
      .get({ id });

    if (data) {
      return;
    }
  }

  db.prepare(
    `
    DELETE FROM rarities
    WHERE id = $id
  `,
  ).run({ id });
}

/** ******************************* 卡片框架 *********************************** */

async function getFrames({
  typeId,
  rarityId,
  current = 1,
  pageSize = 10,
  pagination = true,
}: {
  typeId?: number;
  rarityId?: number;
  current?: number;
  pageSize?: number;
  pagination?: boolean;
}): Promise<any> {
  const db = getInstance();

  let sql = `
    SELECT frames.*, types.name as typeName, types.label as typeLabel, rarities.name as rarityName, rarities.label as rarityLabel
    FROM frames
    JOIN types ON frames.typeId = types.id
    JOIN rarities ON frames.rarityId = rarities.id
    WHERE 1=1
  `;

  if (typeId) {
    sql += ` AND typeId = $typeId`;
  }

  if (rarityId) {
    sql += ` AND rarityId = $rarityId`;
  }

  if (pagination) {
    return getPagedData({
      current,
      pageSize,
      getRows: (limit, offset) => {
        return db
          .prepare(`${sql} LIMIT ? OFFSET ?`)
          .all(limit, offset, { typeId, rarityId });
      },
      getCount: () => {
        // @ts-ignore
        return db
          .prepare(`SELECT COUNT(*) FROM (${sql})`)
          .get({ typeId, rarityId })['COUNT(*)'];
      },
    });
  }
  return db.prepare(`${sql}`).all({ typeId, rarityId });
}

function setFrame({ id, typeId, rarityId, frame }: DB.Frame): void {
  const db = getInstance();
  db.prepare(
    `
    UPDATE frames
    SET frame = $frame
    WHERE id = $id AND typeId = $typeId AND rarityId = $rarityId
  `,
  ).run({
    id,
    typeId,
    rarityId,
    frame,
  });
}

function deleteFrame({ id }: { id?: number }) {
  const db = getInstance();
  db.prepare(
    `
    DELETE FROM frames
    WHERE id = $id
  `,
  ).run({ id });
}

/** ******************************* 兵种 *********************************** */

// 获取兵种分页列表
async function getTraits({
  name,
  label,
  current = 1,
  pageSize = 10,
  pagination = true,
}: {
  name?: string;
  label?: string;
  current?: number;
  pageSize?: number;
  pagination?: boolean;
}): Promise<any> {
  const db = getInstance();

  let sql = `
    SELECT *
    FROM traits
    WHERE 1=1
  `;

  const params = { name, label };

  if (name) {
    sql += ` AND name = $name`;
  }

  if (label) {
    sql += ` AND label LIKE $label`;
    params.label = `%${label}%`;
  }

  if (pagination) {
    return getPagedData({
      current,
      pageSize,
      getRows: (limit, offset) => {
        return db.prepare(`${sql} LIMIT ? OFFSET ?`).all(limit, offset, params);
      },
      getCount: () => {
        // @ts-ignore
        return db.prepare(`SELECT COUNT(*) FROM (${sql})`).get(params)[
          'COUNT(*)'
        ];
      },
    });
  }
  return db.prepare(`${sql}`).all(params);
}

function setTrait({ id, name, label }: DB.Trait): void {
  const db = getInstance();

  if (id) {
    db.prepare(
      `
    UPDATE traits SET name = $name, label = $label
    WHERE id = $id
  `,
    ).run({
      id,
      name,
      label,
    });
  } else {
    db.prepare(
      `
    INSERT INTO traits (name, label)
    VALUES ($name, $label)
  `,
    ).run({
      name,
      label,
    });
  }
}

function deleteTrait({ id }: { id?: number }) {
  const db = getInstance();

  const card = db
    .prepare(
      `
        SELECT * FROM cards
        WHERE traitId = $id
        LIMIT 1
      `,
    )
    .get({ id });

  if (card) {
    return;
  }

  db.prepare(
    `
    DELETE FROM traits
    WHERE id = $id
  `,
  ).run({ id });
}

/** ******************************* 能力 *********************************** */

async function getAbilities({
  name,
  label,
  description,
  current = 1,
  pageSize = 10,
  pagination = true,
}: {
  name?: string;
  label?: string;
  description?: string;
  current?: number;
  pageSize?: number;
  pagination?: boolean;
}): Promise<any> {
  const db = getInstance();

  let sql = `
    SELECT *
    FROM abilities
    WHERE 1=1
  `;

  const params = { name, label, description };

  if (name) {
    sql += ` AND name = $name`;
  }

  if (label) {
    sql += ` AND label LIKE $label`;
    params.label = `%${label}%`;
  }

  if (description) {
    sql += ` AND label LIKE $description`;
    params.description = `%${description}%`;
  }

  if (pagination) {
    return getPagedData({
      current,
      pageSize,
      getRows: (limit, offset) => {
        return db.prepare(`${sql} LIMIT ? OFFSET ?`).all(limit, offset, params);
      },
      getCount: () => {
        // @ts-ignore
        return db.prepare(`SELECT COUNT(*) FROM (${sql})`).get(params)[
          'COUNT(*)'
        ];
      },
    });
  }
  return db.prepare(`${sql}`).all(params);
}

function setAbility({ id, name, label, sort, description }: DB.Ability): void {
  const db = getInstance();
  db.prepare(
    `
    INSERT OR REPLACE INTO abilities (id, name, label,sort, description)
    VALUES ($id, $name, $label, $sort, $description)
  `,
  ).run({
    id,
    name,
    label,
    sort,
    description,
  });
}

function deleteAbility({ id }: { id?: number }) {
  const db = getInstance();
  db.prepare(
    `
    DELETE FROM abilities
    WHERE id = $id
  `,
  ).run({ id });
}

/** ******************************* 卡包 *********************************** */

async function getCardPacks({
  name,
  label,
  description,
  current = 1,
  pageSize = 10,
  pagination = true,
}: {
  name?: string;
  label?: string;
  description?: string;
  current?: number;
  pageSize?: number;
  pagination?: boolean;
}): Promise<any> {
  const db = getInstance();

  let sql = `
    SELECT *
    FROM cardPacks
    WHERE 1=1
  `;

  const params = { name, label, description };

  if (name) {
    sql += ` AND name = $name`;
  }

  if (label) {
    sql += ` AND label LIKE $label`;
    params.label = `%${label}%`;
  }

  if (description) {
    sql += ` AND label LIKE $description`;
    params.description = `%${description}%`;
  }

  if (pagination) {
    return getPagedData({
      current,
      pageSize,
      getRows: (limit, offset) => {
        return db.prepare(`${sql} LIMIT ? OFFSET ?`).all(limit, offset, params);
      },
      getCount: () => {
        // @ts-ignore
        return db.prepare(`SELECT COUNT(*) FROM (${sql})`).get(params)[
          'COUNT(*)'
        ];
      },
    });
  }
  return db.prepare(`${sql}`).all(params);
}

function setCardPack({ id, name, label, sort, description }: DB.Ability): void {
  const db = getInstance();

  if (id) {
    db.prepare(
      `
    UPDATE cardPacks SET name = $name, label = $label, sort = $sort, description = $description
    WHERE id = $id
  `,
    ).run({
      id,
      name,
      label,
      sort,
      description,
    });
  } else {
    db.prepare(
      `
    INSERT INTO cardPacks (name, label,sort, description)
    VALUES ($name, $label, $sort, $description)
  `,
    ).run({
      name,
      label,
      sort,
      description,
    });
  }
}

function deleteCardPack({ id }: { id?: number }) {
  const db = getInstance();

  const card = db
    .prepare(
      `
        SELECT * FROM cards
        WHERE cardPackId = $id
        LIMIT 1
      `,
    )
    .get({ id });

  if (card) {
    return;
  }

  db.prepare(
    `
    DELETE FROM cardPacks
    WHERE id = $id
  `,
  ).run({ id });
}

/** ******************************* 卡片 *********************************** */

async function getCards({
  roleId,
  typeId,
  traitId,
  rarityId,
  cardPackId,
  cost,
  name,
  isToken,
  tokenIds,
  parentId,
  isReborn,
  current = 1,
  pageSize = 10,
  pagination = true,
}: DB.Card & {
  current?: number;
  pageSize?: number;
  pagination?: boolean;
}): Promise<any> {
  const db = getInstance();

  let sql = `
    SELECT cards.*, roles.label as roleLabel, types.label as typeLabel, traits.label as traitLabel, rarities.label as rarityLabel, cardPacks.label as cardPackLabel
    FROM cards
    JOIN roles ON cards.roleId = roles.id
    JOIN types ON cards.typeId = types.id
    JOIN traits ON cards.traitId = traits.id
    JOIN rarities ON cards.rarityId = rarities.id
    JOIN cardPacks ON cards.cardPackId = cardPacks.id
    WHERE 1=1
  `;

  const params = {
    roleId,
    typeId,
    traitId,
    rarityId,
    cardPackId,
    cost,
    name,
    isToken,
    tokenIds,
    parentId,
    isReborn,
  };

  if (roleId) {
    sql += ` AND roleId = $roleId`;
  }
  if (typeId) {
    sql += ` AND typeId = $typeId`;
  }
  if (traitId) {
    sql += ` AND traitId = $traitId`;
  }
  if (rarityId) {
    sql += ` AND rarityId = $rarityId`;
  }
  if (cardPackId) {
    sql += ` AND cardPackId = $cardPackId`;
  }
  if (cost) {
    sql += ` AND cost = $cost`;
  }
  if (name) {
    sql += ` AND name LIKE $name`;
    params.name = `%${name}%`;
  }
  if (isToken) {
    sql += ` AND isToken = $isToken`;
  }
  if (tokenIds) {
    sql += ` AND tokenIds = $tokenIds`;
  }
  if (parentId) {
    sql += ` AND parentId = $parentId`;
  }
  if (isReborn) {
    sql += ` AND isReborn = $isReborn`;
  }

  if (pagination) {
    return getPagedData({
      current,
      pageSize,
      getRows: (limit, offset) => {
        return db.prepare(`${sql} LIMIT ? OFFSET ?`).all(limit, offset, params);
      },
      getCount: () => {
        // @ts-ignore
        return db.prepare(`SELECT COUNT(*) FROM (${sql})`).get(params)[
          'COUNT(*)'
        ];
      },
    });
  }
  return db.prepare(`${sql}`).all(params);
}

function setCard({
  id,
  roleId,
  typeId,
  traitId,
  rarityId,
  cardPackId,
  cost,
  name,
  isToken,
  tokenIds,
  parentId,
  isReborn,
  image,
}: DB.Card): void {
  const db = getInstance();

  if (id) {
    db.prepare(
      `
    UPDATE cards SET roleId = $roleId, typeId = $typeId, traitId = $traitId, rarityId = $rarityId, cardPackId = $cardPackId, cost = $cost, name = $name, isToken = $isToken, tokenIds = $tokenIds, parentId = $parentId, isReborn = $isReborn, image = $image
    WHERE id = $id
  `,
    ).run({
      id,
      roleId,
      typeId,
      traitId,
      rarityId,
      cardPackId,
      cost,
      name,
      isToken,
      tokenIds,
      parentId,
      isReborn,
      image,
    });
  } else {
    db.prepare(
      `
    INSERT INTO cards (roleId, typeId, traitId, rarityId, cardPackId, cost, name, isToken, tokenIds, parentId, isReborn, image)
    VALUES ($roleId, $typeId, $traitId, $rarityId, $cardPackId, $cost, $name, $isToken, $tokenIds, $parentId, $isReborn, $image)
  `,
    ).run({
      roleId,
      typeId,
      traitId,
      rarityId,
      cardPackId,
      cost,
      name,
      isToken,
      tokenIds,
      parentId,
      isReborn,
      image,
    });
  }
}

function deleteCard({ id }: { id?: number }) {
  const db = getInstance();

  const cardDetails = db
    .prepare(
      `
        SELECT * FROM cardDetails
        WHERE cardId = $id
        LIMIT 1
      `,
    )
    .get({ id });

  if (cardDetails) {
    return;
  }

  db.prepare(
    `
    DELETE FROM cards
    WHERE id = $id
  `,
  ).run({ id });
}

/** ******************************* 卡片详情 *********************************** */

async function getCardDetails({
  cardId,
  evolutionStage,
  attack,
  health,
  description,
  current = 1,
  pageSize = 10,
  pagination = true,
}: DB.CardDetails & {
  current?: number;
  pageSize?: number;
  pagination?: boolean;
}): Promise<any> {
  const db = getInstance();

  let sql = `
    SELECT *
    FROM cardDetails
    WHERE 1=1
  `;

  const params = {
    cardId,
    evolutionStage,
    attack,
    health,
    description,
  };

  if (cardId) {
    sql += ` AND cardId = $cardId`;
  }

  if (evolutionStage) {
    sql += ` AND evolutionStage LIKE $evolutionStage`;
  }
  if (attack) {
    sql += ` AND attack = $attack`;
  }
  if (health) {
    sql += ` AND health = $health`;
  }
  if (description) {
    sql += ` AND description LIKE $description`;
    params.description = `%${description}%`;
  }

  if (pagination) {
    return getPagedData({
      current,
      pageSize,
      getRows: (limit, offset) => {
        return db.prepare(`${sql} LIMIT ? OFFSET ?`).all(limit, offset, params);
      },
      getCount: () => {
        // @ts-ignore
        return db.prepare(`SELECT COUNT(*) FROM (${sql})`).get(params)[
          'COUNT(*)'
        ];
      },
    });
  }
  return db.prepare(`${sql}`).all(params);
}

function setCardDetails({
  id,
  cardId,
  evolutionStage,
  attack,
  health,
  description,
}: DB.CardDetails): void {
  const db = getInstance();
  db.prepare(
    `
    INSERT OR REPLACE INTO roles (id, cardId, evolutionStage, attack, health, description)
    VALUES ($id, $cardId, $evolutionStage, $attack, $health, $description)
  `,
  ).run({
    id,
    cardId,
    evolutionStage,
    attack,
    health,
    description,
  });
}

function deleteCardDetails({ id }: { id?: number }) {
  const db = getInstance();
  db.prepare(
    `
    DELETE FROM cardDetails
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
  getFrames,
  setFrame,
  deleteFrame,
  getTraits,
  setTrait,
  deleteTrait,
  getAbilities,
  setAbility,
  deleteAbility,
  getCardPacks,
  setCardPack,
  deleteCardPack,
  getCards,
  setCard,
  deleteCard,
  getCardDetails,
  setCardDetails,
  deleteCardDetails,
};

export default dataInterface;
