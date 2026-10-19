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
// Builds a simple case study from facts only (no invented process or results)
function makeCase(title, overview, client, type, role, tools) {
    return {
        title: title,
        sections: [
            { h: "Overview", p: [overview] },
            { h: "Client", p: [client] },
            { h: "Project type", p: [type] },
            { h: "My role", p: [role] },
            { h: "Tools", tags: tools || ["Affinity Photo", "Affinity Designer"] }
        ]
    };
}

const G = {
    koa: {
        t: "K\u014cA Brand Identity",
        d: "K\u014cA is a modern specialty coffee and ready-to-drink beverage brand for young, ambitious, and creative people.",
        sections: [
            {
                k: "logo", label: "Logo",
                i: ["KOA1-01.jpg", "KOA submark-02.jpg"],
                c: ["K\u014cA logo.", "K\u014cA submark."]
            },
            {
                k: "mockups", label: "Mockups",
                i: ["KOA-jar.png", "KOA-mug.png", "KOA-productbox.png", "KOA_Lobby.png"],
                c: ["Jar packaging mockup.", "Mug mockup.", "Product box mockup.", "Lobby mockup."]
            }
        ],
        cs: {
            all: {
                title: "Case study: K\u014cA branding and mockups",
                summary: "K\u014cA is a modern specialty coffee brand for young, ambitious, and creative people who want quality coffee that fits their everyday movement and lifestyle.",
                sections: [
                    { h: "Brand Context", p: [
                        "K\u014cA is a modern specialty coffee and ready-to-drink beverage brand aimed at young adults who live active, creative, and fast-paced lifestyles.",
                        "The brand is built around the idea of strength, confidence, and movement. The name is inspired by the Hawaiian word koa, associated with a warrior or brave person, as well as the koa tree.",
                        "K\u014cA wants to provide coffee that feels energizing but approachable, with a visual identity that stands apart from typical coffee brands that rely on coffee cups, beans, brown tones, and handwritten typography."
                    ]},
                    { h: "Target Audience", tags: ["18\u201335 years old", "College students", "Young professionals", "Freelancers", "Creatives", "Coffee enthusiasts", "Social-media-conscious consumers"] },
                    { h: "Brand Personality", tags: ["Modern", "Confident", "Creative", "Warm", "Approachable", "Slightly Premium"] },
                    { h: "Core Message", p: ["Coffee for people who move with purpose."] },
                    { h: "Visual Direction", p: ["The identity communicates natural strength and modern simplicity, which is why the koa tree serves as the main visual symbol rather than an obvious coffee-related icon."] },
                    { h: "Why it works", list: [
                        "It avoids the coffee clich\u00e9s. The koa tree is the symbol instead of a cup or a bean, so the brand stands apart from typical coffee brands, as the brief required.",
                        "The name, the symbol and the message all point to one idea: strength and movement. A warrior, a tree, and \u201cCoffee for people who move with purpose.\u201d",
                        "The personality (modern, confident, approachable, slightly premium) matches an audience of students, young professionals and creatives.",
                        "The submark gives a simpler, smaller version of the logo for tight spaces, while the full logo handles larger applications."
                    ]}
                ]
            }
        }
    },
    noirrose: {
        t: "Noir Rose Brand Identity",
        d: "Noir Rose is a concept fragrance house with a quiet, old-money luxury feel: black, gold, and a sparing oxblood red.",
        sections: [
            {
                k: "logo", label: "Logo",
                i: ["noir rose-01.png", "noir rose-02.png", "noir rose-03.png"],
                c: [
                    "Concept 1: an abstract rose emblem in black and bronze, the darkest of the three.",
                    "Concept 2: a rose on a stem with a diamond accent.",
                    "Concept 3: a red rose growing out of the N R monogram. The selected direction."
                ]
            },
            {
                k: "mockups", label: "Mockups", soon: true,
                i: [], c: [],
                soonText: "Brand office, product packaging and the product itself."
            }
        ],
        cs: {
            all: {
                title: "Case study: Noir Rose brand concept",
                summary: "Noir Rose is a concept fragrance house built around quiet, old-money luxury: dark glass, amber and smoke, with a red rose as the focal point.",
                sections: [
                    { h: "The Brief", p: [
                        "Noir Rose is a new fragrance house going for a quiet, old-money luxury feel rather than anything trendy or loud.",
                        "The inspiration is dark glass bottles, amber and smoke notes with a hint of leather or oud underneath, the kind of scent you would expect to find on a grandmother's vanity table rather than something unboxed for social media."
                    ]},
                    { h: "Colour Direction", p: [
                        "Black is the base. Gold is used for the lettering and metallic details. A deep maroon or oxblood red is used sparingly, such as on the bottle cap or behind the rose, so the rose in the name still shows without overpowering the black and gold."
                    ], swatches: [
                        { n: "Black", h: "#050605" },
                        { n: "Gold", h: "#B28357" },
                        { n: "Light gold", h: "#E2C29D" },
                        { n: "Oxblood", h: "#5A0F1E" },
                        { n: "Oxblood highlight", h: "#A02A3C" }
                    ]},
                    { h: "Concept Exploration", p: [
                        "I sketched four directions by hand and digitized three of them: an abstract rose emblem in black and bronze, a rose on a stem with a diamond accent, and a red rose growing out of an N R monogram."
                    ]},
                    { h: "Selected Direction", p: [
                        "The red rose growing out of the N R monogram. It is the only concept that brings the oxblood red of the brief into the rose itself, and it joins the initials and the flower into one mark."
                    ]},
                    { h: "Why it works", list: [
                        "The red rose is the focal point. The dark red gradient gives the name Noir Rose real presence, while the rest of the mark stays in bronze and gold.",
                        "The metallic gold finish on the lettering and monogram gives an old-world feel that fits the amber and leather mood of the brief.",
                        "The tall N R grows into the rose, so the initials and the flower read as one mark.",
                        "The classic serif wordmark with \u201cEau de Parfum\u201d below states the product and keeps the tone elegant and quiet.",
                        "It is distinctive. A simple rose on a stem could belong to any upscale rose brand, while a rose growing out of the N R reads as Noir Rose."
                    ]},
                    { h: "Project Type", p: ["Self-initiated concept project. Mockups for the brand office, product packaging and the product itself are coming soon."] }
                ]
            }
        }
    },
    capstone: {
        t: "Ecodrip IoT Capstone",
        d: "Ecodrip: An IoT Web-Based Japanese Eggplant Drip Irrigation with Smart Filtration System for Cuya's Farm. Developed by a three-member team, featuring a responsive web interface optimized for desktop and mobile, enabling efficient monitoring and management of irrigation processes to support sustainable farming practices.",
        l: "https://ecodrip-f6d59.web.app/",
        i: ["capstone1.jpg", "capstone2.jpg", "capstone4.jpg", "landing.png"]
    },
    logos: {
        t: "Logo Designs",
        d: "Logo and brand design work for clients.",
        c: [
            "Brand design for an Android OS, a student project.",
            "Logo I made for our local Drum and Lyre band group, designed back in 2019."
        ],
        i: ["Logo3.png","Logo6.png"],
        cs: {
            0: makeCase("Case study: Android OS brand design",
                "A brand design for an Android OS, created as a student project.",
                "Done for a client as part of a student project.",
                "Client project (student project)",
                "Brand and logo design"),
            1: makeCase("Case study: Drum and Lyre band logo",
                "A logo for our local Drum and Lyre band group, designed back in 2019.",
                "Local Drum and Lyre band group.",
                "Client project",
                "Logo design",
                ["Adobe Illustrator"])
        }
    },
    posters: {
        t: "Poster Designs",
        d: "Story and product posters.",
        c: [
            "A poster about a knight who went on a journey and overcame every challenge for his beloved princess.",
            "A beverage product poster for a drink.",
            "A lipstick branding product poster.",
            "A shoes branding product poster.",
            "A horror movie poster."
        ],
        i: ["Knight1.2.jpg","poster1.jpg","poster3.jpg","poster5.jpg","TakingOver.jpg"],
        cs: {
            0: makeCase("Case study: The knight poster",
                "A poster about a knight who went on a journey and overcame every challenge for his beloved princess.",
                "None. This is a personal project.",
                "Personal project",
                "Poster design"),
            1: makeCase("Case study: Beverage product poster",
                "A product poster for a drink.",
                "Made for a client.",
                "Commission-based project",
                "Poster design",
                ["Adobe Photoshop"]),
            2: makeCase("Case study: Lipstick branding poster",
                "A branding product poster for a lipstick.",
                "Made for a client.",
                "Commission-based project",
                "Poster design",
                ["Adobe Photoshop"]),
            3: makeCase("Case study: Shoes branding poster",
                "A branding product poster for a pair of shoes.",
                "Made for a client.",
                "Commission-based project",
                "Poster design",
                ["Adobe Photoshop"]),
            4: makeCase("Case study: Horror movie poster",
                "A horror movie poster.",
                "None. This is a personal project.",
                "Personal project",
                "Poster design")
        }
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
    },
    infographics: {
        t: "Infographics",
        d: "Infographic slides from a freelance project.",
        i: ["Slide2.JPG","Slide3.JPG","Slide4.JPG","Slide5.JPG","Slide6.jpg"]
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

let curSec = null;

// Returns the image list for a group, or for one section of a group (e.g. Logo / Mockups)
function getView(k, s) {
    const g = G[k];
    if (!g) { return null; }
    if (g.sections) {
        const sec = g.sections.find(x => x.k === s) || g.sections[0];
        return { i: sec.i || [], c: sec.c || [], soon: Boolean(sec.soon), sec: sec, group: g };
    }
    return { i: g.i || [], c: g.c || [], soon: false, sec: null, group: g };
}

function renderCase(group, index) {
    const box = document.getElementById('lbCS');
    if (!box) { return; }
    box.innerHTML = '';
    const data = group.cs && (group.cs[index] || group.cs.all);
    if (!data) { box.style.display = 'none'; return; }
    box.style.display = 'block';

    const title = document.createElement('h4');
    title.textContent = data.title;
    box.appendChild(title);

    if (data.summary) {
        const lead = document.createElement('p');
        lead.className = 'cs-lead';
        lead.textContent = data.summary;
        box.appendChild(lead);
    }

    data.sections.forEach(sec => {
        const wrap = document.createElement('div');
        wrap.className = 'cs-sec';
        const h = document.createElement('h5');
        h.textContent = sec.h;
        wrap.appendChild(h);
        (sec.p || []).forEach(text => {
            const p = document.createElement('p');
            p.textContent = text;
            wrap.appendChild(p);
        });
        if (sec.list) {
            const ul = document.createElement('ul');
            sec.list.forEach(text => {
                const li = document.createElement('li');
                li.textContent = text;
                ul.appendChild(li);
            });
            wrap.appendChild(ul);
        }
        if (sec.swatches) {
            const row = document.createElement('div');
            row.className = 'cs-swatches';
            sec.swatches.forEach(sw => {
                const item = document.createElement('div');
                item.className = 'sw';
                const chip = document.createElement('i');
                chip.style.background = sw.h;
                const label = document.createElement('span');
                label.textContent = sw.n + ' ' + sw.h;
                item.appendChild(chip);
                item.appendChild(label);
                row.appendChild(item);
            });
            wrap.appendChild(row);
        }
        if (sec.tags) {
            const tags = document.createElement('div');
            tags.className = 'cs-tags';
            sec.tags.forEach(text => {
                const tag = document.createElement('span');
                tag.textContent = text;
                tags.appendChild(tag);
            });
            wrap.appendChild(tags);
        }
        box.appendChild(wrap);
    });
}

function show(i) {
    const view = getView(cur, curSec);
    if (!view || !view.i.length || !img) { return; }
    const group = view.group;
    idx = (i + view.i.length) % view.i.length;
    img.src = view.i[idx];
    const caption = view.c[idx] || '';
    img.alt = caption || group.t;
    const desc = document.getElementById('lbD');
    if (desc) { desc.textContent = caption || group.d; }
    renderCase(group, idx);
    const counter = document.getElementById('lbC');
    if (counter) { counter.textContent = (idx + 1) + ' / ' + view.i.length; }
    if (th) { [...th.children].forEach((thumbnail, k) => { thumbnail.classList.toggle('on', k === idx); }); }
}

function open(k, s) {
    const view = getView(k, s);
    if (!view || !view.i.length || !lb || !img || !th) { return; }
    const group = view.group;
    cur = k;
    curSec = view.sec ? view.sec.k : null;
    document.getElementById('lbT').textContent = group.t;
    document.getElementById('lbD').textContent = group.d;
    const link = document.getElementById('lbL');
    if (link) {
        if (group.l) { link.style.display = 'inline-block'; link.href = group.l; }
        else { link.style.display = 'none'; link.removeAttribute('href'); }
    }
    th.innerHTML = '';
    view.i.forEach((src, index) => {
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
const FAN_ORDER = ['koa','noirrose','capstone','logos','posters','visual','pins','tshirts','infographics'];
const FAN_LABEL = {koa:'K\u014cA Brand',noirrose:'Noir Rose',capstone:'Ecodrip Capstone',logos:'Logos',posters:'Posters',visual:'Visual Graphics',pins:'Pins',tshirts:'T-Shirts',infographics:'Infographics'};

const fanFilter = document.getElementById('fanFilter');
const fanStage  = document.getElementById('fanStage');
const fanTitle  = document.getElementById('fanTitle');
const fanHint   = document.getElementById('fanHint');
const fanLive   = document.getElementById('fanLive');
const canHover  = window.matchMedia('(hover:hover)').matches;
let fanSeen = false;   // true once the cards have fanned out for the visitor

// Logo / Mockups selector shown above the stage for groups that have sections
const fanTabs = document.createElement('div');
fanTabs.className = 'fan-tabs';
fanTabs.id = 'fanTabs';
fanTabs.style.display = 'none';
if (fanStage && fanStage.parentNode) { fanStage.parentNode.insertBefore(fanTabs, fanStage); }

function totalCount(group) {
    return group.sections ? group.sections.reduce((n, s) => n + (s.i ? s.i.length : 0), 0) : group.i.length;
}

function renderTabs(key, activeKey) {
    const group = G[key];
    fanTabs.innerHTML = '';
    if (!group || !group.sections) { fanTabs.style.display = 'none'; return; }
    fanTabs.style.display = 'flex';
    group.sections.forEach(sec => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = sec.label;
        if (sec.soon) {
            const note = document.createElement('small');
            note.textContent = 'Soon';
            button.appendChild(note);
        }
        button.classList.toggle('on', sec.k === activeKey);
        button.addEventListener('click', () => renderFan(key, true, sec.k));
        fanTabs.appendChild(button);
    });
}

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

function renderFan(key, autoSpread, secKey) {
    const group = G[key];
    if (!group || !fanStage) return;

    const view = getView(key, secKey);
    const activeKey = view.sec ? view.sec.k : '';

    fanStage.classList.remove('spread');
    fanStage.innerHTML = '';
    fanStage.dataset.group = key;     // lets CSS style specific groups (e.g. landscape infographics)
    fanStage.dataset.view = activeKey; // lets CSS style logo / mockup views

    renderTabs(key, activeKey);

    [...fanFilter.children].forEach(li =>
        li.firstChild.classList.toggle('on', li.dataset.k === key));

    // "Coming soon" section (no images yet)
    if (view.soon) {
        const soon = document.createElement('div');
        soon.className = 'fan-soon';
        const heading = document.createElement('b');
        heading.textContent = 'Coming Soon';
        const text = document.createElement('span');
        text.textContent = view.sec.soonText || 'This section is on its way.';
        soon.appendChild(heading);
        soon.appendChild(text);
        fanStage.appendChild(soon);
        fanTitle.textContent = group.t + ' \u00b7 ' + view.sec.label;
        fanHint.textContent = 'Coming soon';
        if (fanLive) { fanLive.classList.remove('show'); fanLive.innerHTML = ''; }
        return;
    }

    const cards = view.i.map((src, index) => {
        const card = document.createElement('div');
        card.className = 'fan-card';

        const pic = document.createElement('img');
        pic.src = src;
        pic.alt = view.c[index] || (group.t + ' ' + (index + 1));
        pic.loading = 'lazy';
        card.appendChild(pic);

        card.addEventListener('click', () => {
            if (!fanStage.classList.contains('spread')) {
                fanStage.classList.add('spread');   // first tap on touch screens spreads the cards
                if (!canHover) return;
            }
            open(key, activeKey);
            show(index);
        });

        fanStage.appendChild(card);
        return card;
    });

    layoutFan(cards);

    fanTitle.textContent = group.t + ' \u00b7 ' + (view.sec ? view.sec.label + ' \u00b7 ' : '') + view.i.length;
    fanHint.textContent = canHover ? 'Click a card to open' : 'Tap a card to open';

    if (fanLive) {
        fanLive.classList.toggle('show', Boolean(group.l));
        fanLive.innerHTML = group.l
            ? '<a href="' + group.l + '" target="_blank" rel="noopener">View live project &#8599;</a>'
            : '';
    }

    if (autoSpread || fanSeen) {
        setTimeout(() => fanStage.classList.add('spread'), 80);
    }
}

if (fanFilter && fanStage) {
    FAN_ORDER.forEach(key => {
        if (!G[key]) return;
        const li = document.createElement('li');
        li.dataset.k = key;
        li.innerHTML = '<button type="button">' + FAN_LABEL[key] + '<small>' + totalCount(G[key]) + '</small></button>';
        li.firstChild.addEventListener('click', () => renderFan(key, true));
        fanFilter.appendChild(li);
    });

    renderFan('koa', false);

    // cards fan out automatically the first time the projects section scrolls into view
    if ('IntersectionObserver' in window) {
        const fanObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    fanSeen = true;
                    fanStage.classList.add('spread');
                    fanObserver.disconnect();
                }
            });
        }, { threshold: 0.35 });
        fanObserver.observe(fanStage);
    } else {
        fanSeen = true;
        fanStage.classList.add('spread');
    }
}
