const express = require("express");
const router = express.Router();
const StanZamowienia = require("../models/orderStatus");

router.get("/", async (req, res) => {
  try {
    const stany = await StanZamowienia.fetchAll();
    res.json(stany.toJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
