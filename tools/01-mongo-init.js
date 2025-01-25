db = db.getSiblingDB('PLACEHOLDER_NAME_DB');
db.createCollection('users');
db.users.createIndex(
    {
        name: "text",
        email: "text",
    }
);
db.createUser(
  {
    user: "control-msc-user",
    pwd: "control-msc-pass",
    roles: [
      {
        role: "readWrite",
        db: "PLACEHOLDER_NAME_DB"
      }
    ]
  }
);
