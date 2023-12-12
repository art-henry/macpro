// Функція для оновлення цін відповідно до кодів продуктів
function updatePrices() {
  // Знаходимо всі елементи з класом .order_item
  const orders = document.querySelectorAll(".order_item");

  // Проходимо по кожному .order_item
  orders.forEach((order) => {
    const codeItem = order.querySelector(".code_item"); // знаходимо .code_item в цьому .order_item
    const basePrice = order.querySelector(".baseprice"); // знаходимо .baseprice в цьому .order_item

    // Відправляємо AJAX запит на сервер з кодом продукту
    var xhr = new XMLHttpRequest();
    xhr.open(
      "GET",
      "../database/get-price.php?code=" +
        encodeURIComponent(codeItem.textContent.trim()),
      true
    );

    xhr.onload = function () {
      if (this.status === 200) {
        const response = JSON.parse(this.responseText);
        // Якщо з сервера прийшла відповідь з ціною, оновлюємо .baseprice
        if (response.price) {
          basePrice.textContent = `${response.price} €`;
        } else {
          // Якщо ціна = NULL, додаємо клас out-of-stock
          order.classList.add("out-of-stock");
        }
      } else {
        console.error("Error loading price for code:", codeItem.textContent);
      }
    };
    xhr.onerror = function () {
      console.error(
        "Network error for price request of code:",
        codeItem.textContent
      );
    };
    xhr.send();
  });
}

// Викликаємо функцію при завантаженні сторінки
document.addEventListener("DOMContentLoaded", updatePrices);
