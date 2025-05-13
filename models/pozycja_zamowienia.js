const db = require("../db");

const pozycja_zamowienia = db.Model.extend({
  tableName: "pozycjazamowienia",
  idAttribute: "id_pozycji",
  
  produkt() {
    return this.belongsTo("Produkt", "id_produktu");
  },

  zamowienie() {
    return this.belongsTo("Zamowienie", "id_zamowienia");
  }
});

module.exports = db.model("pozycjazamowienia", pozycja_zamowienia);
