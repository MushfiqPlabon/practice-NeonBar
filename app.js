// app.js
let cart = [];

const productContainer = document.getElementById("product-container");
const cartMainContainer = document.getElementById("cart-main-container");
const countSpan = document.getElementById("count");
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");

// Modal elements
const drinkDetailsModal = document.getElementById('drinkDetailsModal');
const modalTitle = document.getElementById('drinkDetailsModalLabel');
const modalDrinkImg = document.getElementById('modal-drink-img');
const modalDrinkCategory = document.getElementById('modal-drink-category');
const modalDrinkGlass = document.getElementById('modal-drink-glass');
const modalDrinkInstructions = document.getElementById('modal-drink-instructions');
const modalDrinkIngredients = document.getElementById('modal-drink-ingredients');
const modalCloseButton = drinkDetailsModal.querySelector('.modal-close-button');


// Event listener for closing the modal
modalCloseButton.addEventListener('click', () => {
    drinkDetailsModal.classList.add('hidden');
});

// Close modal when clicking outside of it
drinkDetailsModal.addEventListener('click', (event) => {
    if (event.target === drinkDetailsModal) {
        drinkDetailsModal.classList.add('hidden');
    }
});


const loadAllProduct = (searchTerm = '') => {
    let url;
    if (searchTerm) {
        url = `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${searchTerm}`;
    } else {
        url = `https://www.thecocktaildb.com/api/json/v1/1/search.php?f=a`;
    }

    fetch(url)
        .then((res) => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then((data) => {
            if (data.drinks) {
                displayProduct(data.drinks);
            } else {
                productContainer.innerHTML = `<p class="neon-text-alert">No drinks found for your search. Try another query! 😔</p>`;
            }
        })
        .catch((error) => {
            console.error("Error fetching cocktails:", error);
            productContainer.innerHTML = `<p class="neon-text-alert">Failed to load cocktails. Please check your connection. 🚧</p>`;
        });
};

const displayProduct = (drinks) => {
    productContainer.innerHTML = ''; // Clear previous products
    
    drinks.forEach((drink) => {
        const glass = drink.strGlass ? drink.strGlass : 'N/A';
        const instructions = drink.strInstructions ? `${drink.strInstructions.slice(0, 15)}...` : 'No instructions available.';

        const productCard = document.createElement('div');
        productCard.classList.add('product-card');

        productCard.innerHTML = `
            <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}" class="product-img">
            <div class="product-info">
                <h3 class="product-title">${drink.strDrink}</h3>
                <p class="product-category">Category: <span>${drink.strCategory}</span></p>
                <p class="product-glass">Glass: <span>${glass}</span></p>
                <p class="product-instructions">${instructions}</p>
            </div>
            <div class="product-actions">
                <button class="action-button details-btn" data-product-id="${drink.idDrink}">Details <i class="fas fa-info-circle"></i></button>
                <button class="action-button add-to-group-btn" data-product-id="${drink.idDrink}" data-product-name="${drink.strDrink}" data-product-image="${drink.strDrinkThumb}">Add to Group <i class="fas fa-plus-circle"></i></button>
            </div>
        `;
        productContainer.appendChild(productCard);
    });
};

productContainer.addEventListener('click', (event) => {
    const target = event.target;

    // Check if the clicked element or its parent is one of our buttons
    const detailsBtn = target.closest('.details-btn');
    const addBtn = target.closest('.add-to-group-btn');

    if (detailsBtn) {
        const productId = detailsBtn.dataset.productId;
        singleProduct(productId);
    } else if (addBtn) {
        const productId = addBtn.dataset.productId;
        const productName = addBtn.dataset.productName;
        const productImage = addBtn.dataset.productImage;
        handleAddToGroup(productName, productId, productImage);
    }
});

searchButton.addEventListener('click', () => {
    const searchTerm = searchInput.value.trim();
    loadAllProduct(searchTerm);
});

searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        const searchTerm = searchInput.value.trim();
        loadAllProduct(searchTerm);
    }
});

const handleAddToGroup = (name, id, image) => {
    if (cart.length >= 7) {
        alert("Attention! You've reached the max (7) concoctions for your group! 🛑");
        return;
    }

    const existingItem = cart.find(item => item.id === id);

    if (!existingItem) {
        cart.push({ id, name, image });
        updateCartUI();
    } else {
        alert(`"${name}" is already glowing in your group! ✨`);
    }
};

const updateCartUI = () => {
    let cartItemsHtml = `
        <div class="cart-list-header">
            <span class="cart-header-sl">#</span>
            <span class="cart-header-img">Image</span>
            <span class="cart-header-name">Concoction</span>
        </div>
    `;

    let serialNumber = 1;
    cart.forEach(item => {
        cartItemsHtml += `
            <div class="cart-item">
                <span class="cart-item-sl">${serialNumber++}</span>
                <img src="${item.image}" class="cart-item-img" alt="${item.name}">
                <span class="cart-item-name">${item.name}</span>
            </div>
        `;
    });
    
    cartMainContainer.innerHTML = cartItemsHtml;
    countSpan.innerText = cart.length;
};

const singleProduct = (id) => {
    fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`)
        .then((res) => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then((data) => {
            const drinkDetails = data.drinks[0];
            if (drinkDetails) {
                modalTitle.textContent = drinkDetails.strDrink;
                modalDrinkImg.src = drinkDetails.strDrinkThumb;
                modalDrinkImg.alt = drinkDetails.strDrink;
                modalDrinkCategory.textContent = drinkDetails.strCategory;
                modalDrinkGlass.textContent = drinkDetails.strGlass;
                modalDrinkInstructions.textContent = drinkDetails.strInstructions;

                modalDrinkIngredients.innerHTML = '';
                let ingredientsCount = 0;
                for (let i = 1; i <= 15; i++) {
                    const ingredient = drinkDetails[`strIngredient${i}`];
                    const measure = drinkDetails[`strMeasure${i}`];
                    if (ingredient && ingredient.trim() !== '') {
                        const listItem = document.createElement('li');
                        listItem.textContent = `${measure ? measure.trim() + ' ' : ''}${ingredient.trim()}`;
                        modalDrinkIngredients.appendChild(listItem);
                        ingredientsCount++;
                        if (ingredientsCount >= 5 && i >= 5) break; 
                    }
                }
                if (ingredientsCount === 0) {
                    const listItem = document.createElement('li');
                    listItem.textContent = 'No ingredients listed. 🤷‍♀️';
                    modalDrinkIngredients.appendChild(listItem);
                }

                drinkDetailsModal.classList.remove('hidden'); // Show the modal
            } else {
                alert("Concoction details not found. 😔");
            }
        })
        .catch((error) => {
            console.error("Error fetching single drink:", error);
            alert("Failed to illuminate concoction details. 💥");
        });
};

loadAllProduct();