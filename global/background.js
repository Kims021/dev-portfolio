/* ================================================= */
/* FULL-PAGE 3D BACKGROUND — MULTI-MODE */
/* ================================================= */

(function(){

/* ================================================= */
/* CANVAS SETUP */
/* ================================================= */

const canvas = document.getElementById("bgCanvas");
if(!canvas) return;
const ctx = canvas.getContext("2d");

/* ================================================= */
/* SHARED STATE */
/* ================================================= */

const LINK    = 185;
const LINK_SQ = LINK * LINK;
const DEPTH   = 600;
const FOV     = 600;

let W, H, cx, cy;
let mX, mY, targetMX, targetMY;
let rotX = 0, rotY = 0;
let raf, lastTs = 0, time = 0;
let pts = [];

const _BG_POOL = [
    "constellation","starfield","grid","rain","vortex",
    "bubbles","dna","waves","snow","fireflies"
];

let currentMode = (function(){
    var saved = localStorage.getItem("bgMode");
    if(saved) return saved;
    var id = "grid";
    localStorage.setItem("bgMode", id);
    return id;
})();

/* ================================================= */
/* RESIZE */
/* ================================================= */

function resize(){
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    cx = W / 2;
    cy = H / 2;
    mX = cx;  mY = cy;
    targetMX = cx;  targetMY = cy;
}

/* ================================================= */
/* COLORS */
/* ================================================= */

function hexRgb(hex){
    hex = hex.trim().replace("#", "");
    if(hex.length === 3) hex = hex.split("").map(c => c+c).join("");
    const n = parseInt(hex, 16);
    return [(n>>16)&255, (n>>8)&255, n&255];
}

let clrCache = null, clrTheme = "";

function getColors(){
    const theme =
        document.documentElement.getAttribute("data-theme") || "dark";
    if(theme === clrTheme && clrCache) return clrCache;
    const s = getComputedStyle(document.documentElement);
    clrCache = {
        p:       hexRgb(s.getPropertyValue("--primary").trim()   || "#38bdf8"),
        s:       hexRgb(s.getPropertyValue("--secondary").trim() || "#8b5cf6"),
        isLight: theme === "light",
    };
    clrTheme = theme;
    return clrCache;
}

new MutationObserver(() => { clrCache = null; }).observe(
    document.documentElement,
    { attributes: true, attributeFilter: ["data-theme"] }
);

/* ================================================= */
/* 3D PROJECTION (shared by constellation) */
/* ================================================= */

function project3D(pt, rx, ry){
    const cY = Math.cos(ry), sY = Math.sin(ry);
    let x =  pt.x * cY + pt.z * sY;
    let z = -pt.x * sY + pt.z * cY;
    const cX = Math.cos(rx), sX = Math.sin(rx);
    let y =  pt.y * cX - z * sX;
    z     =  pt.y * sX + z * cX;
    const sc = FOV / (FOV + z + DEPTH * .5);
    return { sx: x*sc+cx, sy: y*sc+cy, sc: Math.max(.08, sc), depth: z };
}

/* ================================================= */
/* GLOW HELPER */
/* ================================================= */

function drawGlowDot(x, y, sz, r, g, b, al){
    ctx.beginPath();
    ctx.arc(x, y, sz * 7, 0, 6.283);
    ctx.fillStyle = `rgba(${r},${g},${b},${al*.04})`;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, sz * 2.5, 0, 6.283);
    ctx.fillStyle = `rgba(${r},${g},${b},${al*.16})`;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, sz, 0, 6.283);
    ctx.fillStyle = `rgba(${r},${g},${b},${al})`;
    ctx.fill();
}

/* ════════════════════════════════════════════════
   MODE 1 — CONSTELLATION
   ════════════════════════════════════════════════ */

function initConstellation(){
    const count = W < 768 ? 65 : 100;
    pts = Array.from({ length: count }, () => ({
        x:  (Math.random() - .5) * 1600,
        y:  (Math.random() - .5) * 1200,
        z:  Math.random() * DEPTH,
        vx: (Math.random() - .5) * .14,
        vy: (Math.random() - .5) * .14,
        vz: (Math.random() - .5) * .07,
    }));
}

function drawConstellation(dt, colors){
    const [pr,pg,pb] = colors.p;
    const [sr,sg,sb] = colors.s;

    rotY += .00045 * dt;
    rotX += .00018 * dt;
    const rx = rotX + (mY - cy) / (H||1) * .14;
    const ry = rotY + (mX - cx) / (W||1) * .14;

    ctx.globalCompositeOperation =
        colors.isLight ? "source-over" : "lighter";

    const proj = pts.map(pt => {
        pt.x += pt.vx*dt; if(Math.abs(pt.x)>850) pt.vx*=-1;
        pt.y += pt.vy*dt; if(Math.abs(pt.y)>650) pt.vy*=-1;
        pt.z += pt.vz*dt; if(pt.z>DEPTH||pt.z<0) pt.vz*=-1;
        return project3D(pt, rx, ry);
    });

    proj.sort((a, b) => a.depth - b.depth);
    const n = proj.length;

    for(let i = 0; i < n-1; i++){
        const a = proj[i];
        for(let j = i+1; j < n; j++){
            const b = proj[j];
            const dx = a.sx-b.sx, dy = a.sy-b.sy;
            const dSq = dx*dx+dy*dy;
            if(dSq > LINK_SQ) continue;
            const alpha =
                (1 - Math.sqrt(dSq)/LINK) * .28 *
                Math.min(a.sc, b.sc) * 3;
            if(alpha < .008) continue;
            const t = (i+j)/(2*(n-1));
            ctx.strokeStyle = `rgba(${pr+(sr-pr)*t|0},${pg+(sg-pg)*t|0},${pb+(sb-pb)*t|0},${alpha})`;
            ctx.lineWidth = .85;
            ctx.beginPath();
            ctx.moveTo(a.sx, a.sy);
            ctx.lineTo(b.sx, b.sy);
            ctx.stroke();
        }
    }

    for(let i = 0; i < n; i++){
        const { sx, sy, sc } = proj[i];
        const t  = i / (n-1||1);
        const cr = pr+(sr-pr)*t|0;
        const cg = pg+(sg-pg)*t|0;
        const cb = pb+(sb-pb)*t|0;
        const al = Math.min(1, sc*2.8);
        if(al < .04) continue;
        drawGlowDot(sx, sy, Math.max(.5, sc*2.8), cr, cg, cb, al);
    }

    ctx.globalCompositeOperation = "source-over";
}

/* ════════════════════════════════════════════════
   MODE 2 — STARFIELD
   ════════════════════════════════════════════════ */

function initStarfield(){
    pts = Array.from({ length: 180 }, () => ({
        angle: Math.random() * Math.PI * 2,
        r:     Math.random() * 400,
        speed: 0.6 + Math.random() * 1.8,
    }));
}

function drawStarfield(dt, colors){
    const [pr,pg,pb] = colors.p;
    const [sr,sg,sb] = colors.s;
    const maxR = Math.hypot(W, H) / 2 + 20;

    ctx.globalCompositeOperation =
        colors.isLight ? "source-over" : "lighter";

    pts.forEach((pt, i) => {
        pt.r += (pt.speed * (pt.r/120 + 0.4)) * dt;
        if(pt.r > maxR){ pt.r = 1; pt.angle = Math.random()*Math.PI*2; }

        const x = Math.cos(pt.angle) * pt.r + cx;
        const y = Math.sin(pt.angle) * pt.r + cy;
        const scale = pt.r / maxR;
        const size  = Math.max(.3, scale * 3);
        const al    = Math.min(1, scale * 1.8);
        const t  = i / pts.length;
        const cr = pr+(sr-pr)*t|0;
        const cg = pg+(sg-pg)*t|0;
        const cb = pb+(sb-pb)*t|0;

        const trailLen = pt.speed * (pt.r/100 + 1) * 6;
        const tx = Math.cos(pt.angle) * (pt.r - trailLen) + cx;
        const ty = Math.sin(pt.angle) * (pt.r - trailLen) + cy;

        ctx.strokeStyle = `rgba(${cr},${cg},${cb},${al*.4})`;
        ctx.lineWidth   = size * .6;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(x, y);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x, y, size*3.5, 0, 6.283);
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${al*.07})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, size, 0, 6.283);
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${al})`;
        ctx.fill();
    });

    ctx.globalCompositeOperation = "source-over";
}

/* ════════════════════════════════════════════════
   MODE 3 — GRID WAVE
   ════════════════════════════════════════════════ */

function initGrid(){ pts = []; }

function drawGrid(dt, colors){
    time += dt * .022;
    const [pr,pg,pb] = colors.p;
    const [sr,sg,sb] = colors.s;

    ctx.globalCompositeOperation =
        colors.isLight ? "source-over" : "lighter";

    const COLS = Math.min(Math.ceil(W/72)+1, 22);
    const ROWS = Math.min(Math.ceil(H/72)+1, 16);
    const cW   = W / (COLS-1);
    const cH   = H / (ROWS-1);

    for(let row = 0; row < ROWS; row++){
        for(let col = 0; col < COLS; col++){
            const bx   = col * cW;
            const by   = row * cH;
            const wave = Math.sin(col*.55+time) *
                         Math.cos(row*.55+time*.75) * 28;
            const x = bx, y = by + wave;
            const intensity = Math.abs(wave) / 28;
            const t  = (row*COLS+col) / (ROWS*COLS);
            const cr = pr+(sr-pr)*t|0;
            const cg = pg+(sg-pg)*t|0;
            const cb = pb+(sb-pb)*t|0;
            const al = .12 + intensity*.45;

            if(col < COLS-1){
                const nw = Math.sin((col+1)*.55+time) *
                           Math.cos(row*.55+time*.75) * 28;
                ctx.strokeStyle = `rgba(${cr},${cg},${cb},${al*.5})`;
                ctx.lineWidth = .7;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(bx+cW, by+nw);
                ctx.stroke();
            }
            if(row < ROWS-1){
                const nw = Math.sin(col*.55+time) *
                           Math.cos((row+1)*.55+time*.75) * 28;
                ctx.strokeStyle = `rgba(${cr},${cg},${cb},${al*.5})`;
                ctx.lineWidth = .7;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(bx, by+cH+nw);
                ctx.stroke();
            }

            const sz = 1 + intensity*2.5;
            ctx.beginPath();
            ctx.arc(x, y, sz, 0, 6.283);
            ctx.fillStyle = `rgba(${cr},${cg},${cb},${al+.08})`;
            ctx.fill();

            if(intensity > .55){
                ctx.beginPath();
                ctx.arc(x, y, sz*5, 0, 6.283);
                ctx.fillStyle = `rgba(${cr},${cg},${cb},${intensity*.07})`;
                ctx.fill();
            }
        }
    }

    ctx.globalCompositeOperation = "source-over";
}

/* ════════════════════════════════════════════════
   MODE 4 — RAIN
   ════════════════════════════════════════════════ */

function initRain(){
    const cols    = Math.floor((W||window.innerWidth) / 22);
    const spacing = (W||window.innerWidth) / cols;
    pts = Array.from({ length: cols }, (_, i) => ({
        x:    i * spacing + spacing / 2,
        drops: Array.from({
            length: 3 + Math.floor(Math.random()*3)
        }, () => ({
            y:     Math.random() * (H||window.innerHeight),
            speed: 1.5 + Math.random() * 2.5,
            op:    0.2  + Math.random() * 0.5,
            len:   35   + Math.random() * 80,
        })),
    }));
}

function drawRain(dt, colors){
    const [pr,pg,pb] = colors.p;
    const [sr,sg,sb] = colors.s;

    ctx.globalCompositeOperation =
        colors.isLight ? "source-over" : "lighter";

    pts.forEach((col, ci) => {
        const t  = ci / (pts.length-1||1);
        const cr = pr+(sr-pr)*t|0;
        const cg = pg+(sg-pg)*t|0;
        const cb = pb+(sb-pb)*t|0;

        col.drops.forEach(d => {
            d.y += d.speed * dt;
            if(d.y - d.len > H) d.y = -d.len;

            ctx.strokeStyle = `rgba(${cr},${cg},${cb},${d.op*.22})`;
            ctx.lineWidth   = 1;
            ctx.beginPath();
            ctx.moveTo(col.x, Math.max(0, d.y-d.len));
            ctx.lineTo(col.x, Math.min(H, d.y));
            ctx.stroke();

            if(d.y > 0 && d.y < H){
                ctx.beginPath();
                ctx.arc(col.x, d.y, 6, 0, 6.283);
                ctx.fillStyle = `rgba(${cr},${cg},${cb},${d.op*.1})`;
                ctx.fill();

                ctx.beginPath();
                ctx.arc(col.x, d.y, 1.8, 0, 6.283);
                ctx.fillStyle = `rgba(${cr},${cg},${cb},${d.op})`;
                ctx.fill();
            }
        });
    });

    ctx.globalCompositeOperation = "source-over";
}

/* ════════════════════════════════════════════════
   MODE 5 — VORTEX
   ════════════════════════════════════════════════ */

const ARMS = 3, PER_ARM = 55;

function initVortex(){
    pts = [];
    for(let arm = 0; arm < ARMS; arm++){
        for(let i = 0; i < PER_ARM; i++){
            const t = i / PER_ARM;
            const r = 30 + t * 370;
            pts.push({
                r,
                angle:    (arm/ARMS)*Math.PI*2 + t*Math.PI*4.5,
                angSpeed: (0.35 + Math.random()*.25) / (r/100 + .5),
                t,
            });
        }
    }
}

function drawVortex(dt, colors){
    const [pr,pg,pb] = colors.p;
    const [sr,sg,sb] = colors.s;
    const maxR = 420;

    ctx.globalCompositeOperation =
        colors.isLight ? "source-over" : "lighter";

    pts.forEach(pt => {
        pt.angle += pt.angSpeed * dt * .008;
        const x    = Math.cos(pt.angle) * pt.r + cx;
        const y    = Math.sin(pt.angle) * pt.r * .42 + cy;
        const fade = 1 - pt.r / maxR;
        const al   = fade * .85;
        if(al < .02) return;
        const sz = fade * 3.2 + .5;
        const cr = pr+(sr-pr)*pt.t|0;
        const cg = pg+(sg-pg)*pt.t|0;
        const cb = pb+(sb-pb)*pt.t|0;
        drawGlowDot(x, y, sz, cr, cg, cb, al);
    });

    ctx.globalCompositeOperation = "source-over";
}

/* ════════════════════════════════════════════════
   MODE 6 — BUBBLES
   ════════════════════════════════════════════════ */

function initBubbles(){
    pts = Array.from({ length: 45 }, () => ({
        x:     Math.random() * (W||window.innerWidth),
        y:     (H||window.innerHeight) + Math.random() * (H||window.innerHeight),
        r:     12 + Math.random() * 35,
        speed: 0.3 + Math.random() * 0.8,
        drift: (Math.random() - 0.5) * 0.4,
        op:    0.15 + Math.random() * 0.3,
        phase: Math.random() * Math.PI * 2,
    }));
}

function drawBubbles(dt, colors){
    time += dt * 0.012;
    const [pr,pg,pb] = colors.p;
    const [sr,sg,sb] = colors.s;

    ctx.globalCompositeOperation =
        colors.isLight ? "source-over" : "lighter";

    pts.forEach((pt, i) => {
        pt.y -= pt.speed * dt;
        pt.x += Math.sin(time + pt.phase) * pt.drift * dt;
        if(pt.y + pt.r < 0){
            pt.y = H + pt.r;
            pt.x = Math.random() * W;
        }

        const t  = i / pts.length;
        const cr = pr+(sr-pr)*t|0;
        const cg = pg+(sg-pg)*t|0;
        const cb = pb+(sb-pb)*t|0;

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.r * 1.4, 0, 6.283);
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${pt.op*.05})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.r, 0, 6.283);
        ctx.strokeStyle = `rgba(${cr},${cg},${cb},${pt.op})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.r, 0, 6.283);
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${pt.op*.08})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(pt.x - pt.r*.3, pt.y - pt.r*.3, pt.r*.2, 0, 6.283);
        ctx.fillStyle = `rgba(255,255,255,${pt.op*.65})`;
        ctx.fill();
    });

    ctx.globalCompositeOperation = "source-over";
}

/* ════════════════════════════════════════════════
   MODE 7 — DNA
   ════════════════════════════════════════════════ */

function initDNA(){ pts = []; }

function drawDNA(dt, colors){
    time += dt * 0.012;
    const [pr,pg,pb] = colors.p;
    const [sr,sg,sb] = colors.s;

    ctx.globalCompositeOperation =
        colors.isLight ? "source-over" : "lighter";

    const amp      = Math.min(W * .18, 130);
    const segments = 65;
    const segH     = H / segments;

    for(let i = 0; i <= segments; i++){
        const y     = i * segH;
        const phase = i * .22 + time;

        const x1 = cx + Math.sin(phase)         * amp;
        const x2 = cx + Math.sin(phase + Math.PI) * amp;

        const d1 = (Math.sin(phase) + 1) / 2;
        const d2 = 1 - d1;
        const al1 = .35 + d1 * .55;
        const al2 = .35 + d2 * .55;
        const sz1 = 1.5 + d1 * 2.5;
        const sz2 = 1.5 + d2 * 2.5;

        drawGlowDot(x1, y, sz1, pr, pg, pb, al1);
        drawGlowDot(x2, y, sz2, sr, sg, sb, al2);

        if(i % 7 === 0){
            const crossAl = .07 + Math.abs(Math.sin(phase)) * .12;
            ctx.beginPath();
            ctx.moveTo(x1, y);
            ctx.lineTo(x2, y);
            ctx.strokeStyle = `rgba(${(pr+sr)/2|0},${(pg+sg)/2|0},${(pb+sb)/2|0},${crossAl})`;
            ctx.lineWidth = .9;
            ctx.stroke();
        }

        if(i < segments){
            const ny     = (i+1) * segH;
            const phase2 = (i+1) * .22 + time;
            const nx1 = cx + Math.sin(phase2)           * amp;
            const nx2 = cx + Math.sin(phase2 + Math.PI) * amp;

            ctx.beginPath();
            ctx.moveTo(x1, y); ctx.lineTo(nx1, ny);
            ctx.strokeStyle = `rgba(${pr},${pg},${pb},${al1*.35})`;
            ctx.lineWidth = .9; ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x2, y); ctx.lineTo(nx2, ny);
            ctx.strokeStyle = `rgba(${sr},${sg},${sb},${al2*.35})`;
            ctx.lineWidth = .9; ctx.stroke();
        }
    }

    ctx.globalCompositeOperation = "source-over";
}

/* ════════════════════════════════════════════════
   MODE 8 — WAVES
   ════════════════════════════════════════════════ */

function initWaves(){
    pts = Array.from({ length: 5 }, (_, i) => ({
        freq:  .007 + i * .003,
        amp:   38  + i * 18,
        speed: .014 + i * .007,
        phase: (i / 5) * Math.PI * 2,
        yBase: (H||window.innerHeight) * (.18 + i * .16),
        t:     i / 4,
    }));
}

function drawWaves(dt, colors){
    time += dt * .018;
    const [pr,pg,pb] = colors.p;
    const [sr,sg,sb] = colors.s;

    ctx.globalCompositeOperation =
        colors.isLight ? "source-over" : "lighter";

    const steps = Math.ceil(W / 8) + 1;

    pts.forEach(wave => {
        const cr = pr+(sr-pr)*wave.t|0;
        const cg = pg+(sg-pg)*wave.t|0;
        const cb = pb+(sb-pb)*wave.t|0;

        ctx.beginPath();
        for(let s = 0; s <= steps; s++){
            const x = s * 8;
            const y = wave.yBase +
                Math.sin(x * wave.freq + time * wave.speed + wave.phase) * wave.amp;
            s === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(${cr},${cg},${cb},0.18)`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        for(let s = 0; s <= steps; s += 12){
            const x = s * 8;
            const sinV = Math.sin(x * wave.freq + time * wave.speed + wave.phase);
            const y = wave.yBase + sinV * wave.amp;
            const intensity = (sinV + 1) / 2;
            if(intensity > .65){
                drawGlowDot(x, y, 1.5 + intensity*2, cr, cg, cb, .35 + intensity*.4);
            }
        }
    });

    ctx.globalCompositeOperation = "source-over";
}

/* ════════════════════════════════════════════════
   MODE 9 — SNOW
   ════════════════════════════════════════════════ */

function initSnow(){
    const count = (W||window.innerWidth) < 768 ? 80 : 150;
    pts = Array.from({ length: count }, () => ({
        x:           Math.random() * (W||window.innerWidth),
        y:           Math.random() * (H||window.innerHeight),
        r:           1 + Math.random() * 2.8,
        speed:       0.3 + Math.random() * 0.75,
        drift:       (Math.random() - .5) * .5,
        wobble:      Math.random() * Math.PI * 2,
        wobbleSpeed: .02 + Math.random() * .04,
        op:          .3 + Math.random() * .5,
        t:           Math.random(),
    }));
}

function drawSnow(dt, colors){
    const [pr,pg,pb] = colors.p;
    const [sr,sg,sb] = colors.s;

    ctx.globalCompositeOperation =
        colors.isLight ? "source-over" : "lighter";

    pts.forEach(pt => {
        pt.wobble += pt.wobbleSpeed * dt;
        pt.y += pt.speed * dt;
        pt.x += Math.sin(pt.wobble) * pt.drift * dt;

        if(pt.y > H + pt.r){ pt.y = -pt.r; pt.x = Math.random() * W; }
        if(pt.x < -pt.r) pt.x = W + pt.r;
        if(pt.x > W + pt.r) pt.x = -pt.r;

        const cr = pr+(sr-pr)*pt.t|0;
        const cg = pg+(sg-pg)*pt.t|0;
        const cb = pb+(sb-pb)*pt.t|0;

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.r * 4, 0, 6.283);
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${pt.op*.04})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.r, 0, 6.283);
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${pt.op})`;
        ctx.fill();
    });

    ctx.globalCompositeOperation = "source-over";
}

/* ════════════════════════════════════════════════
   MODE 10 — FIREFLIES
   ════════════════════════════════════════════════ */

function initFireflies(){
    const count = (W||window.innerWidth) < 768 ? 40 : 70;
    pts = Array.from({ length: count }, () => ({
        x:          Math.random() * (W||window.innerWidth),
        y:          Math.random() * (H||window.innerHeight),
        vx:         (Math.random() - .5) * .4,
        vy:         (Math.random() - .5) * .4,
        phase:      Math.random() * Math.PI * 2,
        pulseSpeed: .03 + Math.random() * .05,
        r:          2 + Math.random() * 2.5,
        t:          Math.random(),
    }));
}

function drawFireflies(dt, colors){
    const [pr,pg,pb] = colors.p;
    const [sr,sg,sb] = colors.s;

    ctx.globalCompositeOperation =
        colors.isLight ? "source-over" : "lighter";

    pts.forEach(pt => {
        pt.phase += pt.pulseSpeed * dt;
        pt.x     += pt.vx * dt;
        pt.y     += pt.vy * dt;

        if(pt.x < 0 || pt.x > W){
            pt.vx *= -1;
            pt.vx += (Math.random()-.5) * .1;
        }
        if(pt.y < 0 || pt.y > H){
            pt.vy *= -1;
            pt.vy += (Math.random()-.5) * .1;
        }
        pt.vx = Math.max(-.6, Math.min(.6, pt.vx));
        pt.vy = Math.max(-.6, Math.min(.6, pt.vy));

        const pulse = (Math.sin(pt.phase) + 1) / 2;
        const al = .2 + pulse * .75;
        const sz = pt.r * (.6 + pulse * .7);

        const cr = pr+(sr-pr)*pt.t|0;
        const cg = pg+(sg-pg)*pt.t|0;
        const cb = pb+(sb-pb)*pt.t|0;

        drawGlowDot(pt.x, pt.y, sz, cr, cg, cb, al);
    });

    ctx.globalCompositeOperation = "source-over";
}

/* ================================================= */
/* MODES REGISTRY */
/* ================================================= */

const MODES = {
    constellation: { init: initConstellation, draw: drawConstellation },
    starfield:     { init: initStarfield,     draw: drawStarfield     },
    grid:          { init: initGrid,          draw: drawGrid          },
    rain:          { init: initRain,          draw: drawRain          },
    vortex:        { init: initVortex,        draw: drawVortex        },
    bubbles:       { init: initBubbles,       draw: drawBubbles       },
    dna:           { init: initDNA,           draw: drawDNA           },
    waves:         { init: initWaves,         draw: drawWaves         },
    snow:          { init: initSnow,          draw: drawSnow          },
    fireflies:     { init: initFireflies,     draw: drawFireflies     },
    off:           { init: () => { pts = []; }, draw: () => {}        },
};

/* ================================================= */
/* PUBLIC API — called by navbar.js */
/* ================================================= */

window.setBgMode = function(id){
    if(!MODES[id] || id === currentMode) return;
    currentMode = id;
    localStorage.setItem("bgMode", id);
    time = 0;
    MODES[id].init();
};

/* ================================================= */
/* MAIN DRAW LOOP */
/* ================================================= */

function draw(ts){
    const dt = Math.min((ts - lastTs) / 16.667, 2.5);
    lastTs = ts;

    /* Global mouse lerp — available to all modes */
    mX += (targetMX - mX) * .04;
    mY += (targetMY - mY) * .04;

    ctx.clearRect(0, 0, W, H);

    MODES[currentMode].draw(dt, getColors());

    raf = requestAnimationFrame(draw);
}

/* ================================================= */
/* EVENTS */
/* ================================================= */

document.addEventListener("mousemove", e => {
    targetMX = e.clientX;
    targetMY = e.clientY;
});

document.addEventListener("touchmove", e => {
    if(e.touches[0]){
        targetMX = e.touches[0].clientX;
        targetMY = e.touches[0].clientY;
    }
}, { passive: true });

window.addEventListener("resize", () => {
    resize();
    MODES[currentMode].init();
});

document.addEventListener("visibilitychange", () => {
    if(document.hidden){
        cancelAnimationFrame(raf);
    }else{
        lastTs = performance.now();
        raf = requestAnimationFrame(draw);
    }
});

/* ================================================= */
/* START */
/* ================================================= */

resize();
MODES[currentMode].init();
raf = requestAnimationFrame(draw);

})();
