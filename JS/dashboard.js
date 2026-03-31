document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', (e) => {
        const isDropdownButton = e.target.closest('.dropdown-trigger');
        
        if (isDropdownButton) {
            const dropdownWrapper = isDropdownButton.closest('.dropdown-wrapper');
            const menu = dropdownWrapper.querySelector('.dropdown-menu');
            
            document.querySelectorAll('.dropdown-menu').forEach(m => {
                if (m !== menu) m.classList.remove('show');
            });
            
            if (menu) {
                menu.classList.toggle('show');
            }
        } else {
            document.querySelectorAll('.dropdown-menu').forEach(m => {
                m.classList.remove('show');
            });
        }
    });

    const stats = document.querySelectorAll('.stat-value');
    stats.forEach(stat => {
        const targetAttr = stat.getAttribute('data-target');
        if (!targetAttr) return;
        
        const target = parseFloat(targetAttr);
        const prefix = stat.getAttribute('data-prefix') || '';
        
        let current = 0;
        const increment = target / 50; 
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                stat.textContent = `${prefix}${Math.ceil(current).toLocaleString()}`;
                requestAnimationFrame(updateCounter);
            } else {
                stat.textContent = `${prefix}${target.toLocaleString()}`;
            }
        };
        updateCounter();
    });

    const toggleBtns = document.querySelectorAll('.toggle-btn');
    const barFills = document.querySelectorAll('.bar-fill');
    const barTotals = document.querySelectorAll('.bar-total');
    const dLabels = [
        document.getElementById('sat'),
        document.getElementById('sun'),
        document.getElementById('mon'),
        document.getElementById('tue'),
        document.getElementById('wed'),
        document.getElementById('thu'),
        document.getElementById('fri')
    ];

    const chartData = {
        'Week':  [30, 80, 45, 90, 60, 20, 75],
        'Month': [60, 65, 80, 70, 85, 50, 100]
    };
    
    const labelData = {
        'Week':  ['SAT', 'SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI'],
        'Month': ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL']
    };

    const updateTooltips = (data) => {
        barTotals.forEach((barTotal, index) => {
            let tooltip = barTotal.querySelector('.chart-tooltip');
            if (!tooltip) {
                tooltip = document.createElement('div');
                tooltip.className = 'chart-tooltip';
                barTotal.appendChild(tooltip);
            }
            tooltip.textContent = `Sales: ${data[index]}`;
        });
    };

    toggleBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            toggleBtns.forEach(b => b.classList.remove('active'));
            const clickedBtn = e.target;
            clickedBtn.classList.add('active');

            const period = clickedBtn.textContent.trim();
            const dataToLoad = chartData[period] || chartData['Month'];
            const labelsToLoad = labelData[period] || labelData['Month'];
            
            dLabels.forEach((label, index) => {
                if (label) {
                    label.textContent = labelsToLoad[index];
                }
            });

            updateTooltips(dataToLoad);
            
            barFills.forEach((bar, index) => {
                bar.style.height = '0%';
                setTimeout(() => {
                    bar.style.height = `${dataToLoad[index]}%`;
                }, 100 + (index * 50));
            });
        });
    });

    setTimeout(() => {
        const activeBtn = document.querySelector('.toggle-btn.active');
        if (activeBtn) {
            const period = activeBtn.textContent.trim();
            const labelsToLoad = labelData[period] || labelData['Month'];
            const dataToLoad = chartData[period] || chartData['Month'];
            
            dLabels.forEach((label, index) => {
                if (label) {
                    label.textContent = labelsToLoad[index];
                }
            });
            updateTooltips(dataToLoad);
        }

        barFills.forEach((bar) => {
            const currentHeight = bar.style.height;
            bar.style.height = '0%';
            setTimeout(() => {
                bar.style.height = currentHeight;
            }, 100);
        });
    }, 200);

    const viewCatalogBtn = document.querySelector('.trending-books .btn-block-subtle') || document.querySelector('.btn-block-subtle');
    if (viewCatalogBtn) {
        viewCatalogBtn.addEventListener('click', () => {
            window.location.href = 'Book-&-inventory.html';
        });
    }

    const allTransactions = [
        { id: '#ORD-28492', initials: 'JD', name: 'Jane Doe', date: 'Oct 24, 2023', amount: '$124.50', status: 'Completed', color: 'bg-yellow-text' },
        { id: '#ORD-28491', initials: 'AS', name: 'Alex Smith', date: 'Oct 24, 2023', amount: '$42.00', status: 'Pending', color: 'bg-blue-text' },
        { id: '#ORD-28490', initials: 'MK', name: 'Michael King', date: 'Oct 23, 2023', amount: '$89.99', status: 'Completed', color: 'bg-purple-text' },
        { id: '#ORD-28489', initials: 'SJ', name: 'Sarah Jones', date: 'Oct 22, 2023', amount: '$210.00', status: 'Completed', color: 'bg-yellow-text' },
        { id: '#ORD-28488', initials: 'TR', name: 'Tom Riddle', date: 'Oct 22, 2023', amount: '$15.50', status: 'Pending', color: 'bg-blue-text' },
        { id: '#ORD-28487', initials: 'BW', name: 'Bruce Wayne', date: 'Oct 21, 2023', amount: '$999.00', status: 'Completed', color: 'bg-purple-text' },
        { id: '#ORD-28486', initials: 'CK', name: 'Clark Kent', date: 'Oct 20, 2023', amount: '$45.00', status: 'Pending', color: 'bg-yellow-text' }
    ];

    const ITEMS_PER_PAGE = 3;
    let currentTablePage = 1;
    const tbody = document.querySelector('table tbody');
    const paginationText = document.querySelector('#transactions-pagination .subtext');
    const tablePageControls = document.querySelectorAll('.page-controls .btn-outline');

    const renderTable = () => {
        if (!tbody || tablePageControls.length < 2) return;
        
        tbody.innerHTML = '';
        const startIdx = (currentTablePage - 1) * ITEMS_PER_PAGE;
        const endIdx = startIdx + ITEMS_PER_PAGE;
        const pageItems = allTransactions.slice(startIdx, endIdx);

        pageItems.forEach(item => {
            const statusClass = item.status === 'Completed' ? 'success' : 'warning';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.id}</td>
                <td>
                    <div class="customer-cell">
                        <div class="avatar-sm ${item.color}">${item.initials}</div>
                        <span>${item.name}</span>
                    </div>
                </td>
                <td class="text-muted">${item.date}</td>
                <td class="font-bold">${item.amount}</td>
                <td><span class="status-badge ${statusClass}">${item.status}</span></td>
                <td class="text-center">
                    <div class="dropdown-wrapper">
                        <button class="icon-btn-sm dropdown-trigger"><i class="fas fa-ellipsis-v"></i></button>
                        <div class="dropdown-menu action-dropdown">
                            <a href="#" class="dropdown-item">View Details</a>
                            <a href="#" class="dropdown-item">Edit Order</a>
                            <a href="#" class="dropdown-item delete-text" style="color: #ef4444;">Delete</a>
                        </div>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });

        const totalItems = allTransactions.length;
        const displayingEnd = Math.min(startIdx + ITEMS_PER_PAGE, totalItems);
        
        if (paginationText) {
            paginationText.textContent = `SHOWING ${startIdx + 1}-${displayingEnd} OF ${totalItems} TRANSACTIONS`;
        }

        const maxPage = Math.ceil(totalItems / ITEMS_PER_PAGE);
        tablePageControls[0].classList.toggle('active', currentTablePage > 1);
        tablePageControls[1].classList.toggle('active', currentTablePage < maxPage);
    };

    if (tablePageControls.length >= 2) {
        tablePageControls[0].addEventListener('click', () => {
            if (currentTablePage > 1) {
                currentTablePage--;
                renderTable();
            }
        });

        tablePageControls[1].addEventListener('click', () => {
            const maxPage = Math.ceil(allTransactions.length / ITEMS_PER_PAGE);
            if (currentTablePage < maxPage) {
                currentTablePage++;
                renderTable();
            }
        });
        
        renderTable();
    }
    const currentUrl = window.location.pathname.split('/').pop();
    const sidebarLinks = document.querySelectorAll('aside a');
    sidebarLinks.forEach(link => {
        link.classList.remove('active');
        link.style.borderColor = 'transparent';
        
        if (link.getAttribute('href').toLowerCase() === currentUrl.toLowerCase() || 
           (currentUrl === '' && link.getAttribute('href') === 'dashboard.html')) {
            link.classList.add('active');
            link.style.borderColor = 'var(--brand-primary)';
        }
    });

});