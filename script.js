// ========================================
// LOADER
// ========================================
document.body.classList.add('is-loading');

window.addEventListener('load', () => {
    setTimeout(() => {
        const loader = document.getElementById('loader');

        if (loader) {
            loader.classList.add('loaded');
        }

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
        link.addEventListener('click', () => {
            fab.classList.remove('open');
        });
    });

    document.addEventListener('click', event => {
        if (!fab.contains(event.target)) {
            fab.classList.remove('open');
        }
    });
}


// ========================================
// ACTIVE SECTION NAVIGATION
// ========================================
const links = [...document.querySelectorAll('.fab-menu a')];

if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    links.forEach(link => {
                        link.classList.toggle(
                            'active',
                            link.getAttribute('href') ===
                            '#' + entry.target.id
                        );
                    });
                }
            });
        },
        {
            threshold: 0.35
        }
    );

    document.querySelectorAll('section[id]').forEach(section => {
        spy.observe(section);
    });
}


// ========================================
// REVEAL ANIMATIONS AND COUNTERS
// ========================================
const count = element => {
    const target = Number(element.dataset.count);

    if (!Number.isFinite(target)) {
        return;
    }

    let number = 0;
    const step = Math.max(1, Math.ceil(target / 30));

    const interval = setInterval(() => {
        number = Math.min(target, number + step);
        element.textContent = number;

        if (number >= target) {
            clearInterval(interval);
        }
    }, 40);
};

if ('IntersectionObserver' in window) {
    const rev = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in');

                    entry.target
                        .querySelectorAll('[data-count]')
                        .forEach(count);

                    rev.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.15
        }
    );

    document.querySelectorAll('.reveal').forEach(element => {
        rev.observe(element);
    });
} else {
    document.querySelectorAll('.reveal').forEach(element => {
        element.classList.add('in');
    });
}


// ========================================
// CARD SPOTLIGHT EFFECT
// ========================================
document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mousemove', event => {
        const rect = card.getBoundingClientRect();

        card.style.setProperty(
            '--mx',
            (event.clientX - rect.left) + 'px'
        );

        card.style.setProperty(
            '--my',
            (event.clientY - rect.top) + 'px'
        );
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
        i: [
            "capstone1.jpg",
            "capstone2.jpg",
            "capstone4.jpg",
            "landing.png"
        ]
    },

    posters: {
        t: "Poster Designs",
        d: "Poster and graphic design work.",
        i: [
            "poster1.jpg",
            "poster2.jpg",
            "poster3.jpg",
            "poster4.jpg",
            "poster5.jpg",
            "Poster6.jpg",
            "Poster7.jpg",
            "Poster8.jpg",
            "Poster10.jpg",
            "Poster11.jpg",
            "Knight1.2.jpg",
            "TakingOver.jpg"
        ]
    },

    logos: {
        t: "Logo Designs",
        d: "Logo concepts and brand marks.",
        i: [
            "Logo3.png",
            "Logo4.png",
            "Logo5.png",
            "Logo6.png",
            "Logo7.png",
            "Logo8.png",
            "Logo9.png",
            "Logo10.png",
            "Logo11.jpg",
            "Logo12.png",
            "Logo13.png"
        ]
    },

    koa: {
        t: "KOA Brand Identity",
        d: "Logo and submark for KOA, shown on packaging and lobby mockups.",
        i: [
            "KOA submark-02.jpg",
            "KOA1-01.jpg",
            "KOA-jar.png",
            "KOA-mug.png",
            "KOA-productbox.png",
            "KOA_Lobby.png"
        ]
    },

    visual: {
        t: "Visual Graphics",
        d: "Visual graphic design pieces.",
        i: [
            "Expo.jpg",
            "visiual2024.jpg",
            "visiual2025.jpg",
            "visiual2025(2).jpg"
        ]
    },

    pins: {
        t: "Pin Designs",
        d: "Pin designs.",
        i: [
            "Pin1.jpg",
            "Pin2.jpg",
            "Pin3.jpg",
            "Pin4.jpg",
            "Pin5.jpg",
            "Pin6.jpg"
        ]
    },

    tshirts: {
        t: "T-Shirt Designs",
        d: "Apparel and t-shirt designs.",
        i: [
            "Tshirt1.png",
            "Tshirt2.png",
            "Tshirt3.png",
            "Tshirt4.png",
            "Tshirt5.png",
            "Tshirt6.png",
            "Tshirt7.png"
        ]
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


// ========================================
// DISPLAY LIGHTBOX IMAGE
// ========================================
function show(i) {
    const group = G[cur];

    if (!group || !group.i.length || !img) {
        return;
    }

    idx = (i + group.i.length) % group.i.length;

    img.src = group.i[idx];

    const counter = document.getElementById('lbC');

    if (counter) {
        counter.textContent =
            (idx + 1) + ' / ' + group.i.length;
    }

    if (th) {
        [...th.children].forEach((thumbnail, k) => {
            thumbnail.classList.toggle('on', k === idx);
        });
    }
}


// ========================================
// OPEN PROJECT LIGHTBOX
// ========================================
function open(k) {
    const group = G[k];

    if (!group || !lb || !img || !th) {
        return;
    }

    cur = k;

    document.getElementById('lbT').textContent = group.t;
    document.getElementById('lbD').textContent = group.d;

    const link = document.getElementById('lbL');

    if (link) {
        if (group.l) {
            link.style.display = 'inline-block';
            link.href = group.l;
        } else {
            link.style.display = 'none';
            link.removeAttribute('href');
        }
    }

    // Create image thumbnails
    th.innerHTML = '';

    group.i.forEach((src, index) => {
        const thumbnail = document.createElement('img');

        thumbnail.src = src;
        thumbnail.alt = group.t + ' image ' + (index + 1);
        thumbnail.loading = 'lazy';

        thumbnail.addEventListener('click', () => {
            show(index);
        });

        th.appendChild(thumbnail);
    });

    // Display the first image
    show(0);

    lb.classList.add('show');
    document.body.style.overflow = 'hidden';
}


// ========================================
// CLOSE PROJECT LIGHTBOX
// ========================================
function close() {
    if (!lb) {
        return;
    }

    lb.classList.remove('show');
    document.body.style.overflow = '';
}


// ========================================
// PROJECT CARD CLICK EVENTS
// ========================================
document.querySelectorAll('.proj').forEach(project => {
    project.addEventListener('click', () => {
        open(project.dataset.g);
    });
});


// ========================================
// LIGHTBOX BUTTON EVENTS
// ========================================
const lbX = document.getElementById('lbX');
const lbP = document.getElementById('lbP');
const lbN = document.getElementById('lbN');

if (lbX) {
    lbX.addEventListener('click', close);
}

if (lbP) {
    lbP.addEventListener('click', () => {
        show(idx - 1);
    });
}

if (lbN) {
    lbN.addEventListener('click', () => {
        show(idx + 1);
    });
}


// ========================================
// CLOSE LIGHTBOX WHEN CLICKING OUTSIDE
// ========================================
if (lb) {
    lb.addEventListener('click', event => {
        if (event.target === lb) {
            close();
        }
    });
}


// ========================================
// KEYBOARD NAVIGATION
// ========================================
document.addEventListener('keydown', event => {
    if (!lb || !lb.classList.contains('show')) {
        return;
    }

    if (event.key === 'Escape') {
        close();
    }

    if (event.key === 'ArrowLeft') {
        show(idx - 1);
    }

    if (event.key === 'ArrowRight') {
        show(idx + 1);
    }
});