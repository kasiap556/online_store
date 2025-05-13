const db = require("../db");

const StanZamowienia = db.Model.extend({
  tableName: "stanzamowienia",
  idAttribute: "id_stanu",
  orders() {
    return this.hasMany("Zamowienie", "id_stanu"); 
  }
});

module.exports = db.model("StanZamowienia", StanZamowienia);
