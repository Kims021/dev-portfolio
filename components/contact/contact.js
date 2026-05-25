(function(){
/* ================================================= */
/* CONTACT FORM */
/* ================================================= */

const contactForm = document.getElementById("contactForm");

if(contactForm){

    contactForm.addEventListener("submit", (e)=>{

        e.preventDefault();

        const subject = document.getElementById("contactSubject").value.trim();
        const message = document.getElementById("contactMessage").value.trim();

        if(!subject || !message) return;

        /* Build mailto — visitor's email client handles the From identity */

        const sub  = encodeURIComponent(subject);
        const body = encodeURIComponent(message);

        window.location.href =
        `mailto:kimmarin43@gmail.com?subject=${sub}&body=${body}`;

        /* Visual feedback */

        const btn = contactForm.querySelector(".contact-submit");

        if(btn){

            btn.classList.add("sent");

            btn.querySelector(".submit-text").textContent = "Message Sent ✓";

            setTimeout(()=>{
                btn.classList.remove("sent");
                btn.querySelector(".submit-text").textContent = "Send Message";
                contactForm.reset();
            }, 3000);

        }

    });

}
})();
