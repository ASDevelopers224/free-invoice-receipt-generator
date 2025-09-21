let history = JSON.parse(localStorage.getItem("invoiceHistory")) || [];

function addItem() {
  let table = document.getElementById("items");
  let row = table.insertRow();
  row.innerHTML = `
    <td><input type="text" placeholder="Item"></td>
    <td><input type="number" value="1" min="1"></td>
    <td><input type="number" value="0" min="0"></td>
    <td>0</td>
    <td><button class="btn danger" onclick="deleteRow(this)">❌</button></td>
  `;
  row.querySelectorAll("input").forEach(inp => {
    inp.addEventListener("input", () => {
      let qty = row.cells[1].children[0].value;
      let price = row.cells[2].children[0].value;
      row.cells[3].innerText = qty * price;
    });
  });
}

function deleteRow(btn) {
  btn.parentElement.parentElement.remove();
}

function generateInvoice() {
  let shop = document.getElementById("shop").value;
  let client = document.getElementById("client").value;
  document.getElementById("invoice").classList.remove("hidden");
  document.getElementById("invShop").innerText = shop;
  document.getElementById("invClient").innerText = client;

  let invItems = document.getElementById("invItems");
  invItems.innerHTML = "<tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>";

  let rows = document.querySelectorAll("#items tr");
  let total = 0;
  rows.forEach((row, i) => {
    if (i === 0) return;
    let item = row.cells[0].children[0].value;
    let qty = row.cells[1].children[0].value;
    let price = row.cells[2].children[0].value;
    let rowTotal = qty * price;
    total += rowTotal;

    let newRow = invItems.insertRow();
    newRow.innerHTML = `<td>${item}</td><td>${qty}</td><td>${price}</td><td>${rowTotal}</td>`;
  });

  document.getElementById("invTotal").innerText = total;

  // Save to history
  let record = {
    date: new Date().toLocaleString(),
    shop, client, total
  };
  history.push(record);
  localStorage.setItem("invoiceHistory", JSON.stringify(history));
  loadHistory();
}

function loadHistory() {
  let list = document.getElementById("historyList");
  list.innerHTML = "";
  history.forEach(h => {
    let li = document.createElement("li");
    li.textContent = `${h.date} - ${h.client} - Total: ${h.total}`;
    list.appendChild(li);
  });
}

function downloadExcel() {
  if (history.length === 0) {
    alert("No history available!");
    return;
  }
  let worksheet = XLSX.utils.json_to_sheet(history);
  let workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Invoice History");
  XLSX.writeFile(workbook, "invoice_history.xlsx");
}

window.onload = loadHistory;
