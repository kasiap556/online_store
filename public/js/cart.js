document.addEventListener('DOMContentLoaded', () => { //https://developer.mozilla.org/en-US/docs/Web/API/Document/DOMContentLoaded_event
    cart = new Map();
});

function addToCart(id){
    if(cart.has(id)){
        cart.set(id, cart.get(id) + 1);
    }
    else
    {
        cart.set(id, 1);
    }

    renderCart()
}

function countItemsInCart(id){
    return cart.includes(id) ? cart.filter(x => x === id).length : 0;
}

function removeFromCart(id){
    if (cart.has(id)) {
        const newQuantity = cart.get(id) - 1;
        if (newQuantity > 0) {
            cart.set(id, newQuantity); // Zmniejszamy wartość
        } else {
            cart.delete(id); // Usuwamy klucz, jeśli wartość osiąga 0
        }
    }
    renderCart()

}

function removeFromCartTotally(id){
    if (cart.has(id)) {
        cart.delete(id);
    }
    renderCart()

}


function deleteCart(){
    cart = new Map();
    renderCart();
}

function orderCart(){

    const zamowienie = {
        idKlienta: 123, // Przykładowe ID klienta
        koszyk: Object.fromEntries(cart), // Konwersja Map na obiekt
        idStanu: 1, // Przykładowy ID stanu (np. "oczekujące")
    };
    
    fetch("/zamow", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(zamowienie),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Błąd: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            console.log("Sukces:", data);
            const orderId = data.idZamowienia; 
            window.location.href = "/orders/table";
        })
        .catch((error) => console.error("Błąd:", error));
}

async function getProductById(id) {
    try {
        const response = await fetch(`/products/${id}`);
        if (!response.ok) {
            throw new Error(`Błąd: ${response.status} - Nie udało się pobrać produktu`);
        }
        const product = await response.json(); // Zakładam, że API zwraca dane w formacie JSON
        return product; // Zwraca obiekt produktu
    } catch (error) {
        console.error("Wystąpił błąd:", error);
    }
}

async function cartPrice() {
    let sum = 0;
    for (const id of cart.keys()) {
        const product = await getProductById(id); // Możesz używać await
        sum += product.cena_jednostkowa * cart.get(id);
    }
    return sum;
}

function renderCart() {
    const cartItems = document.querySelector('#cart-items');
    const totalPriceElement = document.querySelector('#total-price');
    cartItems.innerHTML = '';
    let totalPrice = 0;

    cart.forEach((quantity, id) => {
        
        getProductById(id).then(product => {
        
            const cartItem = document.createElement('li');
            cartItem.classList.add('list-group-item');
            cartItem.innerHTML = `
                ${product.nazwa} - ${product.cena_jednostkowa} zł
                <button class="btn btn-info btn-sm" onclick="addToCart(${id})">+</button>
                ${quantity}
                <button class="btn btn-info btn-sm" onclick="removeFromCart(${id})">-</button>
                <button class="btn btn-danger btn-sm" onclick="removeFromCartTotally(${id})">Usuń</button>
            `;
            cartItems.appendChild(cartItem);
        });
    });

    cartPrice().then(price =>{
        totalPriceElement.textContent = `Łączna cena: ${price.toFixed(2)} zł`;
    });
    
}

