// (() => {
//   let e = "https://macbook-pro.es/Kommo/api.php",
//     t = {};
//   document.addEventListener("DOMContentLoaded", function () {
//     var o = document.getElementById("myForm"),
//       n = document.querySelectorAll(".buy_btn_form"),
//       l = document.getElementsByClassName("close_form")[0];
//     function r() {
//       o.classList.add("open");
//     }
//     function c() {
//       o.classList.remove("open");
//     }
//     function d(e) {
//       r();
//       var t = e.target.closest(".order_item");
//       if (t) {
//         var o = t.querySelector(".code_item"),
//           n = t.querySelector(".item_title"),
//           l = t.querySelector(".baseprice");
//         if (o && n) {
//           var c = o.textContent.trim().replace(/\s+/g, " "),
//             d = `${n.textContent
//               .trim()
//               .replace(/\s+/g, " ")}; code: ${c}; price: ${l.textContent
//               .trim()
//               .replace(/\s+/g, " ")}`,
//             i = document.querySelector('input[name="modelinfo"]');
//           i && (i.value = d);
//         } else
//           console.error(
//             "Couldn't find the code element or product title element in the order_item"
//           );
//       } else console.error("Couldn't find order_item for the clicked element.");
//     }
//     n.forEach(function (e) {
//       e.removeEventListener("click", r), e.addEventListener("click", d);
//     }),
//       l.addEventListener("click", c),
//       window.addEventListener("click", function (e) {
//         e.target == o && c();
//       });
//     let i = document.querySelector("#myForm form"),
//       s = document.getElementById("submitModal"),
//       a = document.getElementById("errorModal");
//     const m = document.getElementById("modal-overlay"),
//       u = a.querySelector(".close_form_modal");
//     function y() {
//       (a.style.display = "flex"), (m.style.display = "block");
//     }
//     function f() {
//       (a.style.display = "none"), (m.style.display = "none");
//     }
//     i.addEventListener("submit", function (o) {
//       o.preventDefault(),
//         (t = {
//           action: "sendamo",
//           fullname: document.querySelector("#fullname").value,
//           phone: document.querySelector("#phone").value,
//           email: document.querySelector("#email").value,
//           note: document.querySelector("#note").value,
//           modelinfo: document.querySelector("#modelinfo").value,
//         }),
//         console.log("url=" + e + " data=", t),
//         fetch(e, {
//           method: "POST",
//           headers: {"Content-Type": "application/x-www-form-urlencoded"},
//           body: new URLSearchParams(t).toString(),
//         })
//           .then((e) => e.text())
//           .then((e) => {
//             console.log("Raw server response:", e);
//             let t = e.indexOf('{"result":'),
//               o = e.lastIndexOf("}") + 1;
//             if (-1 !== t && -1 !== o) {
//               let n = e.slice(t, o);
//               try {
//                 let e = JSON.parse(n);
//                 console.log("$json=", e),
//                   "ok" === e.result
//                     ? ((s.style.display = "flex"),
//                       setTimeout(function () {
//                         s.style.display = "none";
//                       }, 5e3),
//                       e.action)
//                     : y();
//               } catch (e) {
//                 console.error(e), y();
//               }
//             } else console.error("Couldn't find JSON in server response"), y();
//           })
//           .catch((e) => {
//             console.error("Error:", e), y();
//           }),
//         c();
//     }),
//       u.addEventListener("click", f),
//       m.addEventListener("click", f);
//   });
// })();

// (() => {
//   let apiUrl = "https://macbook-pro.es/Kommo/api.php";
//   let formData = {};

//   document.addEventListener("DOMContentLoaded", function () {
//     var formElement = document.getElementById("myForm"),
//       buyButtons = document.querySelectorAll(".buy_btn_form"),
//       closeButton = document.getElementsByClassName("close_form")[0];

//     function openForm() {
//       formElement.classList.add("open");
//     }

//     function closeForm() {
//       formElement.classList.remove("open");
//     }

//     function prepareForm(e) {
//       openForm();
//       var orderItem = e.target.closest(".order_item");
//       if (orderItem) {
//         var codeItem = orderItem.querySelector(".code_item"),
//           titleItem = orderItem.querySelector(".item_title"),
//           priceItem = orderItem.querySelector(".baseprice");
//         if (codeItem && titleItem) {
//           var code = codeItem.textContent.trim().replace(/\s+/g, " "),
//             modelInfo = `${titleItem.textContent
//               .trim()
//               .replace(
//                 /\s+/g,
//                 " "
//               )}; code: ${code}; price: ${priceItem.textContent
//               .trim()
//               .replace(/\s+/g, " ")}`,
//             modelInfoInput = document.querySelector('input[name="modelinfo"]');
//           if (modelInfoInput) modelInfoInput.value = modelInfo;
//         } else {
//           console.error(
//             "Couldn't find the code element or product title element in the order_item"
//           );
//         }
//       } else {
//         console.error("Couldn't find order_item for the clicked element.");
//       }
//     }

//     buyButtons.forEach(function (btn) {
//       btn.removeEventListener("click", openForm);
//       btn.addEventListener("click", prepareForm);
//     });

//     closeButton.addEventListener("click", closeForm);
//     window.addEventListener("click", function (e) {
//       if (e.target == formElement) closeForm();
//     });

//     let form = document.querySelector("#myForm form"),
//       submitModal = document.getElementById("submitModal"),
//       errorModal = document.getElementById("errorModal"),
//       modalOverlay = document.getElementById("modal-overlay"),
//       closeModalButton = errorModal.querySelector(".close_form_modal");

//     function showErrorModal() {
//       errorModal.style.display = "flex";
//       modalOverlay.style.display = "block";
//     }

//     function hideErrorModal() {
//       errorModal.style.display = "none";
//       modalOverlay.style.display = "none";
//     }

//     async function refreshTokenIfNeeded() {
//       try {
//         const response = await fetch("https://macbook-pro.es/Kommo/api.php");
//         const responseText = await response.text();
//         if (!responseText) {
//           throw new Error("Empty response from the server");
//         }
//         return JSON.parse(responseText);
//       } catch (error) {
//         console.error("Error in refreshTokenIfNeeded:", error);
//       }
//     }

//     form.addEventListener("submit", function (e) {
//       e.preventDefault();

//       refreshTokenIfNeeded().then(() => {
//         formData = {
//           action: "sendamo",
//           fullname: document.querySelector("#fullname").value,
//           phone: document.querySelector("#phone").value,
//           email: document.querySelector("#email").value,
//           note: document.querySelector("#note").value,
//           modelinfo: document.querySelector("#modelinfo").value,
//         };

//         fetch(apiUrl, {
//           method: "POST",
//           headers: {"Content-Type": "application/x-www-form-urlencoded"},
//           body: new URLSearchParams(formData).toString(),
//         })
//           .then((response) => response.text())
//           .then((responseText) => {
//             console.log("Raw server response:", responseText);
//             let jsonStart = responseText.indexOf('{"result":'),
//               jsonEnd = responseText.lastIndexOf("}") + 1;
//             if (jsonStart !== -1 && jsonEnd !== -1) {
//               let jsonStr = responseText.slice(jsonStart, jsonEnd);
//               try {
//                 let jsonData = JSON.parse(jsonStr);
//                 console.log("$json=", jsonData);
//                 if (jsonData.result === "ok") {
//                   submitModal.style.display = "flex";
//                   setTimeout(function () {
//                     submitModal.style.display = "none";
//                   }, 5000);
//                 } else {
//                   showErrorModal();
//                 }
//               } catch (error) {
//                 console.error("Error parsing JSON:", error);
//                 showErrorModal();
//               }
//             } else {
//               console.error("Couldn't find JSON in server response");
//               showErrorModal();
//             }
//           })
//           .catch((error) => {
//             console.error("Error with fetch:", error);
//             showErrorModal();
//           });

//         closeForm();
//       });
//     });

//     closeModalButton.addEventListener("click", hideErrorModal);
//     modalOverlay.addEventListener("click", hideErrorModal);
//   });
// })();

// ------------------------ VERS 2 ------------------------

let ajaxurl = "https://macbook-pro.es/Kommo/api.php";
let data = {};

document.addEventListener("DOMContentLoaded", function () {
  var modal = document.getElementById("myForm");

  var btns = document.querySelectorAll(".buy_btn_form");
  var closeForm = document.getElementsByClassName("close_form")[0];

  function openModal() {
    modal.classList.add("open");
  }

  function closeModal() {
    modal.classList.remove("open");
  }

  function handleBuyButtonClick(e) {
    openModal();
    var clickedElement = e.target;
    var orderItem = clickedElement.closest(".order_item");
    if (!orderItem) {
      console.error("Couldn't find order_item for the clicked element.");
      return;
    }

    var codeElement = orderItem.querySelector(".code_item");
    var productTitleElement = orderItem.querySelector(".item_title");
    var productPriceElement = orderItem.querySelector(".baseprice");

    if (!codeElement || !productTitleElement) {
      console.error(
        "Couldn't find the code element or product title element in the order_item"
      );
      return;
    }

    var codeText = codeElement.textContent.trim().replace(/\s+/g, " ");
    var productTitle = productTitleElement.textContent
      .trim()
      .replace(/\s+/g, " ");
    var productPrice = productPriceElement.textContent
      .trim()
      .replace(/\s+/g, " ");

    var textToSend = `${productTitle}; code: ${codeText}; price: ${productPrice}`;
    var inputModelInfo = document.querySelector('input[name="modelinfo"]');
    if (inputModelInfo) {
      inputModelInfo.value = textToSend;
    }
  }

  btns.forEach(function (btn) {
    btn.removeEventListener("click", openModal);
    btn.addEventListener("click", handleBuyButtonClick);
  });

  closeForm.addEventListener("click", closeModal);
  window.addEventListener("click", function (event) {
    if (event.target == modal) {
      closeModal();
    }
  });

  let form = document.querySelector("#myForm form");
  let submitModal = document.getElementById("submitModal");
  let errorModal = document.getElementById("errorModal");
  const overlay = document.getElementById("modal-overlay");
  const closeErrorModal = errorModal.querySelector(".close_form_modal");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    data = {
      action: "sendamo",
      fullname: document.querySelector("#fullname").value,
      phone: document.querySelector("#phone").value,
      email: document.querySelector("#email").value,
      note: document.querySelector("#note").value,
      modelinfo: document.querySelector("#modelinfo").value,
    };
    send();

    closeModal();
    // submitModal.style.display = "flex";
    // setTimeout(function () {
    //   submitModal.style.display = "none";
    // }, 5000);
  });

  // Функція для відображення модального вікна помилки
  function showErrorModal() {
    errorModal.style.display = "flex";
    overlay.style.display = "block";
  }

  // Функція для приховування модального вікна помилки
  function hideErrorModal() {
    errorModal.style.display = "none";
    overlay.style.display = "none";
  }

  // Обробник подій для кнопки закриття та накладення
  closeErrorModal.addEventListener("click", hideErrorModal);
  overlay.addEventListener("click", hideErrorModal);

  // Відправка даних на сервер
  // function send() {
  //   console.log("url=" + ajaxurl + " data=", data);

  //   fetch(ajaxurl, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/x-www-form-urlencoded",
  //     },
  //     body: new URLSearchParams(data).toString(),
  //   })
  //     .then((response) => response.text())
  //     .then((resp) => {
  //       console.log("Raw server response:", resp);

  //       let start = resp.indexOf('{"result":');
  //       let end = resp.lastIndexOf("}") + 1;

  //       if (start !== -1 && end !== -1) {
  //         let jsonString = resp.slice(start, end);
  //         try {
  //           let json = JSON.parse(jsonString);
  //           console.log("$json=", json);

  //           if (json.result === "ok") {
  //             // Your modal related code goes here
  //             submitModal.style.display = "flex";
  //             setTimeout(function () {
  //               submitModal.style.display = "none";
  //             }, 5000);

  //             switch (json.action) {
  //               case "sendamo":
  //                 // handle specific action if needed
  //                 break;
  //               // You can handle other actions here
  //             }
  //           } else {
  //             // Якщо результат не "ok", показати модальне вікно помилки
  //             showErrorModal();
  //           }
  //         } catch (e) {
  //           console.error(e);
  //           showErrorModal(); // Показати модальне вікно помилки, якщо JSON не зміг парситися
  //         }
  //       } else {
  //         console.error("Couldn't find JSON in server response");
  //         showErrorModal(); // Показати модальне вікно помилки, якщо не вдалося знайти JSON
  //       }
  //     })
  //     .catch((error) => {
  //       console.error("Error:", error);
  //       showErrorModal(); // Показати модальне вікно помилки у випадку помилки запиту
  //     });
  // }

  // function send(retry = false) {
  //   console.log("url=" + ajaxurl + " data=", data);

  //   fetch(ajaxurl, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/x-www-form-urlencoded",
  //     },
  //     body: new URLSearchParams(data).toString(),
  //   })
  //     .then((response) => {
  //       if (!response.ok) {
  //         if (response.status === 401 && !retry) {
  //           console.log("Token expired, retrying in 2 seconds...");
  //           return new Promise((resolve) => setTimeout(resolve, 2000)) // Затримка на 2 секунди
  //             .then(() => send(true)); // Повторна спроба відправки
  //         } else {
  //           throw new Error(`HTTP error! status: ${response.status}`);
  //         }
  //       }
  //       return response.text();
  //     })
  //     .then((resp) => {
  //       console.log("Raw server response:", resp);

  //       let start = resp.indexOf('{"result":');
  //       let end = resp.lastIndexOf("}") + 1;

  //       if (start !== -1 && end !== -1) {
  //         let jsonString = resp.slice(start, end);
  //         try {
  //           let json = JSON.parse(jsonString);
  //           console.log("$json=", json);

  //           if (json.result === "ok") {
  //             submitModal.style.display = "flex";
  //             setTimeout(function () {
  //               submitModal.style.display = "none";
  //             }, 5000);
  //           } else {
  //             showErrorModal();
  //           }
  //         } catch (e) {
  //           console.error("Error parsing JSON:", e);
  //           showErrorModal();
  //         }
  //       } else {
  //         console.error("Couldn't find JSON in server response");
  //         showErrorModal();
  //       }
  //     })
  //     .catch((error) => {
  //       console.error("Error with fetch:", error);
  //       showErrorModal();
  //     });
  // }

  async function send(retry = false) {
    console.log("url=" + ajaxurl + " data=", data);

    try {
      let response = await fetch(ajaxurl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(data).toString(),
      });

      if (!response.ok) {
        if (!response.ok) {
          console.log("Token expired, retrying in 2 seconds...");
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return send(true); // Повторна спроба відправки
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
      // if (!response.ok) {
      //   console.log("Token expired, retrying in 2 seconds...");
      //   await new Promise((resolve) => setTimeout(resolve, 2000));
      //   return send(true); // Повторна спроба відправки
      // } else {
      //   throw new Error(`HTTP error! status: ${response.status}`);
      // }

      let resp = await response.text();
      console.log("Raw server response:", resp);

      let start = resp.indexOf('{"result":');
      let end = resp.lastIndexOf("}") + 1;

      if (start !== -1 && end !== -1) {
        let jsonString = resp.slice(start, end);
        let json = JSON.parse(jsonString);
        console.log("$json=", json);

        if (json.result === "ok") {
          submitModal.style.display = "flex";
          setTimeout(() => (submitModal.style.display = "none"), 5000);
        } else {
          showErrorModal();
        }
      } else {
        throw new Error("Couldn't find JSON in server response");
      }
    } catch (error) {
      console.error("Error:", error);
      showErrorModal();
    }
  }
});
