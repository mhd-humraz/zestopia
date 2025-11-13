import Slideshow from './slideshow.js';
import { Utils, Storage } from './utils.js';

class CampusEventsApp {
    constructor() {
        this.currentFest = null;
        this.slideshow = null;
        this.eventsData = this.getEventsData();
        
        this.init();
    }

    init() {
        this.setupLoading();
        this.setupNavigation();
        this.setupSections();
        this.setupFests();
        this.setupEventHandlers();
        this.setupAnimations();
        
        // Initialize particles
        const particlesContainer = Utils.$('#particles');
        if (particlesContainer) {
            Utils.createParticles(particlesContainer, 30);
        }
    }

    setupLoading() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const loadingScreen = Utils.$('#loadingScreen');
                if (loadingScreen) {
                    loadingScreen.style.opacity = '0';
                    setTimeout(() => {
                        loadingScreen.style.display = 'none';
                    }, 500);
                }
                
                this.animateStats();
            }, 1000);
        });
    }

    setupNavigation() {
        // Navbar scroll effect
        window.addEventListener('scroll', Utils.throttle(() => {
            const navbar = Utils.$('.navbar');
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }, 100));

        // Smooth scrolling for navigation links
        const navLinks = Utils.$$('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetSection = Utils.$(`#${targetId}`);
                
                if (targetSection) {
                    Utils.scrollToElement(targetSection, 80);
                    this.setActiveNavLink(link);
                }
            });
        });

        // Mobile menu toggle
        const hamburger = Utils.$('.hamburger');
        const navMenu = Utils.$('.nav-menu');
        
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
            });
        }

        // Close mobile menu when clicking on links
        const mobileLinks = Utils.$$('.nav-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    setActiveNavLink(activeLink) {
        const navLinks = Utils.$$('.nav-link');
        navLinks.forEach(link => link.classList.remove('active'));
        activeLink.classList.add('active');
    }

    setupSections() {
        // Intersection Observer for section animations
        const sections = Utils.$$('section');
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in-up');
                    
                    // Update active nav link
                    const sectionId = entry.target.id;
                    const correspondingLink = Utils.$(`.nav-link[href="#${sectionId}"]`);
                    if (correspondingLink) {
                        this.setActiveNavLink(correspondingLink);
                    }
                }
            });
        }, observerOptions);

        sections.forEach(section => {
            sectionObserver.observe(section);
        });
    }

    setupFests() {
        const festsGrid = Utils.$('#festsGrid');
        if (!festsGrid) return;

        festsGrid.innerHTML = this.generateFestsHTML();
        
        // Add event listeners to fest cards
        const festCards = Utils.$$('.fest-card');
        festCards.forEach(card => {
            card.addEventListener('click', () => {
                const festId = card.dataset.festId;
                this.selectFest(festId);
            });
        });

        // Select first fest by default
        if (festCards.length > 0) {
            this.selectFest(festCards[0].dataset.festId);
        }
    }

    generateFestsHTML() {
        return Object.values(this.eventsData.fests).map(fest => `
            <div class="fest-card hover-lift" data-fest-id="${fest.id}">
                <div class="fest-image">
                    <img src="${fest.image}" alt="${fest.name}" 
                         onerror="this.src='https://via.placeholder.com/400x250/6366f1/ffffff?text=${encodeURIComponent(fest.name)}'">
                    <div class="fest-badge">${fest.type}</div>
                </div>
                <div class="fest-content">
                    <h3 class="fest-title">${fest.name}</h3>
                    <p class="fest-department">${fest.department}</p>
                    <p class="fest-description">${fest.description}</p>
                    <div class="fest-meta">
                        <span class="fest-date">${Utils.formatDate(fest.date)}</span>
                        <span class="fest-events">${fest.events.length} Events</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    selectFest(festId) {
        // Update active fest card
        const festCards = Utils.$$('.fest-card');
        festCards.forEach(card => card.classList.remove('active'));
        
        const selectedCard = Utils.$(`[data-fest-id="${festId}"]`);
        if (selectedCard) {
            selectedCard.classList.add('active');
        }

        this.currentFest = this.eventsData.fests[festId];
        this.updateFestHeader();
        this.updateSlideshow();
        this.enableViewAllButton();
    }

    updateFestHeader() {
        const titleElement = Utils.$('#currentFestTitle');
        const descriptionElement = Utils.$('#currentFestDescription');
        
        if (titleElement && this.currentFest) {
            titleElement.textContent = this.currentFest.name;
        }
        
        if (descriptionElement && this.currentFest) {
            descriptionElement.textContent = this.currentFest.description;
        }
    }

    updateSlideshow() {
        if (!this.currentFest) return;

        const slidesContainer = Utils.$('#slideshowTrack');
        if (!slidesContainer) return;

        // Generate slides HTML
        slidesContainer.innerHTML = this.currentFest.events.map(event => `
            <div class="event-slide hover-lift" data-event-id="${event.id}">
                <div class="event-slide-image">
                    <img src="${event.image}" alt="${event.name}"
                         onerror="this.src='https://via.placeholder.com/400x250/6366f1/ffffff?text=${encodeURIComponent(event.name)}'">
                </div>
                <div class="event-slide-content">
                    <h3 class="event-slide-title">${event.name}</h3>
                    <p class="event-slide-description">${event.description}</p>
                    <div class="event-slide-meta">
                        <span class="event-slide-date">${Utils.formatDate(event.date)}</span>
                        <span class="event-slide-category">${event.category}</span>
                    </div>
                </div>
            </div>
        `).join('');

        // Initialize or update slideshow
        if (!this.slideshow) {
            this.initializeSlideshow();
        } else {
            this.slideshow.updateSlides(Utils.$$('.event-slide', slidesContainer));
        }
    }

    initializeSlideshow() {
        const slideshowContainer = Utils.$('.slideshow-container');
        if (!slideshowContainer) return;

        this.slideshow = new Slideshow(slideshowContainer, {
            slidesToShow: 3,
            autoplay: true,
            autoplaySpeed: 4000,
            infinite: true,
            dots: true,
            arrows: true
        });

        // Add click handlers to event slides
        slideshowContainer.addEventListener('click', (e) => {
            const eventSlide = e.target.closest('.event-slide');
            if (eventSlide) {
                const eventId = eventSlide.dataset.eventId;
                this.showEventDetails(eventId);
            }
        });
    }

    showEventDetails(eventId) {
        // In a real app, this would navigate to event detail page
        const event = this.findEventById(eventId);
        if (event) {
            // Show modal or navigate to detail page
            this.showEventModal(event);
        }
    }

    showEventModal(event) {
        // Create and show modal with event details
        const modalHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <button class="modal-close">&times;</button>
                    <div class="modal-header">
                        <h2>${event.name}</h2>
                        <span class="event-category">${event.category}</span>
                    </div>
                    <div class="modal-body">
                        <img src="${event.image}" alt="${event.name}">
                        <p>${event.fullDescription || event.description}</p>
                        <div class="event-details">
                            <div class="detail-item">
                                <strong>Date:</strong> ${Utils.formatDate(event.date)}
                            </div>
                            <div class="detail-item">
                                <strong>Time:</strong> ${event.time}
                            </div>
                            <div class="detail-item">
                                <strong>Venue:</strong> ${event.venue}
                            </div>
                            <div class="detail-item">
                                <strong>Organizer:</strong> ${event.organizer}
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary">Register Now</button>
                    </div>
                </div>
            </div>
        `;

        // Add modal to DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Add event listeners
        const modalOverlay = Utils.$('.modal-overlay');
        const closeBtn = Utils.$('.modal-close');
        
        const closeModal = () => {
            modalOverlay.style.opacity = '0';
            setTimeout(() => {
                modalOverlay.remove();
            }, 300);
        };

        closeBtn.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });

        // Animate in
        setTimeout(() => {
            modalOverlay.style.opacity = '1';
        }, 10);
    }

    findEventById(eventId) {
        for (const fest of Object.values(this.eventsData.fests)) {
            const event = fest.events.find(e => e.id === eventId);
            if (event) return event;
        }
        return null;
    }

    enableViewAllButton() {
        const viewAllBtn = Utils.$('#viewAllEvents');
        if (viewAllBtn && this.currentFest) {
            viewAllBtn.disabled = false;
            viewAllBtn.addEventListener('click', () => {
                this.showAllEventsForFest();
            });
        }
    }

    showAllEventsForFest() {
        // Scroll to events section and show all events
        const eventsSection = Utils.$('#events');
        if (eventsSection) {
            Utils.scrollToElement(eventsSection, 80);
        }
        
        // You could implement a grid view of all events here
        console.log('Showing all events for:', this.currentFest.name);
    }

    setupEventHandlers() {
        // Explore button
        const exploreBtn = Utils.$('#exploreBtn');
        if (exploreBtn) {
            exploreBtn.addEventListener('click', () => {
                Utils.scrollToElement(Utils.$('#fests'), 80);
            });
        }

        // View schedule button
        const scheduleBtn = Utils.$('#viewSchedule');
        if (scheduleBtn) {
            scheduleBtn.addEventListener('click', () => {
                this.showScheduleModal();
            });
        }
    }

    showScheduleModal() {
        // Implement schedule modal
        alert('Event schedule feature coming soon!');
    }

    setupAnimations() {
        // Add staggered animation to fest grid
        const festsGrid = Utils.$('#festsGrid');
        if (festsGrid) {
            festsGrid.classList.add('stagger-animate');
        }
    }

    animateStats() {
        const statNumbers = Utils.$$('.stat-number');
        statNumbers.forEach(stat => {
            const target = parseInt(stat.dataset.count);
            Utils.animateCounter(stat, target, 2000);
        });
    }

    getEventsData() {
        return {
            fests: {
                techfest: {
                    id: 'techfest',
                    name: 'Annual Tech Fest 2024',
                    type: 'Technology',
                    department: 'Department of Computer Science',
                    description: 'The biggest technology festival featuring cutting-edge innovations, coding competitions, and tech workshops.',
                    date: '2024-03-15',
                    image: 'assets/images/techfest.jpg',
                    events: [
                        {
                            id: 'tech-1',
                            name: 'Hackathon 2024',
                            description: '24-hour coding marathon to solve real-world challenges',
                            fullDescription: 'Join us for an intense 24-hour coding competition where you\'ll work in teams to develop innovative solutions for real-world problems. Food, drinks, and mentorship provided throughout the event.',
                            image: 'assets/images/hackathon.jpg',
                            date: '2024-03-15',
                            time: '10:00 AM - 10:00 AM (Next Day)',
                            venue: 'CS Department Lab',
                            category: 'Competition',
                            organizer: 'Computer Science Department'
                        },
                        {
                            id: 'tech-2',
                            name: 'AI & ML Workshop',
                            description: 'Hands-on workshop on artificial intelligence and machine learning fundamentals',
                            fullDescription: 'Learn the fundamentals of Artificial Intelligence and Machine Learning in this intensive workshop. No prior experience required. We\'ll cover Python basics, neural networks, and practical applications.',
                            image: 'assets/images/ai-workshop.jpg',
                            date: '2024-03-16',
                            time: '2:00 PM - 5:00 PM',
                            venue: 'Auditorium A',
                            category: 'Workshop',
                            organizer: 'AI Research Club'
                        },
                        {
                            id: 'tech-3',
                            name: 'Robotics Exhibition',
                            description: 'Showcase of innovative robotics projects by students',
                            fullDescription: 'Witness the future of robotics with projects ranging from autonomous vehicles to humanoid robots. Meet the creators and see live demonstrations of their incredible inventions.',
                            image: 'assets/images/robotics.jpg',
                            date: '2024-03-17',
                            time: '11:00 AM - 4:00 PM',
                            venue: 'Main Hall',
                            category: 'Exhibition',
                            organizer: 'Robotics Club'
                        },
                        {
                            id: 'tech-4',
                            name: 'Tech Quiz Championship',
                            description: 'Test your knowledge in technology and computing',
                            fullDescription: 'Compete in our technology trivia competition covering topics from computer history to cutting-edge innovations. Great prizes for the top teams!',
                            image: 'assets/images/tech-quiz.jpg',
                            date: '2024-03-16',
                            time: '4:00 PM - 6:00 PM',
                            venue: 'Seminar Hall',
                            category: 'Quiz',
                            organizer: 'Student Tech Committee'
                        }
                    ]
                },
                cultural: {
                    id: 'cultural',
                    name: 'Cultural Extravaganza',
                    type: 'Cultural',
                    department: 'Student Union',
                    description: 'Experience the vibrant cultural diversity through music, dance, art, and theatrical performances.',
                    date: '2024-04-05',
                    image: 'assets/images/cultural.jpg',
                    events: [
                        {
                            id: 'cultural-1',
                            name: 'Battle of Bands',
                            description: 'Music competition featuring the best college bands',
                            fullDescription: 'Witness an electrifying night of music as college bands compete for the championship title. Rock, pop, jazz, and indie performances guaranteed!',
                            image: 'assets/images/battle-bands.jpg',
                            date: '2024-04-05',
                            time: '6:00 PM - 10:00 PM',
                            venue: 'Open Amphitheater',
                            category: 'Music',
                            organizer: 'Music Society'
                        },
                        {
                            id: 'cultural-2',
                            name: 'Dance Championship',
                            description: 'Showcase your dance skills in various categories',
                            fullDescription: 'From classical to contemporary, hip-hop to ballet, this competition has it all. Solo and group performances welcome. Impressive cash prizes!',
                            image: 'assets/images/dance.jpg',
                            date: '2024-04-06',
                            time: '3:00 PM - 7:00 PM',
                            venue: 'Main Auditorium',
                            category: 'Dance',
                            organizer: 'Dance Club'
                        }
                    ]
                },
                sports: {
                    id: 'sports',
                    name: 'Inter-College Sports Festival',
                    type: 'Sports',
                    department: 'Physical Education Department',
                    description: 'Get ready for intense competition and athletic excellence across multiple sports disciplines.',
                    date: '2024-02-20',
                    image: 'assets/images/sports.jpg',
                    events: [
                        {
                            id: 'sports-1',
                            name: 'Basketball Tournament',
                            description: 'Inter-department basketball championship',
                            fullDescription: 'Witness thrilling basketball action as departments compete for glory. Fast-paced games, incredible shots, and intense rivalries!',
                            image: 'assets/images/basketball.jpg',
                            date: '2024-02-20',
                            time: '9:00 AM - 6:00 PM',
                            venue: 'Main Court',
                            category: 'Sports',
                            organizer: 'Sports Department'
                        },
                        {
                            id: 'sports-2',
                            name: 'Cricket Championship',
                            description: 'Faculty vs Students cricket match',
                            fullDescription: 'The classic rivalry continues! Watch as faculty and students face off in this exciting cricket match. Who will emerge victorious this year?',
                            image: 'assets/images/cricket.jpg',
                            date: '2024-02-21',
                            time: '2:00 PM - 7:00 PM',
                            venue: 'Cricket Ground',
                            category: 'Sports',
                            organizer: 'Sports Committee'
                        }
                    ]
                }
            }
        };
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CampusEventsApp();
});

// Export for potential module use
export default CampusEventsApp;
