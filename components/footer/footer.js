/* ================================================= */
/* BACK TO TOP */
/* ================================================= */

const backToTop =
document.getElementById(
    "backToTop"
);

/* ================================================= */
/* SHOW BUTTON */
/* ================================================= */

window.addEventListener(
    "scroll",
    ()=>{

        if(window.scrollY > 300){

            backToTop.classList.add(
                "active"
            );

        }else{

            backToTop.classList.remove(
                "active"
            );

        }

    }
);

/* ================================================= */
/* SCROLL TOP */
/* ================================================= */

backToTop.addEventListener(
    "click",
    ()=>{

        window.scrollTo({

            top:0,

            behavior:"smooth"

        });

    }
);

/* ================================================= */
/* DYNAMIC COPYRIGHT */
/* ================================================= */

const footerCopyright =
document.getElementById(
    "footerCopyright"
);

const currentYear =
new Date().getFullYear();

footerCopyright.innerHTML =
`
© ${currentYear} Kim Julius Marin.
All rights reserved.
`;

// console.log(
//     "Footer Loaded"
// );