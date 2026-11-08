
(() => {
  "use strict";

  // ==========================================
  // KONFIGURASI SUPABASE
  // ==========================================

  const SUPABASE_URL = "https://hhfksogwcuezjyviygkb.supabase.co";

  const SUPABASE_KEY =
    "sb_publishable_0bIZlUdcS98fY-xefsmSzA_d235gVHt";

  const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );

  // ==========================================
  // KONFIGURASI ARSIP
  // Nama tabel dan kolom dipertahankan
  // ==========================================

  const archiveConfig = {
    history: {
      title: "Sejarah MotoGP",
      description:
        "Jelajahi perjalanan panjang kejuaraan balap motor dunia dari masa ke masa.",
      table: "motogp_history",
      fields: [
        "id",
        "title",
        "era",
        "year_start",
        "year_end",
        "description",
        "image_url",
        "sort_order"
      ],
      orderBy: "sort_order",
      ascending: true
    },

    technology: {
      title: "Motor dan Teknologi",
      description:
        "Kenali perkembangan motor, mesin, dan teknologi yang membentuk dunia MotoGP.",
      table: "motogp_motorcycles",
      fields: [
        "id",
        "manufacturer",
        "model",
        "year",
        "engine",
        "technology",
        "description",
        "image_url",
        "source_url"
      ],
      orderBy: "year",
      ascending: true
    },

    riders: {
      title: "Legenda Pembalap",
      description:
        "Temukan kisah para pembalap legendaris yang meninggalkan jejak dalam sejarah MotoGP.",
      table: "motogp_riders",
      fields: [
        "id",
        "full_name",
        "nationality",
        "date_of_birth",
        "team",
        "championships",
        "career_description",
        "image_url"
      ],
      orderBy: "id",
      ascending: true
    },

    circuits: {
      title: "Sirkuit Dunia",
      description:
        "Jelajahi berbagai sirkuit legendaris yang menjadi bagian dari perjalanan MotoGP.",
      table: "motogp_circuits",
      fields: [
        "id",
        "name",
        "country",
        "location",
        "length_km",
        "number_of_turns",
        "description",
        "image_url"
      ],
      orderBy: "id",
      ascending: true
    }
  };

  // ==========================================
  // ELEMEN WEBSITE
  // ==========================================

  const modal = document.getElementById("categoryModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalDescription = document.getElementById("modalDescription");
  const modalOkay = document.getElementById("modalOkay");
  const modalClose = document.getElementById("modalClose");

  // ==========================================
  // FUNGSI KEAMANAN
  // ==========================================

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      };

      return entities[character];
    });
  }

  function getSafeURL(value) {
    if (!value) return "";

    try {
      const url = new URL(value);

      if (url.protocol === "https:" || url.protocol === "http:") {
        return url.href;
      }
    } catch (error) {
      return "";
    }

    return "";
  }

  function formatValue(value) {
    return value === null || value === undefined || value === ""
      ? "Belum tersedia"
      : escapeHTML(value);
  }

  // ==========================================
  // NAVIGASI
  // ==========================================

  function setupNavigation() {
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");

    if (menuToggle && navLinks) {
      menuToggle.addEventListener("click", () => {
        navLinks.classList.toggle("open");

        const isOpen = navLinks.classList.contains("open");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
      });

      navLinks.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
          navLinks.classList.remove("open");
          menuToggle.setAttribute("aria-expanded", "false");
        });
      });
    }

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        const targetID = link.getAttribute("href");

        if (!targetID || targetID === "#") return;

        const target = document.querySelector(targetID);

        if (target) {
          event.preventDefault();

          target.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }
      });
    });
  }

  // ==========================================
  // MODAL
  // ==========================================

  function openModal() {
    if (!modal) return;

    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    if (!modal) return;

    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function setupModal() {
    if (modalOkay) {
      modalOkay.addEventListener("click", closeModal);
    }

    if (modalClose) {
      modalClose.addEventListener("click", closeModal);
    }

    if (modal) {
      modal.addEventListener("click", (event) => {
        if (event.target === modal) {
          closeModal();
        }
      });
    }

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeModal();
      }
    });
  }

  // ==========================================
  // TAMPILAN STATUS
  // ==========================================

  function showLoading() {
    if (!modalDescription) return;

    modalDescription.innerHTML = `
      <div class="archive-status">
        <p>⏳ Sedang memuat data arsip MotoGP...</p>
      </div>
    `;
  }

  function showError(message) {
    if (!modalDescription) return;

    modalDescription.innerHTML = `
      <div class="archive-status archive-error">
        <p>Data belum berhasil dimuat.</p>
        <p>${escapeHTML(message)}</p>
        <p>Silakan periksa koneksi internet atau konfigurasi Supabase.</p>
      </div>
    `;
  }

  function showEmpty() {
    if (!modalDescription) return;

    modalDescription.innerHTML = `
      <div class="archive-status">
        <p>Belum ada data yang tersedia untuk kategori ini.</p>
      </div>
    `;
  }

  // ==========================================
  // INFORMASI TAMBAHAN SETIAP KATEGORI
  // ==========================================

  function getArchiveDetails(category, item) {
    if (category === "history") {
      const years = item.year_end
        ? `${item.year_start} – ${item.year_end}`
        : item.year_start || "Tahun tidak tersedia";

      return `
        <span class="archive-tag">${formatValue(item.era)}</span>
        <p><strong>Periode:</strong> ${formatValue(years)}</p>
        <p>${formatValue(item.description)}</p>
      `;
    }

    if (category === "technology") {
      return `
        <span class="archive-tag">${formatValue(item.year)}</span>
        <p><strong>Pabrikan:</strong> ${formatValue(item.manufacturer)}</p>
        <p><strong>Mesin:</strong> ${formatValue(item.engine)}</p>
        <p><strong>Teknologi:</strong> ${formatValue(item.technology)}</p>
        <p>${formatValue(item.description)}</p>
        ${item.source_url ? `
          <a class="archive-source"
             href="${getSafeURL(item.source_url)}"
             target="_blank"
             rel="noopener noreferrer">
            Lihat sumber informasi ↗
          </a>
        ` : ""}
      `;
    }

    if (category === "riders") {
      return `
        <span class="archive-tag">PEMBALAP LEGENDARIS</span>
        <p><strong>Negara:</strong> ${formatValue(item.nationality)}</p>
        <p><strong>Tanggal lahir:</strong> ${formatValue(item.date_of_birth)}</p>
        <p><strong>Tim:</strong> ${formatValue(item.team)}</p>
        <p><strong>Gelar juara dunia:</strong> ${formatValue(item.championships)}</p>
        <p>${formatValue(item.career_description)}</p>
      `;
    }

    if (category === "circuits") {
      return `
        <span class="archive-tag">SIRKUIT MOTOGP</span>
        <p><strong>Negara:</strong> ${formatValue(item.country)}</p>
        <p><strong>Lokasi:</strong> ${formatValue(item.location)}</p>
        <p><strong>Panjang lintasan:</strong> ${formatValue(item.length_km)} km</p>
        <p><strong>Jumlah tikungan:</strong> ${formatValue(item.number_of_turns)}</p>
        <p>${formatValue(item.description)}</p>
      `;
    }

    return "";
  }

  // ==========================================
  // GAMBAR ARSIP
  // ==========================================

  function createImage(imageURL, title) {
    const safeURL = getSafeURL(imageURL);

    if (!safeURL) {
      return `
        <div class="archive-image-placeholder">
          GAMBAR BELUM TERSEDIA
        </div>
      `;
    }

    return `
      <img
        class="archive-image"
        src="${escapeHTML(safeURL)}"
        alt="${escapeHTML(title)}"
        loading="lazy"
        onerror="this.style.display='none';"
      >
    `;
  }

  // ==========================================
  // KARTU ARSIP
  // ==========================================

  function createArchiveCard(category, item) {
    let title = "";

    if (category === "history") {
      title = item.title;
    } else if (category === "technology") {
      title = `${item.manufacturer || ""} ${item.model || ""}`.trim();
    } else if (category === "riders") {
      title = item.full_name;
    } else if (category === "circuits") {
      title = item.name;
    }

    const safeTitle = escapeHTML(title || "Arsip MotoGP");
    const image = createImage(item.image_url, title);

    return `
      <article class="archive-result-card">
        <div class="archive-result-image">
          ${image}
        </div>

        <div class="archive-result-content">
          <h3>${safeTitle}</h3>
          <div class="archive-result-details">
            ${getArchiveDetails(category, item)}
          </div>
        </div>
      </article>
    `;
  }

  // ==========================================
  // MENAMPILKAN HASIL ARSIP
  // ==========================================

  function displayArchiveResults(category, data) {
    if (!modalDescription) return;

    if (!data || data.length === 0) {
      showEmpty();
      return;
    }

    const resultsHTML = data
      .map((item) => createArchiveCard(category, item))
      .join("");

    modalDescription.innerHTML = `
      <div class="archive-results">
        <p class="archive-result-count">
          Ditemukan ${data.length} data arsip
        </p>

        <div class="archive-results-grid">
          ${resultsHTML}
        </div>
      </div>
    `;
  }

  // ==========================================
  // MENGAMBIL DATA DARI SUPABASE
  // ==========================================

  async function fetchArchive(category) {
    const config = archiveConfig[category];

    if (!config) {
      showError("Kategori arsip tidak ditemukan.");
      return;
    }

    showLoading();

    try {
      const { data, error } = await supabase
        .from(config.table)
        .select(config.fields.join(","))
        .order(config.orderBy, {
          ascending: config.ascending
        });

      if (error) {
        throw error;
      }

      displayArchiveResults(category, data);
    } catch (error) {
      console.error("Kesalahan mengambil data:", error);
      showError(error.message || "Terjadi kesalahan koneksi.");
    }
  }

  // ==========================================
  // TOMBOL KATEGORI ARSIP
  // ==========================================

  function setupArchiveButtons() {
    const buttons = document.querySelectorAll("[data-category]");

    buttons.forEach((button) => {
      button.addEventListener("click", async () => {
        const category = button.dataset.category;
        const config = archiveConfig[category];

        if (!config) {
          console.error("Kategori tidak dikenali:", category);
          return;
        }

        if (modalTitle) {
          modalTitle.textContent = config.title;
        }

        if (modalDescription) {
          modalDescription.textContent = config.description;
        }

        openModal();
        await fetchArchive(category);
      });
    });
  }

  // ==========================================
  // PEMERIKSAAN KONEKSI SUPABASE
  // ==========================================

  async function testConnection() {
    try {
      const { error } = await supabase
        .from("motogp_history")
        .select("id")
        .limit(1);

      if (error) {
        throw error;
      }

      console.log("MotoGP Heritage: koneksi Supabase berhasil.");
    } catch (error) {
      console.error("Koneksi Supabase bermasalah:", error.message);
    }
  }

  // ==========================================
  // MENJALANKAN WEBSITE
  // ==========================================

  function initializeApp() {
    setupNavigation();
    setupModal();
    setupArchiveButtons();
    testConnection();

    console.log("MotoGP Heritage berhasil dijalankan.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeApp);
  } else {
    initializeApp();
  }
})();
