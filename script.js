
// ==================================================
// MOTOGP LEGACY ARCHIVE
// MAIN JAVASCRIPT + SUPABASE DATABASE
// ==================================================


// ==================================================
// 1. SUPABASE CONFIGURATION
// ==================================================

const SUPABASE_URL = "https://hhfksogwcuezjyviygkb.supabase.co";

const SUPABASE_ANON_KEY = "sb_publishable_0bIZlUdcS98fY-xefsmSzA_d235gVHt";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

console.log("Supabase client initialized!");


// ==================================================
// 2. NAVIGATION
// ==================================================

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle && navLinks) {
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
// 3. MODAL ELEMENTS
// ==================================================

const modal = document.getElementById("categoryModal");
const modalTitle = document.getElementById("modalTitle");
const modalDescription = document.getElementById("modalDescription");
const modalClose = document.getElementById("modalClose");
const modalOkay = document.getElementById("modalOkay");

const modalPanel = modal
    ? modal.querySelector(".modal-panel")
    : null;


// ==================================================
// 4. ARCHIVE CONFIGURATION
// ==================================================

const archiveConfig = {
    history: {
        title: "SEJARAH MOTOGP",
        table: "motogp_history",
        description: "Menjelajahi perjalanan sejarah Grand Prix hingga era MotoGP modern.",
        fields: [
            "id",
            "title",
            "era",
            "year_start",
            "year_end",
            "description",
            "image_url",
            "sort_order"
        ]
    },

    technology: {
        title: "MOTOR & TEKNOLOGI",
        table: "motogp_motorcycles",
        description: "Koleksi motor legendaris dan perkembangan teknologi balap.",
        fields: [
            "id",
            "manufacturer",
            "model",
            "year",
            "engine",
            "technology",
            "description",
            "image_url"
        ]
    },

    riders: {
        title: "PEMBALAP LEGENDA",
        table: "motogp_riders",
        description: "Mengenal pembalap legendaris dan pencapaian mereka.",
        fields: [
            "id",
            "full_name",
            "nationality",
            "date_of_birth",
            "team",
            "championships",
            "career_description",
            "image_url"
        ]
    },

    circuits: {
        title: "SIRKUIT DUNIA",
        table: "motogp_circuits",
        description: "Mengenal sirkuit ikonik yang menjadi bagian sejarah MotoGP.",
        fields: [
            "id",
            "name",
            "country",
            "location",
            "length_km",
            "number_of_turns",
            "description",
            "image_url"
        ]
    }
};


// ==================================================
// 5. HTML SECURITY HELPER
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
// 6. MODAL CONTROL
// ==================================================

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


// ==================================================
// 7. LOADING INDICATOR
// ==================================================

function showLoading() {
    modalDescription.textContent = "Menghubungkan ke database MotoGP...";

    const oldContent = document.getElementById("archiveResults");

    if (oldContent) {
        oldContent.remove();
    }

    if (modalOkay) {
        modalOkay.style.display = "none";
    }
}


// ==================================================
// 8. DISPLAY DATABASE ERROR
// ==================================================

function showError(message) {
    modalDescription.textContent =
        "Maaf, data belum dapat dimuat dari database.";

    let container = document.getElementById("archiveResults");

    if (!container) {
        container = document.createElement("div");
        container.id = "archiveResults";
        modalPanel.insertBefore(container, modalOkay);
    }

    container.innerHTML = `
        <div style="
            padding:20px;
            background:#241313;
            border:1px solid #a52a2a;
            color:#ffb3b3;
            margin-top:20px;
            font-size:13px;
            line-height:1.7;
        ">
            <strong>Database Error</strong>
            <p>${escapeHTML(message)}</p>
            <p>Periksa koneksi Supabase dan pengaturan RLS.</p>
        </div>
    `;

    if (modalOkay) {
        modalOkay.style.display = "inline-flex";
    }
}


// ==================================================
// 9. FETCH DATA FROM SUPABASE
// ==================================================

async function fetchArchiveData(category) {
    const config = archiveConfig[category];

    if (!config) return;

    modalTitle.textContent = config.title;
    modalDescription.textContent = config.description;

    showLoading();
    openModal();

    if (!modalPanel) return;

    modalPanel.style.maxWidth = "850px";
    modalPanel.style.maxHeight = "85vh";
    modalPanel.style.overflowY = "auto";

    try {
        const { data, error } = await supabaseClient
            .from(config.table)
            .select(config.fields.join(","))
            .order(
                category === "history" ? "sort_order" :
                category === "technology" ? "year" :
                "id",
                { ascending: true }
            );

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
// 10. FORMAT ARCHIVE DATA
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

    if (category === "technology") {
        return {
            title: `${item.manufacturer} ${item.model}`,
            subtitle: item.engine || "Motor Grand Prix",
            year: item.year || "-",
            description: item.description,
            extra: item.technology
                ? `Teknologi: ${item.technology}`
                : ""
        };
    }

    if (category === "riders") {
        return {
            title: item.full_name,
            subtitle: item.nationality || "Pembalap MotoGP",
            year: item.date_of_birth
                ? `Lahir: ${item.date_of_birth}`
                : "",
            description: item.career_description,
            extra: `Gelar juara dunia: ${item.championships ?? 0}`
        };
    }

    if (category === "circuits") {
        return {
            title: item.name,
            subtitle: item.country,
            year: item.location || "",
            description: item.description,
            extra:
                `Panjang lintasan: ${item.length_km ?? "-"} km | ` +
                `Tikungan: ${item.number_of_turns ?? "-"}`
        };
    }

    return null;
}


// ==================================================
// 11. RENDER DATABASE CONTENT
// ==================================================

function renderArchiveData(category, data) {
    modalDescription.textContent =
    archiveConfig[category].description;
    let container = document.getElementById("archiveResults");

    if (!container) {
        container = document.createElement("div");
        container.id = "archiveResults";

        modalPanel.insertBefore(container, modalOkay);
    }

    if (data.length === 0) {
        container.innerHTML = `
            <p style="
                color:#aaa;
                padding:25px 0;
                font-size:13px;
            ">
                Belum ada data yang tersedia dalam kategori ini.
            </p>
        `;

        if (modalOkay) {
            modalOkay.style.display = "inline-flex";
        }

        return;
    }

    container.innerHTML = data.map(item => {
        const details = getArchiveDetails(category, item);

        const imageHTML = item.image_url
            ? `
                <img
                    src="${escapeHTML(item.image_url)}"
                    alt="${escapeHTML(details.title)}"
                    loading="lazy"
                    onerror="this.style.display='none'"
                    style="
                        width:100%;
                        height:190px;
                        object-fit:cover;
                        display:block;
                        margin-bottom:15px;
                    "
                >
            `
            : "";

        return `
            <article style="
                background:#202020;
                border:1px solid #393939;
                border-left:3px solid #e10600;
                margin:15px 0;
                padding:18px;
                text-align:left;
            ">
                ${imageHTML}

                <span style="
                    color:#e10600;
                    font-size:10px;
                    font-weight:800;
                    letter-spacing:2px;
                ">
                    ${escapeHTML(details.year)}
                </span>

                <h3 style="
                    color:white;
                    font-family:'Barlow Condensed',sans-serif;
                    font-size:27px;
                    margin:8px 0;
                ">
                    ${escapeHTML(details.title)}
                </h3>

                <p style="
                    color:#e10600;
                    font-size:11px;
                    font-weight:700;
                    margin-bottom:10px;
                ">
                    ${escapeHTML(details.subtitle)}
                </p>

                <p style="
                    color:#c5c5c5;
                    font-size:12px;
                    line-height:1.8;
                ">
                    ${escapeHTML(details.description)}
                </p>

                ${
                    details.extra
                        ? `
                            <p style="
                                color:#aaa;
                                font-size:11px;
                                margin-top:12px;
                                line-height:1.7;
                            ">
                                ${escapeHTML(details.extra)}
                            </p>
                        `
                        : ""
                }
            </article>
        `;
    }).join("");

    if (modalOkay) {
        modalOkay.style.display = "inline-flex";
    }
}


// ==================================================
// 12. CATEGORY BUTTON EVENTS
// ==================================================

document.querySelectorAll("[data-category]").forEach(button => {
    button.addEventListener("click", () => {
        const category = button.dataset.category;

        fetchArchiveData(category);
    });
});


// ==================================================
// 13. INITIAL CONNECTION TEST
// ==================================================

async function testSupabaseConnection() {
    console.log("Testing Supabase connection...");

    try {
        const { error } = await supabaseClient
            .from("motogp_history")
            .select("id")
            .limit(1);

        if (error) {
            throw error;
        }

        console.log("Supabase connection SUCCESS!");
        console.log("MotoGP Legacy Archive is ready.");

    } catch (error) {
        console.error(
            "Supabase connection FAILED:",
            error.message
        );
    }
}


// ==================================================
// 14. START APPLICATION
// ==================================================

document.addEventListener("DOMContentLoaded", () => {
    console.log("MotoGP Legacy Archive loaded!");

    testSupabaseConnection();
});
