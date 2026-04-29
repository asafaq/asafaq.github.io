
    // Each step describes what to show and what happens next
    const steps = [
      {
        id: 0,
        type: "text",
        text: "You wake up in a quiet room. The only light comes from a small window.",
        next: 1
      },
      {
        id: 1,
        type: "text",
        text: "You hear footsteps in the hallway. They’re getting closer.",
        next: 2
      },
      {
        id: 2,
        type: "choice",
        text: "What do you do?",
        options: [
          { label: "Hide under the bed", next: 3 },
          { label: "Open the door", next: 4 },
          { label: "Stay still and listen", next: 5 }
        ]
      },
      {
        id: 3,
        type: "text",
        text: "You slide under the bed, heart pounding. The footsteps stop right outside.",
        next: 6
      },
      {
        id: 4,
        type: "text",
        text: "You open the door. The hallway is empty, but the air feels heavy.",
        next: 6
      },
      {
        id: 5,
        type: "text",
        text: "You stay perfectly still. The footsteps pass by your door and fade away.",
        next: 6
      },
      {
        id: 6,
        type: "text",
        text: "Whatever you chose, you know one thing: you’re not alone here.",
        next: "end"
      }
    ];

    let currentStepId = 0;

    const dialogTextEl = document.getElementById("dialogText");
    const nextBtn = document.getElementById("nextBtn");
    const choicesEl = document.getElementById("choices");

    function showStep(stepId) {
      const step = steps.find(s => s.id === stepId);
      if (!step) return;

      currentStepId = stepId;
      dialogTextEl.textContent = step.text;

      if (step.type === "text") {
        // Show NEXT, hide choices
        nextBtn.style.display = "inline-block";
        choicesEl.style.display = "none";
        choicesEl.innerHTML = "";
      } else if (step.type === "choice") {
        // Hide NEXT, show choices
        nextBtn.style.display = "none";
        choicesEl.style.display = "flex";
        choicesEl.innerHTML = "";

        step.options.forEach(option => {
          const btn = document.createElement("button");
          btn.textContent = option.label;
          btn.addEventListener("click", () => {
            if (option.next === "end") {
              goToNextPage();
            } else {
              showStep(option.next);
            }
          });
          choicesEl.appendChild(btn);
        });
      }
    }

    function goToNextPage() {
      // Replace with your real navigation logic
      // e.g. window.location.href = "next-page.html";
      dialogTextEl.textContent = "End of this scene. (Here you’d navigate to the next page.)";
      nextBtn.style.display = "none";
      choicesEl.style.display = "none";
    }

    nextBtn.addEventListener("click", () => {
      const step = steps.find(s => s.id === currentStepId);
      if (!step) return;

      if (step.next === "end") {
        goToNextPage();
      } else {
        showStep(step.next);
      }
    });

    // Start
    showStep(currentStepId);