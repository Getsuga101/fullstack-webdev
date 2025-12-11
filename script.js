// Product Data
    const products = [
      { id: 1, name: "Wireless Headphones", price: 12000, img: "assets/img/headphone.jpg" },
      { id: 2, name: "Smart Watch", price: 18000, img: "assets/img/smartwatch.jpg" },
      { id: 3, name: "Bluetooth Speaker", price: 9500, img: "assets/img/BT_speaker.jpg" },
      { id: 4, name: "Phone Case", price: 2500, img: "assets/img/phonecase.jpg" },
      { id: 5, name: "Phone Case", price: 2500, img: "assets/img/phonecase.jpg" }
    ];

    const cart = [];
    const productList = document.getElementById('product-list');
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');
    const cartModal = new bootstrap.Modal(document.getElementById('cartModal'));

    // Display products
    products.forEach(p => {
      const col = document.createElement('div');
      col.classList.add('col-md-3', 'mb-4');
      col.innerHTML = `
        <div class="card product-card text-center p-3">
          <img src="${p.img}" class="card-img-top" alt="${p.name}">
          <div class="card-body">
            <h5 class="card-title">${p.name}</h5>
            <p class="card-text text-primary fw-bold">₦${p.price}</p>
            <button class="btn btn-outline-primary add-to-cart" data-id="${p.id}">Add to Cart</button>
          </div>
        </div>
      `;
      productList.appendChild(col);
    });

    // Add to cart
    document.querySelectorAll('.add-to-cart').forEach(btn => {
      btn.addEventListener('click', () => {
        const product = products.find(p => p.id == btn.dataset.id);
        cart.push(product);
        updateCart();
      });
    });

    // Update cart
    function updateCart() {
      cartItems.innerHTML = '';
      let total = 0;

      cart.forEach((item, index) => {
        total += item.price;
        const li = document.createElement('li');
        li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
        li.innerHTML = `
          ${item.name} - ₦${item.price}
          <button class="btn btn-sm btn-danger remove-item" data-index="${index}">Remove</button>
        `;
        cartItems.appendChild(li);
      });

      cartCount.textContent = cart.length;
      cartTotal.textContent = total;

      // Remove item
      document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', () => {
          cart.splice(btn.dataset.index, 1);
          updateCart();
        });
      });
    }

    // Open cart
    document.getElementById('cart-btn').addEventListener('click', () => {
      cartModal.show();
    });

    // Checkout simulation
    document.getElementById('checkout-btn').addEventListener('click', () => {
      if (cart.length === 0) {
        alert("Your cart is empty!");
      } else {
        alert("Payment Successful! Thank you for shopping with us 💳");
        cart.length = 0;
        updateCart();
        cartModal.hide();
      }
    });