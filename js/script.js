let currentIndex = 0;
const slides = document.querySelectorAll('.slide');
const totalSlides = slides.length;
const slider = document.querySelector('.slider');
const next = document.querySelector('.next');
const prev = document.querySelector('.prev');

function updateSlidePosition() {
  slider.style.transform = `translateX(-${currentIndex * (slides[0].offsetWidth + 32)}px)`;
}

next.addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % totalSlides;
  updateSlidePosition();
});

prev.addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
  updateSlidePosition();
});

// Auto slide every 4 seconds
setInterval(() => {
  currentIndex = (currentIndex + 1) % totalSlides;
  updateSlidePosition();
}, 4000);

// Responsive recalculation on resize
window.addEventListener('resize', updateSlidePosition);
