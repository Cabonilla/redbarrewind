(function () {
  const OSName = window.navigator.userAgent.includes("Mac")
    ? "Mac/iOS"
    : "Windows/Linux";
  const overlayVisibleBool = { value: false };
  let modalMode;

  let domain = window.location.href;

  // let OSName="Mac/iOS";

  const observeUrlChange = () => {
    let oldHref = document.location.href;
    const body = document.querySelector("body");
    const observer = new MutationObserver((mutations) => {
      if (oldHref !== document.location.href) {
        oldHref = document.location.href;
        overlayVisibleBool.value = false;
      }
    });
    observer.observe(body, { childList: true, subtree: true });
  };

  document.addEventListener("DOMContentLoaded", observeUrlChange);

  function addDialogStyles() {
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
        color: rgba(255,255,255,0.5);
      }

      dialog:not([open]) {
        pointer-events: none;
        opacity: 0;
        display: none;
      }    
    `;

    document.head.appendChild(style);
  }

  addDialogStyles();

  function toggleOverlay() {
    const videoElement = window.location.href.includes("watch")
      ? document.getElementById("movie_player")
      : document.querySelector("video");
    const popup = document.getElementById("rr_overlay");

    if (videoElement && popup) {
      const updateOverlayPosition = () => {
        if (overlayVisibleBool.value) {
          const videoRect = videoElement.getBoundingClientRect();
          const popupStyle = popup.style;

          popupStyle.display = "flex";
          popupStyle.left = videoRect.left + "px";
          popupStyle.bottom = videoRect.bottom + "px";
          popupStyle.right = videoRect.right + "px";
          popupStyle.top = videoRect.top + "px";
          popupStyle.width = videoRect.width + "px";
          popupStyle.height = videoRect.height + "px";
          popupStyle.position = "absolute";

          popupStyle.zIndex = 25;

          popupStyle.justifyContent = "center";
          popupStyle.alignItems = "center";
          popupStyle.flexDirection = "column";

          modalMode = document.fullscreenElement ? "showModal" : "show";
          popup[modalMode]();

          popupStyle.opacity = 1;

          const timeInput = document.getElementById("timeInput");
          timeInput && timeInput.focus();
        } else {
          console.log("CLOSING!");
          modalMode = "close";
          popup[modalMode]();
          popup.style.opacity = 0;
        }
      };

      updateOverlayPosition();

      if (overlayVisibleBool.value) {
        const resizeObserver = new ResizeObserver(() => {
          const popup = document.getElementById("rr_overlay");
          const videoRect = videoElement.getBoundingClientRect();
          const popupStyle = popup.style;

          popupStyle.left = videoRect.left + "px";
          popupStyle.bottom = videoRect.bottom + "px";
          popupStyle.right = videoRect.right + "px";
          popupStyle.top = videoRect.top + "px";
          popupStyle.width = videoRect.width + "px";
          popupStyle.height = videoRect.height + "px";

          if (document.fullscreenElement && modalMode === "show") {
            popup.close();
            popup.showModal();
          } else if (!document.fullscreenElement && modalMode === "showModal") {
            popup.close();
            popup.show();
          }
        });

        resizeObserver.observe(videoElement);
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
    <form style="${form_style}" id="jumpForm" method="dialog">
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
  };

  const appendTippy = () => {
    const tippyConfig = {
      arrow: false,
      animation: "scale",
      theme: "translucent",
      inertia: true,
      appendTo: document.getElementById("jumpForm"),
    };

    tippy("#timeButton", { ...tippyConfig, content: "Copy Timecode" });
    tippy("#linkButton", { ...tippyConfig, content: "Copy Timestamp Link" });

    const showCopiedTippy = (selector) => {
      tippy(selector, {
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

    showCopiedTippy("#timeButton");
    showCopiedTippy("#linkButton");
  };

  appendOverlay();
  appendListeners();
  appendTippy();

  function manageTime(e) {
    const action = e.submitter.value;
    if (action === "jump") {
      const timeInput = document.getElementById("timeInput").value.split(":");
      tl = timeInput.length;
      console.log(tl);

      let hoursInput = 0,
        minutesInput = 0,
        secondsInput = 0;

      if (tl === 1) {
        // Only seconds
        secondsInput = parseInt(timeInput[0], 10) || 0;
      } else if (tl === 2) {
        // Minutes and seconds
        minutesInput = parseInt(timeInput[0], 10) || 0;
        secondsInput = parseInt(timeInput[1], 10) || 0;
      } else if (tl === 3) {
        // Hours, minutes, and seconds
        hoursInput = parseInt(timeInput[0], 10) || 0;
        minutesInput = parseInt(timeInput[1], 10) || 0;
        secondsInput = parseInt(timeInput[2], 10) || 0;
      }

      const totalSeconds = hoursInput * 3600 + minutesInput * 60 + secondsInput;

      chrome.runtime?.id &&
        chrome.runtime.sendMessage({
          command: "jumpToTime",
          time: totalSeconds,
        });

      overlayVisibleBool.value = false;
      toggleOverlay();
    }
  }

  // Key command debug.
  // document.addEventListener("keydown", function (event) {
  //   console.log(event)
  // });

  function handleKeydown(event) {
    const isCtrlKey = OSName === "Mac/iOS" ? event.metaKey : event.ctrlKey;
    const isAltKey = OSName === "Mac/iOS" ? event.ctrlKey : event.altKey;

    if (isCtrlKey && isAltKey) {
      if (
        window.location.href.includes("watch") ||
        window.location.href.includes("open")
      ) {
        overlayVisibleBool.value = !overlayVisibleBool.value;

        const overlayDiv = document.getElementById("rr_overlay");

        if (!overlayDiv) {
          appendOverlay();
          appendListeners();
          appendTippy();
        }

        document.getElementById("timeInput").value = "";
        toggleOverlay();
      }
    }
  }

  document.addEventListener("keydown", handleKeydown);

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
