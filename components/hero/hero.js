(function(){

/* ================================================= */
/* TYPING ANIMATION */
/* ================================================= */

const el = document.getElementById("typingText");

if(el){

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

}

/* ================================================= */
/* SVG ARCHITECTURE DIAGRAM ANIMATIONS */
/* ================================================= */

const InfraAnimator = {

    cfg: {
        SPAWN_INTERVAL: 420,
        MAX_PACKETS:    22,
    },

    PATHS: [
        {
            id: 'nginx-laravel',
            pts: [{x:124,y:165},{x:175,y:135},{x:245,y:100},{x:292,y:86}],
            color: '#fbbf24', speed: 1.1,
        },
        {
            id: 'laravel-mysql-top',
            pts: [{x:356,y:78},{x:420,y:78},{x:480,y:78},{x:518,y:78}],
            color: '#60a5fa', speed: 1.3,
        },
        {
            id: 'laravel-graphql',
            pts: [{x:338,y:92},{x:380,y:128},{x:455,y:168},{x:508,y:192}],
            color: '#f0abfc', speed: 0.9,
        },
        {
            id: 'graphql-react',
            pts: [{x:535,y:234},{x:535,y:268},{x:535,y:298}],
            color: '#38bdf8', speed: 1.0,
        },
        {
            id: 'nginx-mysql-bot',
            pts: [{x:90,y:213},{x:90,y:260},{x:100,y:300},{x:110,y:318}],
            color: '#fca5a5', speed: 0.8,
        },
        {
            id: 'mysql-bot-redis',
            pts: [{x:136,y:325},{x:200,y:325},{x:260,y:325},{x:292,y:325}],
            color: '#fca5a5', speed: 0.85,
        },
        {
            id: 'redis-laravel',
            pts: [{x:320,y:292},{x:320,y:240},{x:320,y:165},{x:320,y:96}],
            color: '#fbbf24', speed: 0.75,
        },
        {
            id: 'mysql-top-graphql',
            pts: [{x:534,y:96},{x:532,y:130},{x:530,y:162},{x:530,y:178}],
            color: '#60a5fa', speed: 0.8,
        },
    ],

    packets:  [],
    pktLayer: null,
    ns:       'http://www.w3.org/2000/svg',
    t:        0,
    lastTs:   0,

    init() {
        this.pktLayer = document.getElementById('pkt-layer');
        if (!this.pktLayer) return;
        this._schedulePackets();
        this._loop(0);
    },

    _schedulePackets() {
        this.PATHS.forEach((path, i) => {
            setTimeout(() => this.drawPackets(path), i * 200);
        });
        setInterval(() => {
            if (this.packets.length >= this.cfg.MAX_PACKETS) return;
            const path = this.PATHS[Math.floor(Math.random() * this.PATHS.length)];
            this.drawPackets(path);
        }, this.cfg.SPAWN_INTERVAL);
    },

    drawPackets(path) {
        if (!path || !path.pts || path.pts.length < 2) return;

        const g    = document.createElementNS(this.ns, 'g');
        const halo = document.createElementNS(this.ns, 'circle');
        halo.setAttribute('r', '8');
        halo.setAttribute('fill', path.color);
        halo.setAttribute('opacity', '0.18');
        const core = document.createElementNS(this.ns, 'circle');
        core.setAttribute('r', '3.8');
        core.setAttribute('fill', path.color);
        core.setAttribute('opacity', '1');
        const tail = document.createElementNS(this.ns, 'circle');
        tail.setAttribute('r', '2');
        tail.setAttribute('fill', path.color);
        tail.setAttribute('opacity', '0.45');

        g.appendChild(tail);
        g.appendChild(halo);
        g.appendChild(core);
        this.pktLayer.appendChild(g);

        this.packets.push({
            g, core, halo, tail,
            pts:   path.pts,
            prog:  0,
            speed: (path.speed || 1) * (0.75 + Math.random() * 0.5),
            alive: true,
        });
    },

    _updatePackets(dt) {
        for (let i = this.packets.length - 1; i >= 0; i--) {
            const p = this.packets[i];
            if (!p.alive) {
                p.g.remove();
                this.packets.splice(i, 1);
                continue;
            }

            const ease = p.prog > 0.8
                ? 0.3 + 0.7 * (1 - (p.prog - 0.8) / 0.2)
                : 1;

            p.prog += p.speed * dt * 0.55 * ease;

            if (p.prog >= 1) { p.alive = false; continue; }

            const segs = p.pts.length - 1;
            const raw  = p.prog * segs;
            const si   = Math.min(Math.floor(raw), segs - 1);
            const st   = raw - si;
            const a    = p.pts[si];
            const b    = p.pts[si + 1] || a;
            const x    = a.x + (b.x - a.x) * st;
            const y    = a.y + (b.y - a.y) * st;

            p.g.setAttribute('transform', `translate(${x},${y})`);

            if (si > 0) {
                const prevA = p.pts[si - 1] || a;
                const tx    = prevA.x + (a.x - prevA.x) * st;
                const ty    = prevA.y + (a.y - prevA.y) * st;
                const dx    = x - tx, dy = y - ty;
                const len   = Math.sqrt(dx * dx + dy * dy) || 1;
                p.tail.setAttribute('cx', String(-dx / len * 5));
                p.tail.setAttribute('cy', String(-dy / len * 5));
            }

            const fade = p.prog < 0.08
                ? p.prog / 0.08
                : p.prog > 0.85
                    ? (1 - p.prog) / 0.15
                    : 1;
            p.core.setAttribute('opacity', String(Math.max(0, fade)));
            p.halo.setAttribute('opacity', String(Math.max(0, 0.2 * fade)));
        }
    },

    _animateNodes() {
        const t = this.t;

        const ring = document.getElementById('nginx-ring');
        if (ring) {
            const s = 1 + 0.1 * Math.sin(t * 1.6);
            ring.setAttribute('r', String(46 * s));
            ring.setAttribute('opacity', String(0.12 + 0.22 * Math.abs(Math.sin(t * 1.6))));
        }

        [['ll1', 2.3, 0.9], ['ll2', 3.7, 0.8], ['ll3', 1.9, 0.7]].forEach(([id, spd, base]) => {
            const el = document.getElementById(id);
            if (el) el.setAttribute('opacity', String(base * (0.3 + 0.7 * Math.abs(Math.sin(t * spd)))));
        });

        const mtfl = document.getElementById('mt-fl');
        if (mtfl) mtfl.setAttribute('opacity', String(0.3 + 0.7 * Math.abs(Math.sin(t * 2.8))));

        const mbfl = document.getElementById('mb-fl');
        if (mbfl) mbfl.setAttribute('opacity', String(0.3 + 0.7 * Math.abs(Math.sin(t * 2.1 + 1))));

        ['rd1','rd2','rd3','rd4','rd5','rd6'].forEach((id, i) => {
            const el = document.getElementById(id);
            if (!el) return;
            const v = 0.12 + 0.88 * (0.5 + 0.5 * Math.sin(t * 2.2 - i * (Math.PI / 3)));
            el.setAttribute('opacity', String(v));
        });
    },

    animateLoop(ts) {
        const dt = Math.min((ts - this.lastTs) / 1000, 0.1);
        this.lastTs = ts;
        this.t += dt;

        this._animateNodes();
        this._updatePackets(dt);

        requestAnimationFrame((ts2) => this.animateLoop(ts2));
    },

    _loop(ts) {
        this.lastTs = ts;
        requestAnimationFrame((ts2) => this.animateLoop(ts2));
    },

};

InfraAnimator.init();

})();
