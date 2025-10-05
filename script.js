document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('orderForm');
  const confirmation = document.getElementById('confirmation');
  const totalPrice = document.getElementById('totalPrice');
  const orderDetails = document.getElementById('orderDetails');
  const submitBtn = document.getElementById('submitBtn');
  const loading = document.getElementById('loading');
  const foodCards = document.querySelectorAll('.food-card');

  // Prices for each item
  const prices = {
    'Pizza': 12,
    'Burger': 8,
    'Fries': 5
  };

  let cartItems = []; // {food, qty}

  // Function to calculate and update total
  function updateTotal() {
    let grandTotal = 0;
    cartItems = [];
    foodCards.forEach(card => {
      const checkbox = card.querySelector('.food-checkbox');
      const qtyInput = card.querySelector('.item-qty');
      if (checkbox.checked && qtyInput) {
        const food = checkbox.value;
        const qty = parseInt(qtyInput.value) || 1;
        cartItems.push({ food, qty });
        grandTotal += prices[food] * qty;
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
      const qtyInput = card.querySelector('.item-qty');
      checkbox.checked = !checkbox.checked;
      checkbox.dispatchEvent(new Event('change'));
    });
  });

  // Listen for checkbox and qty changes
  document.querySelectorAll('.food-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      const card = this.closest('.food-card');
      const qtyInput = card.querySelector('.item-qty');
      qtyInput.style.display = this.checked ? 'block' : 'none';
      if (this.checked) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
      updateTotal();
    });
  });

  document.querySelectorAll('.item-qty').forEach(qtyInput => {
    qtyInput.addEventListener('input', updateTotal);
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
        total: cartItems.reduce((sum, item) => sum + prices[item.food] * item.qty, 0).toFixed(2),
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
