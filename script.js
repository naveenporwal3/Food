document.getElementById("orderForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const form = e.target;

  const data = {
    data: {
      food: form.food.value,
      name: form.name.value,
      address: form.address.value
    }
  };

  fetch("https://sheetdb.io/api/v1/qwy02wpreu8z3", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
    .then(response => response.json())
    .then(data => {
      alert("✅ Order placed successfully!");
      form.reset();
    })
    .catch(error => {
      console.error("Error:", error);
      alert("❌ Failed to place order. Please try again.");
    });
});
