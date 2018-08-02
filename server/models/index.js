import fs from 'fs';
import path from 'path';
import Sequelize from 'sequelize';

import sequelize from '../config/sequelize';

const basename = path.basename(module.filename);
const db = {};
fs
  .readdirSync(__dirname)
  // eslint-disable-next-line no-restricted-syntax
  .filter(file => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach((file) => {
    const model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
