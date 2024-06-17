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

/** ******************************* 兵种 *********************************** */

// 获取兵种列表
async function getTraits({ name }: DB.Traits): Promise<any> {
  const db = getInstance();

  let sql = `SELECT * FROM traits`;

  const params = { name };

  if (name) {
    sql += ` WHERE name LIKE $name`;
    params.name = `%${name}%`;
  }

  return db.prepare(`${sql}`).all(params);
}

// 新增或更新兵种
function setTrait({ id, name }: DB.Traits): void {
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

/**
 * 删除兵种
 * 若已有卡片使用此兵种，则无法删除
 * @param id
 */
function deleteTrait({ id }: DB.Traits) {
  const db = getInstance();

  const isUsed = db
    .prepare('SELECT 1 FROM cardTraits WHERE traitId = $id')
    .get({ id });

  if (isUsed) {
    return;
  }

  db.prepare(`DELETE FROM traits WHERE id = $id`).run({ id });
}

/** ******************************* 能力 *********************************** */

// 获取能力关键字列表
async function getAbilities({ name }: DB.Abilities): Promise<any> {
  const db = getInstance();

  let sql = `SELECT * FROM abilities`;

  const params = { name };

  if (name) {
    sql += ` WHERE name LIKE $name`;
    params.name = `%${name}%`;
  }

  sql += ' ORDER BY sort';

  return db.prepare(`${sql}`).all(params);
}

// 新增或更新能力关键字
function setAbility({ id, name, sort, description }: DB.Abilities): void {
  const db = getInstance();

  if (id) {
    db.prepare(
      `UPDATE abilities SET name = $name, sort = $sort, description = $description WHERE id = $id`,
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
      `INSERT INTO abilities (name, sort, description) VALUES ($name, $sort, $description)`,
    ).run({
      name,
      sort: _sort,
      description,
    });
  }
}

/**
 * 删除能力关键字
 * 若以有卡片详情使用此能力关键字，则无法删除
 * @param id
 */
function deleteAbility({ id }: DB.Abilities) {
  const db = getInstance();

  const isUsed = db
    .prepare('SELECT 1 FROM cardDetailAbilities WHERE abilityId = $id')
    .get({ id });

  if (isUsed) {
    return;
  }

  db.prepare(`DELETE FROM abilities WHERE id = $id`).run({ id });
}

/** ******************************* 卡包 *********************************** */

// 获取卡包列表
async function getCardPacks({ name }: DB.CardPacks): Promise<any> {
  const db = getInstance();

  let sql = `SELECT * FROM cardPacks`;

  const params = { name };

  if (name) {
    sql += ` WHERE name LIKE $name`;
    params.name = `%${name}%`;
  }

  sql += ' ORDER BY sort';

  return db.prepare(`${sql}`).all(params);
}

// 新增或更新卡包
function setCardPack({ id, name, sort, description }: DB.CardPacks): void {
  const db = getInstance();

  if (id) {
    db.prepare(
      `UPDATE cardPacks SET name = $name, sort = $sort, description = $description WHERE id = $id`,
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
        .prepare('SELECT MAX(sort) as maxSort FROM cardPacks')
        .get();
      _sort = maxSort ? maxSort + 1 : 1;
    }
    db.prepare(
      `INSERT INTO cardPacks (name, sort, description)
    VALUES ($name, $sort, $description)`,
    ).run({
      name,
      sort: _sort,
      description,
    });
  }
}

/**
 * 删除卡包
 * 若已有卡片使用此卡包，则无法删除
 * @param id
 */
function deleteCardPack({ id }: DB.CardPacks) {
  const db = getInstance();

  const isUsed = db.prepare('SELECT 1 FROM cards WHERE cardPackId = ?').get(id);

  if (isUsed) {
    return;
  }

  db.prepare(`DELETE FROM cardPacks WHERE id = $id`).run({ id });
}

/** ******************************* 卡片 *********************************** */

// 获取卡片列表
async function getCards({
  classes,
  type,
  rarity,
  cardPackId,
  cost,
  isReborn,
  isToken,
  name,
  traitIds,
}: DB.Cards & { traitIds?: number[] }): Promise<any> {
  const db = getInstance();

  let sql = `SELECT cards.*, cardPacks.name as cardPackName, GROUP_CONCAT(traits.name) as traitNameList FROM cards
LEFT JOIN cardTraits ON cards.id = cardTraits.cardId
LEFT JOIN cardPacks on cards.cardPackId = cardPacks.id
LEFT JOIN traits ON cardTraits.traitId = traits.id`;

  const params = {
    classes,
    type,
    rarity,
    cardPackId,
    cost,
    isReborn,
    isToken,
    name,
    traitIds,
  };

  const conditions = [];
  if (classes) {
    conditions.push('classes = $classes');
  }
  if (type) {
    conditions.push('type = $type');
  }
  if (rarity) {
    conditions.push('rarity = $rarity');
  }
  if (cardPackId) {
    conditions.push('cardPackId = $cardPackId');
  }
  if (cost) {
    conditions.push('cost = $cost');
  }
  if (isReborn) {
    conditions.push('isReborn = $isReborn');
  }
  if (isToken) {
    conditions.push('isToken = $isToken');
  }
  if (name) {
    conditions.push('cards.name LIKE $name');
    params.name = `%${name}%`;
  }
  if (traitIds && traitIds.length > 0) {
    conditions.push(`cards.id IN (${traitIds.join(',')})`);
  }

  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(' AND ')}`;
  }

  sql += ' GROUP BY cards.id';

  return db.prepare(`${sql}`).all(params);
}

// 新增或更新卡片
function setCard({
  id,
  classes,
  type,
  rarity,
  cardPackId,
  cost,
  name,
  illustrator,
  isReborn,
  isToken,
  image,
  tokenIds,
  parentIds,
  cardDetails,
  traitIds,
}: DB.Cards & {
  tokenIds?: number[];
  parentIds?: number[];
  cardDetails?: (DB.CardDetails & { abilityIds?: number[] })[];
  traitIds?: number[];
}): Promise<number | bigint | undefined> {
  const db = getInstance();
  let cardId: number | bigint | undefined = id;

  db.transaction(() => {
    if (id) {
      db.prepare(
        `UPDATE cards SET classes = $classes, type = $type, rarity = $rarity, cardPackId = $cardPackId, cost = $cost, name = $name,
        illustrator = $illustrator, isReborn = $isReborn, isToken = $isToken, image = $image, tokenIds = $tokenIds, parentIds = $parentIds WHERE id = $id`,
      ).run({
        id,
        classes,
        type,
        rarity,
        cardPackId,
        cost,
        name,
        illustrator,
        isReborn,
        isToken,
        image,
        tokenIds: tokenIds?.join(','),
        parentIds: parentIds?.join(','),
      });

      // 更新卡片详情
      cardDetails?.forEach((detail) => {
        db.prepare(
          `UPDATE cardDetails SET cardId = $cardId, evolvedStage = $evolvedStage, attack = $attack, health = $health,
description = $description WHERE id = $id`,
        ).run({
          ...detail,
          id: detail.id,
          cardId: id,
        });

        // 更新卡片详情与能力关键字的关联关系
        db.prepare(
          `DELETE FROM cardDetailAbilities WHERE cardDetailId = $id`,
        ).run({ id: detail.id });
        detail.abilityIds?.forEach((abilityId) => {
          db.prepare(
            `INSERT INTO cardDetailAbilities (cardDetailId, abilityId) VALUES ($cardDetailId, $abilityId)`,
          ).run({
            cardDetailId: detail.id,
            abilityId,
          });
        });
      });

      // 更新卡片与兵种的关联关系
      db.prepare(`DELETE FROM cardTraits WHERE cardId = $cardId`).run({
        cardId: id,
      });

      traitIds?.forEach((traitId) => {
        db.prepare(
          `INSERT INTO cardTraits (cardId, traitId) VALUES ($cardId, $traitId)`,
        ).run({
          cardId: id,
          traitId,
        });
      });
    } else {
      const { lastInsertRowid: newId } = db
        .prepare(
          `INSERT INTO cards (classes, type, rarity, cardPackId, cost, name, illustrator, isReborn, isToken, image, tokenIds, parentIds) VALUES ($classes, $type, $rarity, $cardPackId, $cost, $name, $illustrator, $isReborn, $isToken, $image, $tokenIds, $parentIds)`,
        )
        .run({
          classes,
          type,
          rarity,
          cardPackId,
          cost,
          name,
          illustrator,
          isReborn,
          isToken,
          image,
          tokenIds: tokenIds?.join(','),
          parentIds: parentIds?.join(','),
        });
      cardId = newId;
      // 新增卡片详情
      cardDetails?.forEach((detail) => {
        const { lastInsertRowid: newDetailId } = db
          .prepare(
            `INSERT INTO cardDetails (cardId, evolvedStage, attack, health, description) VALUES ($cardId, $evolvedStage, $attack, $health, $description)`,
          )
          .run({
            cardId: newId,
            ...detail,
          });

        // 新增卡片详情与能力关键字的关联关系
        detail.abilityIds?.forEach((abilityId) => {
          db.prepare(
            `INSERT INTO cardDetailAbilities (cardDetailId, abilityId) VALUES ($cardDetailId, $abilityId)`,
          ).run({
            cardDetailId: newDetailId,
            abilityId,
          });
        });
      });

      // 新增卡片与兵种的关联关系
      traitIds?.forEach((traitId) => {
        db.prepare(
          `INSERT INTO cardTraits (cardId, traitId) VALUES ($cardId, $traitId)`,
        ).run({
          cardId: newId,
          traitId,
        });
      });
    }
  })();

  return Promise.resolve(cardId);
}

// 删除卡片
function deleteCard({ id }: DB.Cards) {
  const db = getInstance();

  db.transaction(() => {
    // 删除卡片与兵种的关联关系
    db.prepare(`DELETE FROM cardTraits WHERE cardId = $id`).run({ id });

    // 删除卡片详情
    db.prepare(`DELETE FROM cardDetails WHERE cardId = $id`).run({ id });

    // 删除卡片
    db.prepare(`DELETE FROM cards WHERE id = $id`).run({ id });
  })();
}

// 查询单卡
async function getCard({ id }: DB.Cards): Promise<any> {
  const db = getInstance();

  const sql = `SELECT cards.*,
cardPacks.id as cardPackId,
GROUP_CONCAT(DISTINCT traits.id) as traitIds,
GROUP_CONCAT(cardDetails.id || '||,' || cardDetails.evolvedStage || '||,' || cardDetails.attack || '||,' || cardDetails.health || '||,' || IFNULL(cardDetails.description, ''), '||;') as cardDetails,
GROUP_CONCAT(DISTINCT abilities.id) as abilityIds
FROM cards LEFT JOIN cardDetails ON cards.id = cardDetails.cardId
LEFT JOIN cardPacks ON cards.cardPackId = cardPacks.id
LEFT JOIN cardTraits ON cards.id = cardTraits.cardId
LEFT JOIN traits ON cardTraits.traitId = traits.id
LEFT JOIN cardDetailAbilities ON cardDetails.id = cardDetailAbilities.cardDetailId
LEFT JOIN abilities ON cardDetailAbilities.abilityId = abilities.id
WHERE cards.id = $id`;

  const result = db.prepare(`${sql}`).get({ id });
  // @ts-ignore
  result.parentIds = result.parentIds
    ? // @ts-ignore
      `${result.parentIds}`?.split(',')?.map((item) => Number(item))
    : [];

  // 将卡片详情字符串解析成对象数组
  // @ts-ignore
  result.cardDetails = result.cardDetails?.split('||;').map((detail) => {
    const [cardDetailsId, evolvedStage, attack, health, description] =
      detail.split('||,');
    return {
      id: Number(cardDetailsId),
      evolvedStage: Number(evolvedStage),
      attack: Number(attack),
      health: Number(health),
      description,
    };
  });

  // @ts-ignore
  result.traitIds = result.traitIds?.split(',').map((item) => Number(item));

  return result;
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
  getCard,
};

export default dataInterface;
