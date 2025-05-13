

document.getElementById('searchInput').addEventListener('input', filterProducts);
document.getElementById('categoryFilter').addEventListener('change', filterProducts);

let products = [];

document.addEventListener('DOMContentLoaded', async () => { //https://developer.mozilla.org/en-US/docs/Web/API/Document/DOMContentLoaded_event
    products = await getProducts();
});

async function getProducts() {
    try {
        const response = await fetch(`api/products`);
        if (!response.ok) {
            throw new Error(`Błąd: ${response.status} - Nie udało się pobrać produktów`);
        }
        const product = await response.json(); // Zakładam, że API zwraca dane w formacie JSON
        return product; // Zwraca obiekt produktu
    } catch (error) {
        console.error("Wystąpił błąd:", error);
    }
}


function filterProducts() {
    const searchValue = document.getElementById('searchInput').value.toLowerCase();
    const categoryValue = document.getElementById('categoryFilter').value;
    console.log(categoryValue);

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.nazwa.toLowerCase().includes(searchValue);
        const matchesCategory = categoryValue ? product.id_kategorii == categoryValue : true;
        return matchesSearch && matchesCategory;
    });

    hideOrShowProducts(filteredProducts);
}

function hideOrShowProducts(filtered){
    for (const produkt of products) {
        document.getElementById('product' + produkt.id_produktu).classList.add("d-none");
    }

    for (const produkt of filtered) {
        document.getElementById('product' + produkt.id_produktu).classList.remove("d-none");
    }
}