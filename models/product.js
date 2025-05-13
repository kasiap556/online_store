const db = require("../db");

const Produkt = db.Model.extend({
  tableName: "produkt",
  idAttribute: "id_produktu",
  category() {
    return this.belongsTo("Kategoria", "id_kategorii"); 
  },
  orderItems() {
    return this.hasMany("PozycjaZamowienia", "id_produktu"); 
  }
});

module.exports = db.model("Produkt", Produkt);
