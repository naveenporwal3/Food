document.addEventListener('DOMContentLoaded', function() {
  console.log('JS loaded!'); // Check if this logs

  const form = document.getElementById('orderForm');
  const confirmation = document.getElementById('confirmation');
  const totalPrice = document.getElementById('totalPrice');
  const orderDetails = document.getElementById('orderDetails');
  const quantity = document.getElementById('quantity');
  const foodCards = document.querySelectorAll('.food-card'); // For card clicks

  console.log('Elements found:', { quantity: !!quantity, totalPrice: !!totalPrice, foodCards: foodCards.length }); // Debug

  // Prices for each item
  const prices = {
    'Pizza': 12,
    'Burger': 8,
    'Fries': 5
  };

  // Function to calculate and update total
  function updateTotal() {
    console.log('updateTotal called'); // Debug
    const selectedFoodInput = document.querySelector('input[name="food"]:checked');
    const food = selectedFoodInput ? selectedFoodInput.value : '';
    const qty = parseInt(quantity.value) || 1;
    console.log('Food:', food, 'Qty:', qty); // Debug
    if (food && prices[food]) {
      const total = (prices[food] * qty).toFixed(2);
      totalPrice.textContent = `Total: ₹${total}`;
      totalPrice.style.display = 'block';
      console.log('Total updated to:', total); // Debug
    } else {
      totalPrice.style.display = 'none';
    }
  }

  // Listen for quantity changes
  if (quantity) quantity.addEventListener('input', updateTotal);

  // Listen for card clicks to select radio
  foodCards.forEach(card => {
    card.addEventListener('click', function() {
      const radio = card.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;
        radio.dispatchEvent(new Event('change'));
        // Visual feedback: Add 'selected' class
        foodCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        console.log('Card selected:', radio.value); // Debug
      }
    });
  });

  // Backup: Listen for radio changes
  const radios = document.querySelectorAll('input[name="food"]');
  radios.forEach(radio => radio.addEventListener('change', updateTotal));

  // Initial update
  updateTotal();

  if (form) {
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

      // Prepare data for SheetDB
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
          orderDetails.innerHTML = `${food} x${qty} for ₹${total} to ${name} at ${address}`;
          
          // Hide form and show confirmation
          form.style.display = 'none';
          confirmation.classList.remove('hidden');
        })
        .catch(error => {
          console.error("Error:", error);
          alert("❌ Failed to place order. Please try again.");
        });
    });
  }
});
