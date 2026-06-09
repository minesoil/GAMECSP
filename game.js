document.addEventListener('DOMContentLoaded', function() {
  // Grab all our HTML elements
  const mainBody = document.querySelector("body");
  const startBtn = document.getElementById("startButton"); 
  const dialogueText = document.getElementById("dialogueText");
  const actionBox = document.getElementById("optionButtons");
  const typingBox = document.getElementById("qteContainer");
  const bobPic = document.getElementById("robertImage");
  const lightSwitchPic = document.getElementById("lightSwitchImg");
  const leftHand = document.getElementById("leftHand");
  const rightHand = document.getElementById("rightHand");
  const arrowPic = document.getElementById("flamingArrow");
  const barBox = document.getElementById("timerBarContainer");
  const redBar = document.getElementById("timerBar");
  
  // Timers and Game State Variables
  let sceneTimer = null;
  let healthBarTimer = null;
  let currentRoomDetails = null;
  
  // Typing Game Variables
  let keysToPress = [];
  let currentKeyIndex = 0;
  let isTypingGameActive = false;

  // ALL ROOM DATA
  const roomData = [
    {
      id: 1,
      text: "You stepped inside the damp stone cave entrance. A chilling shadow passes along the walls ahead.",
      options: [
        { text: "Investigate the dark tunnel archway", goTo: 2 },
        { text: "Hide underneath a heavy student desk left in the rubble", goTo: 10 }
      ]
    },
    {
      id: 2,
      isBlackout: true, 
      showSwitch: true, 
      text: "You peer around the corner. You see a modern light switch flicking up and down on the rock wall completely on its own.",
      options: [
        { text: "Reach out and flip the switch manually", goTo: 3 }
      ]
    },
    {
      id: 3,
      isBlackout: true, 
      text: "THE LIGHTS SNAPPED OUT! RUN AWAY BEFORE HE GRABS YOU!",
      timeLimit: 2500,
      timeoutTarget: 99,
      options: [
        { text: "Duck cleanly inside the narrow cavern alcove", goTo: 4 }
      ]
    },
    {
      id: 4,
      showRobert: true,
      scaryShake: true,
      teacherPosition: { top: "50%", left: "50%", scale: "2.4", rotate: "-10deg", zIndex: "15" },
      text: "Teacher Robert smashes through the darkness! HE GRABS YOUR ARM! Mash the key combo perfectly to break free!",
      timeLimit: 3000, 
      timeoutTarget: 99, 
      requiredKeys: ["W", "S", "A", "D", "F"],
      successTarget: 5 
    },
    {
      id: 5, 
      showRobert: true,
      teacherPosition: { top: "52%", left: "72%", scale: "1.45", rotate: "0deg", zIndex: "4" },
      text: "You kick his armored greaves and break free! He stumbles backwards, pacing furiously with his axe right past your line of sight.",
      options: [
        { text: "Draw your bow string and prepare to shoot!", goTo: 6 } 
      ]
    },
    {
      id: 6,
      showRobert: true,
      shootArrow: true, 
      teacherPosition: { top: "51%", left: "68%", scale: "1.6", rotate: "5deg", zIndex: "4" },
      text: "HE SEES THE SPARKS! Release the flaming arrow before he raises his dragon shield!",
      timeLimit: 1600,          
      timeoutTarget: 99,        
      requiredKeys: ["Q", "R", "E", "X"],
      successTarget: 7
    },
    {
      id: 7,
      showRobert: true,
      teacherPosition: { top: "45%", left: "30%", scale: "0.6", rotate: "85deg", zIndex: "1" },
      text: "DIRECT HIT! The flaming arrow catches his chainmail mesh. He staggers back roaring into the abyss as you slide through the passage!",
      options: [
        { text: "Sprint out to freedom", goTo: 100 }
      ]
    },
    {
      id: 10,
      showRobert: true,
      teacherPosition: { top: "32%", left: "50%", scale: "2.8", rotate: "15deg", zIndex: "15" },
      text: "You cram underneath the old desk. You watch Teacher Robert's heavy leather boots walk up and stop inches from your eyes.",
      options: [
        { text: "Hold your breath and wait", goTo: 99 }
      ]
    },
    {
      id: 99,
      scaryCloseup: true,
      scaryShake: true,
      scaryFlash: true,
      playScareSound: true,
      teacherPosition: { top: "45%", left: "50%", scale: "3.8", rotate: "0deg", zIndex: "30" },
      text: "TEACHER ROBERT CAUGHT YOU IN THE DARK! GAME OVER.",
      options: [
        { text: "Return to Main Menu", goTo: -1 }
      ]
    },
    {
      id: 100,
      text: "You managed to throw the iron latch back and exit the cave safely. You beat Teacher Robert!",
      options: [
        { text: "Main Menu", goTo: -1 }
      ]
    }
  ];

  // Listen for keyboard typing during mini-games
  window.addEventListener("keydown", function(event) {
    if (isTypingGameActive === false) return;

    let pressedKey = event.key.toUpperCase();
    let correctKey = keysToPress[currentKeyIndex];

    if (pressedKey === correctKey) {
      // Color the key green
      let keyElements = typingBox.querySelectorAll(".qte-key");
      if (keyElements[currentKeyIndex]) {
        keyElements[currentKeyIndex].classList.add("success");
      }

      currentKeyIndex = currentKeyIndex + 1;

      // Check if we finished all keys
      if (currentKeyIndex >= keysToPress.length) {
        isTypingGameActive = false;
        clearTimeout(sceneTimer);
        clearInterval(healthBarTimer);
        loadScene(currentRoomDetails.successTarget); 
      }
    } else {
      // Wrong key pressed! Game Over!
      isTypingGameActive = false;
      clearTimeout(sceneTimer);
      clearInterval(healthBarTimer);
      loadScene(99); 
    }
  });

  // Make the background move slightly when mouse moves
  mainBody.addEventListener("mousemove", function(event) {
    let mouseX = -event.offsetX / 15;
    let mouseY = -event.offsetY / 15;
    mainBody.style.backgroundPositionX = mouseX + "px";
    mainBody.style.backgroundPositionY = mouseY + "px";
  });

  // Start button logic (For index.html)
  if (startBtn) {
    startBtn.addEventListener("click", function() {
      window.location.href = "inGame.html";
    });
  }

  // Reset button logic
  const resetBtn = document.getElementById("resetButton");
  if (resetBtn) {
    resetBtn.addEventListener("click", function() {
      window.location.href = "index.html";
    });
  }

  // Start the first scene ONLY if we are on the game screen
  if (dialogueText && actionBox) {
    loadScene(1);

    // FIX: Starts the background music automatically when the user clicks anywhere on the cave screen
    window.addEventListener("click", function() {
      const musicAudio = document.getElementById("spookyAmbience");
      if (musicAudio) {
        musicAudio.play().catch(function(error) {
          console.log("Audio playback blocked: ", error);
        });
      }
    }, { once: true }); // This setup runs only one time per page load
  }

  // Core function that updates the screen
  function loadScene(sceneId) {
    clearTimeout(sceneTimer);
    clearInterval(healthBarTimer);
    
    isTypingGameActive = false;
    if (typingBox) typingBox.innerHTML = "";

    // Find the room data by ID
    let foundRoom = null;
    for (let i = 0; i < roomData.length; i++) {
      if (roomData[i].id === sceneId) {
        foundRoom = roomData[i];
      }
    }
    
    if (foundRoom === null) return;
    currentRoomDetails = foundRoom; 

    // Handle Background Colors
    mainBody.className = "";
    if (foundRoom.isBlackout) mainBody.classList.add("blackout");
    if (foundRoom.scaryFlash) mainBody.classList.add("bloodFlash");

    // Handle Teacher Robert
    if (bobPic) {
      bobPic.className = "hide-teacher"; 
      bobPic.classList.remove("vibrating");
      
      if (foundRoom.showRobert) {
        bobPic.className = "show-teacher"; 
        
        // Move him smoothly to new positions
        if (foundRoom.teacherPosition) {
          bobPic.style.top = foundRoom.teacherPosition.top;
          bobPic.style.left = foundRoom.teacherPosition.left;
          bobPic.style.zIndex = foundRoom.teacherPosition.zIndex;
          bobPic.style.transform = "translate(-50%, -50%) scale(" + foundRoom.teacherPosition.scale + ") rotate(" + foundRoom.teacherPosition.rotate + ")";
        }
        
        if (foundRoom.scaryShake) bobPic.classList.add("vibrating");
      }
    }

    // Handle Hands
    if (leftHand && rightHand) {
      if (foundRoom.isBlackout || foundRoom.scaryCloseup) {
        leftHand.classList.add("hidden");
        rightHand.classList.add("hidden");
      } else {
        leftHand.classList.remove("hidden");
        rightHand.classList.remove("hidden");
      }
    }

    // Handle Light Switch
    if (lightSwitchPic) {
      lightSwitchPic.className = "hidden";
      if (foundRoom.showSwitch) {
        lightSwitchPic.classList.remove("hidden");
        lightSwitchPic.classList.add("flicking");
      }
    }

    // Handle Arrow
    if (arrowPic) {
      arrowPic.className = "hidden";
      if (foundRoom.shootArrow) {
        arrowPic.classList.remove("hidden");
        arrowPic.classList.add("shooting");
      }
    }

    // Handle Sound
    const jumpScareAudio = document.getElementById("scareSound");
    if (foundRoom.playScareSound && jumpScareAudio) {
      jumpScareAudio.play().catch(function() {});
    }

    // Update Text
    dialogueText.innerText = foundRoom.text;
    actionBox.innerHTML = "";
    if (barBox) barBox.classList.add("hidden");

    // Setup Typing Game OR Normal Buttons
    if (foundRoom.requiredKeys && typingBox) {
      keysToPress = foundRoom.requiredKeys;
      currentKeyIndex = 0;
      isTypingGameActive = true;

      // Create letters on screen
      for (let i = 0; i < keysToPress.length; i++) {
        let div = document.createElement("div");
        div.className = "qte-key";
        div.innerText = keysToPress[i];
        typingBox.appendChild(div);
      }
    } else {
      // Create normal buttons
      for (let i = 0; i < foundRoom.options.length; i++) {
        let opt = foundRoom.options[i];
        let btn = document.createElement("button");
        btn.innerText = opt.text;
        btn.addEventListener("click", function() {
          if (opt.goTo === -1) {
            window.location.href = "index.html";
          } else {
            loadScene(opt.goTo);
          }
        });
        actionBox.appendChild(btn);
      }
    }

    // Handle Timers (Red Bar)
    if (foundRoom.timeLimit && barBox && redBar) {
      barBox.classList.remove("hidden");
      let timeLeft = foundRoom.timeLimit;
      
      healthBarTimer = setInterval(function() {
        timeLeft = timeLeft - 50;
        let percent = (timeLeft / foundRoom.timeLimit) * 100;
        redBar.style.width = percent + "%";
      }, 50);

      sceneTimer = setTimeout(function() {
        isTypingGameActive = false;
        loadScene(foundRoom.timeoutTarget);
      }, foundRoom.timeLimit);
    }
  }
});