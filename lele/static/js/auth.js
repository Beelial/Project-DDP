// auth.js - Sistem Autentikasi Sederhana
// File ini dapat di copot pasang tanpa konfigurasi tambahan

const Auth = {
  // Key untuk localStorage
  USER_KEY: 'lele_fresh_user',
  
  // Register user baru
  register(email, password, confirmPassword) {
    // Validasi input
    if (!email || !password || !confirmPassword) {
      return { success: false, message: 'Semua field harus diisi!' };
    }
    
    // Validasi email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, message: 'Format email tidak valid!' };
    }
    
    // Validasi password match
    if (password !== confirmPassword) {
      return { success: false, message: 'Password dan konfirmasi password tidak cocok!' };
    }
    
    // Validasi panjang password
    if (password.length < 6) {
      return { success: false, message: 'Password minimal 6 karakter!' };
    }
    
    // Cek apakah user sudah terdaftar
    const users = this.getAllUsers();
    if (users.find(u => u.email === email)) {
      return { success: false, message: 'Email sudah terdaftar!' };
    }
    
    // Simpan user baru
    const newUser = {
      id: Date.now().toString(),
      email: email,
      password: password, // Dalam produksi, harus di-hash!
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('lele_fresh_users', JSON.stringify(users));
    
    return { success: true, message: 'Registrasi berhasil! Silakan login.' };
  },
  
  // Login user
  login(email, password) {
    // Validasi input
    if (!email || !password) {
      return { success: false, message: 'Email dan password harus diisi!' };
    }
    
    // Cari user
    const users = this.getAllUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return { success: false, message: 'Email atau password salah!' };
    }
    
    // Simpan session
    const session = {
      id: user.id,
      email: user.email,
      loginAt: new Date().toISOString()
    };
    
    localStorage.setItem(this.USER_KEY, JSON.stringify(session));
    
    return { success: true, message: 'Login berhasil!', user: session };
  },
  
  // Logout user
  logout() {
    localStorage.removeItem(this.USER_KEY);
    return { success: true, message: 'Logout berhasil!' };
  },
  
  // Cek apakah user sudah login
  isLoggedIn() {
    const session = localStorage.getItem(this.USER_KEY);
    return session !== null;
  },
  
  // Dapatkan data user yang sedang login
  getCurrentUser() {
    const session = localStorage.getItem(this.USER_KEY);
    return session ? JSON.parse(session) : null;
  },
  
  // Get semua users (internal)
  getAllUsers() {
    const users = localStorage.getItem('lele_fresh_users');
    return users ? JSON.parse(users) : [];
  },
  
  // Redirect ke login jika belum login
  requireAuth(redirectUrl = '/login') {
    if (!this.isLoggedIn()) {
      window.location.href = redirectUrl;
      return false;
    }
    return true;
  }
};

// Export untuk digunakan di file lain
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Auth;
}