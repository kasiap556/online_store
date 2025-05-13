const express = require("express");
const router = express.Router();
const Kategoria = require("../models/category");

router.get("/", async (req, res) => {
  try {
    const kategorie = await Kategoria.fetchAll();
    res.json(kategorie.toJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
