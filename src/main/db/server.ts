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

/** ******************************* 兵种 *********************************** */

// 获取兵种分页列表
async function getTraits({
  name,
  current = 1,
  pageSize = 10,
  pagination = true,
}: DB.Trait & DB.Pagination): Promise<any> {
  const db = getInstance();

  let sql = `SELECT * FROM traits WHERE 1=1`;

  const params = { name };

  if (name) {
    sql += ` AND name LIKE $name`;
    params.name = `%${name}%`;
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

function setTrait({ id, name }: DB.Trait): void {
  const db = getInstance();

  if (id) {
    db.prepare(`UPDATE traits SET name = $name WHERE id = $id`).run({
      id,
      name,
    });
  } else {
    db.prepare(`INSERT INTO traits (name) VALUES ($name)`).run({
      name,
    });
  }
}

function deleteTrait({ id }: DB.Trait) {
  const db = getInstance();
  const isUsed = db
    .prepare('SELECT 1 FROM cardTraits WHERE traitId = ?')
    .get(id);

  if (isUsed) {
    return;
  }

  db.prepare(`DELETE FROM traits WHERE id = $id`).run({ id });
}

/** ******************************* 能力 *********************************** */

async function getAbilities({
  name,
  description,
  current = 1,
  pageSize = 10,
  pagination = true,
}: DB.Ability & DB.Pagination): Promise<any> {
  const db = getInstance();

  let sql = `SELECT * FROM abilities WHERE 1=1`;

  const params = { name, description };

  if (name) {
    sql += ` AND name LIKE $name`;
    params.name = `%${name}%`;
  }

  sql += ' ORDER BY sort';

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

function setAbility({ id, name, sort, description }: DB.Ability): void {
  const db = getInstance();

  if (id) {
    db.prepare(
      `UPDATE abilities SET name = $name, sort = $sort, description = $description
    WHERE id = $id`,
    ).run({
      id,
      name,
      sort,
      description,
    });
  } else {
    // eslint-disable-next-line no-underscore-dangle
    let _sort = sort;
    if (!sort) {
      // @ts-ignore
      const { maxSort } = db
        .prepare('SELECT MAX(sort) as maxSort FROM abilities')
        .get();
      _sort = maxSort ? maxSort + 1 : 1;
    }
    db.prepare(
      `INSERT INTO abilities (name, sort, description)
      VALUES ($name, $sort, $description))`,
    ).run({
      name,
      sort: _sort,
      description,
    });
  }
}

function deleteAbility({ id }: DB.Ability) {
  const db = getInstance();

  const isUsed = db
    .prepare('SELECT 1 FROM cardDetailAbilities WHERE abilityId = ?')
    .get(id);

  if (isUsed) {
    return;
  }

  db.prepare(`DELETE FROM cardDetails WHERE id = $id`).run({ id });
}

/** ******************************* 卡包 *********************************** */

async function getCardPacks({
  name,
  sort,
  description,
  current = 1,
  pageSize = 10,
  pagination = true,
}: DB.CardPack & DB.Pagination): Promise<any> {
  const db = getInstance();

  let sql = `SELECT * FROM cardPacks WHERE 1=1`;

  const params = { name, sort, description };

  if (name) {
    sql += ` AND name LIKE $name`;
    params.name = `%${name}%`;
  }

  sql += ' ORDER BY sort';

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

function setCardPack({ id, name, sort, description }: DB.CardPack): void {
  const db = getInstance();

  if (id) {
    db.prepare(
      `UPDATE cardPacks SET name = $name, sort = $sort, description = $description
    WHERE id = $id
  `,
    ).run({
      id,
      name,
      sort,
      description,
    });
  } else {
    // eslint-disable-next-line no-underscore-dangle
    let _sort = sort;
    if (!sort) {
      // @ts-ignore
      const { maxSort } = db
        .prepare('SELECT MAX(sort) as maxSort FROM abilities')
        .get();
      _sort = maxSort ? maxSort + 1 : 1;
    }
    db.prepare(
      `INSERT INTO cardPacks (name, sort, description)
    VALUES ($name, $sort, $description)
  `,
    ).run({
      name,
      sort: _sort,
      description,
    });
  }
}

function deleteCardPack({ id }: DB.CardPack) {
  const db = getInstance();

  const isUsed = db.prepare('SELECT 1 FROM cards WHERE cardPackId = ?').get(id);

  if (isUsed) {
    return;
  }

  db.prepare(`DELETE FROM cardPacks WHERE id = $id`).run({ id });
}

/** ******************************* 卡片 *********************************** */

async function getCards({
  classes,
  type,
  rarity,
  traitIds,
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
}: DB.Card & DB.Pagination): Promise<any> {
  const db = getInstance();

  let sql = `
    SELECT
      cards.*,
      GROUP_CONCAT(traits.name) as traits,
      GROUP_CONCAT(abilities.name || ':' || abilities.sort) as abilities,
      cardPacks.name as cardPackName, cardPacks.sort as cardPackSort
    FROM cards
    LEFT JOIN card_traits ON cards.id = card_traits.cardId
    LEFT JOIN traits ON card_traits.traitId = traits.id
    LEFT JOIN card_abilities ON cards.id = card_abilities.cardId
    LEFT JOIN abilities ON card_abilities.abilityId = abilities.id
    LEFT JOIN cardPacks ON cards.cardPackId = cardPacks.id
    WHERE 1=1
  `;

  const params = {
    classes,
    type,
    rarity,
    traitIds,
    cardPackId,
    cost,
    name,
    isToken,
    tokenIds,
    parentId,
    isReborn,
  };

  if (classes) {
    sql += ` AND classes = $classes`;
  }
  if (type) {
    sql += ` AND type = $type`;
  }
  if (rarity) {
    sql += ` AND rarity = $rarity`;
  }
  if (traitIds) {
    sql += ` AND EXISTS (SELECT 1 FROM card_traits WHERE card_traits.cardId = cards.id AND card_traits.traitId = $traitIds)`;
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
    sql += ` AND ',' || tokenIds || ',' LIKE $tokenIds`;
    params.tokenIds = `%,${tokenIds},%`;
  }
  if (parentId) {
    sql += ` AND parentId = $parentId`;
  }
  if (isReborn) {
    sql += ` AND isReborn = $isReborn`;
  }

  sql += ' GROUP BY cards.id';

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

async function getCard({ id }: DB.Card): Promise<any> {
  const db = getInstance();

  const sql = `
    SELECT
    cards.*,
    roles.name AS roleName,
    roles.label AS roleLabel,
    roles.avatar AS roleAvatar,
    roles.gem AS roleGem,
    roles.emblem AS roleEmblem,
    roles.background AS roleBackground,
    types.name AS typeName,
    types.label AS typeLabel,
    traits.name AS traitName,
    traits.label AS traitLabel,
    rarities.name AS rarityName,
    rarities.label AS rarityLabel,
    cardPacks.name AS cardPackName,
    cardPacks.label AS cardPackLabel,
    cardPacks.sort AS cardPackSort,
    cardPacks.description AS cardPackDescription,
    GROUP_CONCAT(cardDetails.evolutionStage) AS evolutionStages,
    GROUP_CONCAT(cardDetails.attack) AS attacks,
    GROUP_CONCAT(cardDetails.health) AS healths,
    GROUP_CONCAT(cardDetails.description) AS cardDetailsDescriptions
    FROM
        cards
    LEFT JOIN
        roles ON cards.roleId = roles.id
    LEFT JOIN
        types ON cards.typeId = types.id
    LEFT JOIN
        traits ON cards.traitId = traits.id
    LEFT JOIN
        rarities ON cards.rarityId = rarities.id
    LEFT JOIN
        cardPacks ON cards.cardPackId = cardPacks.id
    LEFT JOIN
        cardDetails ON cards.id = cardDetails.cardId
    WHERE
        cards.id = $id
    GROUP BY
        cards.id;
  `;

  return db.prepare(`${sql}`).get({ id });
}

const dataInterface: ServerInterface = {
  close,
  removeDB,
  initialize,
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
  getCard,
};

export default dataInterface;
