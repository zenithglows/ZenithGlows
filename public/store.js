const CART_KEY = "zg_cart";

function readCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  document.cookie = `zg_cart=${encodeURIComponent(JSON.stringify(items))}; path=/; max-age=2592000; SameSite=Lax`;
  updateCartCount();
  renderDrawer();
}

function cartCount() {
  return readCart().reduce((sum, item) => sum + item.quantity, 0);
}

function updateCartCount() {
  const count = cartCount();
  document.querySelectorAll("[data-cart-count]").forEach((el) => {
    el.textContent = count ? `(${count})` : "";
    el.setAttribute("data-count", String(count));
  });
}

function addToCart(product, quantity) {
  const items = readCart();
  const existing = items.find((item) => item.slug === product.slug);
  if (existing) existing.quantity += quantity;
  else items.push({ ...product, quantity });
  writeCart(items);
  showToast("Added to cart");
  openCart();
}

function setQty(slug, quantity) {
  let items = readCart();
  if (quantity <= 0) items = items.filter((item) => item.slug !== slug);
  else {
    const item = items.find((row) => row.slug === slug);
    if (item) item.quantity = quantity;
  }
  writeCart(items);
}

function money(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

function renderDrawer() {
  const body = document.querySelector("[data-cart-body]");
  const totalEl = document.querySelector("[data-cart-total]");
  if (!body) return;
  const items = readCart();
  if (!items.length) {
    body.innerHTML = `<p class="empty-cart">Your cart is empty.</p>`;
    if (totalEl) totalEl.textContent = "$0.00";
    return;
  }
  body.innerHTML = items
    .map(
      (item) => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.title}">
        <div>
          <div class="serif" style="font-size:1.1rem">${item.title}</div>
          <div class="muted">${item.priceLabel}</div>
          <div class="qty-row">
            <button type="button" data-qty="${item.slug}" data-delta="-1">−</button>
            <span>${item.quantity}</span>
            <button type="button" data-qty="${item.slug}" data-delta="1">+</button>
          </div>
        </div>
      </div>`
    )
    .join("");
  const total = items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
  if (totalEl) totalEl.textContent = money(total);
}

function openCart() {
  document.getElementById("cart-backdrop")?.classList.add("open");
  document.getElementById("cart-drawer")?.classList.add("open");
}

function closeCart() {
  document.getElementById("cart-backdrop")?.classList.remove("open");
  document.getElementById("cart-drawer")?.classList.remove("open");
}

function showToast(text) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = text;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1600);
}

function checkoutHref() {
  const items = readCart();
  if (!items.length) return "/checkout";
  const first = items[0];
  const encoded = items.map((item) => `${item.planId}:${item.quantity}`).join(",");
  return `/checkout/${first.planId}?quantity=${first.quantity}&items=${encodeURIComponent(encoded)}`;
}

document.addEventListener("click", (event) => {
  const menuBtn = event.target.closest("[data-menu]");
  if (menuBtn) {
    const nav = document.getElementById("mobile-nav");
    const open = nav?.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
  }

  if (event.target.closest("[data-open-cart]")) {
    event.preventDefault();
    openCart();
  }
  if (event.target.closest("[data-close-cart]")) closeCart();

  const add = event.target.closest("[data-add-cart]");
  if (add) {
    addToCart(
      {
        id: add.dataset.id,
        slug: add.dataset.slug,
        title: add.dataset.title,
        image: add.dataset.image,
        planId: add.dataset.plan,
        priceCents: Number(add.dataset.price),
        priceLabel: add.dataset.label,
      },
      1
    );
  }

  const qty = event.target.closest("[data-qty]");
  if (qty) {
    const slug = qty.getAttribute("data-qty");
    const delta = Number(qty.getAttribute("data-delta"));
    const item = readCart().find((row) => row.slug === slug);
    setQty(slug, (item?.quantity || 0) + delta);
  }

  const thumb = event.target.closest("[data-thumb]");
  if (thumb) {
    const main = document.querySelector("[data-main-image]");
    if (main) main.src = thumb.dataset.thumb;
    document.querySelectorAll("[data-thumb]").forEach((el) => el.classList.remove("active"));
    thumb.classList.add("active");
  }
});

document.addEventListener("submit", async (event) => {
  const form = event.target.closest("[data-checkout-form]");
  if (!form) return;
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  const items = readCart();
  const seeded = form.dataset.items ? JSON.parse(form.dataset.items) : items;
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...data, items: seeded.length ? seeded : items }),
  });
  const payload = await res.json();
  if (!res.ok) {
    showToast(payload.error || "Checkout failed");
    return;
  }
  writeCart([]);
  window.location.href = `/order/${payload.order.id}`;
});

document.querySelectorAll("[data-checkout-link]").forEach((el) => {
  el.addEventListener("click", (event) => {
    if (!el.getAttribute("href") || el.getAttribute("href") === "/checkout") {
      event.preventDefault();
      window.location.href = checkoutHref();
    }
  });
});

updateCartCount();
renderDrawer();
writeCart(readCart());
