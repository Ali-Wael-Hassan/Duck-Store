const searchInput = document.querySelector(".search input");
const rows = document.querySelectorAll("table tr");

// Search
searchInput.addEventListener("input", () => {
    const value = searchInput.value.toLowerCase();

    rows.forEach((row, index) => {
        if (index === 0) return;

        const book = row.children[0].textContent.toLowerCase();
        const customer = row.children[1].textContent.toLowerCase();

        if (book.includes(value) || customer.includes(value)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
});

// Calculate Totals
function updateTotals() {
    let sales = 0;
    let refunds = 0;

    document.querySelectorAll("table tr").forEach((row, index) => {
        if (index === 0) return;

        const amountText = row.children[4].textContent.replace("$", "");
        const amount = parseFloat(amountText);

        if (amount > 0) {
            sales += amount;
        } else {
            refunds += amount;
        }
    });

    document.querySelector(".cards .card:nth-child(1) p").textContent = `$${sales}`;
    document.querySelector(".cards .card:nth-child(2) p").textContent = `$${refunds}`;
    document.querySelector(".cards .card:nth-child(3) p").textContent = `$${sales + refunds}`;
}

updateTotals();