/* ================================================= */
/* NAVBAR */
/* ================================================= */

const navbar =
document.querySelector(".navbar");

/* ================================================= */
/* MOBILE MENU */
/* ================================================= */

const menuToggle =
document.getElementById(
    "menuToggle"
);

const mobileMenu =
document.getElementById(
    "mobileMenu"
);

/* ================================================= */
/* TOGGLE MOBILE MENU */
/* ================================================= */

menuToggle.addEventListener(
    "click",
    ()=>{

        mobileMenu.classList.toggle(
            "active"
        );

    }
);

/* ================================================= */
/* CLOSE MENU WHEN CLICK LINK */
/* ================================================= */

document
.querySelectorAll(".mobile-menu a")
.forEach((link)=>{

    link.addEventListener(
        "click",
        ()=>{

            mobileMenu.classList.remove(
                "active"
            );

        }
    );

});

/* ================================================= */
/* NAVBAR SCROLL EFFECT */
/* ================================================= */

window.addEventListener(
    "scroll",
    ()=>{

        if(window.scrollY > 50){

            navbar.classList.add(
                "scrolled"
            );

        }else{

            navbar.classList.remove(
                "scrolled"
            );

        }

    }
);

// console.log(
//     "Navbar Loaded"
// );