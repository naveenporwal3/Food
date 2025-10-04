document.getElementById("orderForm").addEventListener("submit", function (e) {
  e.preventDefault();

  // In a real app, you’d send this to a server or Google Sheets
  const food = this.food.value;
  const name = this.name.value;
  const address = this.address.value;

  console.log("Order Placed:", { food, name, address });

  // Show confirmation
  document.getElementById("confirmation").classList.remove("hidden");

  // Clear form
  this.reset();
});
