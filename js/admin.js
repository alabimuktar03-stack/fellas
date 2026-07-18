// admin.js
(function() {
    if (!sessionStorage.getItem('admin_logged_in')) {
        window.location.href = 'admin-login.html';
        return;
    }

    // --- Default Products ---
    const defaultProducts = [
        { id: 1, name: "COSMIC CREW TEE", price: 25000, category: "tee", image: "images/Graphic Streetwear T-Shirt.jpeg", badge: "HOT", inStock: true, description: "Premium cotton blend with galactic graphic.", features: ["100% cotton", "Screen print"] },
        { id: 2, name: "REAL ONES HOODIE", price: 25000, category: "hoodie", image: "images/real-ones-hoodie.jpeg", badge: "NEW", inStock: false, description: "Heavyweight fleece hoodie.", features: ["80% cotton", "Kangaroo pocket"] },
        { id: 3, name: "CUBE TEE", price: 25000, category: "tee", image: "images/Cube-tee.jpeg", badge: "NEW", inStock: true, description: "Geometric design tee.", features: ["Combed cotton", "Regular fit"] },
        { id: 4, name: "GRAPHIC STREETWEAR TEE", price: 20000, category: "tee", image: "images/cosmic-crew-tee.jpeg", badge: "", inStock: true, description: "Bold graphics.", features: ["Cotton", "Classic fit"] },
        { id: 5, name: "INSPIRATIONAL LONG SLEEVE", price: 30000, category: "longsleeve", image: "images/Inspirational Graphic Long-Sleeve Tee.jpeg", badge: "", inStock: true, description: "Motivational long sleeve.", features: ["Cotton-poly", "Ribbed cuffs"] },
        { id: 6, name: "INSPIRATIONAL NO SLEEVE", price: 10000, category: "sleeveless", image: "images/No-sleeve.jpg", badge: "", inStock: true, description: "Sleeveless summer tee.", features: ["100% cotton", "Lightweight"] }
    ];

    // --- Load data ---
    let products = JSON.parse(localStorage.getItem('fellaz_products'));
    if (!products || products.length === 0) {
        localStorage.setItem('fellaz_products', JSON.stringify(defaultProducts));
        products = defaultProducts;
    }

    let orders = JSON.parse(localStorage.getItem('fellaz_orders')) || [];

    // --- DOM ---
    const productList = document.getElementById('productList');
    const orderList = document.getElementById('orderList');
    const addBtn = document.getElementById('addProductBtn');
    const modal = document.getElementById('productModal');
    const closeModal = document.getElementById('closeModal');
    const modalTitle = document.getElementById('modalTitle');
    const productForm = document.getElementById('productForm');
    const productId = document.getElementById('productId');
    const prodName = document.getElementById('prodName');
    const prodPrice = document.getElementById('prodPrice');
    const prodCategory = document.getElementById('prodCategory');
    const prodImage = document.getElementById('prodImage');
    const prodDescription = document.getElementById('prodDescription');
    const prodFeatures = document.getElementById('prodFeatures');
    const prodInStock = document.getElementById('prodInStock');
    const prodBadge = document.getElementById('prodBadge');

    // --- Navigation ---
    document.querySelectorAll('.sidebar nav ul li a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.sidebar nav ul li').forEach(li => li.classList.remove('active'));
            this.parentElement.classList.add('active');

            const section = this.dataset.section;
            document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
            document.getElementById(section + 'Section').style.display = 'block';
            document.getElementById('sectionTitle').textContent = this.textContent.trim();

            if (section === 'products') renderProducts();
            if (section === 'orders') renderOrders();
        });
    });

    // --- PRODUCTS ---
    function renderProducts() {
        if (!productList) return;
        if (products.length === 0) {
            productList.innerHTML = '<p style="color:#b9b3c2; text-align:center; padding:20px;">No products yet. Add one!</p>';
            return;
        }
        productList.innerHTML = products.map(p => `
            <div class="product-item" data-id="${p.id}">
                <div class="info">
                    <img src="${p.image || 'images/placeholder.jpg'}" onerror="this.src='https://placehold.co/48x48/1a151f/cba258?text=?'" />
                    <span class="name">${p.name}</span>
                    <span class="price">₦${p.price.toLocaleString()}</span>
                    ${p.badge ? `<span class="badge">${p.badge}</span>` : ''}
                    ${!p.inStock ? `<span class="badge" style="background:#555;">Out of Stock</span>` : ''}
                </div>
                <div class="actions">
                    <button class="btn-edit" onclick="editProduct(${p.id})">Edit</button>
                    <button class="btn-danger" onclick="deleteProduct(${p.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    window.editProduct = function(id) {
        const p = products.find(pr => pr.id === id);
        if (!p) return;
        modalTitle.textContent = 'Edit Product';
        productId.value = p.id;
        prodName.value = p.name;
        prodPrice.value = p.price;
        prodCategory.value = p.category || 'tee';
        prodImage.value = p.image || '';
        prodDescription.value = p.description || '';
        prodFeatures.value = (p.features || []).join(', ');
        prodInStock.checked = p.inStock;
        prodBadge.value = p.badge || '';
        modal.style.display = 'flex';
    };

    window.deleteProduct = function(id) {
        if (confirm('Delete this product?')) {
            products = products.filter(p => p.id !== id);
            localStorage.setItem('fellaz_products', JSON.stringify(products));
            renderProducts();
        }
    };

    addBtn.addEventListener('click', () => {
        modalTitle.textContent = 'Add Product';
        productId.value = '';
        prodName.value = '';
        prodPrice.value = '';
        prodCategory.value = 'tee';
        prodImage.value = '';
        prodDescription.value = '';
        prodFeatures.value = '';
        prodInStock.checked = true;
        prodBadge.value = '';
        modal.style.display = 'flex';
    });

    closeModal.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

    productForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const id = parseInt(productId.value);
        const data = {
            name: prodName.value.trim(),
            price: parseInt(prodPrice.value),
            category: prodCategory.value,
            image: prodImage.value.trim(),
            description: prodDescription.value.trim(),
            features: prodFeatures.value.split(',').map(s => s.trim()).filter(Boolean),
            inStock: prodInStock.checked,
            badge: prodBadge.value
        };
        if (id) {
            const idx = products.findIndex(p => p.id === id);
            if (idx !== -1) products[idx] = { ...products[idx], ...data };
        } else {
            const maxId = products.reduce((max, p) => Math.max(max, p.id), 0);
            data.id = maxId + 1;
            products.push(data);
        }
        localStorage.setItem('fellaz_products', JSON.stringify(products));
        modal.style.display = 'none';
        renderProducts();
    });

    // --- ORDERS (User‑friendly cards) ---
    function renderOrders() {
        if (!orderList) return;
        if (orders.length === 0) {
            orderList.innerHTML = `<p style="color:#b9b3c2; text-align:center; padding:40px;">No orders yet.</p>`;
            return;
        }

        // Sort newest first
        const sorted = [...orders].sort((a, b) => new Date(b.date) - new Date(a.date));

        orderList.innerHTML = sorted.map((order, idx) => {
            const originalIndex = orders.indexOf(order);
            const statusColor = order.status === 'Shipped' ? '#2ecc71' :
                               order.status === 'Delivered' ? '#3498db' :
                               order.status === 'Cancelled' ? '#e74c3c' : '#f39c12';

            // Build address
            const address = order.address ? 
                `${order.address}, ${order.city || ''}, ${order.state || ''}, ${order.country || ''}` :
                'No address';

            // Items list for dropdown
            let itemsHtml = '';
            if (order.items && order.items.length) {
                order.items.forEach(item => {
                    itemsHtml += `
                        <div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px solid #1f1a2a; font-size:0.9rem;">
                            <span>${item.name} (${item.size}) × ${item.quantity}</span>
                            <span>₦${(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                    `;
                });
            } else {
                itemsHtml = '<p style="color:#b9b3c2;">No items found.</p>';
            }

            return `
                <div class="order-card" style="background:#1a151f; border:1px solid #2a2533; border-radius:8px; padding:16px; margin-bottom:12px;">
                    <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:8px;">
                        <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
                            <span style="font-weight:700; color:#cba258;">#${order.id}</span>
                            <span style="font-weight:600;">${order.customer || 'N/A'}</span>
                            <span style="color:#b9b3c2; font-size:0.85rem;">${order.email || ''}</span>
                        </div>
                        <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
                            <span style="font-weight:700; color:#cba258;">₦${(order.total || 0).toLocaleString()}</span>
                            <span style="background:${statusColor}; padding:2px 12px; border-radius:12px; color:#fff; font-size:0.7rem; text-transform:uppercase;">${order.status || 'Pending'}</span>
                            <select onchange="updateOrderStatus(${originalIndex}, this.value)" style="background:#0f0c13; border:1px solid #2a2533; color:#f4f1ea; padding:4px 8px; border-radius:4px;">
                                <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                                <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                                <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                                <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                            </select>
                            <span style="font-size:0.8rem; color:#b9b3c2;">${new Date(order.date).toLocaleDateString()}</span>
                        </div>
                        <button class="btn-toggle" onclick="toggleOrderDetails(${originalIndex})" style="background:transparent; border:1px solid #2a2533; color:#b9b3c2; padding:4px 12px; border-radius:4px; cursor:pointer;">
                            <i class="fas fa-chevron-down"></i> Details
                        </button>
                    </div>
                    <!-- Hidden details -->
                    <div id="order-details-${originalIndex}" style="display:none; margin-top:12px; padding-top:12px; border-top:1px solid #2a2533;">
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:0.9rem;">
                            <div><span style="color:#b9b3c2;">Phone:</span> ${order.phone || 'N/A'}</div>
                            <div><span style="color:#b9b3c2;">Shipping:</span> ${address}</div>
                            <div style="grid-column: span 2;"><span style="color:#b9b3c2;">Reference:</span> ${order.reference || 'N/A'}</div>
                        </div>
                        <div style="margin-top:12px;">
                            <span style="color:#b9b3c2; font-weight:600;">Items:</span>
                            <div style="margin-top:4px;">${itemsHtml}</div>
                        </div>
                        <div style="margin-top:8px; text-align:right; font-weight:700; color:#cba258;">
                            Total: ₦${(order.total || 0).toLocaleString()}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Toggle order details visibility
    window.toggleOrderDetails = function(index) {
        const details = document.getElementById(`order-details-${index}`);
        if (details) {
            if (details.style.display === 'none') {
                details.style.display = 'block';
                // change button icon
                const btn = details.closest('.order-card').querySelector('.btn-toggle i');
                if (btn) btn.className = 'fas fa-chevron-up';
            } else {
                details.style.display = 'none';
                const btn = details.closest('.order-card').querySelector('.btn-toggle i');
                if (btn) btn.className = 'fas fa-chevron-down';
            }
        }
    };

    // Update order status
    window.updateOrderStatus = function(index, newStatus) {
        if (index >= 0 && index < orders.length) {
            orders[index].status = newStatus;
            localStorage.setItem('fellaz_orders', JSON.stringify(orders));
            renderOrders(); // re-render to reflect changes
        }
    };

    // --- Settings ---
    document.getElementById('changePasswordBtn')?.addEventListener('click', function() {
        const newPass = document.getElementById('newPassword').value.trim();
        if (newPass) {
            localStorage.setItem('admin_password', newPass);
            alert('Password updated!');
            document.getElementById('newPassword').value = '';
        } else {
            alert('Enter a new password.');
        }
    });

    document.getElementById('saveShippingBtn')?.addEventListener('click', function() {
        const threshold = document.getElementById('shippingThreshold').value.trim();
        if (threshold) {
            localStorage.setItem('shipping_threshold', threshold);
            alert('Shipping threshold saved.');
        }
    });

    const savedThreshold = localStorage.getItem('shipping_threshold');
    if (savedThreshold) {
        document.getElementById('shippingThreshold').value = savedThreshold;
    }

    // --- Logout ---
    document.getElementById('logoutBtn').addEventListener('click', function() {
        sessionStorage.removeItem('admin_logged_in');
        window.location.href = 'admin-login.html';
    });

    // --- Initial render ---
    renderProducts();
    renderOrders();
})();