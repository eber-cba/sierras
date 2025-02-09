// Configuración de Firebase (para los gastos)
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

// Listado de usuarios predefinidos
// Se asume que todos consumieron alcohol, excepto las conductoras (Josefina y Aldi)
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

/* ------------------------------------------------------------------------------------------ */
// Funciones para el formulario y manejo de gastos

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

  // Para categorías que requieren seleccionar un usuario (comida, bebidas, otros, etc.)
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
          </option>
        `
          )
          .join("")}
      </select>
      <input type="text" id="itemDesc" placeholder="¿Qué compró?" />
      <input type="number" id="itemPrice" placeholder="Precio $" />
    `;
  }

  // Campos específicos según la categoría
  if (currentCategory === "bebidas") {
    extraHTML = `
      <select id="alcoholSelect">
        <option value="" disabled selected>¿Contiene alcohol?</option>
        <option value="true">Con alcohol</option>
        <option value="false">Sin alcohol</option>
      </select>
    `;
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
          </option>
        `
          )
          .join("")}
      </select>
      <input type="number" id="tollPrice" placeholder="Costo del peaje $" />
    `;
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
          </option>
        `
          )
          .join("")}
      </select>
      <input type="number" id="parkingPrice" placeholder="Costo del estacionamiento $" />
    `;
    buttonText = "Guardar 🅿️";
  } else if (currentCategory === "nafta") {
    extraHTML = `
      <select id="carSelect">
        <option value="Josefina">🚗 Auto de Josefina</option>
        <option value="Aldi">🚙 Auto de Aldi</option>
      </select>
      <input type="number" id="naftaPrice" placeholder="Monto gastado $" />
    `;
    buttonText = "Guardar ⛽";
  } else if (currentCategory === "nuevoItem") {
    extraHTML = `
      <input type="text" id="newItemDesc" placeholder="Descripción del nuevo ítem" />
      <input type="number" id="newItemPrice" placeholder="Precio del nuevo ítem $" />
    `;
    buttonText = "Agregar Nuevo Ítem";
  }

  const formHTML = `
    ${generalFormHTML}
    ${extraHTML}
    <button onclick="saveItem()" id="saveButton">${buttonText}</button>
  `;
  document.getElementById("dynamicForm").innerHTML = formHTML;
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
      .catch((error) => {
        console.error("Error al guardar el item en Firebase:", error);
      });
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

/* ------------------------------------------------------------------------------------------ */
// Función para actualizar la división de gastos en tiempo real

function updatePurchaseList() {
  database.ref("gastos").once("value", (snapshot) => {
    const data = snapshot.val() || {};

    // --- GASTOS DE AUTO (Peaje, Estacionamiento y Combustible) ---
    const carGroups = {
      Josefina: {
        members: ["Gabi", "Jere", "Eber"],
        fuelTotal: 0,
        autoExpenses: [],
        totalPaid: 0, // Total pagado por Josefina
      },
      Aldi: {
        members: ["Eva", "Carito", "Fer"],
        fuelTotal: 0,
        autoExpenses: [],
        totalPaid: 0, // Total pagado por Aldi
      },
    };

    // Objeto para acumular lo que cada usuario pagó en auto
    let autoPaid = {};
    Object.values(carGroups).forEach((group) => {
      group.members.forEach((m) => {
        autoPaid[m] = 0;
      });
    });

    // Recorremos los ítems de auto: nafta, peaje y estacionamiento.
    for (let id in data) {
      const item = data[id];
      if (item.categoria === "nafta") {
        if (carGroups.hasOwnProperty(item.nombre)) {
          carGroups[item.nombre].fuelTotal += item.precio;
          autoPaid[item.nombre] += item.precio;
          carGroups[item.nombre].totalPaid += item.precio; // Acumula el total pagado
        }
      } else if (
        item.categoria === "peaje" ||
        item.categoria === "estacionamiento"
      ) {
        if (carGroups.hasOwnProperty(item.car)) {
          carGroups[item.car].autoExpenses.push({
            payer: item.nombre,
            amount: item.precio,
            type: item.categoria,
          });
          autoPaid[item.nombre] = (autoPaid[item.nombre] || 0) + item.precio;
          carGroups[item.car].totalPaid += item.precio; // Acumula el total pagado
        }
      }
    }

    // --- GASTOS DE COMIDA Y BEBIDAS ---
    let foodContributions = {};
    let nonAlcoholTotal = 0;
    let alcoholTotal = 0;
    for (let id in data) {
      const item = data[id];
      if (
        item.categoria !== "peaje" &&
        item.categoria !== "nafta" &&
        item.categoria !== "estacionamiento"
      ) {
        if (!foodContributions[item.nombre]) {
          foodContributions[item.nombre] = 0;
        }
        foodContributions[item.nombre] += item.precio;
        if (item.categoria === "bebidas") {
          if (item.alcohol === true) {
            alcoholTotal += item.precio;
          } else {
            nonAlcoholTotal += item.precio;
          }
        } else {
          nonAlcoholTotal += item.precio;
        }
      }
    }

    // Calculamos la división para cada grupo
    let autoDivisionHtml = `<div class="division-section">
      <h3>🚗 Gastos de Auto (Peaje, Estacionamiento y Combustible)</h3>`;
    for (let car in carGroups) {
      const group = carGroups[car];
      const members = group.members;
      const numMembers = members.length;
      const shareFuel = numMembers > 0 ? group.fuelTotal / numMembers : 0;
      let expectedAuto = {};
      members.forEach((m) => (expectedAuto[m] = shareFuel));
      group.autoExpenses.forEach((exp) => {
        if (members.includes(exp.payer) && numMembers > 1) {
          members.forEach((m) => {
            if (m !== exp.payer) {
              expectedAuto[m] += exp.amount / (numMembers - 1);
            }
          });
        }
      });

      // Descuenta el total pagado por cada miembro
      members.forEach((m) => {
        expectedAuto[m] -= foodContributions[m] || 0; // Descuenta contribuciones de comida
      });

      autoDivisionHtml += `<h4>${
        car === "Josefina" ? "Auto de Josefina" : "Auto de Aldi"
      }</h4>`;
      members.forEach((m) => {
        const expected = expectedAuto[m];
        const paid = autoPaid[m] || 0;
        const diff = paid - expected;
        const expensesPaid = group.autoExpenses.filter(
          (exp) => exp.payer === m
        );
        let expenseInfo = "";
        if (expensesPaid.length > 0) {
          expenseInfo =
            " (Pagó " +
            expensesPaid
              .map((exp) => {
                return (
                  (exp.type === "peaje" ? "Peaje: $" : "Estac: $") +
                  exp.amount.toFixed(2)
                );
              })
              .join(", ") +
            ")";
        }
        autoDivisionHtml += `<div class="user-balance" style="background: ${
          users[m].color
        }40">
          <div>
            <strong>${users[m].icon} ${m}${expenseInfo}</strong><br>
            Pagado: $${paid.toFixed(2)}<br>
            Esperado: $${expected.toFixed(2)}
          </div>
          <div style="text-align: right;">
            ${diff >= 0 ? "A favor:" : "Debe:"} $${Math.abs(diff).toFixed(2)}
          </div>
        </div>`;
      });
    }
    autoDivisionHtml += `</div>`;

    // Actualizamos el contenedor de detalles de auto y comida.
    document.getElementById("purchaseList").innerHTML = autoDivisionHtml;
  });
}

// Función para calcular balances
function calculateBalances(data) {
  let validExpenses = {
    totalFood: 0,
    totalNonAlcDrinks: 0,
    totalAlcDrinks: 0,
    totalOthers: 0,
    userContributions: {},
  };

  // Inicializar contribuciones
  Object.keys(users).forEach((user) => {
    validExpenses.userContributions[user] = {
      food: 0,
      nonAlcDrinks: 0,
      alcDrinks: 0,
      others: 0,
      total: 0,
      items: [], // Para almacenar los elementos comprados
    };
  });

  // Calcular gastos válidos
  Object.values(data).forEach((item) => {
    const user = item.nombre;

    // Excluir a Aldi de los gastos de comida
    if (user === "Aldi" && item.categoria === "comida") {
      return; // No contar los gastos de comida de Aldi
    }

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
          // Las conductoras no deben pagar por estos gastos
          validExpenses.userContributions[user].total += item.precio;
          validExpenses.userContributions[user].items.push(item.item);
          break;
      }
    }
  });

  // Calcular deudas
  const balances = {};
  Object.keys(users).forEach((user) => {
    balances[user] = 0; // Inicializar saldo
  });

  // Calcular cuánto debe cada usuario a los demás
  Object.entries(validExpenses.userContributions).forEach(
    ([user, contributions]) => {
      const totalPaid = contributions.total;
      const totalShare =
        (validExpenses.totalFood +
          validExpenses.totalNonAlcDrinks +
          validExpenses.totalAlcDrinks +
          validExpenses.totalOthers) /
        Object.keys(users).length;

      const balance = totalPaid - totalShare;
      balances[user] = balance; // Guardar el saldo del usuario
    }
  );

  // Crear un objeto para mostrar a quién debe cada usuario
  const debts = {};
  Object.keys(users).forEach((user) => {
    debts[user] = [];
    if (balances[user] < 0) {
      const amountOwed = Math.abs(balances[user]);
      Object.entries(validExpenses.userContributions).forEach(
        ([creditor, contributions]) => {
          if (balances[creditor] > 0) {
            // Asegurarse de que las conductoras no deban a quienes compraron bebidas con alcohol
            if (users[user].isDriver && contributions.alcDrinks > 0) {
              return; // No deben nada si son conductoras y el acreedor compró alcohol
            }
            const creditorShare =
              (contributions.total /
                (validExpenses.totalFood +
                  validExpenses.totalNonAlcDrinks +
                  validExpenses.totalAlcDrinks +
                  validExpenses.totalOthers)) *
              amountOwed;
            debts[user].push({ creditor, amount: creditorShare.toFixed(2) });
          }
        }
      );
    }
  });

  return { validExpenses, balances, debts };
}

// Función para renderizar los detalles de compras
function renderPurchaseDetails() {
  const dbRef = firebase.database().ref("gastos");
  dbRef.once("value", (snapshot) => {
    const data = snapshot.val() || {};
    const { validExpenses, balances, debts } = calculateBalances(data);

    let purchaseDetailsHTML = `
      <div class="division-section">
        <h3 style="color: var(--color-titulo);">🧾 Resumen de Gastos y Deudas</h3>
        <div class="totals">
          <h4>Total Gastado:</h4>
          <p>Comida: $${validExpenses.totalFood.toFixed(2)}</p>
          <p>Bebidas sin alcohol: $${validExpenses.totalNonAlcDrinks.toFixed(
            2
          )}</p>
          <p>Bebidas con alcohol: $${validExpenses.totalAlcDrinks.toFixed(
            2
          )}</p>
          <p>Otros: $${validExpenses.totalOthers.toFixed(2)}</p>
        </div>
    `;

    // Tarjetas de usuarios
    purchaseDetailsHTML += '<div class="user-cards">';
    Object.entries(users).forEach(([user, data]) => {
      const contributions = validExpenses.userContributions[user];
      purchaseDetailsHTML += `
        <div class="user-card" style="background: ${data.color}20">
          <h5>${data.icon} ${user}</h5>
          <p>Comida: $${contributions.food.toFixed(2)}</p>
          <p>Bebidas sin alcohol: $${contributions.nonAlcDrinks.toFixed(2)}</p>
          ${
            !data.isDriver
              ? `<p>Bebidas con alcohol: $${contributions.alcDrinks.toFixed(
                  2
                )}</p>`
              : ""
          }
          <p>Otros: $${contributions.others.toFixed(2)}</p>
          <hr>
          <p>Total aportado: <strong>$${contributions.total.toFixed(
            2
          )}</strong></p>
          <p>Elementos comprados: ${contributions.items.join(", ")}</p>
        </div>
      `;
    });
    purchaseDetailsHTML += "</div>";

    // Deudas
    purchaseDetailsHTML += '<div class="balances">';
    Object.entries(debts).forEach(([user, debtList]) => {
      if (debtList.length > 0) {
        debtList.forEach(({ creditor, amount }) => {
          purchaseDetailsHTML += `
            <div class="debt">
              <strong>${users[user].icon} ${user}</strong> debe: <strong>$${amount}</strong> a <strong>${creditor}</strong>
            </div>
          `;
        });
      }
    });

    purchaseDetailsHTML += "</div></div>";

    // Sección de aclaraciones
    purchaseDetailsHTML += `
      <div class="aclaraciones">
        <h4 style="color: var(--color-titulo);">💖 Aclaraciones</h4>
        <p>Las deudas mostradas son solo para comida y bebidas.</p>
        <p>Las conductoras no cuentan las bebidas con alcohol, pero sí las sin alcohol.</p>
        <p>La comida se cuenta para todos los participantes, excepto Aldi, quien no consumió.</p>
        <p>¡Lxs quiero mucho! ❤️</p>
        <p><strong>Operación Matemática:</strong></p>
        <p>Para calcular cuánto debe cada usuario, se realizó la siguiente operación:</p>
        <p>1. Se sumaron todos los gastos de cada usuario.</p>
        <p>2. Se calculó el total de gastos y se dividió entre el número de participantes.</p>
        <p>3. La diferencia entre lo que cada usuario pagó y su parte proporcional es lo que debe o le deben.</p>
        <p style="color: #ff5733;"><em>Nota:</em> Las conductoras no tienen deudas porque sus gastos de combustible y peaje se consideran al calcular sus aportes. Sin embargo, si sus gastos totales exceden lo que deberían pagar, podrían tener deudas.</p>
      </div>
    `;

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
              ${item.icon} 
              <strong>${item.nombre}</strong><br>
              ${item.item} (${item.categoria}${
          currentCategory === "bebidas" && item.hasOwnProperty("alcohol")
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
          </div>
        `;
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
  // Listener en tiempo real para actualizar los datos sin recargar
  database.ref("gastos").on("value", drawItems);
});
