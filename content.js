(function () {
  const OSName = window.navigator.userAgent.includes("Mac")
    ? "Mac/iOS"
    : "Windows/Linux";
  const overlayVisibleBool = { value: false };
  let modalMode;

  // let OSName="Mac/iOS";
  let isMoveMutationObserverApplied = false;
  let spotifyOverlayBackground = true;

  const observeUrlChange = () => {
    let oldHref = document.location.href;
    const body = document.querySelector("body");
    const URLObserver = new MutationObserver((mutations) => {
      if (oldHref !== document.location.href) {
        oldHref = document.location.href;
        overlayVisibleBool.value = false;
      }
    });
    URLObserver.observe(body, { childList: true, subtree: true });
  };

  document.addEventListener("DOMContentLoaded", observeUrlChange);

  function addDialogStyles() {
    const style = document.createElement("style");
    style.textContent = `
      @font-face {
        font-family: 'DotGothic';
        src: url(chrome-extension://${chrome.runtime.id}/assets/DotGothic.ttf);
      }

      @font-face {
        font-family: 'Grischel';
        src: url(chrome-extension://${chrome.runtime.id}/assets/Grischel.ttf);
      }

      @font-face {
        font-family: 'HelNeuMed';
        src: url(chrome-extension://${chrome.runtime.id}/assets/HelNeuMed.otf);
      }

      @font-face {
        font-family: 'HelNeuMedIt';
        src: url(chrome-extension://${chrome.runtime.id}/assets/HelNeuMedIt.otf);
      }

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
        color: rgba(222, 220, 220, .5);
      }

      dialog:not([open]) {
        pointer-events: none;
        opacity: 0;
        display: none;
      }    

      #timeInput::selection {
        background: rgba(252, 255, 255, .25);
      }

      #linkButton:hover {
        box-shadow: 0 1px 1px ${redMeta},
        0 0 2px ${redMeta},
        0 0 4px ${redMeta},
        0 0 8px ${redMeta},
        0 0 16px ${redMeta}
      }
      #linkButton:disabled {
        pointer-events: none;
        opacity: .55;
      }
      #timeButton:hover {
        box-shadow: 0 1px 1px ${redMeta},
        0 0 2px ${redMeta},
        0 0 4px ${redMeta},
        0 0 8px ${redMeta},
        0 0 16px ${redMeta}
      }
      #submitButton:hover {
        box-shadow: 0 1px 1px ${redMeta},
        0 0 2px ${redMeta},
        0 0 4px ${redMeta},
        0 0 8px ${redMeta},
        0 0 16px ${redMeta}
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
          modalMode = "close";
          popup.style.opacity = 0;
          setTimeout(() => {
            popup[modalMode]();
          }, 250);
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

          if (document.fullscreenElement && modalMode === "show" && videoRect) {
            popup.close();
            popup.showModal();
          } else if (
            !document.fullscreenElement &&
            modalMode === "showModal" &&
            videoRect
          ) {
            popup.close();
            popup.show();
          }
        });

        const moveObserver = new MutationObserver(() => {
          const videoRect = videoElement.getBoundingClientRect();
          const popupStyle = popup.style;

          popupStyle.left = videoRect.left + "px";
          popupStyle.bottom = videoRect.bottom + "px";
          popupStyle.right = videoRect.right + "px";
          popupStyle.top = videoRect.top + "px";
          popupStyle.width = videoRect.width + "px";
          popupStyle.height = videoRect.height + "px";
        });

        if (!isMoveMutationObserverApplied) {
          resizeObserver.observe(videoElement);
          moveObserver.observe(videoElement, {
            attributes: true,
            attributeFilter: ["style", "class", "anyOtherAttribute"],
          });
        }

        isMutationObserverApplied = true;
      }
    }
  }

  const rr_logo = chrome.runtime.getURL("assets/RedbarLogo.svg");
  const link_logo = chrome.runtime.getURL("assets/link_8bit.svg");
  const time_logo = chrome.runtime.getURL("assets/clock_8bit.svg");

  const appendOverlay = () => {
    const overlay = `
    <dialog id="rr_overlay" style="${overlay_style}">
      <div id="rr_container" style="${rr_container}" data-tilt data-tilt-glare data-tilt-max-glare="0.8">
        <div class="redbar_title" style="${redbar_title}">
          <img src="${rr_logo}" style="${image_style}"/>
          <h1 class="rewind_text" style="${rewind_text}">Rewind®</h1>
        </div>
        <form style="${form_style}" id="jumpForm" method="dialog">
          <input style="${input_style}" autocomplete="off" type="text" id="timeInput" class="timeInput" name="timeInput" placeholder="00:00:00" value="" maxlength="8"/>
          <div class="button_group" style="${buttons_style}">
            <button style="${button_style}" id="submitButton" type="submit" value="jump" name="action"><span style="font-family: DotGothic; font-size: 20px; color: #dedcdc;">→</span></button>
            <button style="${time_button_style}" id="timeButton" type="submit" value="time" name="time" class="rr_tooltip-trigger"><img src="${time_logo}" style="${time_logo_style}"/></button>
            <button ${
              window.location.href.includes("youtube") ? `` : "disabled"
            } style="${link_button_style}" id="linkButton" type="submit" value="link" name="link" class="rr_tooltip-trigger"><img src="${link_logo}" style="${link_logo_style}"/></button>
          </div>
        </form>
        <p style="margin-top: 10px; font-family: HelNeuMed; font-size: 8px; color: #FF2424;">© 2023 ALL RIGHTS RESERVED. <span style="font-family: HelNeuMedIt">GIVE IT A DOWNLOAD.</span></p>
      </div>
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

    document
      .getElementById("rr_overlay")
      .addEventListener("click", function (e) {
        if (this === e.target) {
          document.getElementById("timeInput").focus();
          if (
            spotifyOverlayBackground &&
            window.location.href.includes("spotify") &&
            document.fullscreenElement
          ) {
            document.getElementsByClassName(
              "npv-video-overlay"
            )[0].style.opacity = 0;
          }
          spotifyOverlayBackground = false;
        }
      });

    document.getElementById("timeButton").addEventListener("click", () => {
      handleClick(handleTimeCopy());
    });

    document.getElementById("linkButton").addEventListener("click", () => {
      handleClick(handleLinkCopy());
    });

    document.getElementById("timeInput").addEventListener("input", (e) => {
      let inputValue = e.target.value;
      inputValue = inputValue.replace(/[^0-9]/g, "");
      inputValue = inputValue.replace(/(\d{0,2}):?(\d{0,2})?:?(\d{0,2})?/, function(match, p1, p2, p3) {
        console.log(p1, p2, p3)
        return (p1 || '') + (p2 ? ':' + (p2.length > 1 ? p2 : p2) : '') + (p3 ? ':' + (p3.length > 1 ? p3 : p3) : '');
      });
  
      e.target.value = inputValue;
    });

    const handleFullscreenChange = () => {
      const popup = document.getElementById("rr_overlay");
      if (
        document.fullscreenElement &&
        overlayVisibleBool.value &&
        modalMode !== "showModal"
      ) {
        // Video is in fullscreen and modal is not in fullscreen mode
        popup.close();
        modalMode = "showModal";
        console.log("converting to ", modalMode);
        toggleOverlay();
      } else if (
        !document.fullscreenElement &&
        overlayVisibleBool.value &&
        modalMode === "showModal"
      ) {
        // Video is not in fullscreen and modal is in fullscreen mode
        popup.close();
        modalMode = "show";
        console.log("converting to ", modalMode);
        toggleOverlay();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    window.addEventListener('beforeunload', function (event) {
      const popup = document.getElementById("rr_overlay");
      popup.style.opacity = 0;
      popup.close();
    });
  };

  const appendTippy = () => {
    const tippyConfig = {
      arrow: false,
      animation: "scale",
      theme: "translucent",
      inertia: true,
      appendTo: document.getElementById("jumpForm"),
      zIndex: 1000,
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
        if (!spotifyOverlayBackground) {
          spotifyOverlayBackground = true;
        }
        toggleOverlay();
        document.getElementById("timeInput").value = "";
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
