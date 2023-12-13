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

  const jumpForm = document.getElementById("jumpForm");

  jumpForm.addEventListener("submit", function (e) {
    e.preventDefault();
    manageTime(e);
  });

  function manageTime(e) {
    const action = e.submitter.value;
    if (action === "jump") {
      const timeInput = document.getElementById("timeInput").value.split(":");
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
    }
  }

  document.getElementById("timeButton").addEventListener("click", () => {
    handleClick(handleTimeCopy());
  });

  document.getElementById("linkButton").addEventListener("click", () => {
    handleClick(handleLinkCopy());
  });

  document.addEventListener("keydown", function (event) {
    // Check for Ctrl (Windows) or Meta (Mac) key
    const isCtrlKey = event.ctrlKey || event.metaKey;
    
    // Check for Alt (Windows) or Option (Mac) key
    const isAltKey = event.altKey;
  
    if (isCtrlKey && isAltKey) {
      if (
        window.location.href.includes("watch") ||
        window.location.href.includes("open")
      ) {
        document.getElementById("timeInput").value = "";
        overlayVisibleBool = !overlayVisibleBool;
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
