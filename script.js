// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCmM2Sj7_MVEDDaX-Ob1iUizHzm3Nuln00",
  authDomain: "sierras-6809e.firebaseapp.com",
  databaseURL: "https://sierras-6809e-default-rtdb.firebaseio.com",
  projectId: "sierras-6809e",
  storageBucket: "sierras-6809e.appspot.com",
  messagingSenderId: "1034904937452",
  appId: "1:1034904937452:web:16106c7997cb5638b216c9",
  measurementId: "G-X6PQ8XKPX2",
};

const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let currentCategory = "comida";
let editingId = null;

const users = {
  Gabi: { color: "#ffadad", icon: "🐱" },
  Jere: { color: "#a0c4ff", icon: "🐶" },
  Eber: { color: "#bdb2ff", icon: "🦊" },
  Eva: { color: "#fdffb6", icon: "🐰" },
  Carito: { color: "#caffbf", icon: "🐻" },
  Josefina: { color: "#ffd6a5", icon: "🐯", isDriver: true },
  Aldi: { color: "#ffc6ff", icon: "🐧", isDriver: true },
  Fer: { color: "#a8dadc", icon: "👨‍🔧" },
};

function showCategory(category, e) {
  currentCategory = category;
  document
    .querySelectorAll(".tab")
    .forEach((t) => t.classList.remove("active-tab"));
  if (e) e.target.classList.add("active-tab");
  renderForm();
  drawItems();
}

function renderForm() {
  let extraHTML = "";
  let generalFormHTML = "";
  let buttonText = "Agregar 🐾";

  if (
    !["peaje", "nafta", "estacionamiento", "nuevoItem"].includes(
      currentCategory
    )
  ) {
    generalFormHTML = `
      <select id="userSelect">
        <option value="" disabled selected>Elegí tu nombre o quién sos</option>
        ${Object.entries(users)
          .map(
            ([name, data]) => `
          <option value="${name}" style="background: ${data.color}">
            ${data.icon} ${name}
          </option>`
          )
          .join("")}
      </select>
      <input type="text" id="itemDesc" placeholder="¿Qué compró?" />
      <input type="number" id="itemPrice" placeholder="Precio $" />`;
  }

  if (currentCategory === "bebidas") {
    extraHTML = `
      <select id="alcoholSelect">
        <option value="" disabled selected>¿Contiene alcohol?</option>
        <option value="true">Con alcohol</option>
        <option value="false">Sin alcohol</option>
      </select>`;
  } else if (currentCategory === "peaje") {
    extraHTML = `
      <select id="carSelect">
        <option value="Josefina">🚗 Auto de Josefina</option>
        <option value="Aldi">🚙 Auto de Aldi</option>
      </select>
      <select id="peajeUserSelect">
        <option value="" disabled selected>Elegí el usuario que pagó el peaje</option>
        ${Object.entries(users)
          .map(
            ([name, data]) => `
          <option value="${name}" style="background: ${data.color}">
            ${data.icon} ${name}
          </option>`
          )
          .join("")}
      </select>
      <input type="number" id="tollPrice" placeholder="Costo del peaje $" />`;
    buttonText = "Guardar 🛣️";
  } else if (currentCategory === "estacionamiento") {
    extraHTML = `
      <select id="carSelect">
        <option value="Josefina">🚗 Auto de Josefina</option>
        <option value="Aldi">🚙 Auto de Aldi</option>
      </select>
      <select id="estacionamientoUserSelect">
        <option value="" disabled selected>Elegí el usuario que pagó el estacionamiento</option>
        ${Object.entries(users)
          .map(
            ([name, data]) => `
          <option value="${name}" style="background: ${data.color}">
            ${data.icon} ${name}
          </option>`
          )
          .join("")}
      </select>
      <input type="number" id="parkingPrice" placeholder="Costo del estacionamiento $" />`;
    buttonText = "Guardar 🅿️";
  } else if (currentCategory === "nafta") {
    extraHTML = `
      <select id="carSelect">
        <option value="Josefina">🚗 Auto de Josefina</option>
        <option value="Aldi">🚙 Auto de Aldi</option>
      </select>
      <input type="number" id="naftaPrice" placeholder="Monto gastado $" />`;
    buttonText = "Guardar ⛽";
  } else if (currentCategory === "nuevoItem") {
    extraHTML = `
      <input type="text" id="newItemDesc" placeholder="Descripción del nuevo ítem" />
      <input type="number" id="newItemPrice" placeholder="Precio del nuevo ítem $" />`;
    buttonText = "Agregar Nuevo Ítem";
  }

  document.getElementById("dynamicForm").innerHTML = `
    ${generalFormHTML}
    ${extraHTML}
    <button onclick="saveItem()" id="saveButton">${buttonText}</button>`;
}

function saveItem() {
  let itemDescValue, precioValue;

  if (currentCategory === "nafta") {
    itemDescValue = "Combustible";
    precioValue = parseFloat(document.getElementById("naftaPrice").value);
  } else if (currentCategory === "peaje") {
    itemDescValue = "Peaje";
    precioValue = parseFloat(document.getElementById("tollPrice").value);
  } else if (currentCategory === "estacionamiento") {
    itemDescValue = "Estacionamiento";
    precioValue = parseFloat(document.getElementById("parkingPrice").value);
  } else if (currentCategory === "nuevoItem") {
    itemDescValue = document.getElementById("newItemDesc").value;
    precioValue = parseFloat(document.getElementById("newItemPrice").value);
  } else {
    itemDescValue = document.getElementById("itemDesc").value;
    precioValue = parseFloat(document.getElementById("itemPrice").value);
  }

  if (isNaN(precioValue) || precioValue <= 0) {
    alert("Por favor, ingresa un precio válido.");
    return;
  }

  let selectedUser;
  let extraData = {};

  if (currentCategory === "peaje") {
    const selectedCar = document.getElementById("carSelect").value;
    selectedUser = document.getElementById("peajeUserSelect").value;
    extraData.car = selectedCar;
  } else if (currentCategory === "estacionamiento") {
    const selectedCar = document.getElementById("carSelect").value;
    selectedUser = document.getElementById("estacionamientoUserSelect").value;
    extraData.car = selectedCar;
  } else if (currentCategory === "nafta") {
    selectedUser = document.getElementById("carSelect").value;
  } else if (
    !["peaje", "nafta", "estacionamiento", "nuevoItem"].includes(
      currentCategory
    )
  ) {
    selectedUser = document.getElementById("userSelect").value;
  }

  const itemData = {
    categoria: currentCategory,
    nombre: selectedUser,
    item: itemDescValue,
    precio: precioValue,
    ...users[selectedUser],
  };

  if (
    (currentCategory === "peaje" || currentCategory === "estacionamiento") &&
    extraData.car
  ) {
    itemData.car = extraData.car;
  }
  if (currentCategory === "bebidas") {
    itemData.alcohol =
      document.getElementById("alcoholSelect").value === "true";
  }

  if (editingId) {
    database
      .ref(`gastos/${editingId}`)
      .update(itemData)
      .then(() => {
        drawItems();
        clearForm();
      });
    editingId = null;
    document.getElementById("saveButton").textContent =
      currentCategory === "nafta"
        ? "Guardar ⛽"
        : currentCategory === "peaje"
        ? "Guardar 🛣️"
        : "Agregar 🐾";
  } else {
    database
      .ref("gastos")
      .push(itemData)
      .then(() => {
        drawItems();
        clearForm();
      })
      .catch((error) =>
        console.error("Error al guardar el item en Firebase:", error)
      );
  }
}

function editItem(id) {
  database.ref(`gastos/${id}`).once("value", (snapshot) => {
    const item = snapshot.val();
    if (currentCategory === "nafta") {
      document.getElementById("carSelect").value = item.nombre;
      document.getElementById("naftaPrice").value = item.precio;
    } else if (currentCategory === "peaje") {
      document.getElementById("carSelect").value = item.car;
      document.getElementById("peajeUserSelect").value = item.nombre;
      document.getElementById("tollPrice").value = item.precio;
    } else if (currentCategory === "estacionamiento") {
      document.getElementById("carSelect").value = item.car;
      document.getElementById("estacionamientoUserSelect").value = item.nombre;
      document.getElementById("parkingPrice").value = item.precio;
    } else {
      document.getElementById("userSelect").value = item.nombre;
      document.getElementById("itemDesc").value = item.item;
      document.getElementById("itemPrice").value = item.precio;
      if (currentCategory === "bebidas" && item.hasOwnProperty("alcohol")) {
        document.getElementById("alcoholSelect").value = item.alcohol
          ? "true"
          : "false";
      }
    }
    editingId = id;
    document.getElementById("saveButton").textContent = "Actualizar 🐾";
  });
}

function deleteItem(id) {
  database
    .ref(`gastos/${id}`)
    .remove()
    .then(() => drawItems());
}

function clearForm() {
  if (currentCategory === "nafta") {
    document.getElementById("naftaPrice").value = "";
  } else if (currentCategory === "peaje") {
    document.getElementById("tollPrice").value = "";
    if (document.getElementById("peajeUserSelect"))
      document.getElementById("peajeUserSelect").selectedIndex = 0;
    if (document.getElementById("carSelect"))
      document.getElementById("carSelect").selectedIndex = 0;
  } else if (currentCategory === "estacionamiento") {
    document.getElementById("parkingPrice").value = "";
    if (document.getElementById("estacionamientoUserSelect"))
      document.getElementById("estacionamientoUserSelect").selectedIndex = 0;
    if (document.getElementById("carSelect"))
      document.getElementById("carSelect").selectedIndex = 0;
  } else {
    if (document.getElementById("userSelect"))
      document.getElementById("userSelect").selectedIndex = 0;
    if (document.getElementById("itemDesc"))
      document.getElementById("itemDesc").value = "";
    if (document.getElementById("itemPrice"))
      document.getElementById("itemPrice").value = "";
    if (
      currentCategory === "bebidas" &&
      document.getElementById("alcoholSelect")
    ) {
      document.getElementById("alcoholSelect").selectedIndex = 0;
    }
  }
}

function updatePurchaseList() {
  database.ref("gastos").once("value", (snapshot) => {
    const data = snapshot.val() || {};

    const carGroups = {
      Josefina: {
        driver: "Josefina",
        members: ["Gabi", "Jere", "Eber"],
        fuelTotal: 0,
        autoExpenses: [],
        totalPaid: 0,
      },
      Aldi: {
        driver: "Aldi",
        members: ["Eva", "Carito", "Fer"],
        fuelTotal: 0,
        autoExpenses: [],
        totalPaid: 0,
      },
    };

    let autoPaid = {};
    Object.values(carGroups).forEach((group) => {
      group.members.forEach((m) => (autoPaid[m] = 0));
      autoPaid[group.driver] = 0;
    });

    for (let id in data) {
      const item = data[id];
      if (item.categoria === "nafta") {
        const car = item.nombre;
        if (carGroups[car]) {
          carGroups[car].fuelTotal += item.precio;
          autoPaid[carGroups[car].driver] += item.precio;
        }
      } else if (["peaje", "estacionamiento"].includes(item.categoria)) {
        const car = item.car;
        if (carGroups[car]) {
          carGroups[car].autoExpenses.push({
            payer: item.nombre,
            amount: item.precio,
            type: item.categoria,
          });
          autoPaid[item.nombre] += item.precio;
        }
      }
    }

    let autoDivisionHtml = `<div class="division-section"><h3>🚗 Gastos de Auto</h3>`;

    for (let car in carGroups) {
      const group = carGroups[car];
      const numMembers = group.members.length;
      const shareFuel = group.fuelTotal / numMembers;

      let expectedAuto = {};
      group.members.forEach((m) => (expectedAuto[m] = shareFuel));

      group.autoExpenses.forEach((exp) => {
        const share = exp.amount / numMembers;
        group.members.forEach((m) => {
          if (m !== exp.payer) expectedAuto[m] += share;
        });
      });

      autoDivisionHtml += `
        <div class="car-group">
          <h4>${group.driver} - ${group.members.join(", ")}</h4>
          <div class="expense-breakdown">
            <p><strong>Combustible:</strong> $${group.fuelTotal.toFixed(2)}</p>
            <p>Dividido entre ${numMembers} pasajeros: $${shareFuel.toFixed(
        2
      )} c/u</p>`;

      if (group.autoExpenses.length > 0) {
        autoDivisionHtml += `<p><strong>Otros gastos:</strong></p>`;
        group.autoExpenses.forEach((exp) => {
          const share = exp.amount / numMembers;
          autoDivisionHtml += `
            <p>${exp.type} pagado por ${exp.payer}: 
            $${exp.amount.toFixed(2)} ($${share.toFixed(2)} por pasajero)</p>`;
        });
      }

      autoDivisionHtml += `</div><div class="member-balances">`;

      group.members.forEach((m) => {
        const paid = autoPaid[m] || 0;
        const expected = expectedAuto[m];
        const balance = paid - expected;

        autoDivisionHtml += `
          <div class="user-balance" style="background: ${users[m].color}40">
            <div>
              <strong>${users[m].icon} ${m}</strong><br>
              Pagado: $${paid.toFixed(2)}<br>
              Esperado: $${expected.toFixed(2)}
            </div>
            <div class="balance-amount">
              ${balance >= 0 ? "A favor" : "Debe"}:<br>
              $${Math.abs(balance).toFixed(2)}
            </div>
          </div>`;
      });

      const driverPaid = autoPaid[group.driver];
      const driverBalance = driverPaid - group.fuelTotal;

      autoDivisionHtml += `
        <div class="user-balance driver" style="background: ${
          users[group.driver].color
        }40">
          <div>
            <strong>${users[group.driver].icon} ${
        group.driver
      } (Conductor)</strong><br>
            Total combustible pagado: $${driverPaid.toFixed(2)}<br>
            A recuperar de pasajeros: $${group.fuelTotal.toFixed(2)}
          </div>
          <div class="balance-amount">
            Balance final: $${(driverPaid - group.fuelTotal).toFixed(2)}
          </div>
        </div>`;

      autoDivisionHtml += `</div></div>`;
    }

    autoDivisionHtml += `</div>`;
    document.getElementById("purchaseList").innerHTML = autoDivisionHtml;
  });
}

function calculateBalances(data) {
  let validExpenses = {
    totalFood: 0,
    totalNonAlcDrinks: 0,
    totalAlcDrinks: 0,
    totalOthers: 0,
    userContributions: {},
  };

  Object.keys(users).forEach((user) => {
    validExpenses.userContributions[user] = {
      food: 0,
      nonAlcDrinks: 0,
      alcDrinks: 0,
      others: 0,
      total: 0,
      items: [],
    };
  });

  Object.values(data).forEach((item) => {
    const user = item.nombre;
    if (user === "Aldi" && item.categoria === "comida") return;

    if (
      ["comida", "bebidas", "otros", "peaje", "nafta"].includes(item.categoria)
    ) {
      switch (item.categoria) {
        case "comida":
          validExpenses.totalFood += item.precio;
          validExpenses.userContributions[user].food += item.precio;
          validExpenses.userContributions[user].total += item.precio;
          validExpenses.userContributions[user].items.push(item.item);
          break;

        case "bebidas":
          if (item.alcohol) {
            validExpenses.totalAlcDrinks += item.precio;
            if (!users[user].isDriver) {
              validExpenses.userContributions[user].alcDrinks += item.precio;
              validExpenses.userContributions[user].total += item.precio;
              validExpenses.userContributions[user].items.push(item.item);
            }
          } else {
            validExpenses.totalNonAlcDrinks += item.precio;
            validExpenses.userContributions[user].nonAlcDrinks += item.precio;
            validExpenses.userContributions[user].total += item.precio;
            validExpenses.userContributions[user].items.push(item.item);
          }
          break;

        case "otros":
          validExpenses.totalOthers += item.precio;
          validExpenses.userContributions[user].others += item.precio;
          validExpenses.userContributions[user].total += item.precio;
          validExpenses.userContributions[user].items.push(item.item);
          break;

        case "peaje":
        case "nafta":
          if (user === "Josefina" || user === "Aldi") {
            validExpenses.userContributions[user].total += item.precio;
            validExpenses.userContributions[user].items.push(item.item);
          }
          break;
      }
    }
  });

  const balances = {};
  Object.keys(users).forEach((user) => (balances[user] = 0));

  Object.entries(validExpenses.userContributions).forEach(
    ([user, contributions]) => {
      const totalPaid = contributions.total;
      const totalShare =
        (validExpenses.totalFood +
          validExpenses.totalNonAlcDrinks +
          validExpenses.totalAlcDrinks +
          validExpenses.totalOthers) /
        Object.keys(users).length;
      balances[user] = totalPaid - totalShare;
    }
  );

  const debts = {};
  Object.keys(users).forEach((user) => {
    debts[user] = [];
    if (balances[user] < 0) {
      const amountOwed = Math.abs(balances[user]);
      Object.entries(validExpenses.userContributions).forEach(
        ([creditor, contributions]) => {
          if (balances[creditor] > 0) {
            if (users[user].isDriver && users[creditor].isDriver) {
              const isFuelDebt = contributions.items.some((item) =>
                item.toLowerCase().includes("combustible")
              );
              if (isFuelDebt) return;
            }

            if (
              (user === "Josefina" || user === "Aldi") &&
              creditor !== "Josefina" &&
              creditor !== "Aldi"
            )
              return;

            if (
              (user === "Gabi" || user === "Jere" || user === "Eber") &&
              (creditor === "Josefina" || creditor === "Aldi")
            )
              return;

            const creditorShare =
              (contributions.total /
                (validExpenses.totalFood +
                  validExpenses.totalNonAlcDrinks +
                  validExpenses.totalAlcDrinks +
                  validExpenses.totalOthers)) *
              amountOwed;

            debts[user].push({
              creditor,
              amount: creditorShare.toFixed(2),
              reason: contributions.items.join(", "),
            });
          }
        }
      );
    }
  });

  return { validExpenses, balances, debts };
}

function renderPurchaseDetails() {
  const dbRef = firebase.database().ref("gastos");
  dbRef.once("value", (snapshot) => {
    const data = snapshot.val() || {};
    const { validExpenses, balances, debts } = calculateBalances(data);

    let purchaseDetailsHTML = `
      <div class="division-section">
        <h3 style="color: var(--color-titulo); margin-bottom: 20px;">🧾 Deudas por Comida y Bebidas</h3>
        <div class="debt-container">`;

    // Generar tarjetas de deudas para cada usuario
    Object.entries(users).forEach(([user, userData]) => {
      const userDebts = debts[user];
      const userBalance = balances[user];
      const isDriver = userData.isDriver;

      purchaseDetailsHTML += `
        <div class="debt-card" style="border-color: ${userData.color}">
          <div class="debt-header" style="background: ${userData.color}20">
            <span style="background: ${userData.color}">${userData.icon}</span>
            <h4>${user} ${isDriver ? "🚗" : ""}</h4>
            <div class="balance-status ${
              userBalance >= 0 ? "positive" : "negative"
            }">
              $${Math.abs(userBalance).toFixed(2)}
              ${userBalance >= 0 ? "Recibe" : "Debe"}
            </div>
          </div>`;

      if (userDebts.length > 0) {
        purchaseDetailsHTML += `<div class="debt-list">`;
        userDebts.forEach(({ creditor, amount, reason }) => {
          // Filtrar solo deudas de comida/bebida
          const foodDrinkItems = reason
            .split(", ")
            .filter(
              (item) =>
                !["Combustible", "Peaje", "Estacionamiento"].includes(item)
            );

          if (foodDrinkItems.length > 0) {
            purchaseDetailsHTML += `
              <div class="debt-item">
                <div class="creditor-info">
                  ${users[creditor].icon} ${creditor}
                  <span class="debt-amount">$${amount}</span>
                </div>
                <div class="debt-reason">
                  ${foodDrinkItems
                    .map(
                      (item) => `
                    <span class="item-category ${
                      item.includes("bebida") || item.includes("Bebida")
                        ? "drink"
                        : "food"
                    }">${item}</span>
                  `
                    )
                    .join("")}
                </div>
              </div>`;
          }
        });
        purchaseDetailsHTML += `</div>`;
      } else {
        purchaseDetailsHTML += `
          <div class="no-debt">
            ${user === "Aldi" ? "🚫 No consumió comida" : "✅ Todo balanceado"}
          </div>`;
      }

      purchaseDetailsHTML += `</div>`; // Cierre debt-card
    });

    purchaseDetailsHTML += `
        </div>
        <div class="aclaraciones">
          <h4>💡 Cómo se calcula:</h4>
          <ul>
            <li>Total gastado en comida/bebidas ÷ ${
              Object.keys(users).length
            } personas</li>
            <li>Aldi no participa en gastos de comida 🚫</li>
            <li>Conductoras no pagan bebidas con alcohol 🚗</li>
            <li>Deudas entre conductoras por combustible se excluyen ⛽</li>
          </ul>
          <div class="leyenda">
            <span class="leyenda-item"><div class="food-dot"></div> Comida</span>
            <span class="leyenda-item"><div class="drink-dot"></div> Bebida</span>
          </div>
        </div>
      </div>`;

    document.getElementById("purchaseDetailsContainer").innerHTML =
      purchaseDetailsHTML;
  });
}
function drawItems() {
  database.ref("gastos").once("value", (snapshot) => {
    const data = snapshot.val() || {};
    let html = '<div class="item-list">';

    Object.entries(data).forEach(([id, item]) => {
      if (item.categoria === currentCategory) {
        html += `
          <div class="item" style="background: ${item.color}40">
            <div>
              ${item.icon} <strong>${item.nombre}</strong><br>
              ${item.item} (${item.categoria}${
          item.alcohol !== undefined
            ? item.alcohol
              ? " - Con alcohol"
              : " - Sin alcohol"
            : ""
        })
            </div>
            <div>
              $${item.precio.toFixed(2)}
              <div class="item-actions">
                <button onclick="editItem('${id}')">✏️</button>
                <button onclick="deleteItem('${id}')">🗑️</button>
              </div>
            </div>
          </div>`;
      }
    });

    html += "</div>";
    document.getElementById("content").innerHTML = html;
    updatePurchaseList();
    renderPurchaseDetails();
  });
}

document.addEventListener("DOMContentLoaded", function () {
  renderForm();
  drawItems();
  database.ref("gastos").on("value", drawItems);
});
