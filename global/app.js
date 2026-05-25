/* ================================================= */
/* BASE PATH */
/* ================================================= */

const BASE_PATH =
window.location.hostname.includes(
    "github.io"
)
? "/dev-portfolio"
: "";

/* ================================================= */
/* COMPONENTS */
/* ================================================= */

const components = [

    "navbar",
    "hero",
    "about",
    "skills",
    "experience",
    "projects",
    "contact",
    "footer"

];

/* ================================================= */
/* LOADED ASSETS */
/* ================================================= */

const loadedCSS = new Set();

const loadedJS = new Set();

/* ================================================= */
/* LOAD CSS */
/* ================================================= */

function loadCSS(path){

    if(loadedCSS.has(path)){

        return;

    }

    const link =
    document.createElement("link");

    link.rel = "stylesheet";

    link.href = path;

    document.head.appendChild(link);

    loadedCSS.add(path);

}

/* ================================================= */
/* LOAD JS */
/* ================================================= */

async function loadJS(path){

    if(loadedJS.has(path)){

        return;

    }

    const response = await fetch(path, { cache: "no-store" });

    if(!response.ok){

        throw new Error(`Failed to load ${path}`);

    }

    const code = await response.text();

    const script = document.createElement("script");

    /* inline text executes synchronously on appendChild,
       guaranteeing the component HTML is already in the DOM.
       sourceURL preserves correct filenames in devtools. */
    /* Wrap in IIFE so each component's const/let declarations
       are scoped and don't collide across scripts sharing the
       global scope (e.g. both navbar.js and footer.js declare _r). */
    script.textContent = `(()=>{\n${code}\n})();\n//# sourceURL=${path}`;

    document.body.appendChild(script);

    loadedJS.add(path);

}

/* ================================================= */
/* LOAD HTML */
/* ================================================= */

async function loadHTML(path){

    const response =
    await fetch(path, { cache: "no-store" });

    if(!response.ok){

        throw new Error(
            `${path} not found`
        );

    }

    return await response.text();

}

/* ================================================= */
/* LOAD COMPONENT */
/* ================================================= */

async function loadComponent(name){

    try{

        /* ========================================= */
        /* ROOT */
        /* ========================================= */

        const root =
        document.getElementById(name);

        if(!root){

            console.warn(
                `${name} root element missing`
            );

            return;

        }

        /* ========================================= */
        /* PATHS */
        /* ========================================= */

        const htmlPath =
        `${BASE_PATH}/components/${name}/${name}.html`;

        const cssPath =
        `${BASE_PATH}/components/${name}/${name}.css`;

        const jsPath =
        `${BASE_PATH}/components/${name}/${name}.js`;

        /* ========================================= */
        /* LOAD HTML */
        /* ========================================= */

        const html =
        await loadHTML(htmlPath);

        /* Strip every <script> block from fetched component HTML.
           Live-server injects its WebSocket reload script inside SVG
           elements (3× in navbar.html — once per icon SVG). When left
           in place those <script> nodes corrupt innerHTML parsing in
           SVG context, swallowing sibling elements like #themePanel. */
        root.innerHTML = html.replace(/<script\b[\s\S]*?<\/script>/gi, "");

        /* ========================================= */
        /* LOAD CSS */
        /* ========================================= */

        loadCSS(cssPath);

        /* ========================================= */
        /* LOAD JS */
        /* ========================================= */

        /* Expose the component root so scripts can use
           __cmpRoot.querySelector instead of document.getElementById,
           which is unreliable for dynamically-injected content. */
        window.__cmpRoot = root;

        await loadJS(jsPath);

        window.__cmpRoot = null;

        // console.log(
        //     `${name} loaded successfully`
        // );

    }catch(error){

        console.error(
            `Failed to load ${name}:`,
            error
        );

    }

}

/* ================================================= */
/* LOAD ALL COMPONENTS */
/* ================================================= */

async function loadComponents(){

    for(const component of components){

        await loadComponent(component);

    }

    initializeReveal();

    initializeActiveNavbar();

    initThemeToggle();

    dismissLoader();

    initScrollProgress();

}

/* ================================================= */
/* SCROLL REVEAL */
/* ================================================= */

function initializeReveal(){

    const hiddenElements =
    document.querySelectorAll(
        ".hidden"
    );

    if(!hiddenElements.length){

        return;

    }

    const observer =
    new IntersectionObserver(

        (entries)=>{

            entries.forEach((entry)=>{

                if(entry.isIntersecting){

                    entry.target.classList.add(
                        "show"
                    );

                    observer.unobserve(
                        entry.target
                    );

                }

            });

        },
        {
            threshold:0.15
        }

    );

    hiddenElements.forEach((element)=>{

        observer.observe(element);

    });

}

/* ================================================= */
/* ACTIVE NAVBAR */
/* ================================================= */

function initializeActiveNavbar(){

    const sections =
    document.querySelectorAll("section");

    const navLinks =
    document.querySelectorAll(
        ".navbar-links a"
    );

    function updateActive(){

        let current = "";

        sections.forEach((section)=>{

            /* getBoundingClientRect gives viewport-relative top;
               adding scrollY converts it to document-absolute position.
               section.offsetTop alone is wrong here because each section
               sits inside a position:relative wrapper div, making
               offsetTop ≈ 0 for every section. */
            const sectionTop =
            section.getBoundingClientRect().top
            + scrollY - 120;

            const sectionHeight =
            section.clientHeight;

            if(
                scrollY >= sectionTop &&
                scrollY <
                sectionTop + sectionHeight
            ){

                current =
                section.getAttribute("id");

            }

        });

        navLinks.forEach((link)=>{

            link.classList.remove("active");

            if(
                link.getAttribute("href")
                === `#${current}`
            ){

                link.classList.add("active");

            }

        });

    }

    window.addEventListener("scroll", updateActive);

    /* Run once on init so the correct link is active on page load */
    updateActive();

}

/* ================================================= */
/* LOADER DISMISS */
/* ================================================= */

function dismissLoader(){

    const screen = document.getElementById("loadingScreen");

    if(!screen) return;

    const fill = screen.querySelector(".loader-fill");

    if(fill){
        fill.style.animation = "none";
        fill.style.transition = "width 0.25s ease";
        fill.style.width = "100%";
    }

    setTimeout(()=>{
        screen.classList.add("done");
    }, 280);

}

/* ================================================= */
/* SCROLL PROGRESS */
/* ================================================= */

function initScrollProgress(){

    const bar = document.getElementById("scrollProgress");

    if(!bar) return;

    window.addEventListener("scroll", ()=>{

        const scrolled = window.scrollY;

        const total =
        document.documentElement.scrollHeight
        - window.innerHeight;

        bar.style.width =
        (total > 0 ? (scrolled / total) * 100 : 0) + "%";

    }, { passive: true });

}

/* ================================================= */
/* THEME PANEL TOGGLE */
/* ================================================= */

function initThemeToggle(){

    document.addEventListener("click", (e) => {

        const panel  = document.getElementById("themePanel");
        const toggle = document.getElementById("themeToggle");

        if(!panel) return;

        /* Clicked the toggle button (or anything inside it) */
        if(toggle && toggle.contains(e.target)){

            panel.classList.toggle("open");
            return;

        }

        /* Clicked outside both panel and toggle — close */
        if(!panel.contains(e.target)){

            panel.classList.remove("open");

        }

    });

}

/* ================================================= */
/* START */
/* ================================================= */

document.addEventListener(
    "DOMContentLoaded",
    ()=>{

        loadComponents();

    }
);