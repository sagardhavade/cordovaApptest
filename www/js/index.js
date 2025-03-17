document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    console.log("Cordova is ready!");

    // Attach event listeners
    document.getElementById("cashInBtn").addEventListener("click", () => addTransaction("cashIn"));
    document.getElementById("cashOutBtn").addEventListener("click", () => addTransaction("cashOut"));
    document.getElementById("monthFilter").addEventListener("change", filterTransactionsByMonth);

    loadData(); // Load stored transactions on app start
}

document.addEventListener("DOMContentLoaded", function () {
    let transactions = [];
    let cashInTotal = 0;
    let cashOutTotal = 0;

    // UI Elements
    const titleInput = document.getElementById("title");
    const amountInput = document.getElementById("amount");
    const cashInBtn = document.getElementById("cashInBtn");
    const cashOutBtn = document.getElementById("cashOutBtn");
    const transactionsList = document.getElementById("transactionsList");
    const cashInTotalSpan = document.getElementById("cashInTotal");
    const cashOutTotalSpan = document.getElementById("cashOutTotal");
    const balanceTotalSpan = document.getElementById("balanceTotal");
    const monthFilter = document.getElementById("monthFilter");

    // Load transactions from localStorage
    function loadData() {
        const storedData = localStorage.getItem("transactions");
        if (storedData) {
            transactions = JSON.parse(storedData);
            renderTransactions();
            updateTotals();
            updateMonthFilter();
        }
    }

    // Update totals and balance
    function updateTotals() {
        cashInTotal = transactions.filter(t => t.type === "cashIn").reduce((sum, t) => sum + t.amount, 0);
        cashOutTotal = transactions.filter(t => t.type === "cashOut").reduce((sum, t) => sum + t.amount, 0);

        let balance = cashInTotal - cashOutTotal;
        let balanceSign = balance < 0 ? "-" : "+";

        cashInTotalSpan.textContent = `₹${cashInTotal}`;
        cashOutTotalSpan.textContent = `₹${cashOutTotal}`;
        balanceTotalSpan.textContent = `${balanceSign} ₹${Math.abs(balance)}`;

        // Change balance color based on value
        balanceTotalSpan.style.color = balance < 0 ? "red" : "green";
    }

    // Add a new transaction
    function addTransaction(type) {
        const title = titleInput.value.trim();
        const amount = parseFloat(amountInput.value);

        if (title === "" || isNaN(amount) || amount <= 0) {
            alert("Please enter a valid title and amount.");
            return;
        }

        // Get current date, time, and month
        const now = new Date();
        const date = now.toLocaleDateString(); // Format: MM/DD/YYYY
        const time = now.toLocaleTimeString(); // Format: HH:MM AM/PM
        const month = now.toLocaleString("default", { month: "long" });

        const transaction = { title, amount, type, date, time, month };

        transactions.push(transaction);
        localStorage.setItem("transactions", JSON.stringify(transactions));

        renderTransactions();
        updateMonthFilter();

        // Clear input fields
        titleInput.value = "";
        amountInput.value = "";
    }

    // Render transactions in UI
    function renderTransactions() {
        transactionsList.innerHTML = "";

        const selectedMonth = monthFilter.value;

        transactions.forEach((transaction, index) => {
            if (selectedMonth === "all" || transaction.month === selectedMonth) {
                const transactionDiv = document.createElement("div");
                transactionDiv.classList.add("transaction");

                const amountColor = transaction.type === "cashIn" ? "green" : "red";

                transactionDiv.innerHTML = `
                    <div class="transaction-row">
                        <div>
                            <p>
                                <strong>${transaction.title}</strong> - 
                                <span style="color: ${amountColor}; font-weight: bold;">₹${transaction.amount}</span> 
                                (${transaction.type === "cashIn" ? "Cash In" : "Cash Out"})
                            </p>
                            <p class="transaction-time">📅 ${transaction.date} 🕒 ${transaction.time} - ${transaction.month}</p>
                        </div>
                        <div class="transaction-buttons">
                            <button class="small-btn" onclick="editTransaction(${index})">✏️</button>
                            <button class="small-btn" onclick="deleteTransaction(${index})">❌</button>
                        </div>
                    </div>
                `;
                transactionsList.appendChild(transactionDiv);
            }
        });

        updateTotals();
    }

    // Update month filter dropdown
    function updateMonthFilter() {
        const selectedMonth = monthFilter.value; // Save selected month
        const uniqueMonths = [...new Set(transactions.map(t => t.month))];

        monthFilter.innerHTML = `<option value="all">All</option>`;

        uniqueMonths.forEach(month => {
            const option = document.createElement("option");
            option.value = month;
            option.textContent = month;
            if (month === selectedMonth) option.selected = true;
            monthFilter.appendChild(option);
        });
    }

    // Filter transactions based on selected month
    function filterTransactionsByMonth() {
        renderTransactions();
    }

    // Edit a transaction
    window.editTransaction = function (index) {
        const transaction = transactions[index];
        titleInput.value = transaction.title;
        amountInput.value = transaction.amount;

        transactions.splice(index, 1);
        localStorage.setItem("transactions", JSON.stringify(transactions));
        renderTransactions();
    };

    // Delete a transaction
    window.deleteTransaction = function (index) {
        if (confirm("Are you sure you want to delete this transaction?")) {
            transactions.splice(index, 1);
            localStorage.setItem("transactions", JSON.stringify(transactions));
            renderTransactions();
            updateMonthFilter();
        }
    };

    // Attach event listeners
    cashInBtn.addEventListener("click", () => addTransaction("cashIn"));
    cashOutBtn.addEventListener("click", () => addTransaction("cashOut"));
    monthFilter.addEventListener("change", filterTransactionsByMonth);

    loadData(); // Load stored data on app start
});
