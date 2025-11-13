let index = 0;
const slides = document.querySelectorAll(".slide");

function showSlide() {
  slides.forEach((slide, i) => {
    slide.style.transform = `translateX(-${index * 100}%)`;
  });
  index = (index + 1) % slides.length;
}

setInterval(showSlide, 4000);
