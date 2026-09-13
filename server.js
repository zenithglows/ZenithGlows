const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");
const crypto = require("crypto");
const catalog = require("./catalog");

const PORT = Number(process.env.PORT || 3000);
const PUBLIC_DIR = path.join(__dirname, "public");
const DATA_DIR = path.join(__dirname, "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
};

function ensureData() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, "[]");
}

function readOrders() {
  ensureData();
  try {
    return JSON.parse(fs.readFileSync(ORDERS_FILE, "utf8"));
  } catch {
    return [];
  }
}

function writeOrders(orders) {
  ensureData();
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "\u0026amp;")
    .replace(/</g, "\u0026lt;")
    .replace(/>/g, "\u0026gt;")
    .replace(/"/g, "\u0026quot;");
}

function layout({ title, description, body, ogImage }) {
  const image = ogImage || "/photos/cube.png";
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="theme-color" content="#ffffff" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${escapeHtml(image)}" />
    <link rel="icon" href="/logo.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Outfit:wght@300;400;500;600&display=swap" />
    <link rel="stylesheet" href="/store.css" />
  </head>
  <body>
    ${body}
    <div class="drawer-backdrop" id="cart-backdrop" data-close-cart></div>
    <aside class="drawer" id="cart-drawer" aria-label="Cart">
      <div class="drawer-head">
        <h2>Cart</h2>
        <button type="button" class="ghost-btn" data-close-cart>Close</button>
      </div>
      <div class="drawer-body" data-cart-body></div>
      <div class="drawer-foot">
        <div class="row"><span>Subtotal</span><strong data-cart-total>$0.00</strong></div>
        <a class="btn btn-dark" href="/checkout" data-checkout-link style="width:100%">Checkout</a>
      </div>
    </aside>
    <script src="/store.js" defer></script>
  </body>
</html>`;
}

function header() {
  return `
    <div class="announcement">16 colors · Remote included · Ships worldwide</div>
    <header class="site-header">
      <div class="header-inner">
        <button type="button" class="ghost-btn menu-btn" data-menu aria-expanded="false" aria-controls="mobile-nav">Menu</button>
        <a class="brand" href="/">
          <img src="/logo.png" alt="" class="logo" />
          <span class="brand-name">ZenithGlows</span>
        </a>
        <nav class="nav-desktop">
          <a class="nav-link" href="/collections/all">Shop</a>
          <a class="nav-link" href="/products/zenithglows-cube">The Cube</a>
          <a class="nav-link" href="/#reviews">Reviews</a>
          <a class="nav-link" href="/#about">About</a>
        </nav>
        <button type="button" class="ghost-btn cart-btn" data-open-cart>Cart <span data-cart-count data-count="0"></span></button>
      </div>
      <nav class="nav-mobile" id="mobile-nav">
        <a class="nav-link" href="/collections/all">Shop</a>
        <a class="nav-link" href="/products/zenithglows-cube">The Cube</a>
        <a class="nav-link" href="/#reviews">Reviews</a>
        <a class="nav-link" href="/#about">About</a>
      </nav>
    </header>`;
}

function footer() {
  return `
    <footer class="site-footer">
      <div class="footer-grid">
        <div>
          <a class="footer-brand" href="/">ZenithGlows</a>
          <p class="footer-copy">Light that moves like water. A glass cube for the ceiling above you.</p>
        </div>
        <div>
          <p class="footer-title">Shop</p>
          <ul class="footer-links">
            <li><a href="/products/zenithglows-cube">The Cube</a></li>
            <li><a href="/collections/all">Shop all</a></li>
          </ul>
        </div>
        <div>
          <p class="footer-title">The brand</p>
          <ul class="footer-links">
            <li><a href="/#about">About</a></li>
            <li><a href="/#reviews">Reviews</a></li>
          </ul>
        </div>
        <div>
          <p class="footer-title">Help</p>
          <ul class="footer-links">
            <li><a href="/#shipping">Shipping</a></li>
            <li><a href="/#shipping">Returns</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">© 2026 ZenithGlows</div>
    </footer>`;
}

function stars() {
  return `<div class="stars" aria-label="5 out of 5 stars"><span aria-hidden="true">★</span><span aria-hidden="true">★</span><span aria-hidden="true">★</span><span aria-hidden="true">★</span><span aria-hidden="true">★</span></div>`;
}

function reviewsSection() {
  const cards = catalog.reviews
    .map(
      (review) => `
      <article class="review">
        <div class="review-photos">
          ${review.photos.map((photo) => `<img src="${photo.src}" alt="${escapeHtml(photo.alt)}" />`).join("")}
        </div>
        <div class="review-body">
          ${stars()}
          <blockquote>“${escapeHtml(review.quote)}”</blockquote>
          ${review.original ? `<p class="review-original">${escapeHtml(review.original)}</p>` : ""}
        </div>
      </article>`
    )
    .join("");
  return `
    <section id="reviews" class="reviews">
      <p class="eyebrow">Reviews</p>
      <div class="section-head">
        <h2 class="serif">They switched it on.</h2>
        <p class="muted">★★★★★ 4.0 · 4 reviews</p>
      </div>
      <div class="review-grid">${cards}</div>
    </section>`;
}

function productCard(item) {
  return `
    <a href="/products/${item.slug}" class="product-card">
      <div class="media"><img src="${item.image}" alt="${escapeHtml(item.title)}" /></div>
      <div class="title serif">${escapeHtml(item.title)}</div>
      <div class="price">${escapeHtml(item.priceLabel)}</div>
    </a>`;
}

function homePage() {
  const item = catalog.listProducts()[0];
  return layout({
    title: "ZenithGlows",
    description: "A glass cube on a wood base. Switch it on, and the glow turns your ceiling into water.",
    ogImage: item.image,
    body: `
      <div class="page">
        ${header()}
        <div class="main">
          <section class="hero">
            <img src="/photos/room-blue.jpg" alt="ZenithGlows cube projecting blue water ripples across a bedroom" />
            <div class="hero-shade"></div>
            <div class="hero-copy">
              <p class="eyebrow">ZenithGlows</p>
              <h1 class="serif">Light that moves like water</h1>
              <p>A glass cube for the ceiling above you.</p>
              <a class="btn btn-light" href="/products/zenithglows-cube">Shop the Cube</a>
            </div>
          </section>
          <section class="strip">
            <div class="strip-grid">
              <p>16 colors, remote included</p>
              <p>Ships worldwide</p>
              <p>5-star customer reviews</p>
            </div>
          </section>
          <section id="shop" class="wrap">
            <div class="section-head">
              <div>
                <p class="eyebrow">Shop</p>
                <h2 class="serif">The collection</h2>
              </div>
              <a class="nav-link" href="/collections/all">View all</a>
            </div>
            <div class="product-grid">${productCard(item)}</div>
          </section>
          <section class="wrap" style="padding-top:0">
            <p class="eyebrow">In the room</p>
            <h2 class="serif" style="margin-bottom:32px">How the ceiling looks.</h2>
            <div class="room-grid">
              <a href="/products/zenithglows-cube"><img src="/photos/room-blue.jpg" alt="ZenithGlows cube projecting blue water ripples across a bedroom ceiling" /></a>
              <a href="/products/zenithglows-cube"><img src="/photos/desk-amber.jpg" alt="ZenithGlows cube in warm amber, throwing water light onto the wall" /></a>
              <a href="/products/zenithglows-cube"><img src="/photos/cube-hold.jpg" alt="Holding the ZenithGlows glass cube lamp on its wood base" /></a>
            </div>
          </section>
          <section id="about" class="about">
            <div class="about-grid">
              <img src="/photos/desk-amber.jpg" alt="ZenithGlows cube in warm amber on a desk" />
              <div>
                <p class="eyebrow">About</p>
                <h2 class="serif">A cube of glass.<br />A ceiling of water.</h2>
                <p class="body">ZenithGlows makes one object: a textured glass cube on a wood base. Switch it on and the glow fractures into moving ripples — warm amber, ocean blue, or anything between.</p>
                <p class="body">The remote is in the box. Sixteen colors. Made to sit on a nightstand, a desk, or the floor, and to do the work on the ceiling above you.</p>
                <a class="link-plain" href="/products/zenithglows-cube">Meet the Cube →</a>
              </div>
            </div>
          </section>
          <section class="features">
            <div>
              <h2 class="serif">Textured glass</h2>
              <p>A solid cube of glass, cut so the light fractures into moving water.</p>
            </div>
            <div>
              <h2 class="serif">16 colors, remote</h2>
              <p>Warm amber, ocean blue, or anything between. The remote is in the box.</p>
            </div>
            <div>
              <h2 class="serif">Ceiling ripples</h2>
              <p>Switch it on. The glow projects water across the ceiling above you.</p>
            </div>
          </section>
          ${reviewsSection()}
          <section id="shipping" class="shipping">
            <div class="shipping-grid">
              <div>
                <p class="eyebrow">Shipping</p>
                <h2 class="serif">Ships worldwide.</h2>
                <p class="body">We ship the cube internationally. Most orders arrive within two to three weeks. You’ll get tracking once it leaves.</p>
              </div>
              <div>
                <p class="eyebrow">Returns</p>
                <h2 class="serif">Made right.</h2>
                <p class="body">If the cube arrives damaged or isn’t what you expected, message us from your order. We’ll make it right.</p>
              </div>
            </div>
          </section>
        </div>
        ${footer()}
      </div>`,
  });
}

function shopPage() {
  const items = catalog.listProducts();
  return layout({
    title: "Shop — ZenithGlows",
    description: "Shop the ZenithGlows cube — light that moves like water.",
    body: `
      <div class="page">
        ${header()}
        <div class="main">
          <section class="wrap wrap-tight">
            <p class="eyebrow">ZenithGlows</p>
            <h1 class="serif" style="font-size:2.25rem;margin:0">Shop</h1>
            <div class="shop-grid">${items.map(productCard).join("")}</div>
          </section>
        </div>
        ${footer()}
      </div>`,
  });
}

function productPage(product) {
  const thumbs = product.gallery
    .map(
      (src, index) =>
        `<button type="button" class="${index === 0 ? "active" : ""}" data-thumb="${src}"><img src="${src}" alt="" /></button>`
    )
    .join("");
  const buyHref = `/checkout/${product.planId}?quantity=1&items=${encodeURIComponent(product.planId + ":1")}`;
  return layout({
    title: `${product.title} — ZenithGlows`,
    description: product.description,
    ogImage: product.image,
    body: `
      <div class="page">
        ${header()}
        <div class="main">
          <nav class="crumbs">
            <a href="/">Home</a><span aria-hidden="true">/</span>
            <a href="/collections/all">Shop</a><span aria-hidden="true">/</span>
            <span class="current">${escapeHtml(product.title)}</span>
          </nav>
          <section class="product-layout">
            <div>
              <div class="gallery-main"><img data-main-image src="${product.image}" alt="${escapeHtml(product.title)}" /></div>
              <div class="thumbs">${thumbs}</div>
            </div>
            <div class="product-info">
              <p class="eyebrow">The Cube</p>
              <h1 class="serif">${escapeHtml(product.title)}</h1>
              <p class="price">${escapeHtml(product.priceLabel)}</p>
              <p class="body">${escapeHtml(product.headline)}</p>
              <p class="body">${escapeHtml(product.description)}</p>
              <div class="buy-stack">
                <button type="button" class="btn btn-dark" data-add-cart data-id="${product.id}" data-slug="${product.slug}" data-title="${escapeHtml(product.title)}" data-image="${product.image}" data-plan="${product.planId}" data-price="${product.priceCents}" data-label="${product.priceLabel}">Add to cart</button>
                <a class="btn btn-outline" href="${buyHref}">Buy now</a>
              </div>
            </div>
          </section>
          ${reviewsSection()}
        </div>
        ${footer()}
      </div>`,
  });
}

function checkoutPage(items) {
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
  const summary = items
    .map(
      (item) => `
      <div class="summary-item">
        <img src="${item.image}" alt="${escapeHtml(item.title)}" />
        <div>
          <div class="serif">${escapeHtml(item.title)}</div>
          <div class="muted">Cube · Qty ${item.quantity}</div>
        </div>
        <div>${item.priceLabel}</div>
      </div>`
    )
    .join("");
  return layout({
    title: "Checkout — ZenithGlows",
    description: "Secure checkout for ZenithGlows.",
    body: `
      <div class="page">
        ${header()}
        <div class="main">
          <section class="checkout">
            <div>
              <h1 class="serif">Checkout</h1>
              <p class="secure">All transactions are secure and encrypted. Your order includes free returns and 24/7 access to our award-winning customer service.</p>
              ${
                items.length
                  ? `<form data-checkout-form data-items='${JSON.stringify(items).replace(/'/g, "&#39;")}'>
                <div class="field">
                  <label for="email">Email (required)</label>
                  <input id="email" name="email" type="email" required />
                  <span class="hint">After you pay, you will receive product information shortly in this email.</span>
                </div>
                <h2 class="serif" style="font-size:1.5rem;margin:8px 0 16px">Delivery</h2>
                <div class="field"><label for="name">Full name</label><input id="name" name="name" required /></div>
                <div class="field"><label for="address">Address</label><input id="address" name="address" required /></div>
                <div class="field"><label for="city">City</label><input id="city" name="city" required /></div>
                <div class="field"><label for="country">Country</label><input id="country" name="country" required /></div>
                <div class="field"><label for="zip">Postal code</label><input id="zip" name="zip" required /></div>
                <h2 class="serif" style="font-size:1.5rem;margin:8px 0 16px">Secure Checkout</h2>
                <div class="field"><label for="card">Card or crypto</label><input id="card" name="card" inputmode="numeric" placeholder="4242 4242 4242 4242" required /></div>
                <div class="field" style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                  <input name="expiry" placeholder="MM/YY" required />
                  <input name="cvc" placeholder="CVC" required />
                </div>
                <p class="hint">You'll be charged $${(subtotal / 100).toFixed(2)} plus sales tax, so the charge will be higher.</p>
                <button class="btn btn-dark" type="submit" style="width:100%;margin-top:12px">Complete Purchase</button>
              </form>`
                  : `<p class="body">Your cart is empty.</p><a class="btn btn-dark" href="/collections/all">Shop</a>`
              }
            </div>
            <aside class="summary">
              <p class="eyebrow">Order summary</p>
              ${summary || `<p class="muted">No items yet.</p>`}
              <div class="summary-row"><span>Subtotal · ${count} item${count === 1 ? "" : "s"}</span><span>$${(subtotal / 100).toFixed(2)}</span></div>
              <div class="summary-row"><span>Shipping</span><span>Calculated at payment</span></div>
              <div class="summary-total"><span>Total USD</span><strong>$${(subtotal / 100).toFixed(2)}</strong></div>
              <p class="hint" style="margin-top:16px">Sales tax is added at payment, so your card is charged more than the total shown.</p>
            </aside>
          </section>
        </div>
        ${footer()}
      </div>`,
  });
}

function orderPage(order) {
  const lines = order.items
    .map((item) => `<div class="summary-row"><span>${escapeHtml(item.title)} × ${item.quantity}</span><span>$${((item.priceCents * item.quantity) / 100).toFixed(2)}</span></div>`)
    .join("");
  return layout({
    title: "Order confirmed — ZenithGlows",
    description: "Your ZenithGlows order is confirmed.",
    body: `
      <div class="page">
        ${header()}
        <div class="main">
          <section class="wrap order-card">
            <p class="eyebrow">Thank you</p>
            <h1 class="serif" style="font-size:2.5rem;margin:0">Order confirmed.</h1>
            <p class="body">We sent a receipt to ${escapeHtml(order.email)}. Most orders arrive within two to three weeks.</p>
            <p class="muted">Order ${escapeHtml(order.id)}</p>
            <div class="summary" style="margin-top:32px">
              ${lines}
              <div class="summary-total"><span>Total</span><strong>$${(order.totalCents / 100).toFixed(2)}</strong></div>
            </div>
            <a class="btn btn-dark" href="/" style="margin-top:32px">Back home</a>
          </section>
        </div>
        ${footer()}
      </div>`,
  });
}

function notFoundPage() {
  return layout({
    title: "Not found — ZenithGlows",
    description: "This page does not exist.",
    body: `<div class="page">${header()}<div class="main"><section class="wrap"><h1 class="serif">Page not found.</h1><a class="link-plain" href="/">Return home →</a></section></div>${footer()}</div>`,
  });
}

function send(res, status, body, type) {
  res.writeHead(status, { "content-type": type || "text/html; charset=utf-8" });
  res.end(body);
}

function sendJson(res, status, payload) {
  send(res, status, JSON.stringify(payload), "application/json; charset=utf-8");
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function parseItemsParam(itemsParam, quantityParam) {
  const items = [];
  if (itemsParam) {
    for (const part of itemsParam.split(",")) {
      const [planId, qty] = part.split(":");
      const product = catalog.getByPlanId(planId);
      if (!product) continue;
      items.push({
        id: product.id,
        slug: product.slug,
        title: product.title,
        image: product.image,
        planId: product.planId,
        priceCents: product.priceCents,
        priceLabel: product.priceLabel,
        quantity: Math.max(1, Number(qty || 1)),
      });
    }
  }
  if (!items.length && quantityParam) {
    const product = catalog.products[0];
    items.push({
      id: product.id,
      slug: product.slug,
      title: product.title,
      image: product.image,
      planId: product.planId,
      priceCents: product.priceCents,
      priceLabel: product.priceLabel,
      quantity: Math.max(1, Number(quantityParam)),
    });
  }
  return items;
}

function serveStatic(reqPath, res) {
  const safe = path.normalize(reqPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(PUBLIC_DIR, safe);
  if (!filePath.startsWith(PUBLIC_DIR)) return false;
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) return false;
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { "content-type": MIME[ext] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(res);
  return true;
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = decodeURIComponent(url.pathname);

    if (req.method === "GET" && pathname.startsWith("/api/products")) {
      if (pathname === "/api/products") return sendJson(res, 200, { items: catalog.listProducts() });
      const slug = pathname.replace("/api/products/", "");
      const product = catalog.getBySlug(slug);
      if (!product) return sendJson(res, 404, { error: "Product not found" });
      return sendJson(res, 200, product);
    }

    if (req.method === "GET" && pathname.startsWith("/api/orders/")) {
      const id = pathname.replace("/api/orders/", "");
      const order = readOrders().find((row) => row.id === id);
      if (!order) return sendJson(res, 404, { error: "Order not found" });
      return sendJson(res, 200, order);
    }

    if (req.method === "POST" && pathname === "/api/checkout") {
      const payload = JSON.parse((await readBody(req)) || "{}");
      const rawItems = Array.isArray(payload.items) ? payload.items : [];
      const items = rawItems
        .map((row) => {
          const product = catalog.getBySlug(row.slug) || catalog.getByPlanId(row.planId);
          if (!product) return null;
          return {
            id: product.id,
            slug: product.slug,
            title: product.title,
            image: product.image,
            planId: product.planId,
            priceCents: product.priceCents,
            priceLabel: product.priceLabel,
            quantity: Math.max(1, Number(row.quantity || 1)),
          };
        })
        .filter(Boolean);
      if (!items.length) return sendJson(res, 400, { error: "Cart is empty" });
      if (!payload.email) return sendJson(res, 400, { error: "Email is required" });
      const totalCents = items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
      const order = {
        id: `ord_${crypto.randomBytes(6).toString("hex")}`,
        email: String(payload.email),
        name: String(payload.name || ""),
        address: {
          line1: String(payload.address || ""),
          city: String(payload.city || ""),
          country: String(payload.country || ""),
          zip: String(payload.zip || ""),
        },
        items,
        totalCents,
        status: "paid",
        createdAt: new Date().toISOString(),
      };
      const orders = readOrders();
      orders.push(order);
      writeOrders(orders);
      return sendJson(res, 201, { order });
    }

    if (req.method === "GET" && pathname === "/") return send(res, 200, homePage());
    if (req.method === "GET" && pathname === "/collections/all") return send(res, 200, shopPage());

    if (req.method === "GET" && pathname.startsWith("/products/")) {
      const slug = pathname.replace("/products/", "");
      const product = catalog.getBySlug(slug);
      if (!product) return send(res, 404, notFoundPage());
      return send(res, 200, productPage(product));
    }

    if (req.method === "GET" && (pathname === "/checkout" || pathname.startsWith("/checkout/"))) {
      const planId = pathname === "/checkout" ? url.searchParams.get("plan") : pathname.replace("/checkout/", "");
      let items = parseItemsParam(url.searchParams.get("items"), url.searchParams.get("quantity"));
      if (!items.length && planId) {
        const product = catalog.getByPlanId(planId);
        if (product) {
          items = parseItemsParam(`${product.planId}:${url.searchParams.get("quantity") || 1}`);
        }
      }
      return send(res, 200, checkoutPage(items));
    }

    if (req.method === "GET" && pathname.startsWith("/order/")) {
      const id = pathname.replace("/order/", "");
      const order = readOrders().find((row) => row.id === id);
      if (!order) return send(res, 404, notFoundPage());
      return send(res, 200, orderPage(order));
    }

    if (req.method === "GET" && serveStatic(pathname, res)) return;

    send(res, 404, notFoundPage());
  } catch (error) {
    sendJson(res, 500, { error: "Server error" });
  }
});

server.listen(PORT, "0.0.0.0", () => {
  process.stdout.write(`ZenithGlows listening on http://127.0.0.1:${PORT}\n`);
});
