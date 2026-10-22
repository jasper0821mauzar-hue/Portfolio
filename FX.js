/* ==========================================================
   fx.js — premium motion layer, v2
   1  Smooth scroll ........ Lenis
   2  Scroll motion ........ GSAP + ScrollTrigger (+ SplitText)
   3  Gold particle field .. Three.js, one fixed layer for the whole page
   4  Pointer layer ........ cursor follower, card hover, magnetic links
   5  Performance .......... content-visibility on below-the-fold sections
   Runs after script.js. Every part fails safe: if a library does not
   load, the site behaves like the plain version.
   ========================================================== */

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

const { gsap, ScrollTrigger, SplitText, Lenis } = window; // classic scripts loaded just before this module
const html = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const hasGSAP = Boolean(gsap && ScrollTrigger);

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const damp = (current, target, rate, dt) => current + (target - current) * (1 - Math.exp(-rate * dt));
const safe = step => {
    try {
        const result = step();
        if (result && typeof result.catch === 'function') { result.catch(error => console.warn('[fx] ' + step.name + ' skipped:', error)); }
    } catch (error) { console.warn('[fx] ' + step.name + ' skipped:', error); }
};

/* Zone targets: written by the scroll triggers (GSAP), eased and read by the particle shader (Three.js). */
const zoneTarget = { calm: 0, halo: 0 };

/* Resolves once script.js has lifted the loader, so intros play on a visible page. */
const loaderDone = new Promise(resolve => {
    const body = document.body;
    if (!body.classList.contains('is-loading')) { resolve(); return; }
    const watcher = new MutationObserver(() => {
        if (!body.classList.contains('is-loading')) { watcher.disconnect(); resolve(); }
    });
    watcher.observe(body, { attributes: true, attributeFilter: ['class'] });
    setTimeout(() => { watcher.disconnect(); resolve(); }, 8000); // safety net
});

/* ----------------------------------------------------------
   1. SMOOTH SCROLL (Lenis)
   ---------------------------------------------------------- */
function initSmoothScroll() {
    if (reduceMotion || !Lenis) { return; }

    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true, anchors: true, autoRaf: !hasGSAP });
    lenis.stop(); // hold still behind the loader
    loaderDone.then(() => lenis.start());

    if (hasGSAP) { // one clock for both libraries
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add(time => lenis.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);
    }

    // The lightbox locks the page: freeze smooth scrolling while it is open.
    const lightbox = $('#lb');
    if (lightbox) {
        new MutationObserver(() => {
            if (lightbox.classList.contains('show')) { lenis.stop(); } else { lenis.start(); }
        }).observe(lightbox, { attributes: true, attributeFilter: ['class'] });
    }
}

/* ----------------------------------------------------------
   2. SCROLL MOTION (GSAP)
   ---------------------------------------------------------- */
const rescuers = []; // run once after load: anything already on screen that never fired still appears

function onceInView(el, start, run) {
    if (!el) { return; }
    let done = false;
    const go = () => { if (!done) { done = true; run(); } };
    ScrollTrigger.create({ trigger: el, start, once: true, onEnter: go });
    rescuers.push(() => { if (!done && el.getBoundingClientRect().top < window.innerHeight) { go(); } });
}

/* Hero: one orchestrated intro after the loader lifts, then it recedes as you scroll away.
   Elements that already use a CSS transform (translateX(-50%)) are tweened with xPercent
   so nothing jumps when GSAP hands the transform back. */
function heroMotion() {
    const intro = gsap.timeline({ paused: true, defaults: { ease: 'expo.out', duration: 1.7 } });
    const hand = 'transform,opacity,transformOrigin';

    intro
        .fromTo('.hero-orbit', { opacity: 0 }, { opacity: 1, duration: 2.8, stagger: 0.3, ease: 'power2.out', clearProps: 'opacity' }, 0)
        .fromTo('.pf-img', { opacity: 0, y: -28, xPercent: -50 }, { opacity: 1, y: 0, xPercent: -50, duration: 2, clearProps: hand }, 0.1)
        .fromTo('.hero-photo', { opacity: 0, y: 70, scale: 1.035, xPercent: -50, transformOrigin: '50% 100%' },
            { opacity: 1, y: 0, scale: 1, xPercent: -50, duration: 2.2, clearProps: hand }, 0.3)
        .fromTo('.hero-kicker', { opacity: 0, y: 14, xPercent: -50 }, { opacity: 1, y: 0, xPercent: -50, clearProps: hand }, 0.6)
        .fromTo(['.role-tag', '.avail'], { opacity: 0, y: 14 }, { opacity: 1, y: 0, stagger: 0.1, clearProps: hand }, 0.65)
        .fromTo(['.hero-quote', '.hero-name', '.hero-bio', '.hero-location'], { opacity: 0, y: 22 },
            { opacity: 1, y: 0, stagger: 0.12, clearProps: hand }, 0.85)
        .fromTo(['.hero-logo', '.hero-bottom-label'], { opacity: 0 }, { opacity: 1, duration: 1.6, ease: 'power2.out', clearProps: 'opacity' }, 1.1);

    loaderDone.then(() => gsap.delayedCall(0.2, () => intro.play()));

    gsap.to('.hero-stage', {
        scale: 0.94, opacity: 0.2, ease: 'none', transformOrigin: '50% 70%',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.5 }
    });
}

/* Everything marked .reveal rises into place. Cards and the contact card tilt up in 3D.
   Parts with their own choreography (project fan, big titles) are handled further down. */
function revealSystem() {
    const reveals = $$('.reveal').filter(el => !el.matches('.fan-wrap, .head, .side'));
    const fromState = el => {
        if (el.matches('.cta')) { return { opacity: 0, y: 72, rotationX: -10, scale: 0.96, transformPerspective: 1200, transformOrigin: '50% 100%' }; }
        if (el.matches('.card')) { return { opacity: 0, y: 64, rotationX: -14, transformPerspective: 900, transformOrigin: '50% 100%' }; }
        return { opacity: 0, y: 36 };
    };
    reveals.forEach(el => gsap.set(el, fromState(el)));

    const revealIn = elements => gsap.to(elements, {
        opacity: 1, y: 0, rotationX: 0, scale: 1, duration: 1.4, ease: 'expo.out', stagger: 0.1,
        clearProps: 'transform,transformOrigin,opacity', overwrite: 'auto',
        onStart() { elements.forEach(el => { el.classList.add('in'); el.dataset.fx = '1'; }); },
        onComplete() { elements.forEach(el => el.classList.add('fx-done')); }
    });

    ScrollTrigger.batch(reveals, { start: 'top 90%', once: true, interval: 0.1, onEnter: revealIn });
    rescuers.push(() => {
        const stuck = reveals.filter(el => !el.dataset.fx && el.getBoundingClientRect().top < window.innerHeight);
        if (stuck.length) { revealIn(stuck); }
    });
}

/* Big section titles: lines slide up out of a mask; captions follow. */
function titles() {
    $$('.head, .side').forEach(group => {
        const title = $('.title', group);
        if (!title) { return; }
        group.classList.add('in', 'fx-done'); // the wrapper shows at once; its parts animate

        const extras = $$(':scope > :not(.title)', group);
        onceInView(group, 'top 86%', () => gsap.to(extras, {
            opacity: 1, y: 0, duration: 1.2, ease: 'expo.out', delay: 0.4, stagger: 0.1, clearProps: 'transform,opacity'
        }));
        gsap.set(extras, { opacity: 0, y: 16 });

        if (SplitText) {
            SplitText.create(title, {
                type: 'lines', mask: 'lines', autoSplit: true,
                onSplit: self => gsap.from(self.lines, {
                    yPercent: 110, duration: 1.4, ease: 'expo.out', stagger: 0.12,
                    scrollTrigger: { trigger: group, start: 'top 86%', once: true }
                })
            });
        }
    });
}

/* Featured Projects: the stage tilts up out of the dark in 3D, lands, and only then does the
   fan deal out card by card. The cards' own CSS transforms are never touched. */
function projectsSequence() {
    const stage = $('#fanStage');
    const fan = $('.fan-wrap');
    if (!stage || !fan) { return; }

    fan.classList.add('in', 'fx-done'); // the wrapper shows at once; its parts are choreographed
    const filters = $$('.fan-filter li', fan);
    const captions = $$('.fan-cap, .fan-live', fan);

    // script.js spreads the fan as soon as it is 35% visible; hold it closed until the stage has landed.
    let landed = false;
    const hold = new MutationObserver(() => {
        if (!landed && stage.classList.contains('spread')) { stage.classList.remove('spread'); }
    });
    hold.observe(stage, { attributes: true, attributeFilter: ['class'] });

    // Trigger from the wrapper: the stage itself is tilted and shifted while hidden, which would skew its start point.
    onceInView(fan, 'top 66%', () => {
        gsap.timeline({ defaults: { ease: 'expo.out' } })
            .to(filters, { opacity: 1, x: 0, duration: 1.1, stagger: 0.06, clearProps: 'transform,opacity' }, 0)
            .to(stage, { opacity: 1, y: 0, rotationX: 0, scale: 1, duration: 1.7, clearProps: 'transform,transformOrigin,opacity' }, 0.1)
            .add(() => { landed = true; hold.disconnect(); stage.classList.add('spread'); }, 0.8)
            .to(captions, { opacity: 1, y: 0, duration: 1.1, stagger: 0.1, clearProps: 'transform,opacity' }, 1.05);
    });

    gsap.set(filters, { opacity: 0, x: -28 });
    gsap.set(captions, { opacity: 0, y: 18 });
    gsap.set(stage, { opacity: 0, y: 90, rotationX: 26, scale: 0.92, transformPerspective: 1400, transformOrigin: '50% 100%' });
}

/* Every time the fan spreads (first reveal and every category switch) the cards deal out
   from the centre, slower and with a stagger. Only the transition timing is borrowed. */
function dealStagger() {
    const stage = $('#fanStage');
    if (!stage) { return; }
    let wasSpread = stage.classList.contains('spread');
    let timer = 0;

    new MutationObserver(() => {
        const spread = stage.classList.contains('spread');
        if (spread && !wasSpread) {
            const cards = $$('.fan-card', stage);
            const mid = (cards.length - 1) / 2;
            cards.forEach((card, index) => {
                card.style.transitionDuration = '0.95s, 0.3s, 0.3s';
                card.style.transitionDelay = (Math.abs(index - mid) * 0.07).toFixed(2) + 's, 0s, 0s';
            });
            clearTimeout(timer);
            timer = setTimeout(() => cards.forEach(card => { card.style.transitionDuration = ''; card.style.transitionDelay = ''; }), (mid * 0.07 + 1.2) * 1000);
        }
        wasSpread = spread;
    }).observe(stage, { attributes: true, attributeFilter: ['class'] });
}

/* Toolkit icons and work-process steps arrive one by one once their card is in. */
function microReveals() {
    const run = (container, items, from, to) => {
        if (!container || !items.length) { return; }
        const busy = on => items.forEach(el => el.classList.toggle('fx-busy', on));
        onceInView(container, 'top 88%', () => {
            busy(true);
            gsap.to(items, { ...to, ease: 'expo.out', clearProps: 'transform,opacity', onComplete: () => busy(false) });
        });
        gsap.set(items, from);
    };
    run($('.tools'), $$('.tool'), { opacity: 0, y: 18, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 1, stagger: 0.05, delay: 0.25 });
    run($('.steps'), $$('.steps li'), { opacity: 0, x: -26 }, { opacity: 1, x: 0, duration: 1.1, stagger: 0.12, delay: 0.3 });
}

/* A gold hairline draws itself across the top of each section as it arrives. */
function seams() {
    $$('#projects, #profile, #skills, #contact').forEach(section => {
        const seam = document.createElement('i');
        seam.className = 'fx-seam';
        seam.setAttribute('aria-hidden', 'true');
        section.prepend(seam);
        gsap.fromTo(seam, { scaleX: 0, opacity: 0 }, {
            scaleX: 1, opacity: 1, ease: 'none',
            scrollTrigger: { trigger: section, start: 'top 96%', end: 'top 58%', scrub: true }
        });
    });
}

/* Zones tell the particle field where the visitor is. The shader eases between them. */
function zones() {
    ScrollTrigger.create({ trigger: '#projects', start: 'top 65%', end: 'bottom 35%', onToggle: self => { zoneTarget.calm = self.isActive ? 1 : 0; } });
    ScrollTrigger.create({ trigger: '#contact', start: 'top 62%', end: 'bottom top', onToggle: self => { zoneTarget.halo = self.isActive ? 1 : 0; } });
}

/* Contact finale: headline characters and paragraph lines slide up out of masks,
   the links glide in, and one sheen sweeps the gold card. */
function contactFinale() {
    const cta = $('.cta');
    if (!cta) { return; }
    const heading = $('h2', cta);
    const paragraph = $('p', cta);
    const links = $$('.cta-links > *', cta);
    const trigger = () => ({ trigger: cta, start: 'top 80%', once: true });

    onceInView(cta, 'top 80%', () => {
        links.forEach(el => el.classList.add('fx-busy'));
        gsap.to(links, {
            opacity: 1, x: 0, duration: 1.4, ease: 'expo.out', stagger: 0.11, delay: 0.5, clearProps: 'transform,opacity',
            onComplete: () => links.forEach(el => el.classList.remove('fx-busy'))
        });
        gsap.fromTo(cta, { '--sheen': -120 }, { '--sheen': 120, duration: 2, ease: 'power2.inOut', delay: 0.7 });
    });
    gsap.set(links, { opacity: 0, x: 44 });

    if (SplitText) {
        SplitText.create(heading, {
            type: 'lines,chars', mask: 'lines', autoSplit: true,
            onSplit: self => gsap.from(self.chars, { yPercent: 120, duration: 1.2, ease: 'expo.out', stagger: 0.02, delay: 0.25, scrollTrigger: trigger() })
        });
        SplitText.create(paragraph, {
            type: 'lines', mask: 'lines', autoSplit: true,
            onSplit: self => gsap.from(self.lines, { yPercent: 110, duration: 1.2, ease: 'expo.out', stagger: 0.1, delay: 0.7, scrollTrigger: trigger() })
        });
    } else {
        gsap.set([heading, paragraph], { opacity: 0, y: 24 });
        onceInView(cta, 'top 80%', () => gsap.to([heading, paragraph], {
            opacity: 1, y: 0, duration: 1.3, ease: 'expo.out', stagger: 0.15, delay: 0.3, clearProps: 'transform,opacity'
        }));
    }
}

function initMotion() {
    if (!hasGSAP || reduceMotion) { return; }
    gsap.registerPlugin(ScrollTrigger);
    if (SplitText) { gsap.registerPlugin(SplitText); }
    html.classList.add('fx');

    [heroMotion, revealSystem, titles, projectsSequence, dealStagger, microReveals, seams, zones, contactFinale].forEach(safe);

    window.addEventListener('load', () => {
        ScrollTrigger.refresh();
        setTimeout(() => rescuers.forEach(safe), 3500);
    });
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(() => ScrollTrigger.refresh()); }
}

/* ----------------------------------------------------------
   3. GOLD PARTICLE FIELD (Three.js)
   One fixed canvas sits behind the whole page. It reacts to scroll (depth parallax and speed),
   calms down over Featured Projects, and in the contact zone part of the field is drawn into
   a halo around the CTA card while a soft gold light blooms behind it.
   ---------------------------------------------------------- */
const THREE_URLS = [
    'https://cdn.jsdelivr.net/npm/three@0.186.1/+esm',                 // bundled + minified
    'https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.module.js' // fallback: raw module
];

async function loadThree() {
    for (const url of THREE_URLS) {
        try { return await import(url); } catch (error) { /* try the next source */ }
    }
    return null;
}

const FIELD_VERTEX = /* glsl */ `
    uniform float uTime, uDrift, uPx, uHalfW, uHalfH, uDepth, uCam, uScroll, uVel, uCalm, uHalo;
    uniform vec2 uMouse, uHaloC, uHaloR;
    attribute vec3 aSeed;
    attribute float aSize;
    varying float vAlpha;
    varying vec3 vColor;
    void main() {
        // position is normalised (-1..1) and fitted to the visible frustum at every depth,
        // so a screen-space point (like the CTA card) lines up no matter how far a particle is.
        float z = position.z * uDepth + cos(uTime * 0.18 + aSeed.x * 6.2831) * 0.16;
        float persp = (uCam - z) / uCam;
        float depth = clamp(z / uDepth * 0.5 + 0.5, 0.0, 1.0);          // 0 far .. 1 near

        // slow upward drift + scroll parallax: near dust travels further than far dust
        float k = fract(position.y * 0.5 + 0.5 + uDrift * (0.010 + aSeed.x * 0.016) + uScroll * (0.35 + depth * 1.15));
        vec2 ndc = vec2(position.x, k * 2.0 - 1.0) * 1.08;

        // contact finale: a share of the field is drawn into a squarish halo around the CTA card
        float h = fract(aSeed.x * 13.7 + aSeed.y * 5.3);
        float join = step(h, 0.78) * smoothstep(h * 0.55, h * 0.55 + 0.45, uHalo);
        float a = aSeed.x * 6.2831 + uTime * (0.10 + aSeed.y * 0.12);
        vec2 dir = vec2(cos(a), sin(a));
        dir = sign(dir) * pow(abs(dir), vec2(0.62));
        ndc = mix(ndc, uHaloC + uHaloR * dir * (1.04 + aSeed.z * 0.30), join);

        float x = ndc.x * uHalfW * persp + sin(uTime * 0.22 + aSeed.y * 6.2831) * (0.12 + aSeed.z * 0.22);
        float y = ndc.y * uHalfH * persp;
        x += uMouse.x * (0.10 + depth * 0.55);                          // pointer parallax
        y += uMouse.y * (0.10 + depth * 0.55);

        vec4 mv = modelViewMatrix * vec4(x, y, z, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = aSize * uPx * (uCam / -mv.z) * (1.0 + 0.25 * join);

        float edge = smoothstep(0.0, 0.10, k) * (1.0 - smoothstep(0.90, 1.0, k));
        edge = mix(edge, 1.0, join);
        float twinkle = 0.62 + 0.38 * sin(uTime * (0.5 + aSeed.z * 1.3) + aSeed.x * 40.0);
        float bokeh = mix(1.0, 0.45, smoothstep(2.6, 6.0, aSize));      // big discs stay softer
        vAlpha = edge * twinkle * bokeh * (1.0 - 0.4 * uCalm) * (1.0 + 0.7 * join) * (1.0 + 0.5 * min(abs(uVel), 1.0));

        vec3 gold = mix(vec3(0.788, 0.635, 0.294), vec3(0.910, 0.773, 0.435), aSeed.y); // --gold .. --gold2
        vColor = mix(gold, vec3(1.0, 0.93, 0.74), step(0.94, aSeed.z) * 0.7);            // a few bright sparks
    }
`;

const FIELD_FRAGMENT = /* glsl */ `
    varying float vAlpha;
    varying vec3 vColor;
    void main() {
        float d = length(gl_PointCoord - 0.5) * 2.0;
        if (d > 1.0) { discard; }
        gl_FragColor = vec4(vColor * 1.2, exp(-d * d * 3.6) * vAlpha);
    }
`;

const GLOW_VERTEX = /* glsl */ `
    varying vec2 vP;
    void main() { vP = position.xy; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const GLOW_FRAGMENT = /* glsl */ `
    uniform vec3 uL0, uL1;   // x, y (NDC), strength
    uniform vec2 uR0, uR1;   // radii (NDC)
    varying vec2 vP;
    void main() {
        vec2 a = (vP - uL0.xy) / uR0;
        vec2 b = (vP - uL1.xy) / uR1;
        float g = exp(-dot(a, a) * 1.6) * uL0.z + exp(-dot(b, b) * 1.6) * uL1.z;
        gl_FragColor = vec4(0.788, 0.635, 0.294, g);
    }
`;

async function initField() {
    const wrap = $('#fxParticles');
    if (!wrap) { return; }

    const THREE = await loadThree();
    if (!THREE) { wrap.remove(); return; }

    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'low-power' });
    } catch (error) { wrap.remove(); return; } // no WebGL: the page stays exactly as it was
    renderer.setClearColor(0x000000, 0);

    document.body.prepend(wrap);               // one fixed layer for the whole page
    wrap.appendChild(renderer.domElement);
    html.classList.add('fx-field');            // CSS now lets the field show through the sections

    const FOV = 40, CAM_Z = 9, DEPTH = 4.5;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 60);
    camera.position.z = CAM_Z;

    const lowPower = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4
        || window.matchMedia('(max-width: 820px)').matches;
    const area = Math.max(1, window.innerWidth * window.innerHeight);
    const count = Math.round(Math.min(850, Math.max(200, area / 2200)) * (lowPower ? 0.7 : 1));

    const position = new Float32Array(count * 3);
    const seed = new Float32Array(count * 3);
    const size = new Float32Array(count);
    for (let i = 0; i < count; i++) {
        position[i * 3] = Math.random() * 2 - 1;
        position[i * 3 + 1] = Math.random() * 2 - 1;
        position[i * 3 + 2] = Math.random() * 2 - 1;
        seed[i * 3] = Math.random();
        seed[i * 3 + 1] = Math.random();
        seed[i * 3 + 2] = Math.random();
        size[i] = 1.4 + Math.pow(Math.random(), 3) * 9; // mostly fine dust, some soft discs
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(position, 3));
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seed, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(size, 1));

    const material = new THREE.ShaderMaterial({
        vertexShader: FIELD_VERTEX,
        fragmentShader: FIELD_FRAGMENT,
        uniforms: {
            uTime: { value: 0 }, uDrift: { value: 0 }, uPx: { value: 1 }, uHalfW: { value: 1 }, uHalfH: { value: 1 },
            uDepth: { value: DEPTH }, uCam: { value: CAM_Z }, uScroll: { value: 0 }, uVel: { value: 0 },
            uCalm: { value: 0 }, uHalo: { value: 0 },
            uMouse: { value: new THREE.Vector2() }, uHaloC: { value: new THREE.Vector2() }, uHaloR: { value: new THREE.Vector2(0.5, 0.3) }
        },
        transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending
    });
    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false; // positions are normalised, so the default bounds would be wrong
    scene.add(points);

    // Soft gold light behind the project stage and the contact card.
    const glowMaterial = new THREE.ShaderMaterial({
        vertexShader: GLOW_VERTEX,
        fragmentShader: GLOW_FRAGMENT,
        uniforms: {
            uL0: { value: new THREE.Vector3() }, uR0: { value: new THREE.Vector2(1, 1) },
            uL1: { value: new THREE.Vector3() }, uR1: { value: new THREE.Vector2(1, 1) }
        },
        transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending
    });
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), glowMaterial);
    glow.frustumCulled = false;
    glow.renderOrder = -1;
    glow.visible = false;
    scene.add(glow);

    const u = material.uniforms;
    const g = glowMaterial.uniforms;

    /* Where the project stage and the CTA card live in the document (ignores GSAP transforms). */
    const anchors = { project: null, contact: null };
    const docBox = el => {
        if (!el) { return null; }
        let x = 0, y = 0, node = el;
        while (node) { x += node.offsetLeft; y += node.offsetTop; node = node.offsetParent; }
        return { cx: x + el.offsetWidth / 2, cy: y + el.offsetHeight / 2, w: el.offsetWidth, h: el.offsetHeight };
    };
    const measure = () => { anchors.project = docBox($('#fanStage')); anchors.contact = docBox($('.cta')); };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
    if (hasGSAP) { ScrollTrigger.addEventListener('refresh', measure); }

    const toNdc = (a, scrollY, cw, ch) => a && { x: a.cx / cw * 2 - 1, y: 1 - (a.cy - scrollY) / ch * 2, rx: a.w / cw, ry: a.h / ch };

    const state = { elapsed: reduceMotion ? 18 : 0, drift: reduceMotion ? 18 : 0, velocity: 0, lastY: window.scrollY, calm: 0, halo: 0 };
    const target = new THREE.Vector2();

    const step = dt => {
        const cw = wrap.clientWidth || 1, ch = wrap.clientHeight || 1;
        const scrollY = window.scrollY;
        state.elapsed += dt;
        state.velocity = damp(state.velocity, clamp((scrollY - state.lastY) / Math.max(dt, 0.001) / ch, -3, 3), 6, dt);
        state.lastY = scrollY;
        state.calm = damp(state.calm, zoneTarget.calm, 2.2, dt);
        state.halo = damp(state.halo, zoneTarget.halo, 1.3, dt);
        state.drift += dt * (1 - 0.5 * state.calm);

        u.uTime.value = state.elapsed;
        u.uDrift.value = state.drift;
        u.uScroll.value = scrollY / ch;
        u.uVel.value = state.velocity;
        u.uCalm.value = state.calm;
        u.uHalo.value = state.halo;
        u.uMouse.value.lerp(target, 1 - Math.pow(0.002, dt));

        const project = toNdc(anchors.project, scrollY, cw, ch);
        if (project) {
            g.uL0.value.set(project.x, project.y, 0.09 * state.calm);
            g.uR0.value.set(project.rx * 1.6 + 0.25, project.ry * 2.4 + 0.25);
        }
        const contact = toNdc(anchors.contact, scrollY, cw, ch);
        if (contact) {
            g.uL1.value.set(contact.x, contact.y, 0.17 * state.halo);
            g.uR1.value.set(contact.rx * 1.5 + 0.2, contact.ry * 3 + 0.3);
            u.uHaloC.value.set(contact.x, contact.y);
            u.uHaloR.value.set(contact.rx, contact.ry);
        }
        glow.visible = state.calm > 0.01 || state.halo > 0.01;
        renderer.render(scene, camera);
    };

    const resize = () => {
        const w = wrap.clientWidth, h = wrap.clientHeight;
        if (!w || !h) { return; }
        const cap = lowPower ? 1.5 : 1.75;
        const dpr = clamp(Math.min(window.devicePixelRatio || 1, cap, Math.sqrt(3.2e6 / (w * h))), 1, cap); // cap total pixels
        renderer.setPixelRatio(dpr);
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        const halfH = Math.tan(FOV * Math.PI / 360) * CAM_Z;
        u.uHalfH.value = halfH;
        u.uHalfW.value = halfH * camera.aspect;
        u.uPx.value = dpr;
        if (reduceMotion) { step(0); }
    };
    new ResizeObserver(resize).observe(wrap);
    resize();

    /* Pointer parallax (eased); touch devices just drift. */
    if (!reduceMotion) {
        window.addEventListener('pointermove', event => {
            if (event.pointerType === 'touch') { return; }
            target.set((event.clientX / window.innerWidth * 2 - 1) * 0.5, -(event.clientY / window.innerHeight * 2 - 1) * 0.35);
        }, { passive: true });
    }

    /* Render loop that sleeps whenever nobody can see it. */
    let running = false, frameId = 0, last = 0;
    const hold = { tab: document.hidden, lightbox: false };
    const frame = now => {
        frameId = requestAnimationFrame(frame);
        const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
        last = now;
        step(dt);
    };
    const sync = () => {
        const shouldRun = !hold.tab && !hold.lightbox && !reduceMotion;
        if (shouldRun && !running) { running = true; last = performance.now(); frameId = requestAnimationFrame(frame); }
        if (!shouldRun && running) { running = false; cancelAnimationFrame(frameId); }
    };
    document.addEventListener('visibilitychange', () => { hold.tab = document.hidden; sync(); });
    const lightbox = $('#lb'); // the lightbox covers the page: no need to draw behind it
    if (lightbox) {
        new MutationObserver(() => { hold.lightbox = lightbox.classList.contains('show'); sync(); })
            .observe(lightbox, { attributes: true, attributeFilter: ['class'] });
    }
    sync();

    // Fade in once the loader has lifted.
    loaderDone.then(() => requestAnimationFrame(() => wrap.classList.add('is-ready')));
}

/* ----------------------------------------------------------
   4. POINTER LAYER (fine pointers only)
   ---------------------------------------------------------- */

/* Cursor follower: a ring that lags behind a dot and changes meaning with what is under it. */
function initCursor() {
    if (!finePointer || reduceMotion || !hasGSAP) { return; }

    const cursor = document.createElement('div');
    cursor.className = 'fx-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    cursor.innerHTML = '<i class="fx-cursor-ring"><b class="fx-cursor-label"></b></i>';
    const dot = document.createElement('div');
    dot.className = 'fx-cursor-dot';
    dot.setAttribute('aria-hidden', 'true');
    document.body.append(cursor, dot);
    const label = $('.fx-cursor-label', cursor);

    // contact links announce what they do
    $$('.cta-links a').forEach(link => {
        const href = link.getAttribute('href') || '';
        link.dataset.cursor = href.startsWith('mailto:') ? 'Email' : href.startsWith('tel:') ? 'Call' : 'Open';
    });

    const ringX = gsap.quickTo(cursor, 'x', { duration: 0.55, ease: 'power3' });
    const ringY = gsap.quickTo(cursor, 'y', { duration: 0.55, ease: 'power3' });
    const dotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3' });
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3' });

    let placed = false, ready = false;
    loaderDone.then(() => { ready = true; });
    const show = on => { cursor.classList.toggle('is-on', on); dot.classList.toggle('is-on', on); };

    window.addEventListener('pointermove', event => {
        if (event.pointerType !== 'mouse') { return; }
        if (!placed) {
            placed = true;
            gsap.set([cursor, dot], { x: event.clientX, y: event.clientY });
            html.classList.add('fx-cursor-on');
        }
        if (ready && !cursor.classList.contains('is-on')) { show(true); }
        ringX(event.clientX); ringY(event.clientY);
        dotX(event.clientX); dotY(event.clientY);
    }, { passive: true });

    const INTERACTIVE = 'a, button, [role="button"], .fan-filter li, input, textarea, select, summary';
    window.addEventListener('pointerover', event => {
        const el = event.target instanceof Element ? event.target : null;
        if (!el) { return; }
        const card = el.closest('.fan-card');
        const tagged = el.closest('[data-cursor]');
        const link = el.closest(INTERACTIVE);
        const dark = Boolean(el.closest('.cta')) && !el.closest('.cta-links a, .cta-links .cta-social');
        label.textContent = card ? 'View' : tagged ? tagged.dataset.cursor : '';
        cursor.classList.toggle('is-view', Boolean(card));
        cursor.classList.toggle('is-labelled', Boolean(tagged) && !card);
        cursor.classList.toggle('is-link', Boolean(link) && !card && !tagged);
        cursor.classList.toggle('is-dark', dark);
        dot.classList.toggle('is-dark', dark);
        dot.classList.toggle('is-hidden', Boolean(card || tagged));
    }, { passive: true });

    window.addEventListener('pointerdown', () => cursor.classList.add('is-down'));
    window.addEventListener('pointerup', () => cursor.classList.remove('is-down'));
    html.addEventListener('pointerleave', () => show(false));
    html.addEventListener('pointerenter', () => { if (ready && placed) { show(true); } });
}

/* Project cards: the picture drifts against the pointer inside its frame and a glare follows it.
   The card itself is never transformed, so the fan layout stays intact. */
function initCardHover() {
    const stage = $('#fanStage');
    if (!stage || !finePointer || reduceMotion || !hasGSAP) { return; }
    html.classList.add('fx-hover');

    const rigs = new WeakMap();
    const rigFor = card => {
        let rig = rigs.get(card);
        if (!rig) {
            const img = $('img', card);
            rig = {
                img,
                x: gsap.quickTo(img, 'x', { duration: 0.7, ease: 'power3' }),
                y: gsap.quickTo(img, 'y', { duration: 0.7, ease: 'power3' })
            };
            rigs.set(card, rig);
        }
        return rig;
    };

    let current = null;
    const enter = card => {
        if (!$('.fx-glare', card)) {
            const glare = document.createElement('span');
            glare.className = 'fx-glare';
            card.appendChild(glare);
        }
        const rig = rigFor(card);
        if (rig.img) { gsap.to(rig.img, { scale: 1.12, duration: 0.8, ease: 'power3.out', overwrite: 'auto' }); }
    };
    const leave = card => {
        if (!card) { return; }
        const rig = rigFor(card);
        if (!rig.img) { return; }
        rig.x(0); rig.y(0);
        gsap.to(rig.img, { scale: 1, duration: 0.9, ease: 'power3.out', overwrite: 'auto' });
    };

    stage.addEventListener('pointermove', event => {
        const card = event.target instanceof Element ? event.target.closest('.fan-card') : null;
        if (card !== current) { leave(current); current = card; if (card) { enter(card); } }
        if (!card) { return; }
        const nx = clamp(event.offsetX / card.offsetWidth, 0, 1); // offsetX is in the card's own (rotated) space
        const ny = clamp(event.offsetY / card.offsetHeight, 0, 1);
        const rig = rigFor(card);
        if (rig.img) { rig.x((0.5 - nx) * 18); rig.y((0.5 - ny) * 18); }
        card.style.setProperty('--gx', (nx * 100).toFixed(1) + '%');
        card.style.setProperty('--gy', (ny * 100).toFixed(1) + '%');
    });
    stage.addEventListener('pointerleave', () => { leave(current); current = null; });
}

/* Contact links: the two main pills lean toward the pointer, and every link carries a glow that follows it. */
function initMagnetic() {
    const cta = $('.cta');
    if (!cta || !finePointer || reduceMotion || !hasGSAP) { return; }
    html.classList.add('fx-magnet');

    $$('.cta-links a', cta).forEach(link => {
        link.addEventListener('pointermove', event => {
            const box = link.getBoundingClientRect();
            link.style.setProperty('--fx-x', (event.clientX - box.left) + 'px');
            link.style.setProperty('--fx-y', (event.clientY - box.top) + 'px');
        });
        link.addEventListener('pointerleave', () => {
            link.style.removeProperty('--fx-x');
            link.style.removeProperty('--fx-y');
        });
    });

    // The lean is normalised by the pill's own size and capped, so wide pills never slide into their neighbours.
    const REACH = 90, MAX_X = 12, MAX_Y = 8;
    const rigs = $$('.cta-links > a', cta).map(link => ({
        link,
        x: gsap.quickTo(link, 'x', { duration: 0.7, ease: 'power3' }),
        y: gsap.quickTo(link, 'y', { duration: 0.7, ease: 'power3' })
    }));

    window.addEventListener('pointermove', event => {
        rigs.forEach(rig => {
            if (rig.link.classList.contains('fx-busy')) { return; } // wait for the entrance to finish
            const box = rig.link.getBoundingClientRect();
            const homeX = box.left + box.width / 2 - Number(gsap.getProperty(rig.link, 'x'));
            const homeY = box.top + box.height / 2 - Number(gsap.getProperty(rig.link, 'y'));
            const dx = event.clientX - homeX, dy = event.clientY - homeY;
            const near = Math.abs(dx) < box.width / 2 + REACH && Math.abs(dy) < box.height / 2 + REACH;
            rig.x(near ? clamp(dx / (box.width / 2 + REACH), -1, 1) * MAX_X : 0);
            rig.y(near ? clamp(dy / (box.height / 2 + REACH), -1, 1) * MAX_Y : 0);
        });
    }, { passive: true });
}

/* ----------------------------------------------------------
   5. PERFORMANCE: content-visibility on below-the-fold sections
   The browser skips rendering sections that are far off-screen. Placeholder heights are measured
   from the real layout (not guessed), so the page never jumps, and they are re-measured on resize.
   ---------------------------------------------------------- */
function initContentVisibility() {
    if (!('contentVisibility' in html.style)) { return; }
    const sections = $$('#profile, #skills, #contact, footer');
    let refreshTimer = 0, resizeTimer = 0;

    // contain-intrinsic-size describes the CONTENT box, so padding and borders must not be counted.
    const contentHeight = section => {
        const style = getComputedStyle(section);
        const chrome = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)
            + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
        return Number((section.getBoundingClientRect().height - chrome).toFixed(2));
    };

    const apply = () => {
        sections.forEach(section => { section.style.contentVisibility = 'visible'; });
        const heights = sections.map(contentHeight); // one forced layout
        sections.forEach((section, index) => {
            section.dataset.fxHeight = String(heights[index]);
            section.style.containIntrinsicSize = 'auto none auto ' + heights[index] + 'px'; // width: none, height: measured
            section.style.contentVisibility = 'auto';
        });
    };

    // Listen on each element itself: this event does not bubble everywhere.
    sections.forEach(section => {
        section.addEventListener('contentvisibilityautostatechange', event => {
            if (event.skipped) { return; }
            const real = contentHeight(section);
            if (Math.abs(real - Number(section.dataset.fxHeight)) > 2) { // self-correct if content changed height
                section.dataset.fxHeight = String(real);
                section.style.containIntrinsicSize = 'auto none auto ' + real + 'px';
                if (hasGSAP) { clearTimeout(refreshTimer); refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 150); }
            }
        });
    });

    window.addEventListener('load', () => {
        const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
        fontsReady.then(() => requestAnimationFrame(apply));
    });
    window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(apply, 300); });
}

/* ---------------------------------------------------------- */
[initSmoothScroll, initMotion, initField, initCursor, initCardHover, initMagnetic, initContentVisibility].forEach(safe);