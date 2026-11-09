
// ==========================================
// MOTOGP HERITAGE - JAVASCRIPT UTAMA
// ==========================================

// 1. KONFIGURASI SUPABASE
const SUPABASE_URL = "https://hhfksogwcuezjyviygkb.supabase.co";

const SUPABASE_KEY = "sb_publishable_0bIZlUdcS98fY-xefsmSzA_d235gVHt";

let supabaseClient = null;

// 2. DAFTAR TABEL DATABASE
const archiveConfig = {
  history: {
    table: "motogp_history",
    title: "Sejarah MotoGP",
    description: "Jelajahi perjalanan sejarah MotoGP, mulai dari kejuaraan dunia pertama pada tahun 1949 hingga perkembangan balap modern."
  },

  technology: {
    table: "motogp_motorcycles",
    title: "Teknologi Motor",
    description: "Kenali perkembangan teknologi motor Grand Prix, mulai dari mesin legendaris hingga inovasi aerodinamika modern."
  },

  riders: {
    table: "motogp_riders",
    title: "Pembalap Legendaris",
    description: "Temukan kisah para pembalap legendaris yang telah menciptakan sejarah dan prestasi luar biasa di dunia MotoGP."
  },

  circuits: {
    table: "motogp_circuits",
    title: "Sirkuit Dunia",
    description: "Jelajahi berbagai sirkuit legendaris yang menjadi bagian penting dari perjalanan kejuaraan dunia MotoGP."
  }
};

// 3. INISIALISASI SUPABASE
function initializeSupabase() {
  if (!window.supabase) {
    console.error("Supabase CDN belum berhasil dimuat.");
    return;
  }

  try {
    supabaseClient = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    );

    console.log("Supabase berhasil diinisialisasi.");
    checkDatabaseConnection();

  } catch (error) {
    console.error("Gagal menginisialisasi Supabase:", error);
  }
}

// 4. MEMERIKSA KONEKSI DATABASE
async function checkDatabaseConnection() {
  if (!supabaseClient) return;

  for (const [category, config] of Object.entries(archiveConfig)) {
    try {
      const { count, error } = await supabaseClient
        .from(config.table)
        .select("*", { count: "exact", head: true });

      if (error) throw error;

      console.log(
        `${config.table}: ${count ?? 0} data berhasil diperiksa.`
      );

    } catch (error) {
      console.error(
        `Gagal memeriksa tabel ${config.table}:`,
        error.message
      );
    }
  }
}

// 5. MENU NAVIGASI MOBILE
function initializeNavigation() {
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  if (!menuToggle || !navLinks) return;

  menuToggle.addEventListener("click", function () {
    const isOpen = navLinks.classList.toggle("active");

    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("active");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

// 6. SISTEM MODAL KATEGORI
function initializeCategoryModal() {
  const modal = document.getElementById("categoryModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalDescription = document.getElementById("modalDescription");
  const modalClose = document.getElementById("modalClose");
  const modalOkay = document.getElementById("modalOkay");

  if (!modal) return;

  function openModal(category) {
    const config = archiveConfig[category];

    if (!config) {
      console.warn("Kategori tidak ditemukan:", category);
      return;
    }

    if (modalTitle) {
      modalTitle.textContent = config.title;
    }

    if (modalDescription) {
      modalDescription.textContent = config.description;
    }

    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  document.querySelectorAll("[data-category]").forEach((button) => {
    button.addEventListener("click", () => {
      const category = button.dataset.category;
      openModal(category);
    });
  });

  if (modalClose) {
    modalClose.addEventListener("click", closeModal);
  }

  if (modalOkay) {
    modalOkay.addEventListener("click", closeModal);
  }

  // Menutup modal ketika area luar panel diklik
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  // Menutup modal menggunakan tombol Escape
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      modal.classList.contains("show")
    ) {
      closeModal();
    }
  });
}

// 7. INISIALISASI SELURUH FITUR
document.addEventListener("DOMContentLoaded", () => {
  initializeSupabase();
  initializeNavigation();
  initializeCategoryModal();

  console.log("MotoGP Heritage berhasil dimuat.");
});
