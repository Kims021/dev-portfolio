/* ================================================= */
/* TYPING ANIMATION */
/* ================================================= */

(function(){

    const el = document.getElementById("typingText");

    if(!el) return;

    const words = [
        "Laravel",
        "Angular",
        "GraphQL",
        "TypeScript",
        "React",
        "DevOps",
        "Docker",
        "Linux"
    ];

    let wordIdx = 0;
    let charIdx = 0;
    let deleting = false;
    let paused   = false;

    function tick(){

        if(paused) return;

        const word = words[wordIdx];

        if(deleting){

            charIdx--;

            el.textContent = word.slice(0, charIdx);

            if(charIdx === 0){

                deleting = false;

                wordIdx  = (wordIdx + 1) % words.length;

                paused = true;

                setTimeout(()=>{ paused = false; tick(); }, 380);

                return;

            }

            setTimeout(tick, 55);

        } else {

            charIdx++;

            el.textContent = word.slice(0, charIdx);

            if(charIdx === word.length){

                paused = true;

                setTimeout(()=>{ paused = false; deleting = true; tick(); }, 2000);

                return;

            }

            setTimeout(tick, 95);

        }

    }

    tick();

})();
