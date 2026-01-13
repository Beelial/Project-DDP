// register.js - Handler untuk halaman register
// Pastikan auth.js sudah di-load sebelum file ini

document.addEventListener('DOMContentLoaded', function() {
  console.log('Register.js loaded');
  
  // Cek apakah Auth tersedia
  if (typeof Auth === 'undefined') {
    console.error('Auth.js tidak ter-load! Pastikan auth.js di-load terlebih dahulu.');
    return;
  }
  
  // Cek apakah sudah login, redirect ke home
  if (Auth.isLoggedIn()) {
    console.log('User sudah login, redirect ke home');
    window.location.href = '/';
    return;
  }
  
  // Dapatkan form element
  const form = document.getElementById('register-form');
  
  if (!form) {
    console.error('Form register tidak ditemukan!');
    return;
  }
  
  // Dapatkan input elements
  const emailInput = form.querySelector('input[name="email"]');
  const passwordInput = form.querySelector('input[name="password"]');
  const confirmPasswordInput = form.querySelector('input[name="confirmPassword"]');
  
  if (!emailInput || !passwordInput || !confirmPasswordInput) {
    console.error('Input fields tidak ditemukan!');
    return;
  }
  
  // Real-time validation untuk confirm password
  confirmPasswordInput.addEventListener('input', function() {
    const password = passwordInput.value;
    const confirmPassword = this.value;
    
    if (confirmPassword && password !== confirmPassword) {
      this.setCustomValidity('Password tidak cocok');
      this.classList.add('border-red-500');
    } else {
      this.setCustomValidity('');
      this.classList.remove('border-red-500');
    }
  });
  
  // Real-time validation untuk password length
  passwordInput.addEventListener('input', function() {
    if (this.value.length > 0 && this.value.length < 6) {
      this.setCustomValidity('Password minimal 6 karakter');
      this.classList.add('border-red-500');
    } else {
      this.setCustomValidity('');
      this.classList.remove('border-red-500');
    }
    
    // Trigger validation pada confirm password juga
    if (confirmPasswordInput.value) {
      confirmPasswordInput.dispatchEvent(new Event('input'));
    }
  });
  
  // Handle form submit
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    console.log('Form submitted');
    
    // Dapatkan input values
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    console.log('Register data:', { email, password: '***', confirmPassword: '***' });
    
    // Proses register
    const result = Auth.register(email, password, confirmPassword);
    
    console.log('Register result:', result);
    
    // Tampilkan pesan
    showMessage(result.message, result.success);
    
    // Jika berhasil, redirect ke login setelah 1.5 detik
    if (result.success) {
      // Disable form
      form.querySelectorAll('input, button').forEach(el => {
        el.disabled = true;
      });
      
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    }
  });
  
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
  if (!document.getElementById('register-styles')) {
    const style = document.createElement('style');
    style.id = 'register-styles';
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
      
      input.border-red-500 {
        border-color: #ef4444 !important;
      }
      
      input.border-red-500:focus {
        ring-color: rgba(239, 68, 68, 0.2) !important;
      }
    `;
    document.head.appendChild(style);
  }
  
  console.log('Register.js initialization complete');
});