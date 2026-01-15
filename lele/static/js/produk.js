const PRODUCT_IMAGES = {
  "Pakan Lele": "/static/assets/6.png",
  "Pelet Lele": "/static/assets/12.png",
  "Vitamin Lele": "/static/assets/7.png",
  "Probiotik Lele": "/static/assets/8.png",
  "Bibit Lele": "/static/assets/13.png",
  "Obat Anti Jamur": "/static/assets/11.png",
  "Obat Anti Kuman": "/static/assets/10.png",
  "Paket Kolam 1": "/static/assets/2.png",
  "Paket Kolam 2": "/static/assets/1.png",
  "Paket Kolam 3": "/static/assets/4.png"
};

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(name + '=')) {
        cookieValue = decodeURIComponent(cookie.slice(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

const csrftoken = getCookie('csrftoken');


// ================== FLOATING CART ==================
window.FloatingCart = {
  init() {
    if (document.getElementById('floating-cart')) return;

    document.body.insertAdjacentHTML('beforeend', `
      <button id="fc-btn"
        style="position:fixed;bottom:20px;right:20px;
        width:56px;height:56px;border-radius:50%;
        background:#2563eb;color:white;font-size:22px;
        z-index:9999">
        🛒
        <span id="fc-count"
          style="position:absolute;top:-6px;right:-6px;
          background:red;color:white;width:22px;height:22px;
          border-radius:50%;font-size:12px;
          display:none;align-items:center;justify-content:center">
          0
        </span>
      </button>

      <div id="floating-cart"
        style="position:fixed;bottom:90px;right:20px;
        width:320px;max-height:60vh;background:white;
        border:1px solid #ddd;border-radius:10px;
        display:none;flex-direction:column;z-index:9999">

        <div style="padding:10px;border-bottom:1px solid #ddd;
          font-weight:bold;display:flex;justify-content:space-between">
          Keranjang
          <button id="fc-close">✖</button>
        </div>

        <div id="fc-items" style="padding:10px;overflow:auto"></div>

        <div style="padding:10px;border-top:1px solid #ddd;font-weight:bold">
          Total: Rp <span id="fc-total">0</span>
          <button id="fc-checkout"
          style="margin-top:10px;width:100%;padding:10px;
          background:#2563eb;color:white;border-radius:8px">
          Checkout
        </button>
        </div>
      </div>
    `);
    document.getElementById('fc-btn').onclick = () => {
      const box = document.getElementById('floating-cart');
      box.style.display = box.style.display === 'none' ? 'flex' : 'none';
    };

    document.getElementById('fc-close').onclick = () => {
    document.getElementById('floating-cart').style.display = 'none';
    };
    document.getElementById('fc-btn').style.cursor = 'pointer';
    document.getElementById('fc-close').style.cursor = 'pointer';
    document.getElementById('fc-checkout').style.cursor = 'pointer';
    this.render();
  },
renderCheckout() {
  fetch('/api/cart/')
    .then(res => res.json())
    .then(data => {
      const itemsBox = document.getElementById('payment-items');
      const totalBox = document.getElementById('payment-total');

      itemsBox.innerHTML = '';

      const checkoutBtn = document.getElementById('fc-checkout');

      if (data.items.length === 0) {
        box.innerHTML = '<p>Keranjang kosong</p>';
        count.style.display = 'none';
        total.textContent = '0';

        checkoutBtn.disabled = true;
        checkoutBtn.classList.add('opacity-50', 'cursor-not-allowed');

        return;
      }

      checkoutBtn.disabled = false;
      checkoutBtn.classList.remove('opacity-50', 'cursor-not-allowed');

      data.items.forEach(item => {
        itemsBox.innerHTML += `
          <div class="flex items-center gap-3 border-b pb-3">
            <img
              src="${PRODUCT_IMAGES[item.name] || '/static/assets/placeholder.png'}"
              class="w-12 h-12 rounded-lg object-cover border">


            <div class="flex-1">
              <div class="font-semibold">${item.name}</div>
              <div class="text-sm text-gray-500">
                ${item.quantity} x Rp ${item.price.toLocaleString('id-ID')}
              </div>
            </div>

            <div class="font-bold">
              Rp ${(item.price * item.quantity).toLocaleString('id-ID')}
            </div>
          </div>
        `;
      });

      totalBox.innerText = data.total.toLocaleString('id-ID');
    });
},

  render() {
    fetch('/api/cart/')
      .then(res => res.json())
      .then(data => {
        const box = document.getElementById('fc-items');
        const total = document.getElementById('fc-total');
        const count = document.getElementById('fc-count');

        box.innerHTML = '';

        if (data.items.length === 0) {
          box.innerHTML = '<p>Keranjang kosong</p>';
          count.style.display = 'none';
          total.textContent = '0';
          return;
        }

        data.items.forEach(item => {
          box.innerHTML += `
            <div style="border-bottom:1px solid #eee;padding:6px 0">
              <strong>${item.name}</strong>
              Rp ${item.price.toLocaleString('id-ID')} x ${item.quantity}<br>
              <button style="cursor:pointer"
                      onclick="FloatingCart.update('${item.id}', ${item.quantity - 1})" ${item.quantity <= 1 ? 'style="opacity:0.5"' : ''}>➖</button>

              <button style="cursor:pointer"
                      onclick="FloatingCart.update('${item.id}', ${item.quantity + 1})">➕</button>
            </div>
          `;
        });

        total.textContent = data.total.toLocaleString('id-ID');
        count.textContent = data.items.length;
        count.style.display = 'flex';
      });
  },

  update(id, qty) {
  fetch('/api/cart/update/', {
    method: 'POST',
    headers: {
      'X-CSRFToken': csrftoken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: id,
      quantity: qty
    })
  })
  .then(res => res.json())
  .then(data => {
  if (data.deleted) {
    this.render();
    return;
  }

  document.getElementById('fc-total').innerText =
    data.total.toLocaleString('id-ID');
  this.render();
});

}
};

// ================== ADD TO CART ==================
document.addEventListener('DOMContentLoaded', () => {
  FloatingCart.init();

  document.getElementById('fc-checkout').onclick = () => {
  fetch('/api/cart/')
    .then(res => res.json())
    .then(data => {
      if (data.items.length === 0) {
        alert('Keranjang masih kosong!');
        return;
      }

      FloatingCart.renderCheckout();
      document.getElementById('payment-modal').classList.remove('hidden');
    });
};




document.getElementById('close-payment')?.addEventListener('click', () => {
  document.getElementById('payment-modal').classList.add('hidden');
});

  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    if (!window.IS_AUTHENTICATED) {
      window.location.href = window.LOGIN_URL;
      return;
    }

    const card = this.closest('[data-product-id]');
    if (!card) return;

    const price = parseInt(
      card.dataset.productPrice.replace(/\D/g, '')
    );

    fetch('/api/cart/add/', {
      method: 'POST',
      headers: {
        'X-CSRFToken': csrftoken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        product_id: card.dataset.productId,
        name: card.dataset.productName,
        price: price
      })
    }).then(() => FloatingCart.render());
  });
});

});
