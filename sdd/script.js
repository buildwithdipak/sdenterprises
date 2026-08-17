/* =====================================================================
   SD ENTERPRISES — site script
   Gallery is data-driven: edit GALLERY_ITEMS below to swap in real
   photos. Drop the image files into images/gallery/ and point "src"
   at that path — everything else (filtering, layout, lightbox) just
   works. Until real photos are added, work-type placeholders render
   instead, so the page never looks broken or empty.
   ===================================================================== */

const GALLERY_ITEMS = [
  { src: "images/gallery/cctv-dome-install-1.jpg", category: "cctv",   label: "Dome camera install — residential",   size: "wide" },
  { src: "images/gallery/ibms-panel-1.jpg",         category: "ibms",   label: "IBMS control panel — commercial",     size: "tall" },
  { src: "images/gallery/cctv-bullet-1.jpg",        category: "cctv",   label: "Bullet camera — warehouse perimeter", size: "" },
  { src: "images/gallery/wiring-cable-mgmt-1.jpg",  category: "wiring", label: "Structured cabling & conduit run",    size: "" },
  { src: "images/gallery/access-control-1.jpg",     category: "ibms",   label: "Biometric access control setup",      size: "" },
  { src: "images/gallery/cctv-nvr-setup-1.jpg",     category: "cctv",   label: "NVR & storage configuration",         size: "" },
  { src: "images/gallery/cctv-shop-front-1.jpg",    category: "cctv",   label: "Retail shop-front coverage",          size: "tall" },
  { src: "images/gallery/wiring-panel-2.jpg",       category: "wiring", label: "Junction panel termination",         size: "" },
];

// Small inline icon shown for placeholder tiles (until a real photo exists)
const PLACEHOLDER_ICON = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
    <rect x="3" y="5" width="18" height="14" rx="2"/>
    <circle cx="12" cy="12" r="3.4"/>
    <path d="M8 5l1.5-2h5L16 5"/>
  </svg>`;

const galleryGrid = document.getElementById("galleryGrid");
const tabs = document.querySelectorAll(".tab");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxCap = document.getElementById("lightboxCap");
const lightboxClose = document.getElementById("lightboxClose");

// Track which images actually exist vs. fall back to a placeholder tile,
// checked lazily so a missing file never breaks layout or blocks paint.
function renderGallery(filter) {
  galleryGrid.innerHTML = "";
  const items = filter === "all" ? GALLERY_ITEMS : GALLERY_ITEMS.filter(i => i.category === filter);

  items.forEach((item, idx) => {
    const tile = document.createElement("div");
    tile.className = "gallery-item" + (item.size ? " " + item.size : "");
    tile.setAttribute("role", "button");
    tile.setAttribute("tabindex", "0");
    tile.setAttribute("aria-label", "View photo: " + item.label);

    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = item.label;

    const img = document.createElement("img");
    img.loading = "lazy";
    img.decoding = "async";
    img.alt = item.label;
    img.src = item.src;

    img.onerror = () => {
      // Real photo not present yet — swap to a lightweight placeholder
      // so the grid still looks intentional, not broken.
      img.remove();
      const ph = document.createElement("div");
      ph.className = "ph";
      ph.innerHTML = PLACEHOLDER_ICON;
      tile.prepend(ph);
    };

    tile.appendChild(img);
    tile.appendChild(tag);

    tile.addEventListener("click", () => openLightbox(item, img));
    tile.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLightbox(item, img); }
    });

    galleryGrid.appendChild(tile);
  });
}

function openLightbox(item, imgEl) {
  // Only open with a real photo — placeholder tiles aren't worth zooming into.
  if (!imgEl.isConnected) return;
  lightboxImg.src = imgEl.currentSrc || imgEl.src;
  lightboxImg.alt = item.label;
  lightboxCap.textContent = item.label;
  lightbox.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  lightbox.classList.remove("open");
  document.body.style.overflow = "";
  lightboxImg.src = "";
}

lightboxClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    renderGallery(tab.dataset.filter);
  });
});

renderGallery("all");

/* ---- Quick preview upload (in-memory only, current session) ----
   Lets the owner preview how a freshly taken photo will look in the
   grid before formally adding it to GALLERY_ITEMS / images/gallery/.
   Nothing is uploaded anywhere or saved between visits. */
const quickUpload = document.getElementById("quickUpload");
if (quickUpload) {
  quickUpload.addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const tile = document.createElement("div");
      tile.className = "gallery-item wide";
      tile.setAttribute("role", "button");
      tile.setAttribute("tabindex", "0");

      const img = document.createElement("img");
      img.src = ev.target.result;
      img.alt = "Preview upload";
      img.loading = "lazy";

      const tag = document.createElement("span");
      tag.className = "tag";
      tag.textContent = "Preview — not yet saved to site";

      tile.appendChild(img);
      tile.appendChild(tag);
      tile.addEventListener("click", () => openLightbox({ label: "Preview upload" }, img));

      galleryGrid.prepend(tile);
    };
    reader.readAsDataURL(file);
  });
}

/* Footer year */
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();