const sidebar = document.getElementById("sidebar");
const tooltip = document.getElementById("tooltip");
const closeSidebar = document.getElementById("closeSidebar");

// Sample data for demonstration
const muscleData = {
  biceps: {
    name: "Biceps Brachii",
    function: "Flexes the elbow and rotates the forearm.",
    exercises: "Bicep curls, hammer curls, chin-ups"
  },
  quads: {
    name: "Quadriceps Femoris",
    function: "Extends the knee and flexes the hip.",
    exercises: "Squats, lunges, leg press"
  }
};

// Simulate muscle selection (replace with actual logic later)
document.querySelector(".viewer").addEventListener("click", () => {
  const data = muscleData.biceps; // Replace this with actual logic later
  document.getElementById("muscleName").innerText = data.name;
  document.getElementById("muscleFunction").innerText = `Function: ${data.function}`;
  document.getElementById("muscleExercises").innerText = `Exercises: ${data.exercises}`;
  sidebar.style.display = "flex";
});

closeSidebar.addEventListener("click", () => {
  sidebar.style.display = "none";
});

// Optional: Simulate hover tooltip
document.querySelector(".viewer").addEventListener("mousemove", (e) => {
  tooltip.style.display = "block";
  tooltip.style.left = `${e.pageX + 10}px`;
  tooltip.style.top = `${e.pageY + 10}px`;
  tooltip.innerText = "Biceps Brachii (example)";
});

document.querySelector(".viewer").addEventListener("mouseleave", () => {
  tooltip.style.display = "none";
});

