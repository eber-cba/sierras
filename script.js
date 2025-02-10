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
        console.error("Error al guardar el ítem en Firebase:", error)
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

/* (Opcional) Función para mostrar gastos de transporte */
function updatePurchaseList() {
  database.ref("gastos").once("value", (snapshot) => {
    const data = snapshot.val() || {};
    const carGroups = {
      Josefina: {
        driver: "Josefina",
        members: ["Gabi", "Jere", "Eber"],
        fuelTotal: 0,
        autoExpenses: [],
      },
      Aldi: {
        driver: "Aldi",
        members: ["Eva", "Carito", "Fer"],
        fuelTotal: 0,
        autoExpenses: [],
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
            <p>${exp.type} pagado por ${exp.payer}: $${exp.amount.toFixed(
            2
          )} ($${share.toFixed(2)} por pasajero)</p>`;
        });
      }
      autoDivisionHtml += `</div></div>`;
    }
    autoDivisionHtml += `</div>`;
    document.getElementById("purchaseList").innerHTML = autoDivisionHtml;
  });
}

// Función para calcular balances, totales y contribuciones (solo de comida y bebidas)
// Se modificó para que los ítems se almacenen como objetos {desc, cost}
function calculateBalances(data) {
  let validExpenses = {
    totalFood: 0,
    totalAlcDrinks: 0,
    totalNonAlcDrinks: 0,
    userContributions: {},
  };

  Object.keys(users).forEach((user) => {
    validExpenses.userContributions[user] = {
      food: 0,
      alcDrinks: 0,
      nonAlcDrinks: 0,
      transport: 0,
      total: 0,
      // Solo se guardarán los ítems de comida y bebidas
      items: [],
    };
  });

  Object.values(data).forEach((item) => {
    if (item.categoria === "comida") {
      const user = item.nombre;
      if (user === "Aldi") return; // Aldi no participa en gastos de comida
      validExpenses.totalFood += item.precio;
      validExpenses.userContributions[user].food += item.precio;
      validExpenses.userContributions[user].total += item.precio;
      validExpenses.userContributions[user].items.push({
        desc: `🍔 ${item.item}`,
        cost: item.precio,
      });
    } else if (item.categoria === "bebidas") {
      const user = item.nombre;
      if (item.alcohol) {
        // Los choferes no consumen bebidas alcohólicas
        if (users[user].isDriver) return;
        validExpenses.totalAlcDrinks += item.precio;
        validExpenses.userContributions[user].alcDrinks += item.precio;
        validExpenses.userContributions[user].total += item.precio;
        validExpenses.userContributions[user].items.push({
          desc: `🍸 ${item.item}`,
          cost: item.precio,
        });
      } else {
        validExpenses.totalNonAlcDrinks += item.precio;
        validExpenses.userContributions[user].nonAlcDrinks += item.precio;
        validExpenses.userContributions[user].total += item.precio;
        validExpenses.userContributions[user].items.push({
          desc: `🥤 ${item.item}`,
          cost: item.precio,
        });
      }
    } else if (item.categoria === "nafta") {
      const driver = item.nombre;
      const transportGroups = {
        Josefina: ["Gabi", "Jere", "Eber"],
        Aldi: ["Eva", "Carito", "Fer"],
      };
      const members = transportGroups[driver];
      if (members) {
        const share = item.precio / members.length;
        // No se añade a items, pues se excluyen de la cuenta de comida/bebidas
        members.forEach(() => {
          validExpenses.userContributions[driver].transport += share;
          validExpenses.userContributions[driver].total += share;
        });
      }
    } else if (
      item.categoria === "peaje" ||
      item.categoria === "estacionamiento"
    ) {
      const driver = item.car;
      const payer = item.nombre;
      const transportGroups = {
        Josefina: ["Gabi", "Jere", "Eber"],
        Aldi: ["Eva", "Carito", "Fer"],
      };
      const members = transportGroups[driver];
      if (members) {
        const share = item.precio / members.length;
        members.forEach((member) => {
          if (member !== payer) {
            validExpenses.userContributions[payer].transport += share;
            validExpenses.userContributions[payer].total += share;
          }
        });
      }
    }
  });

  // Calcular la contribución esperada (solo para comida y bebidas, sin transporte)
  const allUsers = Object.keys(users);
  let totalFoodAndNonAlc =
    validExpenses.totalFood + validExpenses.totalNonAlcDrinks;
  let totalAlc = validExpenses.totalAlcDrinks; // Se reparte solo entre los no choferes
  const nonDriverCount = allUsers.filter((u) => !users[u].isDriver).length;

  let expectedContributions = {};
  allUsers.forEach((user) => {
    let expected = totalFoodAndNonAlc / allUsers.length;
    if (!users[user].isDriver) {
      expected += totalAlc / nonDriverCount;
    }
    expectedContributions[user] = expected;
  });

  // Calcular el gasto real (excluyendo transporte) y el balance
  let balances = {};
  allUsers.forEach((user) => {
    const actualSpent =
      validExpenses.userContributions[user].total -
      validExpenses.userContributions[user].transport;
    balances[user] = actualSpent - expectedContributions[user];
  });

  // Calcular deudas: para cada usuario con saldo negativo, determinar a quién le debe
  let debts = {};
  allUsers.forEach((user) => {
    debts[user] = [];
  });
  let pos = [];
  let neg = [];
  allUsers.forEach((user) => {
    const bal = balances[user];
    if (bal > 0) {
      pos.push({ user, balance: bal });
    } else if (bal < 0) {
      neg.push({ user, balance: -bal });
    }
  });
  pos.sort((a, b) => b.balance - a.balance);
  neg.sort((a, b) => b.balance - a.balance);

  neg.forEach((debtor) => {
    pos.forEach((creditor) => {
      if (debtor.balance === 0) return;
      if (creditor.balance === 0) return;
      const amount = Math.min(debtor.balance, creditor.balance);
      debtor.balance -= amount;
      creditor.balance -= amount;
      // Para el desglose, se utiliza la lista de ítems del acreedor (solo comida y bebidas)
      let creditorItems = validExpenses.userContributions[creditor.user].items;
      let totalItemsCost = creditorItems.reduce(
        (sum, item) => sum + item.cost,
        0
      );
      let breakdown = [];
      if (totalItemsCost > 0) {
        breakdown = creditorItems.map((item) => {
          return {
            desc: item.desc,
            amount: (item.cost / totalItemsCost) * amount,
          };
        });
      }
      debts[debtor.user].push({
        creditor: creditor.user,
        amount: amount,
        reason: "Diferencia entre gasto real y aporte esperado",
        breakdown: breakdown,
      });
    });
  });

  const totals = {
    food: validExpenses.totalFood,
    alcDrinks: validExpenses.totalAlcDrinks,
    nonAlcDrinks: validExpenses.totalNonAlcDrinks,
    overall:
      validExpenses.totalFood +
      validExpenses.totalAlcDrinks +
      validExpenses.totalNonAlcDrinks,
  };

  return { validExpenses, balances, expectedContributions, totals, debts };
}

// Función para renderizar el detalle de compras y el balance final con desglose de productos
function renderPurchaseDetails() {
  const dbRef = firebase.database().ref("gastos");
  dbRef.once("value", (snapshot) => {
    const data = snapshot.val() || {};
    const { validExpenses, balances, expectedContributions, totals, debts } =
      calculateBalances(data);

    let html = "";

    // Sección: Detalle de Compras por Usuario
    html += `
      <div class="division-section">
        <h3 style="color: var(--color-titulo); margin-bottom: 20px;">Detalle de Compras por Usuario</h3>`;
    Object.entries(users).forEach(([user, userData]) => {
      const userItems = validExpenses.userContributions[user].items;
      // Calcular el total gastado (excluyendo transporte)
      const totalSpent =
        validExpenses.userContributions[user].total -
        validExpenses.userContributions[user].transport;
      html += `
        <div class="user-expenses-card" style="border: 2px solid ${userData.color}; padding:10px; margin-bottom:10px; border-radius:8px;">
          <div class="user-header" style="display:flex; align-items:center; gap:10px;">
            <span style="background:${userData.color}; padding:5px; border-radius:50%;">${userData.icon}</span>
            <strong>${user}</strong>
          </div>
          <div class="purchases-list" style="margin-top:10px;">`;
      if (userItems.length > 0) {
        userItems.forEach((item) => {
          html += `<div class="purchase-item">${
            item.desc
          }: $${item.cost.toFixed(2)}</div>`;
        });
      } else {
        html += `<div class="no-debt">Sin registros de compra</div>`;
      }
      html += `</div>
          <div class="total-spent" style="margin-top:10px; font-weight:bold;">Total gastado: $${totalSpent.toFixed(
            2
          )}</div>
        </div>`;
    });
    html += `</div>`;

    // Sección: Balance Final con desglose de deudas
    html += `
      <div class="division-section">
        <h3 style="color: var(--color-titulo); margin-bottom: 20px;">Balance Final</h3>`;
    Object.entries(users).forEach(([user, userData]) => {
      const actualSpent =
        validExpenses.userContributions[user].total -
        validExpenses.userContributions[user].transport;
      const expected = expectedContributions[user] || 0;
      const balance = actualSpent - expected;
      let balanceDesc = "";
      if (balance >= 0) {
        balanceDesc = `Ha gastado $${actualSpent.toFixed(
          2
        )} y se esperaba que aportara $${expected.toFixed(
          2
        )}. Se le devolverían $${balance.toFixed(2)}.`;
      } else {
        balanceDesc = `Ha gastado $${actualSpent.toFixed(
          2
        )} y se esperaba que aportara $${expected.toFixed(2)}. Debe $${Math.abs(
          balance
        ).toFixed(2)}.`;
      }
      html += `
        <div class="balance-card" style="border: 2px solid ${
          userData.color
        }; padding:10px; margin-bottom:10px; border-radius:8px;">
          <div class="balance-header" style="display:flex; align-items:center; gap:10px;">
            <span style="background:${
              userData.color
            }; padding:5px; border-radius:50%;">${userData.icon}</span>
            <strong>${user}</strong>
            <div class="total-balance ${
              balance >= 0 ? "positive" : "negative"
            }" style="margin-left:auto; padding:5px 10px; border-radius:15px; font-weight:bold;">
              $${Math.abs(balance).toFixed(2)} ${
        balance >= 0 ? "Recibe" : "Debe"
      }
            </div>
          </div>
          <div class="balance-info" style="margin-top:10px; font-size:0.9em;">
            ${balanceDesc}
          </div>`;
      // Si el usuario debe, se muestra el desglose de a quién le debe y por qué, junto con la división por productos
      if (balance < 0 && debts[user].length > 0) {
        html += `<div class="debt-info" style="margin-top:10px; font-size:0.9em;">`;
        debts[user].forEach((debt) => {
          html += `<p>${user} le debe $${debt.amount.toFixed(2)} a ${
            debt.creditor
          } (${debt.reason}).</p>`;
          if (debt.breakdown && debt.breakdown.length > 0) {
            html += `<ul>`;
            debt.breakdown.forEach((item) => {
              html += `<li>Por ${item.desc}: $${item.amount.toFixed(2)}</li>`;
            });
            html += `</ul>`;
          }
        });
        html += `</div>`;
      }
      html += `</div>`;
    });
    // Resumen General
    html += `
      <div class="totals-summary" style="margin-top:20px;">
        <h3>Resumen General</h3>
        <p>Total Comida: $${totals.food.toFixed(2)}</p>
        <p>Total Bebidas (Alcohol): $${totals.alcDrinks.toFixed(2)}</p>
        <p>Total Bebidas (Sin Alcohol): $${totals.nonAlcDrinks.toFixed(2)}</p>
        <p>Total General (Comida + Bebidas): $${totals.overall.toFixed(2)}</p>
      </div>
      </div>`;

    document.getElementById("purchaseDetailsContainer").innerHTML = html;
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
