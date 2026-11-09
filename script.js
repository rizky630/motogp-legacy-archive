
/* ==========================================
   MOTOGP HERITAGE
   PEMULIHAN SISTEM ARSIP SUPABASE
========================================== */

// 1. KONFIGURASI SUPABASE
const SUPABASE_URL =
  "https://hhfksogwcuezjyviygkb.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_0bIZlUdcS98fY-xefsmSzA_d235gVHt";

let supabaseClient = null;


// 2. KONFIGURASI ARSIP
const archiveConfig = {
  history: {
    table: "motogp_history",
    title: "Sejarah MotoGP",
    description: "Jelajahi perjalanan sejarah kejuaraan dunia MotoGP.",
    fields: "id,title,era,year_start,year_end,description,image_url,sort_order",
    orderBy: "sort_order"
  },

  technology: {
    table: "motogp_motorcycles",
    title: "Motor dan Teknologi",
    description: "Mengenal perkembangan motor dan teknologi balap Grand Prix.",
    fields: "id,manufacturer,model,year,engine,technology,description,image_url,source_url",
    orderBy: "year"
  },

  riders: {
    table: "motogp_riders",
    title: "Pembalap Legendaris",
    description: "Kisah dan prestasi para pembalap legendaris MotoGP.",
    fields: "id,full_name,nationality,date_of_birth,team,championships,career_description,image_url",
    orderBy: "id"
  },

  circuits: {
    table: "motogp_circuits",
    title: "Sirkuit Dunia",
    description: "Mengenal sirkuit yang menjadi bagian sejarah MotoGP.",
    fields: "id,name,country,location,length_km,number_of_turns,description,image_url",
    orderBy: "id"
  }
};


// 3. ELEMEN MODAL DAN HASIL ARSIP
let archiveResults = null;

function getArchiveElements() {
  const modal = document.getElementById("categoryModal");

  if (!modal) return null;

  const panel = modal.querySelector(".modal-panel");

  if (!panel) return null;

  // Membuat area hasil jika belum tersedia
  if (!document.getElementById("archiveResults")) {
    archiveResults = document.createElement("div");
    archiveResults.id = "archiveResults";
    archiveResults.className = "archive-results";

    const description = document.getElementById("modalDescription");

    if (description) {
      description.insertAdjacentElement(
        "afterend",
        archiveResults
      );
    } else {
      panel.appendChild(archiveResults);
    }
  } else {
    archiveResults = document.getElementById("archiveResults");
  }

  return {
    modal,
    panel,
    title: document.getElementById("modalTitle"),
    description: document.getElementById("modalDescription"),
    results: archiveResults
  };
}


// 4. TAMBAHAN TAMPILAN KARTU ARSIP
function addArchiveStyles() {
  if (document.getElementById("archiveDynamicStyles")) return;

  const style = document.createElement("style");
  style.id = "archiveDynamicStyles";

  style.textContent = `
    .archive-results {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 18px;
      margin-top: 24px;
      width: 100%;
    }

    .archive-item {
      overflow: hidden;
      background: #151515;
      border: 1px solid #303030;
      border-radius: 12px;
      color: #fff;
    }

    .archive-item-image {
      display: block;
      width: 100%;
      height: 190px;
      object-fit: cover;
      background: #222;
    }

    .archive-item-content {
      padding: 16px;
    }

    .archive-item-content h3 {
      color: #fff;
      font-size: 20px;
      margin: 0 0 10px;
    }

    .archive-item-content p {
      color: #ccc;
      line-height: 1.7;
      margin: 7px 0;
      font-size: 14px;
    }

    .archive-item-content strong {
      color: #ed1c24;
    }

    .archive-item-source {
      display: inline-block;
      margin-top: 12px;
      color: #ff4148;
    }

    .archive-loading,
    .archive-error,
    .archive-empty {
      grid-column: 1 / -1;
      color: #ddd;
      padding: 20px;
      text-align: center;
    }

    .archive-error {
      color: #ff7777;
    }

    @media (max-width: 650px) {
      .archive-results {
        grid-template-columns: 1fr;
      }

      .archive-item-image {
        height: 210px;
      }
    }
  `;

  document.head.appendChild(style);
}


// 5. INISIALISASI SUPABASE
function initializeSupabase() {
  if (!window.supabase) {
    console.error("Supabase CDN tidak ditemukan.");
    return;
  }

  try {
    supabaseClient = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    );

    console.log("Supabase berhasil terhubung.");

  } catch (error) {
    console.error("Gagal menghubungkan Supabase:", error);
  }
}


// 6. MENGAMBIL DATA DARI SUPABASE
async function fetchArchiveData(category) {
  if (!supabaseClient) {
    throw new Error("Koneksi Supabase belum tersedia.");
  }

  const config = archiveConfig[category];

  if (!config) {
    throw new Error("Kategori arsip tidak ditemukan.");
  }

  let query = supabaseClient
    .from(config.table)
    .select(config.fields);

  if (category === "technology") {
    query = query.order(config.orderBy, {
      ascending: true,
      nullsFirst: false
    });
  } else {
    query = query.order(config.orderBy, {
      ascending: true
    });
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data || [];
}


// 7. MEMBUAT KARTU ARSIP
function createArchiveCard(category, item) {
  const card = document.createElement("article");
  card.className = "archive-item";

  // FOTO
  if (item.image_url) {
    const image = document.createElement("img");

    image.className = "archive-item-image";
    image.src = item.image_url;
    image.alt =
      item.title ||
      item.model ||
      item.full_name ||
      item.name ||
      "Foto arsip MotoGP";

    image.loading = "lazy";

    image.onerror = function () {
      this.style.display = "none";
    };

    card.appendChild(image);
  }

  const content = document.createElement("div");
  content.className = "archive-item-content";

  const heading = document.createElement("h3");

  let title = "";

  if (category === "history") {
    title = item.title || "Sejarah MotoGP";
  }

  if (category === "technology") {
    title = `${item.manufacturer || ""} ${item.model || ""}`.trim();
  }

  if (category === "riders") {
    title = item.full_name || "Pembalap MotoGP";
  }

  if (category === "circuits") {
    title = item.name || "Sirkuit MotoGP";
  }

  heading.textContent = title || "Arsip MotoGP";
  content.appendChild(heading);

  // INFORMASI TAMBAHAN
  const details = [];

  if (category === "history") {
    if (item.era) details.push(["Era", item.era]);

    if (item.year_start || item.year_end) {
      details.push([
        "Periode",
        `${item.year_start || "?"} – ${item.year_end || "Sekarang"}`
      ]);
    }
  }

  if (category === "technology") {
    if (item.year) details.push(["Tahun", item.year]);
    if (item.engine) details.push(["Mesin", item.engine]);
    if (item.technology) details.push(["Teknologi", item.technology]);
  }

  if (category === "riders") {
    if (item.nationality) {
      details.push(["Negara", item.nationality]);
    }

    if (item.date_of_birth) {
      details.push(["Tanggal lahir", item.date_of_birth]);
    }

    if (item.team) details.push(["Tim", item.team]);

    if (item.championships !== null && item.championships !== undefined) {
      details.push(["Gelar juara", item.championships]);
    }
  }

  if (category === "circuits") {
    if (item.country) details.push(["Negara", item.country]);
    if (item.location) details.push(["Lokasi", item.location]);

    if (item.length_km !== null && item.length_km !== undefined) {
      details.push(["Panjang lintasan", `${item.length_km} km`]);
    }

    if (item.number_of_turns !== null && item.number_of_turns !== undefined) {
      details.push(["Jumlah tikungan", item.number_of_turns]);
    }
  }

  details.forEach(([label, value]) => {
    const paragraph = document.createElement("p");
    const strong = document.createElement("strong");

    strong.textContent = `${label}: `;
    paragraph.appendChild(strong);
    paragraph.appendChild(document.createTextNode(String(value)));

    content.appendChild(paragraph);
  });

  // DESKRIPSI
  const description =
    category === "riders"
      ? item.career_description
      : item.description;

  if (description) {
    const paragraph = document.createElement("p");
    paragraph.textContent = description;
    content.appendChild(paragraph);
  }

  // SUMBER TAMBAHAN MOTOR
  if (category === "technology" && item.source_url) {
    try {
      const url = new URL(item.source_url);

      if (url.protocol === "https:" || url.protocol === "http:") {
        const link = document.createElement("a");

        link.className = "archive-item-source";
        link.href = url.href;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "Lihat sumber ↗";

        content.appendChild(link);
      }
    } catch (error) {
      console.warn("URL sumber tidak valid:", item.source_url);
    }
  }

  card.appendChild(content);

  return card;
}


// 8. MENAMPILKAN DATA ARSIP
function renderArchiveData(category, data) {
  const elements = getArchiveElements();

  if (!elements) return;

  elements.results.replaceChildren();

  if (!data.length) {
    const empty = document.createElement("p");
    empty.className = "archive-empty";
    empty.textContent = "Belum ada data arsip untuk kategori ini.";

    elements.results.appendChild(empty);
    return;
  }

  data.forEach((item) => {
    const card = createArchiveCard(category, item);
    elements.results.appendChild(card);
  });
}


// 9. MEMBUKA MODAL DAN MEMUAT DATA
async function openModal(category) {
  const config = archiveConfig[category];
  const elements = getArchiveElements();

  if (!config || !elements) return;

  elements.title.textContent = config.title;
  elements.description.textContent = config.description;

  elements.results.replaceChildren();

  const loading = document.createElement("p");
  loading.className = "archive-loading";
  loading.textContent = "Memuat arsip MotoGP...";

  elements.results.appendChild(loading);

  elements.modal.classList.add("show");
  elements.modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  try {
    const data = await fetchArchiveData(category);

    // Jangan menampilkan hasil lama jika kategori berubah
    if (!elements.modal.classList.contains("show")) return;

    renderArchiveData(category, data);

    console.log(
      `${config.table}: ${data.length} data berhasil ditampilkan.`
    );

  } catch (error) {
    console.error("Gagal memuat arsip:", error);

    const message = document.createElement("p");
    message.className = "archive-error";
    message.textContent =
      "Arsip gagal dimuat. Periksa koneksi database dan izin akses tabel Supabase.";

    elements.results.replaceChildren(message);
  }
}


// 10. MENUTUP MODAL
function closeModal() {
  const modal = document.getElementById("categoryModal");

  if (!modal) return;

  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");

  document.body.style.overflow = "";
}


// 11. NAVIGASI MOBILE
function initializeNavigation() {
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  if (!menuToggle || !navLinks) return;

  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("active");

    menuToggle.setAttribute(
      "aria-expanded",
      String(isOpen)
    );
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("active");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}


// 12. EVENT MODAL DAN TOMBOL KATEGORI
function initializeCategoryModal() {
  const modal = document.getElementById("categoryModal");
  const modalClose = document.getElementById("modalClose");
  const modalOkay = document.getElementById("modalOkay");

  if (!modal) return;

  document.querySelectorAll("[data-category]").forEach((button) => {
    button.addEventListener("click", () => {
      openModal(button.dataset.category);
    });
  });

  if (modalClose) {
    modalClose.addEventListener("click", closeModal);
  }

  if (modalOkay) {
    modalOkay.addEventListener("click", closeModal);
  }

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      modal.classList.contains("show")
    ) {
      closeModal();
    }
  });
}


// 13. MENJALANKAN WEBSITE
document.addEventListener("DOMContentLoaded", () => {
  addArchiveStyles();
  initializeSupabase();
  initializeNavigation();
  initializeCategoryModal();

  console.log("MotoGP Heritage siap digunakan.");
});
