async function getOrders() {
    try {
        const response = await fetch(`/orders`);
        if (!response.ok) {
            throw new Error(`Błąd: ${response.status} - Nie udało się pobrać produktów`);
        }
        const orders = await response.json(); // Zakładam, że API zwraca dane w formacie JSON
        return orders; // Zwraca obiekt zamowien
    } catch (error) {
        console.error("Wystąpił błąd:", error);
    }
}

function zmienStatus(idZamowienia, status) {
    const url = `/orders/${idZamowienia}/status/${status}`;
  
    fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.status) {
        // Jeśli status został zmieniony pomyślnie, zaktualizuj status w tabeli
        const statusCell = document.getElementById(`status${idZamowienia}`);
        statusCell.innerText = data.status;
      } else {
        location.reload()
      }
    })
    .catch(error => {
      console.error('Błąd:', error);
      alert('Wystąpił błąd przy próbie zmiany statusu.');
    });
  }

document.addEventListener("DOMContentLoaded", async () => {
    const zamowienia = await getOrders();

    for (const zamowienie of zamowienia) {
        const idZamowienia = zamowienie.id_zamowienia;
        try {
            // Wysyłamy zapytanie do serwera po wartość zamówienia
            const response = await fetch(`/orders/${idZamowienia}/wartosc`);
            const data = await response.json();

            // Jeśli zapytanie było udane, uaktualniamy wartość w tabeli
            if (response.ok) {
                document.getElementById(`wartosc${idZamowienia}`).innerText = `${data.wartoscZamowienia} PLN`;
            } else {
                document.getElementById(`wartosc${idZamowienia}`).innerText = 'Błąd obliczeń';
            }
        } catch (error) {
            console.error("Błąd podczas pobierania wartości zamówienia:", error);
            document.getElementById(`wartosc${idZamowienia}`).innerText = 'Błąd połączenia';
        }



        for (const pozycja of zamowienie.orderItems) {
            const produktId = pozycja.id_produktu;
            const liElement = document.getElementById(`zamowienie${idZamowienia}produkt${produktId}`);
      
            try {
              // Wysyłamy zapytanie do serwera po nazwę produktu
              const response = await fetch(`/products/${produktId}`);
              const data = await response.json();
      
              if (response.ok) {
                // Jeśli zapytanie było udane, uaktualniamy nazwę produktu w liście
                console.log(response);
                liElement.textContent = `${data.nazwa} - ${pozycja.liczba_sztuk} szt.`;
              } else {
                liElement.textContent = 'Produkt nie znaleziony';
              }
            } catch (error) {
              console.error("Błąd podczas pobierania produktu:", error);
              liElement.textContent = 'Błąd ładowania produktu';
            }
          }
    }
});