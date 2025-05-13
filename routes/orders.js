const express = require("express");
const router = express.Router();
const Zamowienie = require("../models/order");
const PozycjaZamowienia = require("../models/pozycja_zamowienia")
const Produkt = require("../models/product")

router.get("/", async (req, res) => {
  try {
    const zamowienia = await Zamowienie.fetchAll({ withRelated: ["orderItems"] });
    res.json(zamowienia.toJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/table", async (req, res) => {
  try {
    const zamowienia = await Zamowienie.fetchAll({ withRelated: ["orderItems", "status"] });
    res.render('zamowienia', {zamowienia: zamowienia.toJSON()});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
      const { id } = req.params; // Id zamówienia do edycji
      const { koszyk, idStanu, daneKontaktowe } = req.body;

      // Znajdź zamówienie w bazie
      const order = await Order.findOne({ where: { id_zamowienia: id } });

      if (!order) {
          return res.status(404).json({ error: "Zamówienie nie zostało znalezione" });
      }

      // Aktualizowanie zamówienia (koszyk, stan, dane kontaktowe)
      await order.update({
          koszyk,
          id_stanu: idStanu,
          dane_kontaktowe: daneKontaktowe
      });

      res.status(200).json({ message: "Zamówienie zostało zaktualizowane", order });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// Endpoint do zmiany statusu na "Zrealizowane"
router.put("/:id/status/zrealizowane", async (req, res) => {
  try {
    const zamowienie = await Zamowienie.where({ id_zamowienia: req.params.id }).fetch();
    if (!zamowienie) {
      return res.status(404).json({ error: "Zamówienie o podanym identyfikatorze nie istnieje" });
    }

    // Ustawiamy status na "zrealizowane" (przykładowe id_stanu: 2)
    await zamowienie.save({ id_stanu: 2 }); // Zrealizowane
    res.status(200).json({ message: "Status zamówienia zmieniony na 'zrealizowane'" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint do zmiany statusu na "Anulowane"
router.put("/:id/status/anulowane", async (req, res) => {
  try {
    const zamowienie = await Zamowienie.where({ id_zamowienia: req.params.id }).fetch();
    if (!zamowienie) {
      return res.status(404).json({ error: "Zamówienie o podanym identyfikatorze nie istnieje" });
    }

    // Ustawiamy status na "anulowane" (przykładowe id_stanu: 3)
    await zamowienie.save({ id_stanu: 3 }); // Anulowane
    res.status(200).json({ message: "Status zamówienia zmieniony na 'anulowane'" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:idZamowienia/wartosc", async (req, res) => {
  const { idZamowienia } = req.params;

  try {
      // Pobierz pozycje zamówienia dla podanego ID zamówienia
      const pozycje = await PozycjaZamowienia.where({ id_zamowienia: idZamowienia }).fetchAll();

      // Oblicz sumę
      let wartoscZamowienia = 0;
      for (const pozycja of pozycje.models) {
          const idProduktu = pozycja.get("id_produktu");
          const ilosc = pozycja.get("liczba_sztuk");

          // Pobierz cenę produktu
          const produkt = await Produkt.where({ id_produktu: idProduktu }).fetch();
          const cenaProduktu = produkt.get("cena_jednostkowa");

          // Dodaj wartość tej pozycji do sumy zamówienia
          wartoscZamowienia += cenaProduktu * ilosc;
      }

      res.json({ wartoscZamowienia });
  } catch (error) {
      console.error("Błąd przy obliczaniu wartości zamówienia:", error);
      res.status(500).json({ error: "Coś poszło nie tak!" });
  }
});



router.get("/:id", async (req, res) => {
  try {
    const zamowienie = await Zamowienie.where({ id_zamowienia: req.params.id }).fetch({ withRelated: ["orderItems"] });
    if (!zamowienie) {
      return res.status(404).json({ error: "Zamówienie nie znalezione" });
    }
    res.json(zamowienie.toJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id/summary", async (req, res) => {
  try {
    const zamowienie = await Zamowienie.where({ id_zamowienia: req.params.id }).fetch();
    if (!zamowienie) {
      return res.status(404).json({ error: "Zamówienie nie znalezione" });
    }
    // res.json(zamowienie.toJSON());
    res.render('summary', {zamowienie: zamowienie.toJSON()})
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
      const { email, phone, username, orderItems } = req.body;
      const order = await Order.where({ id_zamowienia: req.params.id }).fetch();

      if (!order) {
          return res.status(404).json({ error: "Zamówienie nie istnieje" });
      }

      order.set({
          email,
          phone,
          username
      });

      await order.save();

      // Aktualizacja pozycji zamówienia
      for (const item of orderItems) {
          const orderItem = await OrderItem.where({ id_zamowienia: req.params.id, id_produktu: item.id_produktu }).fetch();
          if (orderItem) {
              await orderItem.save({ liczba_sztuk: item.liczba_sztuk });
          }
      }

      res.json(order.toJSON());
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

router.get("/user/:username", async (req, res) => {
  try {
    const zamowienia = await Zamowienie.where({ nazwa_uzytkownika: req.params.username }).fetchAll();
    res.json(zamowienia.toJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { email, nazwa_uzytkownika, numer_telefonu, towary } = req.body;

    if (!email || !nazwa_uzytkownika || !numer_telefonu) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: "Pola użytkownika (email, nazwa_uzytkownika, numer_telefonu) są wymagane" });
    }

    const numerTelefonuRegex = /^[0-9]{9}$/;  // Zakładamy polski numer telefonu
    if (!numerTelefonuRegex.test(numer_telefonu)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: "Numer telefonu jest nieprawidłowy" });
    }

    for (const towar of towary) {
      const produkt = await Produkt.where({ id_produktu: towar.id_produktu }).fetch();
      if (!produkt) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: `Produkt o id ${towar.id_produktu} nie istnieje w bazie` });
      }
      if (towar.liczba_sztuk <= 0) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: `Liczba sztuk produktu ${towar.id_produktu} musi być większa niż zero` });
      }
    }

    const zamowienie = await Zamowienie.forge(req.body).save();
    res.status(StatusCodes.CREATED).json(zamowienie.toJSON());
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
  }
});


router.patch("/orders/:id", async (req, res) => {
  const { id_stanu } = req.body;
  try {
    const zamowienie = await Zamowienie.where({ id_zamowienia: req.params.id }).fetch();
    if (!zamowienie) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: "Zamówienie o podanym identyfikatorze nie istnieje" });
    }

    const stan = await StanZamowienia.where({ id_stanu }).fetch();
    if (!stan) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: "Nieprawidłowy stan zamówienia" });
    }

    const aktualnyStan = zamowienie.get("id_stanu");
    if (stan.get("nazwa") === "Anulowane" && aktualnyStan === stan.get("id_stanu")) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: "Nie można zmieniać stanu anulowanego zamówienia" });
    }

    const stanyWstecz = ["Niezatwierdzone", "Zrealizowane"];
    if (stanyWstecz.includes(stan.get("nazwa")) && stanyWstecz.indexOf(zamowienie.get("id_stanu")) > stanyWstecz.indexOf(stan.get("nazwa"))) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: "Nie można zmienić stanu zamówienia wstecz" });
    }

    await zamowienie.save({ id_stanu }, { patch: true });
    res.status(StatusCodes.OK).json(zamowienie.toJSON());
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
  }
});


router.get("/status/:id", async (req, res) => {
  try {
    const zamowienia = await Zamowienie.where({ id_stanu: req.params.id }).fetchAll();
    res.json(zamowienia.toJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
