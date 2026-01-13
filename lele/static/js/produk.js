// produk.js - Handler untuk halaman produk
// Pastikan auth.js sudah di-load sebelum file ini
window.FloatingCart = {
  init() {
    if (document.getElementById('floating-cart')) return;

    document.body.insertAdjacentHTML(
      'beforeend',
      `
      <button id="fc-btn"
        style="position:fixed;bottom:20px;right:20px;width:56px;height:56px;border-radius:50%;background:#2563eb;color:#fff;font-size:22px;z-index:9999">
        🛒
        <span id="fc-count"
          style="position:absolute;top:-6px;right:-6px;background:red;color:white;width:22px;height:22px;border-radius:50%;font-size:12px;display:none;align-items:center;justify-content:center">
          0
        </span>
      </button>

      <div id="floating-cart"
        style="position:fixed;bottom:90px;right:20px;width:320px;max-height:60vh;background:white;border:1px solid #ddd;border-radius:10px;display:none;flex-direction:column;z-index:9999">

        <div style="padding:10px;border-bottom:1px solid #ddd;font-weight:bold;display:flex;justify-content:space-between">
          Keranjang
          <button id="fc-close">✖</button>
        </div>

        <div id="fc-items" style="padding:10px;overflow:auto"></div>

        <div style="padding:10px;border-top:1px solid #ddd;font-weight:bold">
          Total: Rp <span id="fc-total">0</span>
        </div>
      </div>
      `
    );

    document.getElementById('fc-btn').onclick = () => {
      const box = document.getElementById('floating-cart');
      box.style.display = box.style.display === 'none' ? 'flex' : 'none';
    };

    document.getElementById('fc-close').onclick = () => {
      document.getElementById('floating-cart').style.display = 'none';
    };

    this.render();
  },

  render() {
    if (!document.getElementById('floating-cart')) return;

    const items = Cart.getCart();
    const box = document.getElementById('fc-items');
    const total = document.getElementById('fc-total');
    const count = document.getElementById('fc-count');

    box.innerHTML = '';

    if (items.length === 0) {
      box.innerHTML = '<p>Keranjang kosong</p>';
      count.style.display = 'none';
      total.textContent = '0';
      return;
    }

    items.forEach(item => {
      box.innerHTML += `
        <div style="border-bottom:1px solid #eee;padding:6px 0">
          <strong>${item.name}</strong><br>
          Rp ${item.price} x ${item.quantity}<br>
          <button onclick="FloatingCart.dec('${item.id}')">➖</button>
          <button onclick="FloatingCart.inc('${item.id}')">➕</button>
          <button onclick="FloatingCart.del('${item.id}')">❌</button>
        </div>
      `;
    });

    total.textContent = Cart.getTotalPrice().toLocaleString('id-ID');
    count.textContent = Cart.getTotalItems();
    count.style.display = 'flex';
  },

  inc(id) {
    const item = Cart.getCart().find(i => i.id === id);
    Cart.updateQuantity(id, item.quantity + 1);
    this.render();
  },

  dec(id) {
    const item = Cart.getCart().find(i => i.id === id);
    Cart.updateQuantity(id, item.quantity - 1);
    this.render();
  },

  del(id) {
    Cart.removeItem(id);
    this.render();
  }
};

window.Cart = {
  CART_KEY: 'lele_fresh_cart',
  
  // Tambah item ke cart
  addItem(product) {
    const cart = this.getCart();
    
    // Cek apakah produk sudah ada
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        ...product,
        quantity: 1,
        addedAt: new Date().toISOString()
      });
    }
    
    this.saveCart(cart);
    return { success: true, message: 'Produk berhasil ditambahkan ke keranjang!' };
  },
  
  // Dapatkan semua item di cart
  getCart() {
    const cart = localStorage.getItem(this.CART_KEY);
    return cart ? JSON.parse(cart) : [];
  },
  
  // Simpan cart
  saveCart(cart) {
    localStorage.setItem(this.CART_KEY, JSON.stringify(cart));
  },
  
  // Hitung total item
  getTotalItems() {
    const cart = this.getCart();
    return cart.reduce((total, item) => total + item.quantity, 0);
  },
  
  // Hitung total harga
  getTotalPrice() {
    const cart = this.getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  },
  
  // Hapus item
  removeItem(productId) {
    let cart = this.getCart();
    cart = cart.filter(item => item.id !== productId);
    this.saveCart(cart);
  },
  
  // Update quantity
  updateQuantity(productId, quantity) {
    const cart = this.getCart();
    const item = cart.find(item => item.id === productId);
    if (item) {
      item.quantity = quantity;
      if (quantity <= 0) {
        this.removeItem(productId);
      } else {
        this.saveCart(cart);
      }
    }
  },
  
  // Clear cart
  clearCart() {
    localStorage.removeItem(this.CART_KEY);
  }
};

window.updateNavbarCartBadge = function () {
  if (typeof Cart === 'undefined') return;

  const count = Cart.getTotalItems();
  const badge = document.querySelector('#navbar-cart-count');

  if (!badge) return;

  if (count > 0) {
    badge.textContent = count;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
};

document.addEventListener('DOMContentLoaded', function() {
  console.log('Produk.js loaded');
  
  // Cek apakah Auth tersedia
  if (typeof Auth === 'undefined') {
    console.error('Auth.js tidak ter-load! Pastikan auth.js di-load terlebih dahulu.');
    return;
  }
  
  // Dapatkan semua tombol "add to cart" dengan class yang benar
  const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
  
  console.log(`Ditemukan ${addToCartButtons.length} tombol add to cart`);
  
  addToCartButtons.forEach((button, index) => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      
      console.log(`Button ${index} diklik`);
      
      // Cek login status
      if (!Auth.isLoggedIn()) {
        showMessage('Silakan login terlebih dahulu untuk menambahkan produk ke keranjang!', false);
        
        // Redirect ke login setelah 2 detik
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }
      
      // Dapatkan product card parent
      const card = this.closest('[data-product-id]');
      
      if (!card) {
        console.error('Product card tidak ditemukan!');
        showMessage('Terjadi kesalahan. Silakan coba lagi.', false);
        return;
      }
      
      // Extract data dari data attributes
      const productData = {
        id: card.dataset.productId,
        name: card.dataset.productName,
        size: card.dataset.productSize,
        price: parseInt(card.dataset.productPrice),
        unit: card.dataset.productUnit,
        image: card.querySelector('img')?.src || ''
      };
      
      console.log('Product data:', productData);
      
      // Validasi data
      if (!productData.id || !productData.name || !productData.price) {
        console.error('Data produk tidak lengkap!', productData);
        showMessage('Data produk tidak valid!', false);
        return;
      }
      
      // Tambahkan ke cart
      const result = Cart.addItem(productData); 
      FloatingCart.render();
      updateNavbarCartBadge();
      showMessage(result.message, result.success);
      
      // Animasi button
      animateButton(this);
    });
  });
  
  // Fungsi animasi button saat diklik
  function animateButton(button) {
    button.classList.add('scale-90');
    setTimeout(() => {
      button.classList.remove('scale-90');
      button.classList.add('scale-110');
      setTimeout(() => {
        button.classList.remove('scale-110');
      }, 150);
    }, 150);
  }
  
  
  // Fungsi untuk menampilkan pesan
  function showMessage(message, isSuccess) {
    // Hapus pesan sebelumnya jika ada
    const oldAlert = document.querySelector('.alert-message');
    if (oldAlert) {
      oldAlert.remove();
    }
    
    // Buat elemen pesan
    const alert = document.createElement('div');
    alert.className = `alert-message fixed top-20 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
      isSuccess ? 'bg-green-500' : 'bg-red-500'
    } text-white font-medium animate-slide-in max-w-md flex items-center gap-2`;
    
    const icon = isSuccess ? 'check_circle' : 'error';
    alert.innerHTML = `
      <span class="material-symbols-outlined">${icon}</span>
      <span>${message}</span>
    `;
    
    // Tambahkan ke body
    document.body.appendChild(alert);
    
    // Hapus setelah 3 detik
    setTimeout(() => {
      alert.classList.add('animate-slide-out');
      setTimeout(() => alert.remove(), 300);
    }, 3000);
  }
  
  // Tambahkan CSS untuk animasi dan badge
  if (!document.getElementById('produk-styles')) {
    const style = document.createElement('style');
    style.id = 'produk-styles';
    style.textContent = `
      @keyframes slide-in {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes slide-out {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
      
      .animate-slide-in {
        animation: slide-in 0.3s ease-out;
      }
      
      .animate-slide-out {
        animation: slide-out 0.3s ease-in;
      }
      
      .scale-90 {
        transform: scale(0.9);
        transition: transform 0.15s ease;
      }
      
      .scale-110 {
        transform: scale(1.1);
        transition: transform 0.15s ease;
      }
    `;
    document.head.appendChild(style);
  }

  
  // Handle "Shop Now" button
  const shopNowBtn = document.querySelector('a[href="#produk"]');
  if (shopNowBtn) {
    shopNowBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const produkSection = document.getElementById('produk');
      if (produkSection) {
        produkSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
  
  console.log('Produk.js initialization complete');
  FloatingCart.init();
});
