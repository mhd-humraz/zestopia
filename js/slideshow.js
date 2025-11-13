import { Utils, EventEmitter } from './utils.js';

class Slideshow extends EventEmitter {
    constructor(container, options = {}) {
        super();
        
        this.container = container;
        this.options = {
            slidesToShow: 3,
            slidesToScroll: 1,
            autoplay: false,
            autoplaySpeed: 5000,
            infinite: true,
            dots: true,
            arrows: true,
            responsive: [
                { breakpoint: 1024, settings: { slidesToShow: 2 } },
                { breakpoint: 768, settings: { slidesToShow: 1 } }
            ],
            ...options
        };

        this.currentSlide = 0;
        this.totalSlides = 0;
        this.isAnimating = false;
        this.autoplayInterval = null;
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.slides = [];

        this.init();
    }

    init() {
        this.setupDOM();
        this.setupEvents();
        this.updateSlides();
        this.startAutoplay();
    }

    setupDOM() {
        // Create slideshow structure
        this.track = Utils.$('.slideshow-track', this.container);
        this.slides = Array.from(Utils.$$('.event-slide', this.container));
        this.totalSlides = this.slides.length;

        // Create navigation if enabled
        if (this.options.arrows) {
            this.createNavigation();
        }

        // Create dots if enabled
        if (this.options.dots) {
            this.createDots();
        }

        // Create progress elements
        this.createProgress();

        this.updateSlidesPerView();
    }

    setupEvents() {
        // Window resize
        window.addEventListener('resize', Utils.throttle(() => {
            this.updateSlidesPerView();
            this.updateSlides();
        }, 250));

        // Touch events for mobile
        this.container.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
        });

        this.container.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.prev();
            } else if (e.key === 'ArrowRight') {
                this.next();
            }
        });
    }

    createNavigation() {
        this.prevBtn = Utils.$('.slideshow-prev', this.container);
        this.nextBtn = Utils.$('.slideshow-next', this.container);

        if (this.prevBtn && this.nextBtn) {
            this.prevBtn.addEventListener('click', () => this.prev());
            this.nextBtn.addEventListener('click', () => this.next());
        }
    }

    createDots() {
        this.dotsContainer = Utils.$('.slideshow-dots', this.container);
        if (!this.dotsContainer) return;

        this.dotsContainer.innerHTML = '';
        const totalDots = Math.ceil(this.totalSlides / this.getSlidesToShow());

        for (let i = 0; i < totalDots; i++) {
            const dot = document.createElement('button');
            dot.className = 'slideshow-dot';
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            dot.addEventListener('click', () => this.goToSlide(i));
            
            this.dotsContainer.appendChild(dot);
        }
    }

    createProgress() {
        this.progressFill = Utils.$('.progress-fill', this.container);
        this.currentSlideElement = Utils.$('#currentSlide', this.container);
        this.totalSlidesElement = Utils.$('#totalSlides', this.container);

        if (this.totalSlidesElement) {
            this.totalSlidesElement.textContent = Math.ceil(this.totalSlides / this.getSlidesToShow());
        }
    }

    updateSlidesPerView() {
        const width = window.innerWidth;
        let slidesToShow = this.options.slidesToShow;

        // Check responsive breakpoints
        if (this.options.responsive) {
            this.options.responsive.forEach(breakpoint => {
                if (width <= breakpoint.breakpoint) {
                    slidesToShow = breakpoint.settings.slidesToShow;
                }
            });
        }

        this.slidesToShow = slidesToShow;
        this.updateSlideWidths();
    }

    updateSlideWidths() {
        const slideWidth = 100 / this.slidesToShow;
        this.slides.forEach(slide => {
            slide.style.flex = `0 0 calc(${slideWidth}% - var(--space-lg))`;
        });
    }

    getSlidesToShow() {
        return this.slidesToShow || this.options.slidesToShow;
    }

    next() {
        if (this.isAnimating) return;

        const slidesToShow = this.getSlidesToShow();
        const maxSlide = Math.ceil(this.totalSlides / slidesToShow) - 1;

        if (this.currentSlide < maxSlide) {
            this.goToSlide(this.currentSlide + 1);
        } else if (this.options.infinite) {
            this.goToSlide(0);
        }
    }

    prev() {
        if (this.isAnimating) return;

        const slidesToShow = this.getSlidesToShow();
        const maxSlide = Math.ceil(this.totalSlides / slidesToShow) - 1;

        if (this.currentSlide > 0) {
            this.goToSlide(this.currentSlide - 1);
        } else if (this.options.infinite) {
            this.goToSlide(maxSlide);
        }
    }

    goToSlide(slideIndex) {
        if (this.isAnimating || slideIndex === this.currentSlide) return;

        this.isAnimating = true;
        const previousSlide = this.currentSlide;
        this.currentSlide = slideIndex;

        this.animateToSlide(previousSlide, () => {
            this.isAnimating = false;
            this.updateUI();
            this.emit('slideChange', this.currentSlide);
        });
    }

    animateToSlide(previousSlide, callback) {
        const slidesToShow = this.getSlidesToShow();
        const translateX = -this.currentSlide * (100 / slidesToShow);
        
        this.track.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        this.track.style.transform = `translateX(${translateX}%)`;

        // Add animation classes to slides
        const direction = this.currentSlide > previousSlide ? 'next' : 'prev';
        this.slides.forEach((slide, index) => {
            slide.classList.remove('slide-animate-prev', 'slide-animate-next');
            if (index >= this.currentSlide * slidesToShow && 
                index < (this.currentSlide + 1) * slidesToShow) {
                slide.classList.add(`slide-animate-${direction}`);
            }
        });

        setTimeout(() => {
            this.track.style.transition = '';
            if (callback) callback();
        }, 500);
    }

    updateUI() {
        this.updateDots();
        this.updateProgress();
        this.updateNavigation();
        this.updateCounter();
    }

    updateDots() {
        const dots = Utils.$$('.slideshow-dot', this.container);
        const currentDot = Math.floor(this.currentSlide);
        
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentDot);
        });
    }

    updateProgress() {
        if (!this.progressFill) return;

        const slidesToShow = this.getSlidesToShow();
        const totalGroups = Math.ceil(this.totalSlides / slidesToShow);
        const progress = ((this.currentSlide + 1) / totalGroups) * 100;
        
        this.progressFill.style.width = `${progress}%`;
    }

    updateNavigation() {
        if (!this.prevBtn || !this.nextBtn) return;

        const slidesToShow = this.getSlidesToShow();
        const maxSlide = Math.ceil(this.totalSlides / slidesToShow) - 1;

        this.prevBtn.disabled = !this.options.infinite && this.currentSlide === 0;
        this.nextBtn.disabled = !this.options.infinite && this.currentSlide === maxSlide;
    }

    updateCounter() {
        if (this.currentSlideElement) {
            this.currentSlideElement.textContent = this.currentSlide + 1;
        }
    }

    handleSwipe() {
        const swipeThreshold = 50;
        const swipeDistance = this.touchStartX - this.touchEndX;

        if (Math.abs(swipeDistance) > swipeThreshold) {
            if (swipeDistance > 0) {
                this.next();
            } else {
                this.prev();
            }
        }
    }

    startAutoplay() {
        if (!this.options.autoplay) return;

        this.stopAutoplay();
        
        this.autoplayInterval = setInterval(() => {
            this.next();
        }, this.options.autoplaySpeed);
    }

    stopAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
    }

    pauseAutoplay() {
        this.stopAutoplay();
    }

    resumeAutoplay() {
        this.startAutoplay();
    }

    updateSlides(newSlides = null) {
        if (newSlides) {
            this.slides = newSlides;
            this.totalSlides = this.slides.length;
        }

        this.updateSlideWidths();
        this.updateUI();
        
        if (this.options.dots) {
            this.createDots();
        }
    }

    destroy() {
        this.stopAutoplay();
        
        // Remove event listeners
        window.removeEventListener('resize', this.updateSlidesPerView);
        document.removeEventListener('keydown', this.handleKeydown);
        
        // Clear DOM elements
        if (this.dotsContainer) {
            this.dotsContainer.innerHTML = '';
        }
    }
}

// Export for use in other modules
export default Slideshow;
