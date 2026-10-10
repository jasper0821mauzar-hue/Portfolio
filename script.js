// ========================================
// LOADER
// ========================================
document.body.classList.add('is-loading');

window.addEventListener('load', () => {
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader) { loader.classList.add('loaded'); }
        document.body.classList.remove('is-loading');
    }, 900);
});

// ========================================
// FLOATING MENU
// ========================================
const fab = document.getElementById('fab');
const fabBtn = document.getElementById('fabBtn');

if (fab && fabBtn) {
    fabBtn.addEventListener('click', event => {
        event.stopPropagation();
        fab.classList.toggle('open');
    });
    document.querySelectorAll('.fab-menu a').forEach(link => {
        link.addEventListener('click', () => { fab.classList.remove('open'); });
    });
    document.addEventListener('click', event => {
        if (!fab.contains(event.target)) { fab.classList.remove('open'); }
    });
}

// ========================================
// ACTIVE SECTION NAVIGATION
// ========================================
const links = [...document.querySelectorAll('.fab-menu a')];

if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                links.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
                });
            }
        });
    }, { threshold: 0.35 });
    document.querySelectorAll('section[id]').forEach(section => { spy.observe(section); });
}

// ========================================
// REVEAL ANIMATIONS AND COUNTERS
// ========================================
const count = element => {
    const target = Number(element.dataset.count);
    if (!Number.isFinite(target)) { return; }
    let number = 0;
    const step = Math.max(1, Math.ceil(target / 30));
    const interval = setInterval(() => {
        number = Math.min(target, number + step);
        element.textContent = number;
        if (number >= target) { clearInterval(interval); }
    }, 40);
};

if ('IntersectionObserver' in window) {
    const rev = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in');
                entry.target.querySelectorAll('[data-count]').forEach(count);
                rev.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal').forEach(element => { rev.observe(element); });
} else {
    document.querySelectorAll('.reveal').forEach(element => { element.classList.add('in'); });
}

// ========================================
// CARD SPOTLIGHT EFFECT
// ========================================
document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mousemove', event => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', (event.clientX - rect.left) + 'px');
        card.style.setProperty('--my', (event.clientY - rect.top) + 'px');
    });
});

// ========================================
// PROJECT LIGHTBOX DATA
// ========================================
const G = {
    capstone: {
        t: "Ecodrip IoT Capstone",
        d: "Ecodrip: An IoT Web-Based Japanese Eggplant Drip Irrigation with Smart Filtration System for Cuya's Farm. Developed by a three-member team, featuring a responsive web interface optimized for desktop and mobile, enabling efficient monitoring and management of irrigation processes to support sustainable farming practices.",
        l: "https://ecodrip-f6d59.web.app/",
        i: ["capstone1.jpg", "capstone2.jpg", "capstone4.jpg", "landing.png"]
    },
    posters: {
        t: "Poster Designs",
        d: "Poster and graphic design work.",
        i: ["poster1.jpg","poster2.jpg","poster3.jpg","poster4.jpg","poster5.jpg","Poster6.jpg","Poster7.jpg","Poster8.jpg","Poster10.jpg","Poster11.jpg","Knight1.2.jpg","TakingOver.jpg"]
    },
    logos: {
        t: "Logo Designs",
        d: "Logo concepts and brand marks.",
        i: ["Logo3.png","Logo4.png","Logo5.png","Logo6.png","Logo7.png","Logo8.png","Logo9.png","Logo10.png","Logo11.jpg","Logo12.png","Logo13.png"]
    },
    koa: {
        t: "KOA Brand Identity",
        d: "Logo and submark for KOA, shown on packaging and lobby mockups.",
        i: ["KOA submark-02.jpg","KOA1-01.jpg","KOA-jar.png","KOA-mug.png","KOA-productbox.png","KOA_Lobby.png"]
    },
    visual: {
        t: "Visual Graphics",
        d: "Visual graphic design pieces.",
        i: ["Expo.jpg","visiual2024.jpg","visiual2025.jpg","visiual2025(2).jpg"]
    },
    pins: {
        t: "Pin Designs",
        d: "Pin designs.",
        i: ["Pin1.jpg","Pin2.jpg","Pin3.jpg","Pin4.jpg","Pin5.jpg","Pin6.jpg"]
    },
    tshirts: {
        t: "T-Shirt Designs",
        d: "Apparel and t-shirt designs.",
        i: ["Tshirt1.png","Tshirt2.png","Tshirt3.png","Tshirt4.png","Tshirt5.png","Tshirt6.png","Tshirt7.png"]
    }
};

// ========================================
// LIGHTBOX ELEMENTS
// ========================================
const lb = document.getElementById('lb');
const img = document.getElementById('lbImg');
const th = document.getElementById('lbTh');

let cur = null;
let idx = 0;

function show(i) {
    const group = G[cur];
    if (!group || !group.i.length || !img) { return; }
    idx = (i + group.i.length) % group.i.length;
    img.src = group.i[idx];
    const counter = document.getElementById('lbC');
    if (counter) { counter.textContent = (idx + 1) + ' / ' + group.i.length; }
    if (th) { [...th.children].forEach((thumbnail, k) => { thumbnail.classList.toggle('on', k === idx); }); }
}

function open(k) {
    const group = G[k];
    if (!group || !lb || !img || !th) { return; }
    cur = k;
    document.getElementById('lbT').textContent = group.t;
    document.getElementById('lbD').textContent = group.d;
    const link = document.getElementById('lbL');
    if (link) {
        if (group.l) { link.style.display = 'inline-block'; link.href = group.l; }
        else { link.style.display = 'none'; link.removeAttribute('href'); }
    }
    th.innerHTML = '';
    group.i.forEach((src, index) => {
        const thumbnail = document.createElement('img');
        thumbnail.src = src;
        thumbnail.alt = group.t + ' image ' + (index + 1);
        thumbnail.loading = 'lazy';
        thumbnail.addEventListener('click', () => { show(index); });
        th.appendChild(thumbnail);
    });
    show(0);
    lb.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function close() {
    if (!lb) { return; }
    lb.classList.remove('show');
    document.body.style.overflow = '';
}

const lbX = document.getElementById('lbX');
const lbP = document.getElementById('lbP');
const lbN = document.getElementById('lbN');

if (lbX) { lbX.addEventListener('click', close); }
if (lbP) { lbP.addEventListener('click', () => { show(idx - 1); }); }
if (lbN) { lbN.addEventListener('click', () => { show(idx + 1); }); }

if (lb) { lb.addEventListener('click', event => { if (event.target === lb) { close(); } }); }

document.addEventListener('keydown', event => {
    if (!lb || !lb.classList.contains('show')) { return; }
    if (event.key === 'Escape') { close(); }
    if (event.key === 'ArrowLeft') { show(idx - 1); }
    if (event.key === 'ArrowRight') { show(idx + 1); }
});


// ===== PROJECTS: FAN CARDS (radial half-circle) =====
// (uses G, open() and show() that already exist above)
const FAN_ORDER = ['posters','logos','koa','visual','pins','tshirts','capstone'];
const FAN_LABEL = {posters:'Posters',logos:'Logos',koa:'KOA Brand',visual:'Visual Graphics',pins:'Pins',tshirts:'T-Shirts',capstone:'Ecodrip Capstone'};

const fanFilter = document.getElementById('fanFilter');
const fanStage  = document.getElementById('fanStage');
const fanTitle  = document.getElementById('fanTitle');
const fanHint   = document.getElementById('fanHint');
const fanLive   = document.getElementById('fanLive');
const canHover  = window.matchMedia('(hover:hover)').matches;

// Lay cards on a half-circle (an arc, not a full circle) below the stage center.
// radius/spread shrink automatically as the card count grows, so edge cards
// never fly outside the stage and never need an extra "catch up" jump.
function layoutFan(cards) {
    const n = cards.length;
    const stageW = fanStage.clientWidth || 640;
    const maxSweep = 150;                                   // total arc in degrees (half-circle-ish, not full 180+)
    const sweep = n > 1 ? Math.min(maxSweep, 18 * (n - 1)) : 0;
    const startAngle = -90 - sweep / 2;                      // centered, opening upward
    const radius = Math.min(stageW * 0.32, 190);

    cards.forEach((card, index) => {
        const t = n > 1 ? index / (n - 1) : 0.5;
        const deg = startAngle + sweep * t;
        const rad = deg * Math.PI / 180;
        const x = Math.cos(rad) * radius;
        const y = Math.sin(rad) * radius;
        const rot = deg + 90;                                // card tilts to follow the arc

        card.style.setProperty('--x', x.toFixed(1) + 'px');
        card.style.setProperty('--y', y.toFixed(1) + 'px');
        card.style.setProperty('--r', rot.toFixed(1) + 'deg');
        card.style.setProperty('--z', index + 1);
    });
}

function renderFan(key, autoSpread) {
    const group = G[key];
    if (!group || !fanStage) return;

    fanStage.classList.remove('spread');
    fanStage.innerHTML = '';

    const cards = group.i.map((src, index) => {
        const card = document.createElement('div');
        card.className = 'fan-card';

        const pic = document.createElement('img');
        pic.src = src;
        pic.alt = group.t + ' ' + (index + 1);
        pic.loading = 'lazy';
        card.appendChild(pic);

        card.addEventListener('click', () => {
            if (!fanStage.classList.contains('spread')) {
                fanStage.classList.add('spread');   // first tap on touch screens spreads the cards
                if (!canHover) return;
            }
            open(key);
            show(index);
        });

        fanStage.appendChild(card);
        return card;
    });

    layoutFan(cards);

    fanTitle.textContent = group.t + ' · ' + group.i.length;
    fanHint.textContent = canHover ? 'Hover to spread · click a card to open' : 'Tap a card to open';

    if (fanLive) {
        fanLive.classList.toggle('show', Boolean(group.l));
        fanLive.innerHTML = group.l
            ? '<a href="' + group.l + '" target="_blank" rel="noopener">View live project &#8599;</a>'
            : '';
    }

    [...fanFilter.children].forEach(li =>
        li.firstChild.classList.toggle('on', li.dataset.k === key));

    if (autoSpread) {
        setTimeout(() => fanStage.classList.add('spread'), 80);
    }
}

if (fanFilter && fanStage) {
    FAN_ORDER.forEach(key => {
        if (!G[key]) return;
        const li = document.createElement('li');
        li.dataset.k = key;
        li.innerHTML = '<button type="button">' + FAN_LABEL[key] + '<small>' + G[key].i.length + '</small></button>';
        li.firstChild.addEventListener('click', () => renderFan(key, true));
        fanFilter.appendChild(li);
    });

    // compact by default; spreads only on hover (desktop) or tap (touch)
    fanStage.addEventListener('mouseenter', () => { if (canHover) fanStage.classList.add('spread'); });
    fanStage.addEventListener('mouseleave', () => { if (canHover) fanStage.classList.remove('spread'); });

    renderFan('posters', false);
}