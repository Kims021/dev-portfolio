(function(){
/* ================================================= */
/* ROOT REFERENCE */
/* Query from the component root — document.getElementById
   is unreliable for elements injected via innerHTML. */
/* ================================================= */

const _r = window.__cmpRoot || document;
const q  = (id) => _r.querySelector("#" + id);

/* ================================================= */
/* THEMES */
/* ================================================= */

const THEMES = [
    { id:"dark",     name:"Dark",     bg:"#020617", p:"#38bdf8", s:"#8b5cf6" },
    { id:"light",    name:"Light",    bg:"#f1f5f9", p:"#0284c7", s:"#7c3aed" },
    { id:"midnight", name:"Midnight", bg:"#000000", p:"#00d4ff", s:"#ff00d4" },
    { id:"forest",   name:"Forest",   bg:"#071a0e", p:"#10b981", s:"#84cc16" },
    { id:"sunset",   name:"Sunset",   bg:"#18080a", p:"#f97316", s:"#ec4899" },
    { id:"ocean",    name:"Ocean",    bg:"#020c18", p:"#06b6d4", s:"#3b82f6" },
    { id:"aurora",   name:"Aurora",   bg:"#08060f", p:"#a855f7", s:"#ec4899" },
    { id:"rose",     name:"Rose",     bg:"#150810", p:"#f43f5e", s:"#e879f9" },
    { id:"neon",     name:"Neon",     bg:"#000900", p:"#39ff14", s:"#00ffff" },
    { id:"copper",   name:"Copper",   bg:"#120800", p:"#c2732c", s:"#d4a553" },
    { id:"arctic",   name:"Arctic",   bg:"#010b18", p:"#67e8f9", s:"#bae6fd" },
    { id:"lava",     name:"Lava",     bg:"#0f0100", p:"#ef4444", s:"#fbbf24" },
    { id:"galaxy",   name:"Galaxy",   bg:"#02010f", p:"#818cf8", s:"#c084fc" },
];

/* ================================================= */
/* APPLY THEME */
/* ================================================= */

function applyTheme(id){
    document.documentElement.setAttribute("data-theme", id);
    localStorage.setItem("theme", id);
    document.querySelectorAll(".theme-swatch").forEach((s)=>{
        s.classList.toggle("active", s.dataset.themeId === id);
    });
}

/* ================================================= */
/* ELEMENTS */
/* ================================================= */

const themeGrid      = q("themeGrid");
const bgGrid         = q("bgGrid");
const autoToggleBtn  = q("autoToggle");
const autoLabel      = q("autoLabel");
const autoIntervalSel = q("autoInterval");
const menuToggle     = q("menuToggle");
const mobileMenu     = q("mobileMenu");

/* ================================================= */
/* BUILD THEME SWATCHES */
/* ================================================= */

const current = document.documentElement.getAttribute("data-theme") || "dark";

if(themeGrid){
    THEMES.forEach((t)=>{
        const btn = document.createElement("button");
        btn.className = "theme-swatch" + (t.id === current ? " active" : "");
        btn.dataset.themeId = t.id;
        btn.innerHTML = `
            <div class="swatch-preview" style="background:${t.bg}">
                <div class="swatch-accent" style="background:linear-gradient(135deg,${t.p},${t.s})"></div>
            </div>
            <span class="swatch-name">${t.name}</span>
            <span class="swatch-tick">✓</span>
        `;
        btn.addEventListener("click",()=>{
            applyTheme(t.id);
            document.getElementById("themePanel")?.classList.remove("open");
            if(autoEnabled) startAutoRotate();
        });
        themeGrid.appendChild(btn);
    });
}

/* ================================================= */
/* BG MODE SELECTOR */
/* ================================================= */

const BG_MODES = [
    { id:"constellation", name:"Constellation", icon:"✦" },
    { id:"starfield",     name:"Starfield",     icon:"✺" },
    { id:"grid",          name:"Grid Wave",     icon:"⬡" },
    { id:"rain",          name:"Rain",          icon:"≋" },
    { id:"vortex",        name:"Vortex",        icon:"◎" },
    { id:"bubbles",       name:"Bubbles",       icon:"◯" },
    { id:"dna",           name:"DNA",           icon:"⌬" },
    { id:"waves",         name:"Waves",         icon:"∿" },
    { id:"snow",          name:"Snow",          icon:"❅" },
    { id:"fireflies",     name:"Fireflies",     icon:"✧" },
    { id:"off",           name:"Off",           icon:"◌" },
];

const currentBg = localStorage.getItem("bgMode") || "constellation";

if(bgGrid){
    BG_MODES.forEach((m)=>{
        const btn = document.createElement("button");
        btn.className = "bg-swatch" + (m.id === currentBg ? " active" : "");
        btn.dataset.bgId = m.id;
        btn.innerHTML = `
            <span class="bg-icon">${m.icon}</span>
            <span class="bg-name">${m.name}</span>
            <span class="bg-tick">✓</span>
        `;
        btn.addEventListener("click",()=>{
            if(window.setBgMode) window.setBgMode(m.id);
            document.querySelectorAll(".bg-swatch").forEach((s)=>s.classList.remove("active"));
            btn.classList.add("active");
            document.getElementById("themePanel")?.classList.remove("open");
            if(autoEnabled) startAutoRotate();
        });
        bgGrid.appendChild(btn);
    });
}

/* ================================================= */
/* AUTO ROTATE */
/* ================================================= */

const _savedAuto = localStorage.getItem("autoRotate");
let autoEnabled  = _savedAuto === null ? true : _savedAuto === "true";
if(_savedAuto === null) localStorage.setItem("autoRotate", "true");
let autoInterval = parseInt(localStorage.getItem("autoRotateInterval") || "300000", 10);
let autoTimer    = null;

if(autoIntervalSel) autoIntervalSel.value = String(autoInterval);

function setAutoUI(){
    if(!autoToggleBtn) return;
    autoToggleBtn.classList.toggle("on", autoEnabled);
    if(autoLabel) autoLabel.textContent = autoEnabled ? "On" : "Off";
}

function pickRandom(arr, current){
    const pool = arr.filter(x => x.id !== current && x.id !== "off");
    return pool[Math.floor(Math.random() * pool.length)];
}

function doAutoRotate(){
    const overlay = document.getElementById("themeTransition");
    if(overlay) overlay.classList.add("active");
    setTimeout(()=>{
        const themeNow = document.documentElement.getAttribute("data-theme") || "dark";
        const bgNow    = localStorage.getItem("bgMode") || "constellation";
        const nextTheme = pickRandom(THEMES, themeNow);
        const nextBg    = pickRandom(BG_MODES, bgNow);
        if(nextTheme) applyTheme(nextTheme.id);
        if(nextBg && window.setBgMode){
            window.setBgMode(nextBg.id);
            document.querySelectorAll(".bg-swatch").forEach(s=>{
                s.classList.toggle("active", s.dataset.bgId === nextBg.id);
            });
        }
        if(overlay) overlay.classList.remove("active");
    }, 550);
}

function startAutoRotate(){ clearInterval(autoTimer); autoTimer = setInterval(doAutoRotate, autoInterval); }
function stopAutoRotate(){  clearInterval(autoTimer); autoTimer = null; }

function applyAutoState(){
    if(autoEnabled) startAutoRotate(); else stopAutoRotate();
    setAutoUI();
}

applyAutoState();

if(autoToggleBtn){
    autoToggleBtn.addEventListener("click",()=>{
        autoEnabled = !autoEnabled;
        localStorage.setItem("autoRotate", autoEnabled);
        applyAutoState();
    });
}

if(autoIntervalSel){
    autoIntervalSel.addEventListener("change",()=>{
        autoInterval = parseInt(autoIntervalSel.value, 10);
        localStorage.setItem("autoRotateInterval", autoInterval);
        if(autoEnabled) startAutoRotate();
    });
}

/* ================================================= */
/* NAVBAR SCROLL */
/* ================================================= */

const navbar = _r.querySelector(".navbar");
if(navbar){
    window.addEventListener("scroll",()=>{
        navbar.classList.toggle("scrolled", window.scrollY > 50);
    });
}

/* ================================================= */
/* MOBILE MENU */
/* ================================================= */

if(menuToggle && mobileMenu){
    menuToggle.addEventListener("click",()=>{ mobileMenu.classList.toggle("active"); });
    document.querySelectorAll(".mobile-menu a").forEach((link)=>{
        link.addEventListener("click",()=>{ mobileMenu.classList.remove("active"); });
    });
}
})();
