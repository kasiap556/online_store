const db = require("../db");

const Zamowienie = db.Model.extend({
  tableName: "zamowienie",
  idAttribute: "id_zamowienia",
  orderItems() {
    return this.hasMany("pozycjazamowienia", "id_zamowienia"); 
  },
  status() {
    return this.belongsTo("StanZamowienia", "id_stanu"); 
  }
});

module.exports = db.model("Zamowienie", Zamowienie);
