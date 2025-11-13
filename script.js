const programs = {
  runfinite: {
    title: "🏃‍♂️ Runfinite Marathon",
    desc: "A 5km marathon through the campus where stamina meets strategy. Open to all students. Top 3 finishers win exciting prizes!"
  },
  sopy: {
    title: "⚽ Sopy Football",
    desc: "A 5v5 football knockout tournament. Bring your best players and teamwork to take home the championship!"
  },
  egames: {
    title: "🎮 E-Games Arena",
    desc: "Compete in popular titles like Valorant, FIFA, and Call of Duty. Team up and showcase your gaming skills!"
  },
  quiz: {
    title: "🧠 Quiz & Mystery Hunt",
    desc: "Solve riddles, uncover clues, and beat the timer in this ultimate test of logic and teamwork."
  }
};

// Modal logic
const modal = document.getElementById("programModal");
const modalTitle = document.getElementById("modalTitle");
const modalDesc = document.getElementById("modalDesc");
const closeBtn = document.querySelector(".close-btn");

document.querySelectorAll(".program-card").forEach(card => {
  card.addEventListener("click", () => {
    const id = card.getAttribute("data-program");
    modalTitle.textContent = programs[id].title;
    modalDesc.textContent = programs[id].desc;
    modal.classList.add("active");
  });
});

closeBtn.addEventListener("click", () => modal.classList.remove("active"));
window.addEventListener("click", e => {
  if (e.target === modal) modal.classList.remove("active");
});

// Slider logic
const slider = document.querySelector(".program-slider");
const nextBtn = document.querySelector(".next");
const prevBtn = document.querySelector(".prev");

let scrollAmount = 0;

nextBtn.addEventListener("click", () => {
  slider.scrollBy({ left: 320, behavior: "smooth" });
});
prevBtn.addEventListener("click", () => {
  slider.scrollBy({ left: -320, behavior: "smooth" });
});
