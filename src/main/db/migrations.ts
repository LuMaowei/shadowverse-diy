import type { Database } from 'better-sqlite3';
import type { LogFunctions } from 'electron-log';
import {
  getSchemaVersion,
  getSQLCipherVersion,
  getSQLiteVersion,
  getUserVersion,
} from './util';

function updateToSchemaVersion1(
  currentVersion: number,
  db: Database,
  logger: Omit<LogFunctions, 'log'>,
) {
  if (currentVersion >= 1) return;

  logger.info('updateToSchemaVersion1: starting...');

  db.transaction(() => {
    // 兵种
    db.exec(`
      CREATE TABLE traits (
        id INTEGER PRIMARY KEY,
        name STRING NOT NULL
      );
    `);

    // 能力关键字
    db.exec(`
      CREATE TABLE abilities (
        id INTEGER PRIMARY KEY,
        name STRING NOT NULL,
        sort INTEGER NOT NULL,
        description STRING
      );
    `);

    // 卡包
    db.exec(`
      CREATE TABLE cardPacks (
        id INTEGER PRIMARY KEY,
        name STRING NOT NULL,
        sort INTEGER NOT NULL,
        description STRING
      );
    `);

    // 卡片
    db.exec(`
      CREATE TABLE cards (
        id INTEGER PRIMARY KEY,
        classes STRING,
        type STRING,
        rarity STRING,
        cardPackId STRING,
        cost INTEGER,
        name STRING,
        isReborn INTEGER,
        isToken INTEGER,
        image TEXT,
        tokenIds STRING,
        parentIds INTEGER,
        FOREIGN KEY (cardPackId) REFERENCES cardPacks(id)
      );

      CREATE INDEX cardId ON cards (id);
    `);

    // 卡片与兵种的关联关系表
    db.exec(`
      CREATE TABLE cardTraits (
        cardId INTEGER,
        traitId INTEGER,
        PRIMARY KEY (cardId, traitId),
        FOREIGN KEY (cardId) REFERENCES cards(id),
        FOREIGN KEY (traitId) REFERENCES traits(id)
      );
    `);

    // 卡片详情表
    db.exec(`
      CREATE TABLE cardDetails (
        id INTEGER PRIMARY KEY,
        cardId INTEGER,
        evolvedStage INTEGER,
        attack INTEGER,
        health INTEGER,
        description STRING,
        FOREIGN KEY (cardId) REFERENCES cards(id)
      );

      CREATE INDEX cardDetailsId ON cardDetails (id);
    `);

    // 卡片详情与能力关键字的关联关系表
    db.exec(`
      CREATE TABLE cardDetailAbilities (
        cardDetailId INTEGER,
        abilityId INTEGER,
        PRIMARY KEY (cardDetailId, abilityId),
        FOREIGN KEY (cardDetailId) REFERENCES cardDetails(id),
        FOREIGN KEY (abilityId) REFERENCES abilities(id)
      );
    `);

    db.pragma('user_version = 1');
  })();

  logger.info('updateToSchemaVersion1: success!');
}

function updateToSchemaVersion2(
  currentVersion: number,
  db: Database,
  logger: Omit<LogFunctions, 'log'>,
) {
  if (currentVersion >= 2) return;

  logger.info('updateToSchemaVersion1: starting...');

  db.transaction(() => {
    db.pragma('user_version = 2');
  })();

  logger.info('updateToSchemaVersion2: success!');
}

export const SCHEMA_VERSIONS = [updateToSchemaVersion1];

export default function updateSchema(
  db: Database,
  logger: Omit<LogFunctions, 'log'>,
): void {
  const sqliteVersion = getSQLiteVersion(db);
  const sqlcipherVersion = getSQLCipherVersion(db);
  const userVersion = getUserVersion(db);
  const maxUserVersion = SCHEMA_VERSIONS.length;
  const schemaVersion = getSchemaVersion(db);

  logger.info(
    'updateSchema:\n',
    ` Current user_version: ${userVersion};\n`,
    ` Most recent db schema: ${maxUserVersion};\n`,
    ` SQLite version: ${sqliteVersion};\n`,
    ` SQLCipher version: ${sqlcipherVersion};\n`,
    ` (deprecated) schema_version: ${schemaVersion};\n`,
  );

  if (userVersion > maxUserVersion) {
    throw new Error(
      `SQL: User version is ${userVersion} but the expected maximum version ` +
        `is ${maxUserVersion}. Did you try to start an old version of App?`,
    );
  }

  for (let index = 0; index < maxUserVersion; index += 1) {
    const runSchemaUpdate = SCHEMA_VERSIONS[index];

    runSchemaUpdate(userVersion, db, logger);
  }
}
