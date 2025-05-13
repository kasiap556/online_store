module.exports = {
  development: {
    client: "mysql2",
    connection: {
      host: "localhost",
      user: "kasia",
      password: "kasia",
      database: "sklep",
    },
    migrations: {
      tableName: "migrations",
    },
    useNullAsDefault: true,
  },
};
