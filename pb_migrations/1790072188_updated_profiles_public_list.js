/// <reference path="../pb_data/types.d.ts" />
// profiles: datos publicos (alias, bio, avatar). users sigue restringida al admin (migracion 1789927200).
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("profiles");
  collection.listRule = "@request.auth.id != \"\"";
  collection.viewRule = "@request.auth.id != \"\"";
  return dao.saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("profiles");
  collection.listRule = "";
  collection.viewRule = "@request.auth.id = user";
  return dao.saveCollection(collection);
});
