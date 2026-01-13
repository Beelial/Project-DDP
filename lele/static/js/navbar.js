// navbar.js - Handler untuk navbar
// Pastikan auth.js sudah di-load sebelum file ini

document.addEventListener('DOMContentLoaded', function () {
    console.log('Navbar.js loaded');

    // Cek apakah Auth tersedia
    if (typeof Auth === 'undefined') {
        console.error('Auth.js tidak ter-load! Pastikan auth.js di-load terlebih dahulu.');
        return;
    }

    // Update navbar berdasarkan status login
    updateNavbar();

    if (typeof updateNavbarCartBadge === 'function') {
        updateNavbarCartBadge();
    
    window.addEventListener('storage', () => {
  
    if (typeof updateNavbarCartBadge === 'function') {
        updateNavbarCartBadge();
    }
});
}

    function updateNavbar() {
        const isLoggedIn = Auth.isLoggedIn();
        const navList = document.querySelector('nav ul');

        if (!navList) {
            console.error('Navigation list tidak ditemukan!');
            return;
        }

        // Cari li yang berisi tombol login
        const loginLi = Array.from(navList.querySelectorAll('li')).find(li => {
            const link = li.querySelector('a');
            return link && link.href && link.href.includes('login');
        });

        if (!loginLi) {
            console.error('Login button tidak ditemukan!');
            return;
        }

        if (isLoggedIn) {
            const currentUser = Auth.getCurrentUser();
            const userName = currentUser.email.split('@')[0];

            // Buat dropdown menu
            loginLi.innerHTML = `
        <div class="relative user-menu">
          <button class="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all border-2 border-blue-500">
            <span class="material-symbols-outlined text-lg">account_circle</span>
            <span class="hidden sm:inline">${userName}</span>
            <span class="material-symbols-outlined text-sm dropdown-arrow transition-transform">expand_more</span>
          </button>
          
          <div class="dropdown-menu absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 opacity-0 invisible transition-all duration-200 z-50 overflow-hidden">
            <div class="py-1">
              <div class="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <p class="text-xs text-gray-500 mb-1">Signed in as</p>
                <p class="text-sm font-semibold text-gray-700 truncate">${currentUser.email}</p>
              </div>
              
              <button
                id="open-cart"
                class="flex items-center justify-between w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors">
                <div class="flex items-center gap-3">
                    <span class="material-symbols-outlined text-lg">shopping_cart</span>
                    <span>Keranjang</span>
                </div>
                </button>
              
              <hr class="my-1 border-gray-200">
              
              <button id="logout-btn" class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                <span class="material-symbols-outlined text-lg">logout</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      `;

            // Handle dropdown toggle
            const userMenuBtn = loginLi.querySelector('.user-menu button');
            const dropdownMenu = loginLi.querySelector('.dropdown-menu');
            const dropdownArrow = loginLi.querySelector('.dropdown-arrow');

            if (!userMenuBtn || !dropdownMenu) {
                console.error('Dropdown elements tidak ditemukan!');
                return;
            }

            userMenuBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                const isVisible = !dropdownMenu.classList.contains('invisible');

                if (isVisible) {
                    closeDropdown();
                } else {
                    openDropdown();
                }
            });

            function openDropdown() {
                dropdownMenu.classList.remove('opacity-0', 'invisible');
                dropdownMenu.classList.add('opacity-100', 'visible');
                dropdownArrow.style.transform = 'rotate(180deg)';
            }

            function closeDropdown() {
                dropdownMenu.classList.add('opacity-0', 'invisible');
                dropdownMenu.classList.remove('opacity-100', 'visible');
                dropdownArrow.style.transform = 'rotate(0deg)';
            }

            // Close dropdown when clicking outside
            document.addEventListener('click', function (e) {
                if (!loginLi.contains(e.target)) {
                    closeDropdown();
                }
            });

            // Close dropdown on ESC key
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') {
                    closeDropdown();
                }
            });

            const cartBtn = document.getElementById('open-cart');

            if (cartBtn) {
            cartBtn.addEventListener('click', () => {
                const items = Cart.getCart();
                const total = Cart.getTotalPrice();

                if (items.length === 0) {
                alert('Keranjang masih kosong');
                return;
                }

                let text = 'ISI KERANJANG:\n\n';
                items.forEach(i => {
                text += `${i.name} (${i.quantity}x)\n`;
                });
                text += `\nTotal: Rp ${total.toLocaleString('id-ID')}`;

                alert(text);
            });
            }

            // Handle logout
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', function (e) {
                    e.preventDefault();

                    // Konfirmasi logout
                    if (confirm('Apakah Anda yakin ingin logout?')) {
                        const result = Auth.logout();

                        // Tampilkan pesan
                        showMessage(result.message, result.success);

                        // Redirect ke home setelah 1 detik
                        setTimeout(() => {
                            window.location.href = '/';
                        }, 1000);
                    }
                });
            }

        } else {
            // User belum login, pastikan tombol login ada
            const currentLink = loginLi.querySelector('a');
            if (!currentLink || !currentLink.textContent.includes('Login')) {
                loginLi.innerHTML = `
          <a class="border-2 px-6 py-2 rounded-xl hover:bg-blue-600 text-blue-600 hover:text-white border-blue-500 font-semibold transition-all" href="/login">
            Login
          </a>
        `;
            }
        }
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
        alert.className = `alert-message fixed top-20 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${isSuccess ? 'bg-green-500' : 'bg-red-500'
            } text-white font-medium animate-slide-in flex items-center gap-2`;

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

    // Tambahkan CSS untuk animasi
    if (!document.getElementById('navbar-styles')) {
        const style = document.createElement('style');
        style.id = 'navbar-styles';
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
      
      .dropdown-menu {
        transition: opacity 0.2s ease, visibility 0.2s ease, transform 0.2s ease;
        transform-origin: top right;
      }
      
      .dropdown-menu.visible {
        transform: scale(1);
      }
      
      .dropdown-menu.invisible {
        transform: scale(0.95);
      }
      
      .dropdown-arrow {
        transition: transform 0.2s ease;
      }
    `;
        document.head.appendChild(style);
    }

    console.log('Navbar.js initialization complete');
});