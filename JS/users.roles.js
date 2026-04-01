(function () {
    // Tabs
    const tabs = document.querySelectorAll(".tab");
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
        });
    });

    const table = document.querySelector("table");
    const filters = document.querySelectorAll(".filter");
    const searchInput = document.querySelector(".search input");
    const addButton = document.querySelector(".add");
    const addModal = document.querySelector("#add-user-modal");
    const addForm = document.querySelector("#add-user-form");
    const editModal = document.querySelector("#edit-role-modal");
    const editForm = document.querySelector("#edit-role-form");
    const editRoleSelect = document.querySelector("#edit-role");
    let activeRow = null;
    let lastFocusedElement = null;

    if (!table || !addButton || !addModal || !addForm || !editModal || !editForm || !editRoleSelect || !searchInput) {
        console.warn("users.roles.js: missing required elements");
        return;
    }

    function getRows() {
        return Array.from(table.querySelectorAll("tr"));
    }

    function filterRows() {
        const activeFilter = document.querySelector(".filter.active");
        const role = activeFilter ? activeFilter.textContent.trim().toLowerCase() : "all roles";
        const searchValue = searchInput.value.toLowerCase();

        getRows().forEach((row, index) => {
            if (index === 0) return;

            const roleCell = row.querySelector(".role");
            const name = row.querySelector(".user-name")?.textContent.toLowerCase() || "";
            const email = row.querySelector(".user-email")?.textContent.toLowerCase() || "";

            const roleText = roleCell ? roleCell.textContent.toLowerCase() : "";
            const matchesRole = role === "all roles" || roleText === role;
            const matchesSearch = !searchValue || name.includes(searchValue) || email.includes(searchValue);

            row.style.display = matchesRole && matchesSearch ? "" : "none";
        });
    }

    filters.forEach(filter => {
        filter.addEventListener("click", () => {
            filters.forEach(f => f.classList.remove("active"));
            filter.classList.add("active");
            filterRows();
        });
    });

    searchInput.addEventListener("input", filterRows);

    function openModal(modal) {
        if (!modal) return;
        lastFocusedElement = document.activeElement;
        modal.classList.add("open");
        modal.setAttribute("aria-hidden", "false");
        modal.style.display = "flex";
        modal.style.opacity = "1";
        modal.style.visibility = "visible";
        modal.style.pointerEvents = "auto";
        modal.style.zIndex = "10000";
        const modalContent = modal.querySelector(".modal-content");
        if (modalContent) {
            modalContent.style.opacity = "1";
            modalContent.style.transform = "translateY(0)";
        }
        const focusTarget = modal.querySelector("input, select, button");
        if (focusTarget) {
            focusTarget.focus();
        }
    }

    function closeModal(modal) {
        if (!modal) return;
        modal.classList.remove("open");
        modal.setAttribute("aria-hidden", "true");
        modal.style.display = "none";
        modal.style.opacity = "0";
        modal.style.visibility = "hidden";
        modal.style.pointerEvents = "none";
        const modalContent = modal.querySelector(".modal-content");
        if (modalContent) {
            modalContent.style.opacity = "0";
            modalContent.style.transform = "translateY(-24px)";
        }
        if (lastFocusedElement instanceof HTMLElement) {
            lastFocusedElement.focus();
        }
    }

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            if (addModal.classList.contains("open")) {
                closeModal(addModal);
            }
            if (editModal.classList.contains("open")) {
                closeModal(editModal);
            }
        }
    });

    function resetAddForm() {
        addForm.reset();
        addForm.querySelector("#add-user-role").value = "admin";
    }

    function createTableRow(name, email, role, status = "Active") {
        const tr = document.createElement("tr");
        const statusClass = status.toLowerCase() === "active" ? "active-status" : "offline";
        tr.innerHTML = `
            <td class="user-cell">
                <div class="avatar">${name.charAt(0).toUpperCase()}</div>
                <div class="user-info">
                    <div class="user-name">${name}</div>
                    <div class="user-email">${email}</div>
                </div>
            </td>
            <td><span class="role ${role}">${role.charAt(0).toUpperCase() + role.slice(1)}</span></td>
            <td><span class="status ${statusClass}">${status}</span></td>
            <td>${new Date().toLocaleDateString()}</td>
            <td class="action-buttons"><button class="edit" type="button"><i class="fa-solid fa-pen-to-square"></i>Edit Role</button></td>
        `;
        return tr;
    }

    addButton.addEventListener("click", () => {
        resetAddForm();
        openModal(addModal);
    });

    [addModal, editModal].forEach(modal => {
        modal.addEventListener("click", event => {
            if (event.target === modal) {
                closeModal(modal);
            }
        });
    });

    addModal.querySelectorAll(".close-modal").forEach(btn => {
        btn.addEventListener("click", () => closeModal(addModal));
    });

    editModal.querySelectorAll(".close-modal").forEach(btn => {
        btn.addEventListener("click", () => closeModal(editModal));
    });

    addForm.addEventListener("submit", event => {
        event.preventDefault();

        const name = addForm.querySelector("#add-user-name").value.trim();
        const email = addForm.querySelector("#add-user-email").value.trim();
        const role = addForm.querySelector("#add-user-role").value;

        if (!name || !email || !role) return;

        const newRow = createTableRow(name, email, role);
        table.appendChild(newRow);
        closeModal(addModal);
        filterRows();
    });

    editForm.addEventListener("submit", event => {
        event.preventDefault();
        if (!activeRow) return;

        const newRole = editRoleSelect.value;
        const roleSpan = activeRow.querySelector(".role");

        if (roleSpan) {
            roleSpan.className = "role " + newRole;
            roleSpan.textContent = newRole.charAt(0).toUpperCase() + newRole.slice(1);
        }

        closeModal(editModal);
        filterRows();
    });

    table.addEventListener("click", event => {
        const editButton = event.target.closest(".edit");

        if (editButton) {
            activeRow = editButton.closest("tr");
            const currentRole = activeRow.querySelector(".role")?.textContent.toLowerCase() || "user";
            editRoleSelect.value = currentRole;
            openModal(editModal);
        }
    });

    filterRows();
})();
