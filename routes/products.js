const express = require("express");
const router = express.Router();
const Produkt = require("../models/product");
const Kategoria = require("../models/category");

const axios = require("axios");
const apiKey = "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";
const model = "llama3-8b-8192";
const apiUrl = "https://api.groq.com/openai/v1/chat/completions";


// router.get("/", async (req, res) => {
//   try {
//     const produkty = await Produkt.fetchAll();
//     // console.log(produkty);
//     // res.json(produkty.toJSON());
//     console.log(produkty.toJSON()); 
//     res.render('index', { produkty: produkty.toJSON() });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

const { StatusCodes } = require('http-status-codes');


router.get("/", async (req, res) => {
  try {
    const produkty = await Produkt.fetchAll(); 
    const kategorie = await Kategoria.fetchAll(); 
    console.log(produkty.toJSON());
    res.render('index', { produkty: produkty.toJSON(), kategorie: kategorie.toJSON() }); 
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



router.get("/:id", async (req, res) => {
  try {
    const produkt = await Produkt.where({ id_produktu: req.params.id }).fetch();
    if (!produkt) {
      return res.status(StatusCodes.NotFound).json({ error: "Product not found" });
    }
    res.json(produkt);
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { nazwa, opis, cena_jednostkowa, waga_jednostkowa, id_kategorii } = req.body;
    if (!nazwa || !opis) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: "Nazwa i opis produktu są wymagane" });
    }
    if (cena_jednostkowa <= 0 || waga_jednostkowa <= 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: "Cena i waga muszą być większe niż zero" });
    }
    const produkt = await Produkt.forge({
      nazwa,
      opis,
      cena_jednostkowa,
      waga_jednostkowa,
      id_kategorii,
    }).save();
    res.status(StatusCodes.Created).json(produkt.toJSON());
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { nazwa, opis, cena_jednostkowa, waga_jednostkowa, id_kategorii } = req.body;
    const produkt = await Produkt.where({ id_produktu: req.params.id }).fetch();
    if (!produkt) {
      return res.status(StatusCodes.NotFound).json({ error: "Produkt o podanym identyfikatorze nie istnieje" });
    }
    if (!nazwa || !opis) {
      return res.status(StatusCodes.BadRequest).json({ error: "Nazwa i opis produktu są wymagane" });
    }
    if (cena_jednostkowa <= 0 || waga_jednostkowa <= 0) {
      return res.status(StatusCodes.BadRequest).json({ error: "Cena i waga muszą być większe niż zero" });
    }
    await produkt.save({
      nazwa,
      opis,
      cena_jednostkowa,
      waga_jednostkowa,
      id_kategorii,
    });
    res.status(StatusCodes.OK).json(produkt.toJSON());
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
  }
});

router.get('/:id/seo-description', async (req, res) => {
  try {
    const produkt = await Produkt.where({ id_produktu: req.params.id }).fetch();
	const pr_nazwa = produkt.get('nazwa');
	const pr_opis = produkt.get('opis');
	const pr_cena = produkt.get('cena_jednostkowa');
	const pr_waga = produkt.get('waga_jednostkowa')
	const id_kategorii = produkt.get('id_kategorii');
	const kategoria = await Kategoria.where({ id_kategorii }).fetch();
	const nazwaK = kategoria.get("nazwa");

    const prompt = `Write product description in HTML compliant with SEO requirements for product:
Nazwa: ${pr_nazwa}, Opis: ${pr_opis}, Cena Jednostkowa: ${pr_cena}, Waga Jednostkowa: ${pr_waga}, Kategoria: ${nazwaK}.
Write the description and only the description, don't add anything else.
    `;

	const body = {
          messages: [{ role: 'user', content: prompt }],
          model: model,
		  temperature: 1,
		  max_tokens: 1024,
		  top_p: 1,
		  stop: null
        };

    const response = await axios.post(
      apiUrl, body, {
	  headers: {
		  'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
	});

    if (response.data && response.data.choices && response.data.choices[0].message) {
      const seoDescription = response.data.choices[0].message.content.trim();
      res.status(StatusCodes.OK).json({ seoDescription });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to generate SEO description' });
    }
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'An error occurred' });
  }
});

module.exports = router;

router.get("/filter", async (req, res) => {
  try {
    const { nazwa, id_kategorii } = req.query;
    let query = Produkt.query();

    if (nazwa) {
      query = query.where("nazwa", "like", `%${nazwa}%`);
    }
    if (id_kategorii) {
      query = query.where("id_kategorii", id_kategorii);
    }

    const produkty = await query.fetchAll();
    res.json(produkty.toJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
