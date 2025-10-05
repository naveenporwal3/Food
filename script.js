document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('orderForm');
  const confirmation = document.getElementById('confirmation');
  const totalPrice = document.getElementById('totalPrice');
  const orderDetails = document.getElementById('orderDetails');
  const submitBtn = document.getElementById('submitBtn');
  const loading = document.getElementById('loading');
  const foodOptions = document.querySelector('.food-options');

  // Menu Items Array - ADD NEW ITEMS HERE (name, price, image file, fallback icon)
  const menuItems = [
    { name: 'Pizza', price: 12, image: 'pizza.png', icon: 'fas fa-pizza-slice' },
    { name: 'Burger', price: 8, image: 'burger.png', icon: 'fas fa-hamburger' },
    { name: 'Fries', price: 5, image: 'fries.png', icon: 'fas fa-drumstick-bite' },
    { name: 'Biryani', price: 15, image: 'biryani.png', icon: 'fas fa-rice' },
    { name: 'Dosa', price: 10, image: 'dosa.png', icon: 'fas fa-utensils' },
    { name: 'Naan', price: 6, image: 'naan.png', icon: 'fas fa-bread-slice' }
    // To add: { name: 'Idli', price: 7, image: 'idli.png', icon: 'fas fa-utensils' },
  ];

  let cartItems = []; // {food, qty}
  let foodCards = []; // Store for listeners

  // Generate Cards Dynamically
  menuItems.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'food-card';
    card.dataset.food = item.name;
    card.innerHTML = `
      <img src="${item.image}" alt="${item.name}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
      <i class="${item.icon} fallback-icon" style="display: none; font-size: 3rem; color: #ff6b6b;"></i>
      <span>${item.name} (₹${item.price})</span>
      <label class="checkbox-label">
        <input type="checkbox" name="food[]" value="${item.name}" class="food-checkbox">
        <span class="checkmark"></span>
      </label>
      <input type="number" class="item-qty" min="1" value="1" style="display: none;">
    `;
    foodOptions.appendChild(card);
    foodCards.push(card); // Collect for listeners
  });

  console.log(`${menuItems.length} cards generated!`); // Debug: Check console

  // Function to calculate and update total
  function updateTotal() {
    let grandTotal = 0;
    cartItems = [];
    foodCards.forEach(card => {
      const checkbox = card.querySelector('.food-checkbox');
      const qtyInput = card.querySelector('.item-qty');
      if (checkbox && checkbox.checked && qtyInput) {
        const food = checkbox.value;
        const qty = parseInt(qtyInput.value) || 1;
        cartItems.push({ food, qty });
        const itemPrice = menuItems.find(m => m.name === food)?.price || 0;
        grandTotal += itemPrice * qty;
      }
    });
    const totalStr = grandTotal.toFixed(2);
    totalPrice.textContent = `Total: ₹${totalStr}`;
    totalPrice.style.display = grandTotal > 0 ? 'block' : 'none';
  }

  // Card click to toggle checkbox
  foodCards.forEach(card => {
    card.addEventListener('click', function(e) {
      if (e.target.tagName === 'INPUT') return; // Avoid double-toggle on qty
      const checkbox = card.querySelector('.food-checkbox');
      if (checkbox) {
        checkbox.checked = !checkbox.checked;
        checkbox.dispatchEvent(new Event('change'));
      }
    });
  });

  // Listen for checkbox and qty changes
  document.addEventListener('change', function(e) {
    if (e.target.classList.contains('food-checkbox')) {
      const card = e.target.closest('.food-card');
      const qtyInput = card.querySelector('.item-qty');
      qtyInput.style.display = e.target.checked ? 'block' : 'none';
      if (e.target.checked) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
      updateTotal();
    }
  });

  document.addEventListener('input', function(e) {
    if (e.target.classList.contains('item-qty')) {
      updateTotal();
    }
  });

  // Initial update
  updateTotal();

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const formData = new FormData(form);
    const name = formData.get('name');
    const address = formData.get('address');

    if (cartItems.length === 0 || !name || !address) {
      alert('Please select at least one item and fill in your details.');
      return;
    }

    // Show loading
    submitBtn.disabled = true;
    loading.classList.remove('hidden');

    // Prepare data for SheetDB
    const data = {
      data: {
        name: name,
        address: address,
        cart: JSON.stringify(cartItems), // Array as JSON
        total: cartItems.reduce((sum, item) => sum + (menuItems.find(m => m.name === item.food)?.price || 0) * item.qty, 0).toFixed(2),
        timestamp: new Date().toISOString()
      }
    };

    fetch("https://sheetdb.io/api/v1/qwy02wpreu8z3", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('Order saved to Sheets!', data);
        
        // Update confirmation with details
        const itemsStr = cartItems.map(item => `${item.food} x${item.qty}`).join(', ');
        orderDetails.innerHTML = `${itemsStr} for ₹${data.data.total} to ${name} at ${address}`;
        
        // Hide form and show confirmation
        form.style.display = 'none';
        confirmation.classList.remove('hidden');
        loading.classList.add('hidden');
      })
      .catch(error => {
        console.error("Error:", error);
        alert("❌ Failed to place order. Please try again.");
        submitBtn.disabled = false;
        loading.classList.add('hidden');
      });
  });
});
