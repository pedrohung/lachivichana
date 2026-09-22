/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("users");
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "lstseen01",
    "name": "lastSeen",
    "type": "date",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": { "min": "", "max": "" }
  }));
  collection.listRule = '@request.auth.email = "hungpedros@gmail.com"';
  return dao.saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("users");
  collection.schema.removeField("lstseen01");
  collection.listRule = "id = @request.auth.id";
  return dao.saveCollection(collection);
});
