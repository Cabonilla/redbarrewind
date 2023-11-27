console.log("content.js");
let overlayVisibleBool = false;

// Function to handle overlay display
function toggleOverlay(overlayVisible) {
  chrome.runtime.sendMessage(
    { command: "checkActiveTab" },
    function (response) {
      if (response && response.isValid) {
        const videoElement = document.getElementsByTagName("video")[0];
        const popup = document.getElementById("rr_overlay");

        if (videoElement && popup) {
          const videoRect = videoElement.getBoundingClientRect();

          overlayVisible = !overlayVisible;

          if (!overlayVisible) {
            console.log(videoRect);
            popup.style.display = "flex";
            popup.style.position = "absolute";
            popup.style.left = videoRect.left + "px";
            popup.style.bottom = videoRect.bottom + "px";
            popup.style.top = videoRect.top + "px";
            popup.style.width = videoRect.width + "px";
            popup.style.height = videoRect.height + "px";
            
            popup.style.zIndex = 9999;

            popup.style.justifyContent = "center";
            popup.style.alignItems = "center";
            popup.style.flexDirection = "column";

            const timeInput = document.getElementById("timeInput");
            if (timeInput) {
              timeInput.focus();
            }
          } else {
            // Hide the overlay
            popup.style.display = "none";
          }
        }
      }
    }
  );
}

window.onresize = function () {
  const videoElement = document.querySelector("video");
  const videoRect = videoElement.getBoundingClientRect();
  const popup = document.getElementById("rr_overlay");
  popup.style.left = videoRect.left + "px";
  popup.style.bottom = videoRect.bottom + "px";
  popup.style.top = videoRect.top + "px";
  popup.style.width = videoRect.width + "px";
  popup.style.height = videoRect.height + "px";
};

let overlay_style = `
  display: none; 
  position: fixed; 
  top: 0; 
  right: 0; 
  bottom: 0; 
  left: 0; 
  background-color: rgba(0, 0, 0, 0.75);
`;

let image_style = `
  width: 200px;
  height: auto;
  margin-top: -50px;
  margin-bottom: -15px;
`;

let link_logo_style = `
  width: 12px;
  height: auto;
`;

let input_style = `
  border: 0px solid;
  background-color: transparent;
  color: white;
  font-size: 24px;
  padding: 10px;
  width: 120px;
  outline: none;
  font-family: Arial, sans-serif;
`;

let form_style = `
  display: flex;
  align-items: center;
`;

let button_style = `
  width: 100px;
  height: 30px;
  line-height: 20px;
  padding: 0;
  border: none;
  background: rgb(255,27,0);
  background: linear-gradient(0deg, rgba(255,27,0,1) 0%, rgba(251,75,2,1) 100%);
  cursor: pointer;
  border-radius: 5px;
  font-size: 12px;
  color: white;
`;

let link_button_style = `
  width: 30px;
  height: 30px;
  line-height: 20px;
  padding: 0;
  border: none;
  background: rgb(255,27,0);
  background: linear-gradient(0deg, rgba(255,27,0,1) 0%, rgba(251,75,2,1) 100%);
  cursor: pointer;
  border-radius: 5px;
  margin-left: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

// Create and append overlay element
// const rr_logo = "./assets/redbarrewind.svg";
const rr_logo = chrome.runtime.getURL("assets/rrewind.svg");
const link_logo = chrome.runtime.getURL("assets/link.svg");
const overlay = `
  <div id="rr_overlay" style="${overlay_style}">
    <img src="${rr_logo}" style="${image_style}"/>
    <form style="${form_style}" id="jumpForm">
      <input style="${input_style}" autocomplete="off" type="text" id="timeInput" placeholder="00:00:00" />
      <button style="${button_style}" type="submit" value="jump" name="action">Go</button>
      <button style="${link_button_style}" type="submit" value="link" name="link"><img src="${link_logo}" style="${link_logo_style}"/></button>
    </form>
  </div>`;

const popupElement = document.createElement("div");
popupElement.setAttribute("id", "popup_container")
popupElement.setAttribute("class", "popup_container");
popupElement.innerHTML = overlay;
document.body.appendChild(popupElement);

console.log("Plugged in.");

const jumpForm = document.getElementById("jumpForm");

jumpForm.addEventListener("submit", function (e) {
  e.preventDefault();
  console.log("submitting jump");
  manageTime(e);
});

function manageTime(e) {
  console.log(timeInput);
  chrome.runtime.sendMessage(
    { command: "checkActiveTab" },
    function (response) {
      if (response && response.isValid) {
        const action = e.submitter.value;
        console.log(action);
        if (action === "jump") {
          const timeInput = document
            .getElementById("timeInput")
            .value.split(":");
          console.log(timeInput);
          tl = timeInput.length;

          let hoursInput, minutesInput, secondsInput, totalSeconds;

          if (tl === 3) {
            hoursInput = parseInt(timeInput[0], 10) || 0;
            minutesInput = parseInt(timeInput[1], 10) || 0;
            secondsInput = parseInt(timeInput[2], 10) || 0;
            totalSeconds = hoursInput * 3600 + minutesInput * 60 + secondsInput;
          } else if (tl === 2) {
            minutesInput = parseInt(timeInput[0], 10) || 0;
            secondsInput = parseInt(timeInput[1], 10) || 0;
            totalSeconds = minutesInput * 60 + secondsInput;
          } else if (tl === 1) {
            secondsInput = parseInt(timeInput[0], 10) || 0;
            totalSeconds = secondsInput;
          } else {
            return;
          }

          // const hoursInput = parseInt(timeInput[2], 10) || 0;
          // const minutesInput = parseInt(timeInput[1], 10) || 0;
          // const secondsInput = parseInt(timeInput[0], 10) || 0;

          // const totalSeconds = hoursInput * 3600 + minutesInput * 60 + secondsInput;
          // console.log("hours: ", hoursInput);
          // console.log("minutes: ", minutesInput);
          // console.log("seconds: ", secondsInput);
          // console.log("total: ", totalSeconds);

          chrome.runtime.sendMessage({
            command: "jumpToTime",
            time: totalSeconds,
          });
          overlayVisibleBool = false;
          toggleOverlay(overlayVisibleBool);
        } else if (action === "link") {
          const videoElement = document.querySelector("video");
          let totalSeconds = videoElement.currentTime;
          chrome.runtime.sendMessage({
            command: "getLink",
            time: totalSeconds,
          });
        }
      }
    }
  );
}

document.addEventListener("keydown", function (event) {
  // Check if CTRL + ` is pressed
  if (event.ctrlKey && event.key === "`") {
    console.log("TOGGLE ACTIVATED!");
    overlayVisibleBool = !overlayVisibleBool;
    console.log("overlay: ", overlayVisibleBool);
    toggleOverlay(overlayVisibleBool);
  }
});

