
// ==========================================
// MOTOGP LEGACY ARCHIVE
// Main JavaScript
// ==========================================

// 1. NAVIGATION
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("open");
});

document.querySelectorAll(".nav-links a").forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
  });
});

// 2. ARCHIVE CONTENT
const archiveData = {
  history: {
    title: "SEJARAH MOTOGP",
    description:
      "Kejuaraan dunia balap motor dimulai pada tahun 1949. Kategori utama kelas 500cc kemudian berkembang menjadi era MotoGP pada tahun 2002. Koleksi ini akan memuat perjalanan sejarah, perubahan regulasi, dan momen penting dari setiap era."
  },

  technology: {
    title: "MOTOR & TEKNOLOGI",
    description:
      "Kenali evolusi motor Grand Prix, mulai dari mesin dua langkah 500cc, era mesin empat langkah, hingga teknologi elektronik, aerodinamika, dan perangkat pengatur ketinggian motor modern."
  },

  riders: {
    title: "PEMBALAP LEGENDA",
    description:
      "Jelajahi profil pembalap yang mencatatkan prestasi penting dalam sejarah Grand Prix, termasuk perjalanan karier, tim, gelar juara, dan pencapaian mereka."
  },

  circuits: {
    title: "SIRKUIT DUNIA",
    description:
      "Kenali sirkuit-sirkuit ikonik yang menjadi bagian dari kejuaraan dunia, termasuk karakter lintasan, lokasi, sejarah, dan momen balap yang berkesan."
  }
};

// 3. MODAL
const modal = document.getElementById("categoryModal");
const modalTitle = document.getElementById("modalTitle");
const modalDescription = document.getElementById("modalDescription");
const modalClose = document.getElementById("modalClose");
const modalOkay = document.getElementById("modalOkay");

function showCategory(category) {
  const selected = archiveData[category];

  if (!selected) return;

  modalTitle.textContent = selected.title;
  modalDescription.textContent = selected.description;

  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
}

function closeCategory() {
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
}

document.querySelectorAll("[data-category]").forEach(button => {
  button.addEventListener("click", () => {
    showCategory(button.dataset.category);
  });
});

modalClose.addEventListener("click", closeCategory);
modalOkay.addEventListener("click", closeCategory);

modal.addEventListener("click", event => {
  if (event.target === modal) {
    closeCategory();
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeCategory();
  }
});

// 4. SUPABASE CONFIGURATION
// Isi URL dan publishable key setelah konfigurasi Supabase selesai.
const SUPABASE_URL = "ISI_PROJECT_URL_SUPABASE";
const SUPABASE_ANON_KEY = "ISI_PUBLISHABLE_KEY_SUPABASE";

let supabaseClient = null;

if (
  window.supabase &&
  SUPABASE_URL.startsWith("https://") &&
  SUPABASE_ANON_KEY !== "ISI_PUBLISHABLE_KEY_SUPABASE"
) {
  supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );

  console.log("Supabase client berhasil diinisialisasi.");
} else {
  console.log("Supabase belum dikonfigurasi. Website berjalan dengan konten awal.");
}

// 5. INITIALIZATION
console.log("MotoGP Legacy Archive berhasil dimuat!");
