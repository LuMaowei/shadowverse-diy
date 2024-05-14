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
    // 职业表
    db.exec(`
      CREATE TABLE roles (
        id INTEGER PRIMARY KEY,
        name STRING NOT NULL,
        label STRING NOT NULL,
        checkIcon STRING,
        gem STRING,
        emblem STRING,
        cardBackground STRING
      );
    `);

    // 卡片种类表
    db.exec(`
      CREATE TABLE types (
        id INTEGER PRIMARY KEY,
        name STRING NOT NULL,
        label STRING NOT NULL
      );
   `);

    // 卡片稀有度表
    db.exec(`
      CREATE TABLE rarities (
        id INTEGER PRIMARY KEY,
        name STRING NOT NULL,
        label STRING NOT NULL
      );
    `);

    // 卡片框架表
    db.exec(`
      CREATE TABLE frames (
        id INTEGER PRIMARY KEY,
        typeId INTEGER,
        rarityId INTEGER,
        frame STRING,
        FOREIGN KEY (typeId) REFERENCES types(id),
        FOREIGN KEY (rarityId) REFERENCES rarities(id),
        UNIQUE (typeId, rarityId)
      );
    `);

    // 兵种表
    db.exec(`
      CREATE TABLE traits (
        id INTEGER PRIMARY KEY,
        name STRING NOT NULL,
        label STRING NOT NULL
      );
    `);

    // 卡片能力关键字表
    db.exec(`
      CREATE TABLE abilities (
        id INTEGER PRIMARY KEY,
        name STRING NOT NULL,
        label STRING NOT NULL,
        sort INTEGER NOT NULL,
        description STRING
      );
    `);

    // 卡片表
    db.exec(`
      CREATE TABLE cards (
        id INTEGER PRIMARY KEY,
        roleId INTEGER,
        typeId INTEGER,
        traitId INTEGER,
        rarityId INTEGER,
        cost INTEGER,
        name STRING,
        isToken BOOLEAN,
        tokenIds STRING,
        parentId INTEGER,
        isReborn BOOLEAN,
        image STRING,
        FOREIGN KEY (roleId) REFERENCES roles(id),
        FOREIGN KEY (typeId) REFERENCES types(id),
        FOREIGN KEY (traitId) REFERENCES traits(id),
        FOREIGN KEY (rarityId) REFERENCES rarities(id)
      );

      CREATE INDEX cardId ON cards (id);
    `);

    // 卡片详情表
    db.exec(`
      CREATE TABLE cardDetails (
        id INTEGER PRIMARY KEY,
        cardId INTEGER,
        evolutionStage INTEGER,
        attack INTEGER,
        health INTEGER,
        description STRING,
        FOREIGN KEY (cardId) REFERENCES cards(id)
      );

      CREATE INDEX cardDetailsId ON cardDetails (id);
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
    db.exec(`
      CREATE TABLE group(
        id INTEGER PRIMARY KEY,
        userId INTEGER NOT NULL,
        account STRING NOT NULL,
        token STRING,
        avatar STRING DEFAULT NULL,
        email STRING DEFAULT NULL,
        theme STRING,
        regisTime STRING,
        updateTime STRING
      );
    `);

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
