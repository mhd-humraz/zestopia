// Slideshow functionality for events
let currentSlide = 0;
let slidesPerView = 3;
let totalSlides = 0;

function initSlideshow() {
    const slidesContainer = document.getElementById('slidesContainer');
    const slides = document.querySelectorAll('.event-slide');
    totalSlides = slides.length;
    
    // Set initial position
    updateSlidesPosition();
    updateDots();
    
    // Setup navigation
    setupNavigation();
    
    // Handle window resize
    window.addEventListener('resize', handleResize);
    
    // Update slides per view based on screen size
    updateSlidesPerView();
}

function setupNavigation() {
    const prevBtn = document.getElementById('prevSlide');
    const nextBtn = document.getElementById('nextSlide');
    
    prevBtn.addEventListener('click', goToPrevSlide);
    nextBtn.addEventListener('click', goToNextSlide);
    
    // Touch support for mobile
    setupTouchSupport();
}

function goToPrevSlide() {
    if (currentSlide > 0) {
        currentSlide--;
    } else {
        // Loop to end
        currentSlide = Math.ceil(totalSlides / slidesPerView) - 1;
    }
    updateSlidesPosition();
    updateDots();
}

function goToNextSlide() {
    const maxSlide = Math.ceil(totalSlides / slidesPerView) - 1;
    
    if (currentSlide < maxSlide) {
        currentSlide++;
    } else {
        // Loop to beginning
        currentSlide = 0;
    }
    updateSlidesPosition();
    updateDots();
}

function updateSlidesPosition() {
    const slidesContainer = document.getElementById('slidesContainer');
    const slideWidth = 100 / slidesPerView;
    const translateX = -currentSlide * 100;
    
    slidesContainer.style.transform = `translateX(${translateX}%)`;
}

function updateDots() {
    const dotsContainer = document.getElementById('dotsContainer');
    const totalDots = Math.ceil(totalSlides / slidesPerView);
    
    dotsContainer.innerHTML = '';
    
    for (let i = 0; i < totalDots; i++) {
        const dot = document.createElement('div');
        dot.className = `dot ${i === currentSlide ? 'active' : ''}`;
        dot.addEventListener('click', () => {
            currentSlide = i;
            updateSlidesPosition();
            updateDots();
        });
        dotsContainer.appendChild(dot);
    }
}

function updateSlidesPerView() {
    const width = window.innerWidth;
    
    if (width < 768) {
        slidesPerView = 1;
    } else if (width < 1024) {
        slidesPerView = 2;
    } else {
        slidesPerView = 3;
    }
    
    updateSlidesPosition();
    updateDots();
}

function handleResize() {
    updateSlidesPerView();
}

function setupTouchSupport() {
    const slidesContainer = document.getElementById('slidesContainer');
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    
    slidesContainer.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
    });
    
    slidesContainer.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        currentX = e.touches[0].clientX;
    });
    
    slidesContainer.addEventListener('touchend', () => {
        if (!isDragging) return;
        
        const diff = startX - currentX;
        const threshold = 50;
        
        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                goToNextSlide();
            } else {
                goToPrevSlide();
            }
        }
        
        isDragging = false;
    });
}
