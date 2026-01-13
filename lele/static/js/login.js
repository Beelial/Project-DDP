// login.js - Handler untuk halaman login
// Pastikan auth.js sudah di-load sebelum file ini

document.addEventListener('DOMContentLoaded', function() {
  // Cek apakah sudah login, redirect ke home
  if (Auth.isLoggedIn()) {
    window.location.href = '/';
    return;
  }
  
  // Dapatkan form element
  const form = document.querySelector('form');
  
  if (!form) {
    console.error('Form login tidak ditemukan!');
    return;
  }
  
  // Handle form submit
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Dapatkan input values
    const email = form.querySelector('input[type="email"]').value.trim();
    const password = form.querySelector('input[type="password"]').value;
    
    // Proses login
    const result = Auth.login(email, password);
    
    // Tampilkan pesan
    showMessage(result.message, result.success);
    
    // Jika berhasil, redirect ke home setelah 1 detik
    if (result.success) {
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
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
    alert.className = `alert-message fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
      isSuccess ? 'bg-green-500' : 'bg-red-500'
    } text-white font-medium animate-slide-in`;
    alert.textContent = message;
    
    // Tambahkan ke body
    document.body.appendChild(alert);
    
    // Hapus setelah 3 detik
    setTimeout(() => {
      alert.classList.add('animate-slide-out');
      setTimeout(() => alert.remove(), 300);
    }, 3000);
  }
  
  // Tambahkan CSS untuk animasi
  const style = document.createElement('style');
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
  `;
  document.head.appendChild(style);
});