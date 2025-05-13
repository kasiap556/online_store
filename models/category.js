const db = require("../db");

const Kategoria = db.Model.extend({
  tableName: "kategoria",
  idAttribute: "id_kategorii",
  products() {
    return this.hasMany("Produkt", "id_kategorii");
  }
});

module.exports = db.model("Kategoria", Kategoria);
