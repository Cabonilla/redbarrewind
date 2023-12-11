// console.log("content.js");

(function () {
  if (window.hasRun === true) return true;
  window.hasRun = true;

  let overlayVisibleBool = false;
  let listenersAdded = false;

  let domain = window.location.href;
  const observeUrlChange = () => {
    let oldHref = document.location.href;
    const body = document.querySelector("body");
    const observer = new MutationObserver((mutations) => {
      if (oldHref !== document.location.href) {
        oldHref = document.location.href;
        overlayVisibleBool = false;
        const popup = document.getElementById("rr_overlay");
        popup.style.display = "none";
      }
    });
    observer.observe(body, { childList: true, subtree: true });
  };

  window.onload = observeUrlChange;
  // console.log("observing");

  function toggleOverlay() {
    let videoElement;
    if (window.location.href.includes("watch")) {
      videoElement = document.getElementById("movie_player");
    } else {
      videoElement = document.getElementsByTagName("video")[0];
    }
    const popup = document.getElementById("rr_overlay");

    if (videoElement && popup) {
      const updateOverlayPosition = () => {
        if (overlayVisibleBool) {
          const videoRect = videoElement.getBoundingClientRect();
          // console.log("overlay: ", overlayVisibleBool);
          // console.log(videoRect);
          popup.style.display = "flex";
          popup.style.position = "absolute";
          popup.style.left = videoRect.left + "px";
          popup.style.bottom = videoRect.bottom + "px";
          popup.style.top = videoRect.top + "px";
          popup.style.width = videoRect.width + "px";
          popup.style.height = videoRect.height + "px";

          popup.style.zIndex = 25;

          popup.style.justifyContent = "center";
          popup.style.alignItems = "center";
          popup.style.flexDirection = "column";

          const timeInput = document.getElementById("timeInput");
          if (timeInput) {
            timeInput.focus();
          }
        } else {
          popup.style.display = "none";
        }
      };
      updateOverlayPosition();

      if (!listenersAdded && overlayVisibleBool) {
        const onresize = (dom_elem, callback) => {
          const resizeObserver = new ResizeObserver(() => callback());
          resizeObserver.observe(dom_elem);
        };

        onresize(videoElement, function () {
          const videoRect = videoElement.getBoundingClientRect();
          popup.style.left = videoRect.left + "px";
          popup.style.bottom = videoRect.bottom + "px";
          popup.style.top = videoRect.top + "px";
          popup.style.width = videoRect.width + "px";
          popup.style.height = videoRect.height + "px";
          popup.style.width = videoRect.width + "px";
          popup.style.height = videoRect.height + "px";
        });
      }
    }
  }

  let overlay_style = `
  display: none;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5);
  clear: both;
`;

  let image_style = `
  width: 200px;
  height: auto;
  padding: 15px;
`;

  let link_logo_style = `
  width: 12px;
  height: auto;
`;
  let time_logo_style = `
  width: 12px;
  height: auto;
`;

  let input_style = `
  border: 0px solid;
  background-color: transparent;
  color: white;
  width: 150px;
  font-size: 24px;
  padding: 10px;
  padding: .5em;
  outline: none;
  font-family: Arial, sans-serif;
  z-index: 99999 !important;
  position: relative;
`;

  let form_style = `
  display: flex;
  align-items: center;
  justify-content: center;
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
  margin-left: 10px;
`;

  let link_button_style = `
  width: 30px;
  height: 30px;
  line-height: 20px;
  padding: 0;
  border: none;
  background: linear-gradient(0deg, rgba(255,27,0,1) 0%, rgba(251,75,2,1) 100%);
  cursor: pointer;
  border-radius: 5px;
  margin-left: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
`;
  let time_button_style = `
  width: 30px;
  height: 30px;
  line-height: 20px;
  padding: 0;
  border: none;
  background: linear-gradient(0deg, rgba(255,27,0,1) 0%, rgba(251,75,2,1) 100%);
  cursor: pointer;
  border-radius: 5px;
  margin-left: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

  const rr_logo = chrome.runtime.getURL("assets/rrewind.svg");
  const link_logo = chrome.runtime.getURL("assets/link.svg");
  const time_logo = chrome.runtime.getURL("assets/time.svg");

  const overlay = `
  <div id="rr_overlay" style="${overlay_style}">
    <img src="${rr_logo}" style="${image_style}"/>
    <form style="${form_style}" id="jumpForm">
    <label for="timeInput"></label>
      <input style="${input_style}" autocomplete="off" type="text" id="timeInput" class="timeInput" name="timeInput" placeholder="00:00:00" value=""/>
      <button style="${button_style}" type="submit" value="jump" name="action">Go</button>
      <button style="${time_button_style}" id="timeButton" type="submit" value="time" name="time" class="rr_tooltip-trigger"}><img src="${time_logo}" style="${time_logo_style}"/></button>
      <button style="${
        domain.includes("youtube") ? link_button_style : "display: none;"
      }" id="linkButton" type="submit" value="link" name="link" class="rr_tooltip-trigger"><img src="${link_logo}" style="${link_logo_style}"/></button>
    </form>
  </div>
`;

  const popupElement = document.createElement("div");
  popupElement.id = "popup_container";
  popupElement.className = "popup_container";
  popupElement.innerHTML = overlay;
  document.body.appendChild(popupElement);

  // console.log("Plugged in.");

  const jumpForm = document.getElementById("jumpForm");

  jumpForm.addEventListener("submit", function (e) {
    e.preventDefault();
    // console.log("submitting jump");
    manageTime(e);
  });

  function manageTime(e) {
    const action = e.submitter.value;
    // console.log(action);
    if (action === "jump") {
      const timeInput = document.getElementById("timeInput").value.split(":");
      // console.log(timeInput);
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

      chrome.runtime?.id
        ? chrome.runtime.sendMessage({
            command: "jumpToTime",
            time: totalSeconds,
          })
        : null;
      overlayVisibleBool = false;
      toggleOverlay();
    } else if (action === "link") {
      const videoElement = document.querySelector("video");
      let totalSeconds = videoElement.currentTime;
      if (domain.includes("youtube")) {
        const pageUrl = window.location.href
          .replace("www.", "")
          .replace("youtube.com", "youtu.be")
          .replace("watch?v=", "");
        // chrome.runtime?.id
        //   ? chrome.runtime.sendMessage({
        //       command: "getLink",
        //       time: totalSeconds,
        //     })
        //   : null;
      }
    } else if (action === "time") {
      // console.log("TIME STUFF!");
      document.getElementById("timeButton").focus();
      const videoElement = document.querySelector("video");
      let currTime = videoElement.currentTime;

      function secondsToTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = Math.floor(seconds % 60);

        const formattedTime = `${padZero(hours)}:${padZero(minutes)}:${padZero(
          remainingSeconds
        )}`;
        return formattedTime;
      }

      function padZero(num) {
        return num < 10 ? `0${num}` : num;
      }

      // Example usage:
      const formattedTime = secondsToTime(currTime);
      // console.log(formattedTime);
      // chrome.runtime?.id
      //   ? chrome.runtime.sendMessage({
      //       command: "copyTime",
      //       time: formattedTime,
      //     })
      //   : null;
    } else {
      // console.log("nothin'");
      return;
    }
  }

  const handleClick = async (text) => {
    try {
      await navigator.clipboard.writeText(text).then(() => {
        console.log("Copied!");
      });
    } catch (err) {
      console.error("Error Copying Text:", err);
    }
  };

  const handleTimeCopy = () => {
    const videoElement = document.querySelector("video");
    let currTime = videoElement.currentTime;

    function secondsToTime(seconds) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = Math.floor(seconds % 60);

      const formattedTime = `${padZero(hours)}:${padZero(minutes)}:${padZero(
        remainingSeconds
      )}`;
      return formattedTime;
    }

    function padZero(num) {
      return num < 10 ? `0${num}` : num;
    }

    // Example usage:
    const paddedTime = secondsToTime(currTime);
    console.log(paddedTime);
    return paddedTime;
  };

  const handleLinkCopy = () => {
    const videoElement = document.querySelector("video");
    let totalSeconds = videoElement.currentTime;
    if (window.location.href.includes("youtube")) {
      const pageUrl = window.location.href
        .replace("www.", "")
        .replace("youtube.com", "youtu.be")
        .replace("watch?v=", "");

      return pageUrl + "?feature=shared&t=" + Math.ceil(totalSeconds);
    }
  };

  document.getElementById("timeButton").addEventListener("click", () => {
    handleClick(handleTimeCopy());
  });

  document.getElementById("linkButton").addEventListener("click", () => {
    handleClick(handleLinkCopy());
  });

  document.addEventListener("keydown", function (event) {
    // Check if CTRL + ` is pressed
    if (event.ctrlKey && event.altKey) {
      if (
        window.location.href.includes("watch") ||
        window.location.href.includes("open")
      ) {
        document.getElementById("timeInput").value = "";
        // console.log("TOGGLE ACTIVATED!");
        overlayVisibleBool = !overlayVisibleBool;
        // console.log("overlay: ", overlayVisibleBool);
        toggleOverlay();
      }
    }
  });

  document.addEventListener(
    "focusin",
    function (event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    },
    true
  );

  tippy("#timeButton", {
    content: "Copy Timecode",
    arrow: false,
    animation: "scale",
    theme: "translucent",
    inertia: true,
  });

  tippy("#linkButton", {
    content: "Copy Timestamp Link",
    arrow: false,
    animation: "scale",
    theme: "translucent",
    inertia: true,
  });

  tippy("#timeButton", {
    trigger: "click focus",
    content: "Copied!",
    arrow: false,
    animation: "fade",
    theme: "translucent",
    duration: 200,
    onShow(instance) {
      setTimeout(() => {
        instance.hide();
      }, 1000);
    },
  });

  tippy("#linkButton", {
    trigger: "click focus",
    content: "Copied!",
    arrow: false,
    animation: "fade",
    theme: "translucent",
    duration: 200,
    onShow(instance) {
      setTimeout(() => {
        instance.hide();
      }, 1000);
    },
  });
})();
