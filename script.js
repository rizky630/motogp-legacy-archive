
// ======================================================
// MOTOGP LEGACY ARCHIVE
// JAVASCRIPT UTAMA + SUPABASE DATABASE
// ======================================================

(() => {
    "use strict";

    // ==================================================
    // 1. KONFIGURASI SUPABASE
    // ==================================================

    const SUPABASE_URL = "https://hhfksogwcuezjyviygkb.supabase.co";

    const SUPABASE_ANON_KEY =
        "sb_publishable_0bIZlUdcS98fY-xefsmSzA_d235gVHt";

    let supabaseClient = null;

    // ==================================================
    // 2. KONFIGURASI KATEGORI ARSIP
    // ==================================================

    const archiveConfig = {
        history: {
            title: "SEJARAH MOTOGP",
            table: "motogp_history",
            description:
                "Menjelajahi perjalanan sejarah Grand Prix hingga era MotoGP modern.",
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
            orderBy: "sort_order"
        },

        technology: {
            title: "MOTOR & TEKNOLOGI",
            table: "motogp_motorcycles",
            description:
                "Mengenal motor legendaris dan perkembangan teknologi balap MotoGP.",
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
            orderBy: "year"
        },

        riders: {
            title: "PEMBALAP LEGENDA",
            table: "motogp_riders",
            description:
                "Mengenal para pembalap legendaris dan pencapaian mereka.",
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
            orderBy: "id"
        },

        circuits: {
            title: "SIRKUIT DUNIA",
            table: "motogp_circuits",
            description:
                "Menjelajahi sirkuit ikonik yang menjadi bagian dari sejarah MotoGP.",
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
            orderBy: "id"
        }
    };

    // ==================================================
    // 3. ELEMEN WEBSITE
    // ==================================================

    let modal;
    let modalTitle;
    let modalDescription;
    let modalClose;
    let modalOkay;
    let modalPanel;

    // ==================================================
    // 4. PENGAMAN TEKS HTML
    // ==================================================

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // ==================================================
    // 5. PENGAMAN ALAMAT SUMBER DAN FOTO
    // ==================================================

    function getSafeURL(value) {
        if (!value) return "";

        try {
            const url = new URL(value);

            if (
                url.protocol === "https:" ||
                url.protocol === "http:"
            ) {
                return url.href;
            }

            return "";
        } catch {
            return "";
        }
    }

    // ==================================================
    // 6. NAVIGASI WEBSITE
    // ==================================================

    function setupNavigation() {
        const menuToggle = document.getElementById("menuToggle");
        const navLinks = document.getElementById("navLinks");

        if (!menuToggle || !navLinks) return;

        menuToggle.addEventListener("click", () => {
            navLinks.classList.toggle("open");
        });

        document.querySelectorAll(".nav-links a").forEach(link => {
            link.addEventListener("click", () => {
                navLinks.classList.remove("open");
            });
        });
    }

    // ==================================================
    // 7. PENGATURAN MODAL
    // ==================================================

    function setupModal() {
        modal = document.getElementById("categoryModal");
        modalTitle = document.getElementById("modalTitle");
        modalDescription = document.getElementById("modalDescription");
        modalClose = document.getElementById("modalClose");
        modalOkay = document.getElementById("modalOkay");

        modalPanel = modal
            ? modal.querySelector(".modal-panel")
            : null;

        if (modalClose) {
            modalClose.addEventListener("click", closeModal);
        }

        if (modalOkay) {
            modalOkay.addEventListener("click", closeModal);
        }

        if (modal) {
            modal.addEventListener("click", event => {
                if (event.target === modal) {
                    closeModal();
                }
            });
        }

        document.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                closeModal();
            }
        });
    }

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

    // ==================================================
    // 8. PENGATURAN TAMPILAN MODAL
    // ==================================================

    function prepareModal() {
        if (!modalPanel) return;

        modalPanel.style.maxWidth = "850px";
        modalPanel.style.maxHeight = "85vh";
        modalPanel.style.overflowY = "auto";
    }

    // ==================================================
    // 9. MEMBUAT AREA HASIL ARSIP
    // ==================================================

    function getResultsContainer() {
        if (!modalPanel) return null;

        let container = document.getElementById("archiveResults");

        if (!container) {
            container = document.createElement("div");
            container.id = "archiveResults";

            const insertBeforeElement =
                modalOkay && modalOkay.parentElement === modalPanel
                    ? modalOkay
                    : null;

            modalPanel.insertBefore(
                container,
                insertBeforeElement
            );
        }

        return container;
    }

    // ==================================================
    // 10. TAMPILAN LOADING
    // ==================================================

    function showLoading() {
        if (modalDescription) {
            modalDescription.textContent =
                "Sedang mengambil data dari database MotoGP...";
        }

        const container = getResultsContainer();

        if (container) {
            container.innerHTML = `
                <div style="
                    padding:35px 15px;
                    text-align:center;
                    color:#cccccc;
                ">
                    <div style="
                        font-size:30px;
                        margin-bottom:12px;
                    ">🏁</div>

                    <p>Memuat koleksi arsip MotoGP...</p>
                </div>
            `;
        }

        if (modalOkay) {
            modalOkay.style.display = "none";
        }
    }

    // ==================================================
    // 11. TAMPILAN ERROR
    // ==================================================

    function showError(message) {
        if (modalDescription) {
            modalDescription.textContent =
                "Maaf, data belum dapat dimuat dari database.";
        }

        const container = getResultsContainer();

        if (container) {
            container.innerHTML = `
                <div style="
                    padding:20px;
                    background:#241313;
                    border:1px solid #a52a2a;
                    color:#ffb3b3;
                    margin-top:20px;
                    font-size:13px;
                    line-height:1.8;
                    border-radius:5px;
                ">
                    <strong>Terjadi Kesalahan</strong>

                    <p>${escapeHTML(message)}</p>

                    <p>
                        Silakan periksa koneksi Supabase,
                        nama tabel, kolom database, dan kebijakan RLS.
                    </p>
                </div>
            `;
        }

        if (modalOkay) {
            modalOkay.style.display = "inline-flex";
        }
    }

    // ==================================================
    // 12. FORMAT DATA SEJARAH MOTOGP
    // ==================================================

    function getArchiveDetails(category, item) {

        if (category === "history") {
            return {
                title: item.title,
                subtitle: item.era || "Sejarah MotoGP",

                year: item.year_end
                    ? `${item.year_start} – ${item.year_end}`
                    : `${item.year_start} – Sekarang`,

                description: item.description
            };
        }

        // ==================================================
        // MOTOR DAN TEKNOLOGI
        // ==================================================

        if (category === "technology") {
            return {
                title: `${item.manufacturer} ${item.model}`,

                subtitle: item.engine || "Motor Grand Prix",

                year: item.year || "-",

                description: item.description,

                extra: item.technology
                    ? `Teknologi: ${item.technology}`
                    : "",

                sourceUrl: item.source_url || ""
            };
        }

        // ==================================================
        // PEMBALAP LEGENDA
        // ==================================================

        if (category === "riders") {
            return {
                title: item.full_name,

                subtitle: item.nationality || "Pembalap MotoGP",

                year: item.date_of_birth
                    ? `Tanggal lahir: ${item.date_of_birth}`
                    : "",

                description: item.career_description,

                extra:
                    `Gelar juara dunia: ${item.championships ?? 0}` +
                    (item.team ? ` | Tim: ${item.team}` : "")
            };
        }

        // ==================================================
        // SIRKUIT DUNIA
        // ==================================================

        if (category === "circuits") {
            return {
                title: item.name,

                subtitle: item.country || "Sirkuit Grand Prix",

                year: item.location || "",

                description: item.description,

                extra:
                    `Panjang lintasan: ${item.length_km ?? "-"} km` +
                    ` | Jumlah tikungan: ${item.number_of_turns ?? "-"}`
            };
        }

        return null;
    }

    // ==================================================
    // 13. MEMBUAT TOMBOL SUMBER REFERENSI
    // ==================================================

    function createSourceButton(sourceUrl) {
        const safeURL = getSafeURL(sourceUrl);

        if (!safeURL) return "";

        return `
            <a
                href="${escapeHTML(safeURL)}"
                target="_blank"
                rel="noopener noreferrer"
                style="
                    display:inline-block;
                    margin-top:16px;
                    padding:11px 18px;
                    background:#e10600;
                    color:#ffffff;
                    text-decoration:none;
                    font-size:11px;
                    font-weight:800;
                    letter-spacing:1px;
                    border-radius:3px;
                    transition:background 0.3s ease;
                "
            >
                LIHAT SUMBER REFERENSI ↗
            </a>
        `;
    }

    // ==================================================
    // 14. MEMBUAT TAMPILAN FOTO
    // ==================================================

    function createImageHTML(imageURL, title) {
        const safeURL = getSafeURL(imageURL);

        if (!safeURL) {
            return "";
        }

        return `
            <img
                src="${escapeHTML(safeURL)}"
                alt="${escapeHTML(title)}"
                loading="lazy"
                style="
                    width:100%;
                    height:210px;
                    object-fit:cover;
                    display:block;
                    margin-bottom:16px;
                    border-radius:4px;
                    background:#111111;
                "
                onerror="this.style.display='none'"
            >
        `;
    }

    // ==================================================
    // 15. MEMBUAT KARTU ARSIP
    // ==================================================

    function createArchiveCard(category, item) {
        const details = getArchiveDetails(category, item);

        if (!details) return "";

        const imageHTML = createImageHTML(
            item.image_url,
            details.title
        );

        const sourceHTML = category === "technology"
            ? createSourceButton(details.sourceUrl)
            : "";

        const extraHTML = details.extra
            ? `
                <p style="
                    color:#aaaaaa;
                    font-size:11px;
                    line-height:1.8;
                    margin-top:12px;
                ">
                    ${escapeHTML(details.extra)}
                </p>
            `
            : "";

        return `
            <article style="
                background:#202020;
                border:1px solid #393939;
                border-left:4px solid #e10600;
                margin:16px 0;
                padding:19px;
                text-align:left;
                border-radius:4px;
            ">

                ${imageHTML}

                <span style="
                    color:#e10600;
                    font-size:11px;
                    font-weight:800;
                    letter-spacing:2px;
                ">
                    ${escapeHTML(details.year)}
                </span>

                <h3 style="
                    color:#ffffff;
                    font-family:'Barlow Condensed',sans-serif;
                    font-size:27px;
                    margin:9px 0;
                ">
                    ${escapeHTML(details.title)}
                </h3>

                <p style="
                    color:#e10600;
                    font-size:11px;
                    font-weight:700;
                    margin-bottom:12px;
                    line-height:1.7;
                ">
                    ${escapeHTML(details.subtitle)}
                </p>

                <p style="
                    color:#c5c5c5;
                    font-size:12px;
                    line-height:1.9;
                    white-space:normal;
                ">
                    ${escapeHTML(details.description || "Belum ada deskripsi.")}
                </p>

                ${extraHTML}

                ${sourceHTML}

            </article>
        `;
    }

    // ==================================================
    // 16. MENAMPILKAN DATA KE WEBSITE
    // ==================================================

    function renderArchiveData(category, data) {
        const config = archiveConfig[category];

        const container = getResultsContainer();

        if (!container || !config) return;

        if (modalDescription) {
            modalDescription.textContent = config.description;
        }

        if (!data || data.length === 0) {
            container.innerHTML = `
                <div style="
                    color:#aaaaaa;
                    padding:30px 10px;
                    text-align:center;
                    line-height:1.8;
                ">
                    <p>Belum ada data yang tersedia.</p>
                </div>
            `;

            if (modalOkay) {
                modalOkay.style.display = "inline-flex";
            }

            return;
        }

        container.innerHTML = data
            .map(item => createArchiveCard(category, item))
            .join("");

        if (modalOkay) {
            modalOkay.style.display = "inline-flex";
        }

        console.log(
            `Berhasil menampilkan ${data.length} data dari ${config.table}`
        );
    }

    // ==================================================
    // 17. MENGAMBIL DATA DARI SUPABASE
    // ==================================================

    async function fetchArchiveData(category) {
        const config = archiveConfig[category];

        if (!config) {
            console.error("Kategori tidak ditemukan:", category);
            return;
        }

        if (!supabaseClient) {
            showError("Koneksi Supabase belum berhasil dibuat.");
            openModal();
            return;
        }

        if (modalTitle) {
            modalTitle.textContent = config.title;
        }

        if (modalDescription) {
            modalDescription.textContent = config.description;
        }

        prepareModal();
        showLoading();
        openModal();

        try {
            const { data, error } = await supabaseClient
                .from(config.table)
                .select(config.fields.join(","))
                .order(config.orderBy, {
                    ascending: true
                });

            if (error) {
                throw error;
            }

            renderArchiveData(category, data || []);

            console.log(
                `Berhasil mengambil ${data.length} data dari ${config.table}`
            );

        } catch (error) {
            console.error("Supabase error:", error);

            showError(
                error.message || "Terjadi kesalahan saat mengambil data."
            );
        }
    }

    // ==================================================
    // 18. TOMBOL KATEGORI ARSIP
    // ==================================================

    function setupCategoryButtons() {
        document.querySelectorAll("[data-category]").forEach(button => {

            button.addEventListener("click", () => {
                const category = button.dataset.category;

                fetchArchiveData(category);
            });

        });
    }

    // ==================================================
    // 19. TES KONEKSI SUPABASE
    // ==================================================

    async function testSupabaseConnection() {
        console.log("Memeriksa koneksi Supabase...");

        try {
            const { error } = await supabaseClient
                .from("motogp_history")
                .select("id")
                .limit(1);

            if (error) {
                throw error;
            }

            console.log("Koneksi Supabase berhasil!");
            console.log("MotoGP Legacy Archive siap digunakan.");

        } catch (error) {
            console.error(
                "Koneksi Supabase gagal:",
                error.message
            );
        }
    }

    // ==================================================
    // 20. MEMULAI APLIKASI
    // ==================================================

    function initializeApp() {
        console.log("MotoGP Legacy Archive dimulai!");

        setupNavigation();
        setupModal();
        setupCategoryButtons();

        if (!window.supabase) {
            console.error(
                "Library Supabase belum dimuat. Periksa script CDN di index.html."
            );
            return;
        }

        try {
            supabaseClient = window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_ANON_KEY
            );

            console.log("Supabase client berhasil dibuat!");

            testSupabaseConnection();

        } catch (error) {
            console.error(
                "Gagal membuat koneksi Supabase:",
                error
            );
        }
    }

    // Menjalankan aplikasi setelah HTML siap.

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initializeApp
        );
    } else {
        initializeApp();
    }

})();
