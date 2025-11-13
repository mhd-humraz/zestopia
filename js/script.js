// Main application logic
document.addEventListener('DOMContentLoaded', function() {
    // Event data for different fests
    const eventsData = {
        techfest: {
            name: "Annual Tech Fest",
            description: "Join us for the biggest technology festival of the year featuring coding competitions, workshops, and tech talks.",
            events: [
                {
                    id: 1,
                    name: "Hackathon 2024",
                    description: "24-hour coding marathon to solve real-world problems",
                    image: "images/hackathon.jpg",
                    date: "Mar 15, 2024",
                    category: "Competition",
                    time: "10:00 AM",
                    venue: "CS Department Lab"
                },
                {
                    id: 2,
                    name: "AI Workshop",
                    description: "Hands-on workshop on Machine Learning and AI fundamentals",
                    image: "images/ai-workshop.jpg",
                    date: "Mar 16, 2024",
                    category: "Workshop",
                    time: "2:00 PM",
                    venue: "Auditorium A"
                },
                {
                    id: 3,
                    name: "Robotics Showcase",
                    description: "Display of innovative robotics projects by students",
                    image: "images/robotics.jpg",
                    date: "Mar 17, 2024",
                    category: "Exhibition",
                    time: "11:00 AM",
                    venue: "Main Hall"
                },
                {
                    id: 4,
                    name: "Tech Quiz",
                    description: "Test your knowledge in technology and computing",
                    image: "images/tech-quiz.jpg",
                    date: "Mar 16, 2024",
                    category: "Quiz",
                    time: "4:00 PM",
                    venue: "Seminar Hall"
                }
            ]
        },
        cultural: {
            name: "Cultural Extravaganza",
            description: "Experience the vibrant cultural diversity through music, dance, and art performances.",
            events: [
                {
                    id: 5,
                    name: "Battle of Bands",
                    description: "Music competition featuring college bands",
                    image: "images/battle-bands.jpg",
                    date: "Apr 5, 2024",
                    category: "Music",
                    time: "6:00 PM",
                    venue: "Open Amphitheater"
                },
                {
                    id: 6,
                    name: "Dance Competition",
                    description: "Showcase your dance skills in various categories",
                    image: "images/dance.jpg",
                    date: "Apr 6, 2024",
                    category: "Dance",
                    time: "3:00 PM",
                    venue: "Auditorium"
                },
                {
                    id: 7,
                    name: "Art Exhibition",
                    description: "Display of student artwork and installations",
                    image: "images/art-exhibition.jpg",
                    date: "Apr 5-7, 2024",
                    category: "Art",
                    time: "10:00 AM - 5:00 PM",
                    venue: "Art Gallery"
                }
            ]
        },
        sports: {
            name: "Sports Festival",
            description: "Get ready for intense competition and athletic excellence across multiple sports.",
            events: [
                {
                    id: 8,
                    name: "Basketball Tournament",
                    description: "Inter-department basketball championship",
                    image: "images/basketball.jpg",
                    date: "Feb 20, 2024",
                    category: "Sports",
                    time: "9:00 AM",
                    venue: "Main Court"
                },
                {
                    id: 9,
                    name: "Cricket Match",
                    description: "Faculty vs Students cricket match",
                    image: "images/cricket.jpg",
                    date: "Feb 21, 2024",
                    category: "Sports",
                    time: "2:00 PM",
                    venue: "Cricket Ground"
                },
                {
                    id: 10,
                    name: "Marathon",
                    description: "5K run around the campus",
                    image: "images/marathon.jpg",
                    date: "Feb 22, 2024",
                    category: "Sports",
                    time: "7:00 AM",
                    venue: "Starting at Main Gate"
                }
            ]
        }
    };

    // Initialize the application
    initApp();

    function initApp() {
        setupFestCards();
        setupEventClickHandlers();
    }

    function setupFestCards() {
        const festCards = document.querySelectorAll('.fest-card');
        
        festCards.forEach(card => {
            card.addEventListener('click', function() {
                const festType = this.getAttribute('data-fest');
                showEventsForFest(festType);
                
                // Update active state
                festCards.forEach(c => c.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }

    function showEventsForFest(festType) {
        const festData = eventsData[festType];
        
        if (!festData) return;

        // Update fest header
        document.getElementById('festName').textContent = festData.name;
        document.getElementById('festDescription').textContent = festData.description;

        // Initialize slideshow with events
        initializeSlideshow(festData.events);
    }

    function initializeSlideshow(events) {
        const slidesContainer = document.getElementById('slidesContainer');
        const dotsContainer = document.getElementById('dotsContainer');
        
        // Clear previous content
        slidesContainer.innerHTML = '';
        dotsContainer.innerHTML = '';

        // Create slides
        events.forEach((event, index) => {
            const slide = createEventSlide(event, index);
            slidesContainer.appendChild(slide);
        });

        // Initialize slideshow functionality
        initSlideshow();
    }

    function createEventSlide(event, index) {
        const slide = document.createElement('div');
        slide.className = 'event-slide';
        slide.setAttribute('data-event-id', event.id);
        
        slide.innerHTML = `
            <div class="event-image">
                <img src="${event.image}" alt="${event.name}" onerror="this.src='https://via.placeholder.com/400x250/4a6fa5/ffffff?text=${encodeURIComponent(event.name)}'">
            </div>
            <div class="event-content">
                <h3>${event.name}</h3>
                <p>${event.description}</p>
                <div class="event-meta">
                    <span class="event-date">${event.date}</span>
                    <span class="event-category">${event.category}</span>
                </div>
            </div>
        `;

        return slide;
    }

    function setupEventClickHandlers() {
        // Event delegation for event slides
        document.addEventListener('click', function(e) {
            const eventSlide = e.target.closest('.event-slide');
            if (eventSlide) {
                const eventId = eventSlide.getAttribute('data-event-id');
                navigateToEventDetail(eventId);
            }
        });
    }

    function navigateToEventDetail(eventId) {
        // In a real application, this would navigate to a dedicated event page
        // For now, we'll show an alert and you can implement the actual navigation
        window.location.href = `pages/event-detail.html?event=${eventId}`;
    }
});

// Utility function for scrolling
function scrollToFests() {
    document.getElementById('fests').scrollIntoView({ 
        behavior: 'smooth' 
    });
}
