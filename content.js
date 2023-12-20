(function () {
  let OSName;
  if (window.navigator.userAgent.indexOf("Mac") != -1) {
    OSName = "Mac/iOS";
  } else if (
    window.navigator.userAgent.indexOf("Windows") != -1 ||
    window.navigator.userAgent.indexOf("Linux") != -1
  ) {
    OSName = "Windows";
  }

  // let OSName="Mac/iOS";

  if (window.hasRun === true) return true;
  window.hasRun = true;

  let overlayVisibleBool = false;
  let modalMode;

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
          popup.style.right = videoRect.right + "px";
          popup.style.top = videoRect.top + "px";
          popup.style.width = videoRect.width + "px";
          popup.style.height = videoRect.height + "px";

          popup.style.zIndex = 25;

          popup.style.justifyContent = "center";
          popup.style.alignItems = "center";
          popup.style.flexDirection = "column";
          if (document.fullscreenElement) {
            modalMode = "showModal"
            popup.showModal();
          } else {
            modalMode = "show"
            popup.show();
          }

          const timeInput = document.getElementById("timeInput");
          if (timeInput) {
            timeInput.focus();
          }
        } else {
          popup.style.display = "none";
          console.log("CLOSING!");
          modalMode = "none"
          popup.close();
        }
      };

      updateOverlayPosition();

      if (overlayVisibleBool) {
        const onresize = (dom_elem, callback) => {
          const resizeObserver = new ResizeObserver(() => callback());
          resizeObserver.observe(dom_elem);
        };

        onresize(videoElement, function () {
          const popup = document.getElementById("rr_overlay");
          const videoRect = videoElement.getBoundingClientRect();
          popup.style.left = videoRect.left + "px";
          popup.style.bottom = videoRect.bottom + "px";
          popup.style.right = videoRect.right + "px";
          popup.style.top = videoRect.top + "px";
          popup.style.width = videoRect.width + "px";
          popup.style.height = videoRect.height + "px";
          if (document.fullscreenElement && modalMode === "show") {
            popup.close()
            popup.showModal()
          } else if (!document.fullscreenElement && modalMode === "showModal") {
            popup.close()
            popup.show()
          }
        });
      }
    }
  }

  const rr_logo = chrome.runtime.getURL("assets/rrewind.svg");
  const link_logo = chrome.runtime.getURL("assets/link.svg");
  const time_logo = chrome.runtime.getURL("assets/time.svg");

  const appendOverlay = () => {
    const overlay = `
  <dialog id="rr_overlay" style="${overlay_style}">
    <img src="${rr_logo}" style="${image_style}"/>
    <form style="${form_style}" id="jumpForm">
      <input style="${input_style}" autocomplete="off" type="text" id="timeInput" class="timeInput" name="timeInput" placeholder="00:00:00" value=""/>
      <button style="${button_style}" type="submit" value="jump" name="action">Go</button>
      <button style="${time_button_style}" id="timeButton" type="submit" value="time" name="time" class="rr_tooltip-trigger"}><img src="${time_logo}" style="${time_logo_style}"/></button>
      <button style="${
        domain.includes("youtube") ? link_button_style : "display: none;"
      }" id="linkButton" type="submit" value="link" name="link" class="rr_tooltip-trigger"><img src="${link_logo}" style="${link_logo_style}"/></button>
    </form>
  </dialog>
`;

    const popupElement = document.createElement("div");
    popupElement.id = "popup_container";
    popupElement.className = "popup_container";
    popupElement.innerHTML = overlay;

    document.body.appendChild(popupElement);
  };

  const appendListeners = () => {
    const jumpForm = document.getElementById("jumpForm");

    jumpForm.addEventListener("submit", function (e) {
      e.preventDefault();
      manageTime(e);
    });

    document.getElementById("timeButton").addEventListener("click", () => {
      handleClick(handleTimeCopy());
    });

    document.getElementById("linkButton").addEventListener("click", () => {
      handleClick(handleLinkCopy());
    });

    tippy("#timeButton", {
      content: "Copy Timecode",
      arrow: false,
      animation: "scale",
      theme: "translucent",
      inertia: true,
      appendTo: document.getElementById("jumpForm"),
    });

    tippy("#linkButton", {
      content: "Copy Timestamp Link",
      arrow: false,
      animation: "scale",
      theme: "translucent",
      inertia: true,
      appendTo: document.getElementById("jumpForm"),
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
      appendTo: document.getElementById("jumpForm"),
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
      appendTo: document.getElementById("jumpForm"),
    });
  };

  appendOverlay();
  appendListeners();

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
      const popup = document.getElementById("rr_overlay");
      popup.close();
      toggleOverlay();
    }
  }

  function addCustomStyles() {
    const style = document.createElement("style");
    style.textContent = `
      dialog::backdrop {
        position: absolute;
        top: 0px;
        right: 0px;
        bottom: 0px;
        left: 0px;
        background: rgba(0, 0, 0, 0.0);
      }

      dialog:-internal-dialog-in-top-layer {
        max-width: 100%;
        max-height: 100%;
      }

      #timeInput::placeholder {
        color: rgba(255,255,255,0.25);
      }
    `;

    document.head.appendChild(style);
    
  }

  addCustomStyles();

  // Key command debug.
  // document.addEventListener("keydown", function (event) {
  //   console.log(event)
  // });

  document.addEventListener("keydown", function (event) {
    // Check for Ctrl (Windows) or Meta (Mac) key
    let isCtrlKey;
    if (OSName === "Mac/iOS") {
      isCtrlKey = event.metaKey;
    } else if (OSName === "Windows") {
      isCtrlKey = event.ctrlKey;
    }

    // Check for Alt (Windows) or Control (Mac) key
    let isAltKey;
    if (OSName === "Mac/iOS") {
      isAltKey = event.ctrlKey;
    } else if (OSName === "Windows") {
      isAltKey = event.altKey;
    }

    if (isCtrlKey && isAltKey) {
      if (
        window.location.href.includes("watch") ||
        window.location.href.includes("open")
      ) {
        overlayVisibleBool = !overlayVisibleBool;

        const overlayDiv = document.getElementById("rr_overlay");

        if (!overlayDiv) {
          appendOverlay();
          appendListeners();
        }

        document.getElementById("timeInput").value = "";
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
})();
