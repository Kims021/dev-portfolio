(function(){
const _r = window.__cmpRoot || document;

const backToTop       = _r.querySelector("#backToTop");
const footerCopyright = _r.querySelector("#footerCopyright");

if(backToTop){
    window.addEventListener("scroll",()=>{
        backToTop.classList.toggle("active", window.scrollY > 300);
    });
    backToTop.addEventListener("click",()=>{
        window.scrollTo({ top:0, behavior:"smooth" });
    });
}

if(footerCopyright){
    footerCopyright.innerHTML =
    `© ${new Date().getFullYear()} Kim Julius Marin. All rights reserved.`;
}
})();
