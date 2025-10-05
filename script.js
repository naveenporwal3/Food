document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('orderForm');
  const confirmation = document.getElementById('confirmation');
  const totalPrice = document.getElementById('totalPrice');
  const orderDetails = document.getElementById('orderDetails');
  const foodSelect = document.getElementById('foodSelect');
  const quantity = document.getElementById('quantity');

  // Prices for each item
  const prices = {
    'Pizza': 12,
    'Burger': 8,
    'Fries': 5
  };

  // Function to calculate and update total
  function updateTotal() {
    const food = foodSelect.value;
    const qty = parseInt(quantity.value) || 1;
    if (food && prices[food]) {
      const total = (prices[food] * qty).toFixed(2);
      totalPrice.textContent = `Total: $${total}`;
      totalPrice.style.display = 'block';
    } else {
      totalPrice.style.display = 'none';
    }
  }

  // Listen for changes on food and quantity
  foodSelect.addEventListener('change', updateTotal);
  quantity.addEventListener('input', updateTotal);

  // Initial update
  updateTotal();

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const formData = new FormData(form);
    const food = formData.get('food');
    const qty = parseInt(formData.get('quantity')) || 1;
    const name = formData.get('name');
    const address = formData.get('address');
    const total = (prices[food] * qty).toFixed(2);

    if (!food || !name || !address || qty < 1) {
      alert('Please fill in all fields correctly.');
      return;
    }

    // Prepare data for SheetDB (your original format, plus new fields)
    const data = {
      data: {
        food: food,
        quantity: qty,
        name: name,
        address: address,
        total: total,
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
        orderDetails.innerHTML = `${food} x${qty} for $${total} to ${name} at ${address}`;
        
        // Hide form and show confirmation
        form.style.display = 'none';
        confirmation.classList.remove('hidden');
      })
      .catch(error => {
        console.error("Error:", error);
        alert("❌ Failed to place order. Please try again.");
      });
  });
});
