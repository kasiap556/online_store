const { StatusCodes } = require("http-status-codes");
const express = require("express");

const bodyParser = require("body-parser");
const productsRoutes = require("./routes/products");
const ordersRoutes = require("./routes/orders");
const categoriesRoutes = require("./routes/categories");
const statusRoutes = require("./routes/status");
// const koszykRoutes = require('./routes/koszyk');
const ProduktModel = require("./models/product");
const Zamowienie = require("./models/order")  
const PozycjaZamowienia = require("./models/pozycja_zamowienia")
const fs = require('fs');
const path = require('path');

const app = express();

app.get('/init.json', (req, res) => {
	console.log("Received request for /init");
	  const initData = loadInitData();
	  if (initData) {
		res.json(initData);
	  } else {
		console.error('Error: init.json could not be loaded');
		res.status(500).json({ error: "Nie można załadować pliku init.json." });
	  }
});

app.use(express.static('public'));
app.set('views', 'views'); 
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use("/products", productsRoutes);
app.use("/orders", ordersRoutes);
app.use("/categories", categoriesRoutes);
app.use("/status", statusRoutes);
app.use('/', productsRoutes);

function loadInitData() {
  const filePath = path.join(__dirname, 'init.json');
  console.log("File path:", filePath);
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
	console.log("init.json loaded:", data);
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading init.json:', error);
    return null;
  }
}

app.post('/init', async (req, res) => {
	const productCount = await ProduktModel.count();
  if (productCount > 0) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "Database is already initalized."
    });
  }

  const initData = loadInitData();
  if (!Array.isArray(initData.products) || initData.products.length === 0) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "No data to input."
    });
  }

  for (let i=0; i < initData.products.length; i++) {
	const { nazwa, opis, cena_jednostkowa, waga_jednostkowa, id_kategorii } = initData.products[i];
	try {
		const produkt = await ProduktModel.forge({
		  nazwa,
		  opis,
		  cena_jednostkowa,
		  waga_jednostkowa,
		  id_kategorii,
		}).save();
	} catch (err) {
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
	}
  }
  return res.status(StatusCodes.OK).json({
    message: "Succesfull database init."
  });
});

// app.get('/', function(req, res){
//     res.render('index.ejs');
// });

app.get('/api/products', async (req, res) => {
  try {
    const products = await ProduktModel.fetchAll({ withRelated: ['category'] });
    res.json(products.toJSON());
  } catch (error) {
    console.error('Błąd pobierania produktów:', error);
    res.status(500).json({ error: 'Błąd pobierania produktów' });
  }
});


app.listen(3000, () => {
  console.log("Serwer działa na porcie 3000");
});


function createOrder(cart, customerDetails) {
  return {
      orderId: Date.now(),
      items: cart,
      customer: customerDetails,
      totalAmount: cart.reduce((total, item) => total + item.price, 0),
      status: 'Nowe'
  };
}

app.post('/order', (req, res) => {
  const { cart, customerDetails } = req.body;
  const order = createOrder(cart, customerDetails);
  res.status(201).send(order);
});

app.get("/zamow", (req, res)=>{


});

// app.post("/zamow", async (req, res) => {
//   try {
//       const { idKlienta, koszyk, idStanu } = req.body;

//       if (!idKlienta || !koszyk || !idStanu) {
//           return res.status(400).json({ error: "Brak wymaganych danych!" });
//       }

//       const dataUtworzenia = new Date();

//       // Tworzymy nowe zamówienie
//       const zamowienie = await Zamowienie.forge({
//           data_zatwierdzenia: dataUtworzenia,
//           nazwa_uzytkownika: "testuser",
//           email: "testuser@test.com",
//           numer_telefonu: "000000000",
//           id_stanu: idStanu, // Zakładam, że to np. "oczekujące"
//       }).save();

//       const idZamowienia = zamowienie.get("id_zamowienia");
      

//       // Tworzymy pozycje zamówienia na podstawie koszyka
//       for (const [idProduktu, ilosc] of Object.entries(koszyk)) {
//           await PozycjaZamowienia.forge({
//               id_zamowienia: idZamowienia,
//               id_produktu: idProduktu,
//               liczba_sztuk: ilosc,
//           }).save();
//       }

//       res.redirect(`/order/${idZamowienia}/summary`);
//       res.status(201).json({ message: "Zamówienie utworzone!", idZamowienia });
//   } catch (error) {
//       console.error("Błąd przy tworzeniu zamówienia:", error);
//       res.status(500).json({ error: "Coś poszło nie tak!" });
//   }
// });

app.post("/zamow", async (req, res) => {
  try {
      const { idKlienta, koszyk, idStanu } = req.body;

      if (!idKlienta || !koszyk || !idStanu) {
          return res.status(400).json({ error: "Brak wymaganych danych!" });
      }

      const dataUtworzenia = new Date();

      // Tworzymy nowe zamówienie
      const zamowienie = await Zamowienie.forge({
          data_zatwierdzenia: dataUtworzenia,
          nazwa_uzytkownika: "testuser",
          email: "testuser@test.com",
          numer_telefonu: "000000000",
          id_stanu: idStanu, // Zakładam, że to np. "oczekujące"
      }).save();

      const idZamowienia = zamowienie.get("id_zamowienia");
      

      // Tworzymy pozycje zamówienia na podstawie koszyka
      for (const [idProduktu, ilosc] of Object.entries(koszyk)) {
          await PozycjaZamowienia.forge({
              id_zamowienia: idZamowienia,
              id_produktu: idProduktu,
              liczba_sztuk: ilosc,
          }).save();
      }

      // Przekierowanie na stronę edycji zamówienia
      res.status(201).json({ message: "Zamówienie utworzone!", idZamowienia });
      // res.redirect(`/orders/${idZamowienia}/summary`);

  } catch (error) {
      console.error("Błąd przy tworzeniu zamówienia:", error);
      res.status(500).json({ error: "Coś poszło nie tak!" });
  }
});

app.post('/koszyk/dodaj', (req, res) => {
  const { id_produktu } = req.body;

  if (!id_produktu) {
    return res.status(400).send('ID produktu jest wymagane.');
  }

  // Tworzenie koszyka na podstawie sesji
  const koszyk = new Koszyk(req.session);

  // Dodanie produktu do koszyka
  koszyk.dodajProdukt(id_produktu);

  res.redirect('/'); // Przekierowanie z powrotem na stronę główną
});


