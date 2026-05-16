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

function loadJS(path){

    return new Promise((resolve,reject)=>{

        if(loadedJS.has(path)){

            resolve();

            return;

        }

        const script =
        document.createElement("script");

        script.src = path;

        script.defer = true;

        script.onload = ()=>{

            loadedJS.add(path);

            resolve();

        };

        script.onerror = ()=>{

            reject(
                `Failed to load ${path}`
            );

        };

        document.body.appendChild(script);

    });

}

/* ================================================= */
/* LOAD HTML */
/* ================================================= */

async function loadHTML(path){

    const response =
    await fetch(path);

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

        root.innerHTML = html;

        /* ========================================= */
        /* LOAD CSS */
        /* ========================================= */

        loadCSS(cssPath);

        /* ========================================= */
        /* LOAD JS */
        /* ========================================= */

        await loadJS(jsPath);

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

    window.addEventListener(
        "scroll",
        ()=>{

            let current = "";

            sections.forEach((section)=>{

                const sectionTop =
                section.offsetTop - 120;

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

                link.classList.remove(
                    "active"
                );

                if(
                    link.getAttribute("href")
                    === `#${current}`
                ){

                    link.classList.add(
                        "active"
                    );

                }

            });

        }
    );

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