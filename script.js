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

  // Para categorías generales (comida, bebidas, etc.) se muestra también el campo de descuento.
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
      <input type="number" id="itemPrice" placeholder="Precio $" />
      <input type="number" id="itemDiscount" placeholder="Descuento aplicado $" />`;
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
      <input type="number" id="tollPrice" placeholder="Costo del peaje $" />
      <input type="number" id="tollDiscount" placeholder="Descuento aplicado $" />`;
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
      <input type="number" id="parkingPrice" placeholder="Costo del estacionamiento $" />
      <input type="number" id="parkingDiscount" placeholder="Descuento aplicado $" />`;
    buttonText = "Guardar 🅿️";
  } else if (currentCategory === "nafta") {
    extraHTML = `
      <select id="carSelect">
        <option value="Josefina">🚗 Auto de Josefina</option>
        <option value="Aldi">🚙 Auto de Aldi</option>
      </select>
      <input type="number" id="naftaPrice" placeholder="Monto gastado $" />
      <input type="number" id="naftaDiscount" placeholder="Descuento aplicado $" />`;
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
  let itemDescValue,
    precioValue,
    descuentoValue = 0;
  if (currentCategory === "nafta") {
    itemDescValue = "Combustible";
    precioValue = parseFloat(document.getElementById("naftaPrice").value);
    descuentoValue =
      parseFloat(document.getElementById("naftaDiscount")?.value) || 0;
  } else if (currentCategory === "peaje") {
    itemDescValue = "Peaje";
    precioValue = parseFloat(document.getElementById("tollPrice").value);
    descuentoValue =
      parseFloat(document.getElementById("tollDiscount")?.value) || 0;
  } else if (currentCategory === "estacionamiento") {
    itemDescValue = "Estacionamiento";
    precioValue = parseFloat(document.getElementById("parkingPrice").value);
    descuentoValue =
      parseFloat(document.getElementById("parkingDiscount")?.value) || 0;
  } else if (currentCategory === "nuevoItem") {
    itemDescValue = document.getElementById("newItemDesc").value;
    precioValue = parseFloat(document.getElementById("newItemPrice").value);
  } else {
    itemDescValue = document.getElementById("itemDesc").value;
    precioValue = parseFloat(document.getElementById("itemPrice").value);
    descuentoValue =
      parseFloat(document.getElementById("itemDiscount")?.value) || 0;
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
    descuento: descuentoValue,
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
      if (document.getElementById("naftaDiscount"))
        document.getElementById("naftaDiscount").value = item.descuento || "";
    } else if (currentCategory === "peaje") {
      document.getElementById("carSelect").value = item.car;
      document.getElementById("peajeUserSelect").value = item.nombre;
      document.getElementById("tollPrice").value = item.precio;
      if (document.getElementById("tollDiscount"))
        document.getElementById("tollDiscount").value = item.descuento || "";
    } else if (currentCategory === "estacionamiento") {
      document.getElementById("carSelect").value = item.car;
      document.getElementById("estacionamientoUserSelect").value = item.nombre;
      document.getElementById("parkingPrice").value = item.precio;
      if (document.getElementById("parkingDiscount"))
        document.getElementById("parkingDiscount").value = item.descuento || "";
    } else {
      document.getElementById("userSelect").value = item.nombre;
      document.getElementById("itemDesc").value = item.item;
      document.getElementById("itemPrice").value = item.precio;
      if (document.getElementById("itemDiscount"))
        document.getElementById("itemDiscount").value = item.descuento || "";
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
    if (document.getElementById("naftaDiscount"))
      document.getElementById("naftaDiscount").value = "";
  } else if (currentCategory === "peaje") {
    document.getElementById("tollPrice").value = "";
    if (document.getElementById("tollDiscount"))
      document.getElementById("tollDiscount").value = "";
    if (document.getElementById("peajeUserSelect"))
      document.getElementById("peajeUserSelect").selectedIndex = 0;
    if (document.getElementById("carSelect"))
      document.getElementById("carSelect").selectedIndex = 0;
  } else if (currentCategory === "estacionamiento") {
    document.getElementById("parkingPrice").value = "";
    if (document.getElementById("parkingDiscount"))
      document.getElementById("parkingDiscount").value = "";
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
    if (document.getElementById("itemDiscount"))
      document.getElementById("itemDiscount").value = "";
    if (
      currentCategory === "bebidas" &&
      document.getElementById("alcoholSelect")
    ) {
      document.getElementById("alcoholSelect").selectedIndex = 0;
    }
  }
}

/* ──────────── CÁLCULO DE GASTOS COMPARTIDOS (COMIDA Y BEBIDAS) ────────────
   Se consideran únicamente las categorías "comida" y "bebidas". Para cada usuario se calcula:
   - Lo que pagó (precio efectivo = precio - descuento)
   - Lo que se esperaba (cuota dividida entre todos)
   - El balance
   - Se guarda un detalle de cada gasto.
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
    const effectivePrice = Math.max(0, item.precio - (item.descuento || 0));
    let share = effectivePrice / participants.length;
    participants.forEach((u) => {
      expected[u] += share;
    });
    totals[item.nombre] += effectivePrice;
    participants.forEach((u) => {
      if (u !== item.nombre) {
        if (!detailedDebts[u][item.nombre]) {
          detailedDebts[u][item.nombre] = [];
        }
        detailedDebts[u][item.nombre].push({
          item: item.item,
          category: item.categoria,
          amount: share,
          descuento: item.descuento ? item.descuento : 0,
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

/* ──────────── CÁLCULO DE GASTOS DE AUTO ────────────
   Se agrupan los ítems de nafta, peaje y estacionamiento por grupo (según conductor). Para cada integrante se calcula:
   - Lo que pagó (precio efectivo)
   - La cuota (total del grupo / número de pasajeros)
   - La diferencia.
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
      const effectivePrice = Math.max(0, item.precio - (item.descuento || 0));
      let groupKey;
      if (item.categoria === "nafta") {
        groupKey = item.nombre;
      } else {
        groupKey = item.car;
      }
      if (autoGroups[groupKey]) {
        autoGroups[groupKey].totalExpenses += effectivePrice;
        autoGroups[groupKey].payments[item.nombre] =
          (autoGroups[groupKey].payments[item.nombre] || 0) + effectivePrice;
      }
    }
  }

  let autoDetails = {};
  Object.entries(autoGroups).forEach(([groupKey, group]) => {
    const numTotal = group.members.length + 1; // Conductor + pasajeros
    const share = numTotal > 0 ? group.totalExpenses / numTotal : 0;
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
    const credit = paidDriver - share;
    autoDetails[driver] = {
      group: groupKey,
      autoPaid: paidDriver,
      totalAuto: group.totalExpenses,
      autoCredit: credit > 0 ? credit : 0,
    };
  });

  return autoDetails;
}

/* ──────────── RENDERIZADO DE DEUDA TOTAL, CRÉDITOS Y DETALLE DE PAGOS ────────────
   Se muestra para cada usuario:
     - Si NO es conductor: su deuda en Comida/Bebidas y Auto, junto con el total a pagar.
     - Si es conductor: lo que pagó, lo esperado y el crédito, junto con el total a recibir.
   Además se muestra:
     • El detalle de los pagos realizados.
     • Un breve comentario.
     • Una nota especial para Aldi.
     • Al final, se muestra el plan de pagos sugerido.
*/
function renderPurchaseDetails() {
  const dbRef = firebase.database().ref("gastos");
  dbRef.once("value", (snapshot) => {
    const data = snapshot.val() || {};
    const sharedData = calculateDetailedDebts(data);
    const autoData = calculateAutoExpensesDetails(data);
    const purchaseDetailsContainer = document.getElementById(
      "purchaseDetailsContainer"
    );
    purchaseDetailsContainer.innerHTML = ""; // Limpiar el contenedor

    const headerHTML = `
<div class="division-section">
  <h3 style="color: var(--color-titulo); margin-bottom: 20px;">Deuda Total y Créditos</h3>
  <div class="info-section" style="margin-bottom:20px; padding:10px; border:1px solid #ccc; border-radius:8px;">
    <p><strong>Nota:</strong> Los gastos de <em>Auto</em> (nafta, peaje, estacionamiento) se calculan por separado a los de <em>Comida y Bebidas</em>.</p>
    <p><strong>Nota:</strong> En <em>Comida</em>, los gastos registrados por <strong>Aldi</strong> no se consideran (Aldi no comió por ser celíaca).</p>
    <p>Las conductoras no consumieron bebidas alcohólicas, por lo que esos gastos no se les asignan.</p>
  </div>
  <div class="debt-container"></div>
</div>`;
    purchaseDetailsContainer.innerHTML = headerHTML;
    const debtContainer =
      purchaseDetailsContainer.querySelector(".debt-container");

    Object.keys(users).forEach((user) => {
      const isDriver = users[user].isDriver;
      const card = document.createElement("div");
      card.className = isDriver ? "credit-card" : "debt-card";
      card.style.border = `2px solid ${users[user].color}`;
      card.style.borderRadius = "8px";
      card.style.margin = "10px";
      card.style.padding = "10px";

      if (!isDriver) {
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

        card.innerHTML = `
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
<p style="margin-top:6px; font-style: italic; color:#555;">Comentario: Pagaste menos de lo que te correspondía, por eso debes este monto.</p>`;
      } else {
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

        card.innerHTML = `
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
    sharedData.totals[user] ? sharedData.totals[user].toFixed(2) : "0.00"
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
<p style="margin-top:6px; font-style: italic; color:#555;">Comentario: Has pagado más de lo que te correspondía, por eso tienes crédito.</p>`;
      }

      // Detalle de pagos realizados
      let paidItems = [];
      for (let id in data) {
        const paid = data[id];
        if (paid.nombre === user) {
          let line = `${paid.item} (${paid.categoria}): $${paid.precio.toFixed(
            2
          )}`;
          if (paid.descuento && paid.descuento > 0) {
            line += ` - Descuento: $${paid.descuento.toFixed(2)}`;
          }
          paidItems.push(line);
        }
      }
      card.innerHTML += `
<div class="paid-detail" style="margin-top:10px;">
  <strong>Detalle de Pagos Realizados:</strong>
  ${
    paidItems.length > 0
      ? `<ul style="margin:4px 0 0 16px;">${paidItems
          .map((line) => `<li>${line}</li>`)
          .join("")}</ul>`
      : "<p>No registraste pagos.</p>"
  }
</div>`;
      if (user === "Aldi") {
        card.innerHTML += `<div style="font-size:0.9em; color:#555; margin-top:6px;"><strong>Nota:</strong> Aldi no consumió comida por ser celíaca.</div>`;
      }
      debtContainer.appendChild(card);
    });

    // Renderizamos el plan de pagos sugerido
    renderTransferPlan(sharedData, autoData);
  });
}

/* ──────────── RENDERIZADO DE GASTOS DE AUTO ────────────
   Se agrupan los ítems de nafta, peaje y estacionamiento por grupo (según conductor)
   y se muestra un resumen simple.
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
        const effectivePrice = Math.max(0, item.precio - (item.descuento || 0));
        let groupKey;
        if (item.categoria === "nafta") {
          groupKey = item.nombre;
        } else {
          groupKey = item.car;
        }
        if (autoGroups[groupKey]) {
          autoGroups[groupKey].totalExpenses += effectivePrice;
          autoGroups[groupKey].payments[item.nombre] =
            (autoGroups[groupKey].payments[item.nombre] || 0) + effectivePrice;
        }
      }
    }
    let autoSummaryHTML = `<div class="division-section"><h3>Gastos de Auto</h3>`;
    Object.values(autoGroups).forEach((group) => {
      const numTotal = group.members.length + 1; // Incluir conductor
      const sharePerPerson = numTotal > 0 ? group.totalExpenses / numTotal : 0;
      autoSummaryHTML += `<div class="car-group-summary" style="border: 2px solid ${
        users[group.driver].color
      }; padding: 10px; margin-bottom: 10px; border-radius:8px;">
            <h4>${users[group.driver].icon} ${
        group.driver
      } (Conductor) y pasajeros: ${group.members.join(", ")}</h4>
            <p><strong>Total gastos de auto:</strong> $${group.totalExpenses.toFixed(
              2
            )}</p>
            <p><strong>Cada integrante debe:</strong> $${sharePerPerson.toFixed(
              2
            )}</p>
            <div class="auto-balances">`;
      group.members.forEach((m) => {
        const paid = group.payments[m] || 0;
        const balance = paid - sharePerPerson;
        autoSummaryHTML += `<div class="auto-balance" style="background: ${
          users[m].color
        }20; padding: 5px; margin: 5px; border-radius:6px;">
                  <strong>${users[m].icon} ${m}</strong>: Pagó $${paid.toFixed(
          2
        )} - Debe $${sharePerPerson.toFixed(2)} = <span style="color: ${
          balance >= 0 ? "green" : "red"
        };">${balance >= 0 ? "A favor $" : "Debe $"}${Math.abs(balance).toFixed(
          2
        )}</span>
              </div>`;
      });
      const driverPaid = group.payments[group.driver] || 0;
      const driverBalance = driverPaid - sharePerPerson;
      autoSummaryHTML += `<div class="auto-balance driver" style="background: ${
        users[group.driver].color
      }20; padding: 5px; margin: 5px; border-radius:6px;">
                  <strong>${users[group.driver].icon} ${
        group.driver
      } (Conductor)</strong>: Pagó $${driverPaid.toFixed(
        2
      )} - Debe $${sharePerPerson.toFixed(2)} = <span style="color: ${
        driverBalance >= 0 ? "green" : "red"
      };">${driverBalance >= 0 ? "A favor $" : "Debe $"}${Math.abs(
        driverBalance
      ).toFixed(2)}</span>
              </div>`;
      autoSummaryHTML += `</div></div>`;
    });
    autoSummaryHTML += `</div>`;
    const purchaseList = document.getElementById("purchaseList");
    purchaseList.innerHTML = autoSummaryHTML;
  });
}

/* ──────────── RENDERIZADO DEL PLAN DE PAGOS SUGERIDO ────────────
   A partir del saldo neto de cada usuario (lo que pagaron menos lo que debían),
   se genera un plan sencillo que indica quién debe pagar a quién para equilibrar las cuentas.
   
   Explicación simple:
   - Un saldo negativo significa que el usuario pagó menos de lo que le correspondía.
   - Un saldo positivo significa que pagó de más.
   - Para igualar las cuentas, la cantidad que se debe transferir es la menor diferencia entre lo que falta por pagar y el exceso.
   
   Ejemplo:
   Si Carito tiene un saldo de -$8,000 y Josefina +$35,000, entonces Carito debe pagar $8,000 a Josefina.
   Esto se calcula tomando el valor mínimo entre el monto que le falta a Carito y el crédito de Josefina.
   
   Se incluye una nota que explica de forma sencilla cómo se hacen las cuentas.
*/
function renderTransferPlan(sharedData, autoData) {
  // Calcular saldo neto de cada usuario
  let settlement = {};
  Object.keys(users).forEach((user) => {
    if (users[user].isDriver) {
      let sharedCredit =
        sharedData.netBalances[user] > 0 ? sharedData.netBalances[user] : 0;
      let autoCredit =
        autoData[user] && autoData[user].autoCredit
          ? autoData[user].autoCredit
          : 0;
      settlement[user] = sharedCredit + autoCredit;
    } else {
      let sharedDebt =
        sharedData.netBalances[user] < 0
          ? Math.abs(sharedData.netBalances[user])
          : 0;
      let autoDebt =
        autoData[user] && autoData[user].autoDebt ? autoData[user].autoDebt : 0;
      settlement[user] = -(sharedDebt + autoDebt);
    }
  });

  // Separar deudores (saldo negativo) y acreedores (saldo positivo)
  let debtors = [];
  let creditors = [];
  for (let user in settlement) {
    let amount = settlement[user];
    if (amount < 0) {
      debtors.push({ user: user, amount: -amount });
    } else if (amount > 0) {
      creditors.push({ user: user, amount: amount });
    }
  }
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  let instructions = [];
  let i = 0,
    j = 0;
  while (i < debtors.length && j < creditors.length) {
    let debtor = debtors[i];
    let creditor = creditors[j];
    let transferAmount = Math.min(debtor.amount, creditor.amount);
    instructions.push({
      debtor: debtor.user,
      creditor: creditor.user,
      transferAmount: transferAmount,
      debtorBalance: debtor.amount,
      creditorBalance: creditor.amount,
    });
    debtor.amount -= transferAmount;
    creditor.amount -= transferAmount;
    if (debtor.amount === 0) i++;
    if (creditor.amount === 0) j++;
  }

  // Generar HTML con instrucciones simples y detalladas
  let html = `<div class="division-section" style="margin-top:20px; padding:20px; border:2px solid #4CAF50; border-radius:8px; background: #e8f5e9;">
    <h3 style="color:#2e7d32; text-align:center;">Plan de Pagos Sugerido</h3>
    <p style="font-size:1em; color:#555; text-align:center;">
      Cada usuario tiene un saldo neto: si es negativo, pagó menos de lo que le correspondía; si es positivo, pagó de más.
      Para equilibrar las cuentas, quien tiene saldo negativo debe pagar a quien tiene saldo positivo.
    </p>
    <hr style="border-top:1px dashed #aaa; margin:15px 0;">
    <div style="display:flex; flex-direction:column; gap:15px;">`;
  if (instructions.length === 0) {
    html += `<p style="font-size:1em; color:#555; text-align:center;">Todos están saldados.</p>`;
  } else {
    instructions.forEach((inst) => {
      html += `<div style="background:#fff; padding:15px; border:1px solid #ccc; border-radius:6px;">
        <strong>${
          inst.debtor
        }</strong> debe pagar <strong>$${inst.transferAmount.toFixed(
        2
      )}</strong> a <strong>${inst.creditor}</strong>.<br>
        <small style="color:#777;">
          Esto se debe a que ${
            inst.debtor
          } tenía un saldo negativo (no pagó lo suficiente) y ${
        inst.creditor
      } tenía un saldo positivo (pagó de más).<br>
          Se transfiere la cantidad menor entre el monto que le faltaba a ${
            inst.debtor
          } y el crédito de ${
        inst.creditor
      } (es decir, $${inst.transferAmount.toFixed(2)}).
        </small>
      </div>`;
    });
  }
  html += `</div>
    <hr style="border-top:1px dashed #aaa; margin:15px 0;">
    <p style="font-size:0.9em; color:#555; text-align:center;">
      <strong>Nota:</strong> Las cuentas se equilibran tomando la menor diferencia entre lo que cada deudor debe y lo que cada acreedor tiene de exceso. De esta forma, se minimiza el número de transferencias.
    </p>
  </div>`;

  const purchaseDetailsContainer = document.getElementById(
    "purchaseDetailsContainer"
  );
  purchaseDetailsContainer.innerHTML += html;
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
              ${
                item.descuento && item.descuento > 0
                  ? `<br><small>Descuento: $${item.descuento.toFixed(
                      2
                    )}</small>`
                  : ""
              }
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
    updateAutoExpensesSummary();
    renderPurchaseDetails();
  });
}

document.addEventListener("DOMContentLoaded", function () {
  renderForm();
  drawItems();
  database.ref("gastos").on("value", drawItems);
});
