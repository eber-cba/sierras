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

/* ──────────── CALCULO DE GASTOS COMPARTIDOS (SOLO COMIDA Y BEBIDAS) ────────────
   Se consideran únicamente las categorías "comida" y "bebidas".
   Para cada usuario se calcula:
     - total pagado,
     - lo que se esperaba (cuota dividida entre todos; en bebidas alcohólicas solo no conductores),
     - el balance,
     - y se guarda un detalle de cada gasto.
*/
function calculateDetailedDebts(data) {
  let totals = {};
  let expected = {};
  let detailedDebts = {};
  Object.keys(users).forEach((u) => {
    totals[u] = 0;
    expected[u] = 0;
    detailedDebts[u] = {};
  });
  for (let id in data) {
    const item = data[id];
    if (!["comida", "bebidas"].includes(item.categoria)) continue;
    // Omitir comida pagada por Aldi (según regla)
    if (item.categoria === "comida" && item.nombre === "Aldi") continue;
    let participants = Object.keys(users);
    if (item.categoria === "bebidas" && item.alcohol === true) {
      participants = participants.filter((u) => !users[u].isDriver);
    }
    let share = item.precio / participants.length;
    participants.forEach((u) => {
      expected[u] += share;
    });
    totals[item.nombre] += item.precio;
    participants.forEach((u) => {
      if (u !== item.nombre) {
        if (!detailedDebts[u][item.nombre]) {
          detailedDebts[u][item.nombre] = [];
        }
        detailedDebts[u][item.nombre].push({
          item: item.item,
          category: item.categoria,
          amount: share,
        });
      }
    });
  }
  let netBalances = {};
  Object.keys(users).forEach((u) => {
    netBalances[u] = totals[u] - expected[u];
  });
  return { netBalances, detailedDebts, totals, expected };
}

/* ──────────── CALCULO DE GASTOS DE AUTO ────────────
   Se agrupan los ítems de nafta, peaje y estacionamiento por grupo (según conductor).
   Para cada integrante se calcula:
     - lo que pagó,
     - la cuota (total del grupo / número de pasajeros),
     - y la diferencia: para pasajeros, lo que deben; para conductores, el crédito.
*/
function calculateAutoExpensesDetails(data) {
  const autoGroups = {
    Josefina: {
      driver: "Josefina",
      members: ["Gabi", "Jere", "Eber"],
      totalExpenses: 0,
      payments: {},
    },
    Aldi: {
      driver: "Aldi",
      members: ["Eva", "Carito", "Fer"],
      totalExpenses: 0,
      payments: {},
    },
  };
  Object.values(autoGroups).forEach((group) => {
    group.members.forEach((m) => (group.payments[m] = 0));
    group.payments[group.driver] = 0;
  });
  for (let id in data) {
    const item = data[id];
    if (["nafta", "peaje", "estacionamiento"].includes(item.categoria)) {
      let groupKey;
      if (item.categoria === "nafta") {
        groupKey = item.nombre;
      } else {
        groupKey = item.car;
      }
      if (autoGroups[groupKey]) {
        autoGroups[groupKey].totalExpenses += item.precio;
        if (!autoGroups[groupKey].payments[item.nombre]) {
          autoGroups[groupKey].payments[item.nombre] = 0;
        }
        autoGroups[groupKey].payments[item.nombre] += item.precio;
      }
    }
  }
  let autoDetails = {};
  Object.entries(autoGroups).forEach(([groupKey, group]) => {
    const numPassengers = group.members.length;
    const share = numPassengers > 0 ? group.totalExpenses / numPassengers : 0;
    group.members.forEach((member) => {
      const paid = group.payments[member] || 0;
      const debt = share - paid;
      autoDetails[member] = {
        group: groupKey,
        autoPaid: paid,
        autoShare: share,
        autoDebt: debt > 0 ? debt : 0,
      };
    });
    const driver = group.driver;
    const paidDriver = group.payments[driver] || 0;
    const credit = paidDriver - group.totalExpenses;
    autoDetails[driver] = {
      group: groupKey,
      autoPaid: paidDriver,
      totalAuto: group.totalExpenses,
      autoCredit: credit > 0 ? credit : 0,
    };
  });
  return autoDetails;
}

/* ──────────── RENDERIZADO DE DEUDA TOTAL Y CRÉDITOS ────────────
   Para cada usuario se muestran dos bloques:
   - Si NO es conductor (quien debe):
       • Se muestra el total de deuda en Comida y Bebidas (calculado en calculateDetailedDebts).
       • Se muestra el total que debe en Auto (calculado en calculateAutoExpensesDetails).
       • Se muestra la suma de ambos (total a pagar).
       • Se detalla, con un listado, quién le debe a quién y por qué (desglose por ítem).
   - Si es conductor (quien recibe):
       • Se muestra lo que pagó en Comida y Bebidas, lo que se esperaba y la diferencia (crédito).
       • Se muestra lo que puso en Auto, el total del grupo y el crédito resultante.
       • Se muestra la suma total a recibir.
       • Se detalla el listado de quién le debe a ellos.
*/
function renderPurchaseDetails() {
  const dbRef = firebase.database().ref("gastos");
  dbRef.once("value", (snapshot) => {
    const data = snapshot.val() || {};
    const sharedData = calculateDetailedDebts(data); // Para comida y bebidas
    const autoData = calculateAutoExpensesDetails(data); // Para gastos de auto

    let purchaseDetailsHTML = `
      <div class="division-section">
        <h3 style="color: var(--color-titulo); margin-bottom: 20px;">🧾 Deuda Total y Créditos</h3>
        <div class="info-section" style="margin-bottom:20px; padding:10px; border:1px solid #ccc; border-radius:8px;">
          <p><strong>Nota:</strong> Los gastos de <em>Auto</em> (nafta, peaje, estacionamiento) se calculan por separado a los gastos de <em>Comida y Bebidas</em>.</p>
          <p>Las conductoras no consumieron bebidas alcohólicas, por lo que esos gastos no se les asignan.</p>
        </div>
        <div class="debt-container"> </div> </div> `;
    document.getElementById("purchaseList").innerHTML = purchaseDetailsHTML; // Set the HTML

    const debtContainer = document.querySelector(".debt-container");

    Object.keys(users).forEach((user) => {
      const isDriver = users[user].isDriver;
      let cardHTML = "";
      if (!isDriver) {
        // Para usuarios que deben (no conductores)
        let sharedDebt =
          sharedData.netBalances[user] < 0
            ? Math.abs(sharedData.netBalances[user])
            : 0;
        let autoDebt =
          autoData[user] && autoData[user].autoDebt
            ? autoData[user].autoDebt
            : 0;
        let totalDebt = sharedDebt + autoDebt;
        let driverName =
          autoData[user] && autoData[user].group ? autoData[user].group : "N/A";
        let driverDebtDetail =
          autoDebt > 0
            ? `$${autoDebt.toFixed(2)} a ${driverName}`
            : "No le debes nada al conductor";

        purchaseDetailsHTML += `
          <div class="debt-card" style="border:2px solid ${
            users[user].color
          }; border-radius:8px; margin:10px; padding:10px;">
            <div class="debt-header" style="background:${
              users[user].color
            }20; padding:8px; border-radius:6px;">
              <span style="font-size:24px;">${
                users[user].icon
              }</span> <strong>${user}</strong>
              <span style="float:right; font-weight:bold; color:red;">Debes: $${totalDebt.toFixed(
                2
              )}</span>
            </div>
            <div class="debt-detail" style="margin-top:10px;">
              <strong>Comida y Bebidas:</strong> $${sharedDebt.toFixed(2)}
            </div>
            <div class="debt-detail" style="margin-top:6px;">
              <strong>Auto:</strong> $${autoDebt.toFixed(
                2
              )} <small>(${driverDebtDetail})</small>
            </div>
            <div class="debt-detail total" style="margin-top:10px; border-top:1px solid #ccc; padding-top:6px;">
              <strong>Total a pagar:</strong> $${totalDebt.toFixed(2)}
            </div>
            <div class="breakdown" style="margin-top:10px; font-size:0.9em;">
              <strong>Detalle de deudas (Comida y Bebidas):</strong>`;
        cardHTML = `
          <div class="debt-card" style="border:2px solid ${
            users[user].color
          }; border-radius:8px; margin:10px; padding:10px;">
            <div class="debt-header" style="background:${
              users[user].color
            }20; padding:8px; border-radius:6px;">
              <span style="font-size:24px;">${
                users[user].icon
              }</span> <strong>${user}</strong>
              <span style="float:right; font-weight:bold; color:red;">Debes: $${totalDebt.toFixed(
                2
              )}</span>
            </div>
            <div class="debt-detail" style="margin-top:10px;">
              <strong>Comida y Bebidas:</strong> $${sharedDebt.toFixed(2)}
            </div>
            <div class="debt-detail" style="margin-top:6px;">
              <strong>Auto:</strong> $${autoDebt.toFixed(
                2
              )} <small>(${driverDebtDetail})</small>
            </div>
            <div class="debt-detail total" style="margin-top:10px; border-top:1px solid #ccc; padding-top:6px;">
              <strong>Total a pagar:</strong> $${totalDebt.toFixed(2)}
            </div>
            <div class="breakdown" style="margin-top:10px; font-size:0.9em;">
              <strong>Detalle de deudas (Comida y Bebidas):</strong>`;
        if (Object.keys(sharedData.detailedDebts[user]).length > 0) {
          cardHTML += `<ul style="margin:4px 0 0 16px;">`;
          purchaseDetailsHTML += `<ul style="margin:4px 0 0 16px;">`;
          for (let creditor in sharedData.detailedDebts[user]) {
            let totalOwed = sharedData.detailedDebts[user][creditor].reduce(
              (acc, d) => acc + d.amount,
              0
            );
            let detailText = sharedData.detailedDebts[user][creditor]
              .map((d) => `${d.item} (${d.category}) - $${d.amount.toFixed(2)}`)
              .join(", ");
            cardHTML += `<li>A <strong>${creditor}</strong>: $${totalOwed.toFixed(
              2
            )}<br><small>(${detailText})</small></li>`;
          }
          cardHTML += `</ul>`;
        } else {
          cardHTML += `<p style="margin:4px 0 0 16px;">No hay detalles adicionales.</p>`;
        }
        cardHTML += `</div>`; // Cierra el div breakdown
        cardHTML += `</div>`; // Cierra el div debt-card
        purchaseDetailsHTML += `</div>`;
      } else {
        // Para conductores
        let sharedCredit =
          sharedData.netBalances[user] > 0 ? sharedData.netBalances[user] : 0;
        let autoCredit =
          autoData[user] && autoData[user].autoCredit
            ? autoData[user].autoCredit
            : 0;
        let totalCredit = sharedCredit + autoCredit;
        let autoPaid =
          autoData[user] && autoData[user].autoPaid
            ? autoData[user].autoPaid
            : 0;
        let totalAuto =
          autoData[user] && autoData[user].totalAuto
            ? autoData[user].totalAuto
            : 0;

        cardHTML = `
            <div class="credit-card" style="border:2px solid ${
              users[user].color
            }; border-radius:8px; margin:10px; padding:10px;">
              <div class="credit-header" style="background:${
                users[user].color
              }20; padding:8px; border-radius:6px;">
                <span style="font-size:24px;">${
                  users[user].icon
                }</span> <strong>${user} (Conductor)</strong>
                <span style="float:right; font-weight:bold; color:green;">Recibes: $${totalCredit.toFixed(
                  2
                )}</span>
              </div>
              <div class="credit-detail" style="margin-top:10px;">
                <strong>Comida y Bebidas:</strong> $${sharedCredit.toFixed(2)}
                <small>(Pagaste: $${
                  sharedData.totals[user]
                    ? sharedData.totals[user].toFixed(2)
                    : "0.00"
                }; Se esperaba: $${
          sharedData.expected[user]
            ? sharedData.expected[user].toFixed(2)
            : "0.00"
        })</small>
              </div>
              <div class="credit-detail" style="margin-top:6px;">
                <strong>Auto:</strong> $${autoCredit.toFixed(2)}
                <small>(Pusiste: $${autoPaid.toFixed(
                  2
                )}; Total del grupo: $${totalAuto.toFixed(2)})</small>
              </div>
              <div class="credit-detail total" style="margin-top:10px; border-top:1px solid #ccc; padding-top:6px;">
                <strong>Total a recibir:</strong> $${totalCredit.toFixed(2)}
              </div>
              <div class="breakdown" style="margin-top:10px; font-size:0.9em;">
                <strong>Detalle de créditos (Comida y Bebidas):</strong>`;
        let creditorDetails = "";
        Object.entries(sharedData.detailedDebts).forEach(
          ([debtor, debtsByCreditor]) => {
            if (debtsByCreditor[user]) {
              let total = debtsByCreditor[user].reduce(
                (acc, d) => acc + d.amount,
                0
              );
              let details = debtsByCreditor[user]
                .map(
                  (d) => `${d.item} (${d.category}) - $${d.amount.toFixed(2)}`
                )
                .join(", ");
              creditorDetails += `<li>De <strong>${debtor}</strong>: $${total.toFixed(
                2
              )}<br><small>(${details})</small></li>`;
            }
          }
        );
        if (creditorDetails) {
          cardHTML += `<ul style="margin:4px 0 0 16px;">${creditorDetails}</ul>`;
        } else {
          cardHTML += `<p style="margin:4px 0 0 16px;">No hay detalles adicionales.</p>`;
        }
        cardHTML += `</div>`;
        cardHTML += `</div>`;
      }
      const card = document.createElement("div");
      card.className = isDriver ? "credit-card" : "debt-card";
      card.style.border = `2px solid ${users[user].color}`;
      card.style.borderRadius = "8px";
      card.style.margin = "10px";
      card.style.padding = "10px";

      card.innerHTML = cardHTML;
      debtContainer.appendChild(card);
    });
    purchaseDetailsHTML += `</div>`;
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
          <div class="item" style="background: ${
            item.color
          }40; margin:4px; padding:6px; border-radius:6px;">
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
                <button onclick="editItem('${id}')" style="margin-right:4px;">✏️</button>
                <button onclick="deleteItem('${id}')">🗑️</button>
              </div>
            </div>
          </div>`;
      }
    });
    html += "</div>";
    document.getElementById("content").innerHTML = html;
    // Actualizamos ambas secciones: Gastos de Auto y Deuda Total / Créditos
    updateAutoExpensesSummary();
    renderPurchaseDetails();
  });
}

/* ──────────── RESUMEN DE GASTOS DE AUTO ────────────
   Se agrupan los ítems de nafta, peaje y estacionamiento por grupo (según conductor)
   y se muestra un resumen simple con el total de gastos, lo que debe cada pasajero y lo que recibe el conductor.
*/
function updateAutoExpensesSummary() {
  database.ref("gastos").once("value", (snapshot) => {
    const data = snapshot.val() || {};
    const autoGroups = {
      Josefina: {
        driver: "Josefina",
        members: ["Gabi", "Jere", "Eber"],
        totalExpenses: 0,
        payments: {},
      },
      Aldi: {
        driver: "Aldi",
        members: ["Eva", "Carito", "Fer"],
        totalExpenses: 0,
        payments: {},
      },
    };
    Object.values(autoGroups).forEach((group) => {
      group.members.forEach((m) => (group.payments[m] = 0));
      group.payments[group.driver] = 0;
    });
    for (let id in data) {
      const item = data[id];
      if (["nafta", "peaje", "estacionamiento"].includes(item.categoria)) {
        let groupKey;
        if (item.categoria === "nafta") {
          groupKey = item.nombre;
        } else {
          groupKey = item.car;
        }
        if (autoGroups[groupKey]) {
          autoGroups[groupKey].totalExpenses += item.precio;
          autoGroups[groupKey].payments[item.nombre] =
            (autoGroups[groupKey].payments[item.nombre] || 0) + item.precio;
        }
      }
    }
    let autoSummaryHTML = `<div class="division-section"><h3>🚗 Gastos de Auto</h3>`;
    Object.values(autoGroups).forEach((group) => {
      const numPassengers = group.members.length;
      const sharePerPassenger =
        numPassengers > 0 ? group.totalExpenses / numPassengers : 0;
      autoSummaryHTML += `<div class="debt-card">`;

      autoSummaryHTML += `<div class="car-group-summary" style="border: 2px solid ${
        users[group.driver].color
      }; padding: 10px; margin-bottom: 10px; border-radius:8px;">
           <h4>${users[group.driver].icon} ${
        group.driver
      } (Conductor) y pasajeros: ${group.members.join(", ")}</h4>
           <p><strong>Total gastos de auto:</strong> $${group.totalExpenses.toFixed(
             2
           )}</p>
           <p><strong>Cada pasajero debe:</strong> $${sharePerPassenger.toFixed(
             2
           )} a ${group.driver}</p>
           <div class="auto-balances">`;
      group.members.forEach((m) => {
        const paid = group.payments[m] || 0;
        const balance = paid - sharePerPassenger;
        autoSummaryHTML += `<div class="auto-balance" style="background: ${
          users[m].color
        }20; padding: 5px; margin: 5px; border-radius:6px;">
                <strong>${users[m].icon} ${m}</strong>: Pagó $${paid.toFixed(
          2
        )} - Debe $${sharePerPassenger.toFixed(2)} = <span style="color: ${
          balance >= 0 ? "green" : "red"
        };">${balance >= 0 ? "A favor $" : "Debe $"}${Math.abs(balance).toFixed(
          2
        )}</span>
            </div>`;
      });
      const driverPaid = group.payments[group.driver] || 0;
      autoSummaryHTML += `<div class="auto-balance driver" style="background: ${
        users[group.driver].color
      }20; padding: 5px; margin: 5px; border-radius:6px;">
                <strong>${users[group.driver].icon} ${
        group.driver
      } (Conductor)</strong>: Recibió $${driverPaid.toFixed(
        2
      )} en gastos de auto.
            </div>`;
      autoSummaryHTML += `</div></div>`;
    });
    autoSummaryHTML += `</div>`;
    document.getElementById("purchaseList").innerHTML = autoSummaryHTML;
  });
}

document.addEventListener("DOMContentLoaded", function () {
  renderForm();
  drawItems();
  database.ref("gastos").on("value", drawItems);
});
