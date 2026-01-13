// Generate Stars
const starsContainer = document.getElementById('stars');
for (let i = 0; i < 200; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.animationDelay = Math.random() * 3 + 's';
    starsContainer.appendChild(star);
}

// Generate Comets with Random Speed and Size
const cometContainer = document.getElementById('cometContainer');

function createComet() {
    const comet = document.createElement('div');
    comet.className = 'comet';
    
    // Random size between 3px and 8px
    const size = Math.random() * 5 + 3;
    comet.style.width = size + 'px';
    comet.style.height = size + 'px';
    
    // Random starting position (right and top edges)
    const startX = Math.random() * 100 + 100; // Start from right side (100-200vw)
    const startY = Math.random() * 50; // Random top position (0-50vh)
    
    comet.style.right = -startX + 'vw';
    comet.style.top = startY + 'vh';
    
    // Random duration between 3s and 8s for varying speeds
    const duration = Math.random() * 5 + 3;
    comet.style.animationDuration = duration + 's';
    
    // Random delay before starting
    const delay = Math.random() * 5;
    comet.style.animationDelay = delay + 's';
    
    cometContainer.appendChild(comet);
    
    // Remove comet after animation completes
    setTimeout(() => {
        comet.remove();
    }, (duration + delay) * 1000);
}

// Create initial comets
for (let i = 0; i < 5; i++) {
    createComet();
}

// Continuously create new comets
setInterval(() => {
    createComet();
}, 3000);

// Navbar Scroll Effect & Active Section Highlighting
window.addEventListener('scroll', function() {
    const navbar = document.getElementById('navbar');
    
    // Add scrolled class to navbar
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // Active section highlighting
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    let current = '';
    sections.forEach(function(section) {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop - 150) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(function(link) {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// Mobile Menu Toggle
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

menuToggle.addEventListener('click', function() {
    navLinks.classList.toggle('active');
});

// Smooth Scrolling for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
            navLinks.classList.remove('active');
        }
    });
});

// Gallery Functionality for Projects
const galleryThumbs = document.querySelectorAll('.gallery-thumb');

galleryThumbs.forEach(function(thumb) {
    thumb.addEventListener('click', function() {
        const target = this.getAttribute('data-target');
        const mainImg = document.getElementById(target + '-main-img');
        
        // Update main image
        mainImg.src = this.src;
        
        // Update active state
        const siblingThumbs = this.parentElement.querySelectorAll('.gallery-thumb');
        siblingThumbs.forEach(function(sibling) {
            sibling.classList.remove('active');
        });
        this.classList.add('active');
        
        // Add zoom effect
        mainImg.style.transform = 'scale(1.05)';
        setTimeout(function() {
            mainImg.style.transform = 'scale(1)';
        }, 300);
    });
});

// Achievement Gallery Functionality
const achievementThumbs = document.querySelectorAll('.achievement-thumb');

achievementThumbs.forEach(function(thumb) {
    thumb.addEventListener('click', function() {
        const target = this.getAttribute('data-target');
        const mainImg = document.getElementById(target + '-main-img');
        
        // Update main image
        mainImg.src = this.src;
        
        // Update active state
        const siblingThumbs = this.parentElement.querySelectorAll('.achievement-thumb');
        siblingThumbs.forEach(function(sibling) {
            sibling.classList.remove('active');
        });
        this.classList.add('active');
        
        // Add zoom effect
        mainImg.style.transform = 'scale(1.05)';
        setTimeout(function() {
            mainImg.style.transform = 'scale(1)';
        }, 300);
    });
});

// Image Modal Functionality
const modal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImage');
const modalCaption = document.getElementById('modalCaption');
const closeModal = document.querySelector('.modal-close');

// Add click event to all gallery main images
document.querySelectorAll('.gallery-main-image').forEach(function(img) {
    img.addEventListener('click', function() {
        modal.style.display = 'block';
        modalImg.src = this.src;
        modalCaption.textContent = this.alt;
    });
});

// Add click event to achievement main images for modal
document.querySelectorAll('.achievement-main-image').forEach(function(img) {
    img.addEventListener('click', function() {
        modal.style.display = 'block';
        modalImg.src = this.src;
        modalCaption.textContent = this.alt;
    });
});

// Close modal when clicking the X
closeModal.addEventListener('click', function() {
    modal.style.display = 'none';
});

// Close modal when clicking outside the image
modal.addEventListener('click', function(e) {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Close modal with ESC key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.style.display === 'block') {
        modal.style.display = 'none';
    }
});

// Intersection Observer for Card Animations
const observerOptions = {
    threshold: 0.3,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all cards for animation on scroll
document.querySelectorAll('.skill-card, .project-card, .stat-card, .achievement-card').forEach(function(card) {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.6s ease-out';
    observer.observe(card);
});

// Counter Animation for Achievement Stats
function animateAchievementStats() {
    const statNumbers = document.querySelectorAll('.achievement-stats .stat-number');
    
    statNumbers.forEach(function(stat) {
        const text = stat.textContent.trim();
        
        // Only animate if it's a pure number
        if (!isNaN(text) && text !== '') {
            const target = parseInt(text);
            let current = 0;
            const increment = target / 50;
            const duration = 1500;
            const stepTime = duration / 50;
            
            stat.textContent = '0';
            
            const counter = setInterval(function() {
                current += increment;
                if (current >= target) {
                    stat.textContent = target;
                    clearInterval(counter);
                } else {
                    stat.textContent = Math.floor(current);
                }
            }, stepTime);
        }
    });
}

// Trigger animation when achievement stats section becomes visible
const achievementStatsObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
        if (entry.isIntersecting) {
            animateAchievementStats();
            achievementStatsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const achievementStatsSection = document.querySelector('.achievement-stats');
if (achievementStatsSection) {
    achievementStatsObserver.observe(achievementStatsSection);
}

// Add smooth reveal animation for hero content
window.addEventListener('load', function() {
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.opacity = '0';
        heroContent.style.transform = 'translateY(20px)';
        heroContent.style.transition = 'all 0.8s ease-out';
        
        setTimeout(function() {
            heroContent.style.opacity = '1';
            heroContent.style.transform = 'translateY(0)';
        }, 100);
    }
});

// Parallax effect for floating device (desktop only)
if (window.innerWidth > 968) {
    window.addEventListener('scroll', function() {
        const device = document.querySelector('.device');
        if (device) {
            const scrolled = window.scrollY;
            const parallax = scrolled * 0.1;
            device.style.transform = 'translateY(' + parallax + 'px) rotateY(-15deg)';
        }
    });
}

// Add typing effect to status badge (optional)
const statusBadge = document.querySelector('.status-badge');
if (statusBadge) {
    statusBadge.style.animation = 'pulse 2s ease-in-out infinite';
}

// Console message for developers
console.log('%c🚀 Welcome to my Portfolio!', 'color: #a855f7; font-size: 20px; font-weight: bold;');
console.log('%cBuilt with HTML, CSS & JavaScript', 'color: #6366f1; font-size: 14px;');
console.log('%cFeel free to explore the code!', 'color: #3b82f6; font-size: 14px;');
