(function () {
  const OSName = window.navigator.userAgent.includes("Mac")
    ? "Mac/iOS"
    : "Windows/Linux";
  const overlayVisibleBool = { value: false };
  const overlayBookmarkBool = { value: false };
  const bookmarkStor = []
  let modalMode;

  let isMoveMutationObserverApplied = false;
  let spotifyOverlayBackground = true;

  let fontLinks = {
    DotGothic: `chrome-extension://${chrome.runtime.id}/assets/DotGothic.ttf`,
    Grischel: `chrome-extension://${chrome.runtime.id}/assets/Grischel.ttf`,
    HelNeuMed: `chrome-extension://${chrome.runtime.id}/assets/HelNeuMed.otf`,
    IBMPlexMono: `chrome-extension://${chrome.runtime.id}/assets/IBMPlexMono-Medium.ttf`,
    HelNeuMedIt: `chrome-extension://${chrome.runtime.id}/assets/HelNeuMedIt.otf`,
  };

  function addPreloadStyle() {
    addPreloadFont(fontLinks["DotGothic"]);
    addPreloadFont(fontLinks["Grischel"]);
    addPreloadFont(fontLinks["HelNeuMed"]);
    addPreloadFont(fontLinks["HelNeuMedIt"]);
    addPreloadFont(fontLinks["IBMPlexMono"]);

    function addPreloadFont(href) {
      const linkElement = document.createElement("link");
      linkElement.rel = "preload";
      linkElement.href = href;
      linkElement.as = "font";
      linkElement.crossOrigin = "";

      document.head.appendChild(linkElement);
    }
  }

  function addDialogStyles() {
    const style = document.createElement("style");
    style.textContent = `
      @font-face {
        font-family: 'DotGothic';
        src: url(${fontLinks["DotGothic"]});
      }

      @font-face {
        font-family: 'Grischel';
        src: url(${fontLinks["Grischel"]});
      }

      @font-face {
        font-family: 'HelNeuMed';
        src: url(${fontLinks["HelNeuMed"]});
      }

      @font-face {
        font-family: 'HelNeuMedIt';
        src: url(${fontLinks["HelNeuMedIt"]});
      }

      @font-face {
        font-family: 'IBMPlexMono';
        src: url(${fontLinks["IBMPlexMono"]});
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
        color: rgba(222, 220, 220, .25);
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
        box-shadow: 0 0 .05vw ${redMeta},
        0 0 .1vw ${redMeta},
        0 0 .2vw ${redMeta},
        0 0 .6vw ${redMeta},
        0 0 .8vw ${redMeta};
      }

      #linkButton:disabled {
        pointer-events: none;
        opacity: .55;
      }

      #timeButton:hover {
        box-shadow: 0 0 .05vw ${redMeta},
        0 0 .1vw ${redMeta},
        0 0 .2vw ${redMeta},
        0 0 .6vw ${redMeta},
        0 0 .8vw ${redMeta};
      }

      #bookmarkButton:hover {
        box-shadow: 0 0 .05vw ${redMeta},
        0 0 .1vw ${redMeta},
        0 0 .2vw ${redMeta},
        0 0 .6vw ${redMeta},
        0 0 .8vw ${redMeta};
      }

      #submitButton:hover {
        box-shadow: 0 0 .05vw ${redMeta},
        0 0 .1vw ${redMeta},
        0 0 .2vw ${redMeta},
        0 0 .6vw ${redMeta},
        0 0 .8vw ${redMeta};
      }

      .tippy-content {
        font-size: .5vw;
        font-family: "HelNeuMed";
      }

      .mouse_element {
        background-color: rgba(51,51,51,0.25);
        pointer-events: auto;
        display: grid;
        grid-template-columns: 2fr 1fr auto;
        gap: 1vw; 
        width: 95%;
        height: .85vw;
        border-radius: 5vw;
        margin-bottom: .5vw;
        padding: 0.5vw 1vw;
        align-content: center;
        cursor: pointer;
        transition: background-color .25s cubic-bezier(.25, 0, .3, 1) !important;
        z-index: 100;
      }

      .mouse_element:hover {
        background-color: rgba(191,191,191,0.25);
      }

      .bookmark_label {
        opacity: 0.65;
      }

      .mouse_element:hover .bookmark_label {
        opacity: 0.85;
      }

      .mouse_element:has(.remove_bookmark:hover) {
        background-color: rgba(255, 36, 36, 0.25);
      }

      .remove_bookmark {
        opacity: .5;
      }

      .remove_bookmark:hover {
        opacity: 1;
      }

      #add_bookmark {
        background-color: rgba(51,51,51,0.25);
      }

      #add_bookmark:hover {
        background-color: rgba(191,191,191,0.25);
      }

      #add_logo {
        opacity: .65;
      }

      #add_bookmark:hover #add_logo {
        opacity: .85;
      }

      #bookmark_list {
        overflow-x: hidden;
        overflow-y: auto;
      }

      .simplebar-track.simplebar-vertical {
        background-color: rgba(255, 36, 36, 0.25);
        border-radius: 1vw;
        z-index: 100%;
      }
      
      .simplebar-scrollbar {
        background-color: rgba(255, 36, 36, 0.50);
        border-radius: 1vw;
      }

      .simplebar-scrollbar::before {
        background-color: rgba(255, 36, 36, 1);
      }

      .simplebar-track.simplebar-horizontal {
        display: none;
      }
    `;

    document.head.appendChild(style);
  }

  addPreloadStyle();
  addDialogStyles();

  function toggleOverlay() {
    const videoSizing = document.location.href.includes("youtube.com/watch")
      ? document.getElementById("movie_player")
      : document.location.href.includes("redbarradio.net/shows/")
        ? document.getElementById("player_html5_api")
        : document.querySelector("video");
    const popup = document.getElementById("rr_overlay");
    const popupBook = document.getElementById("rr_bookmark");

    if (document.getElementById('player')) {
      videoEl = document.getElementById('player');
    }

    if (videoSizing && popup) {
      const updateOverlayPosition = () => {
        if (overlayVisibleBool.value) {
          const videoRect = videoSizing.getBoundingClientRect();
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
          popupBook.style.display = "flex"
        } else {
          modalMode = "close";
          popup.style.opacity = 0;
          popupBook.style.display = "none"
          setTimeout(() => {
            popup[modalMode]();
          }, 250);
        }
      };

      updateOverlayPosition();

      if (overlayVisibleBool.value) {
        const resizeObserver = new ResizeObserver(() => {
          const popup = document.getElementById("rr_overlay");
          const videoRect = videoSizing.getBoundingClientRect();
          if (!videoRect) {
            overlayVisibleBool.value = false;
            toggleOverlay();
          }
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
          const videoRect = videoSizing.getBoundingClientRect();
          if (!videoRect) {
            overlayVisibleBool.value = false;
            toggleOverlay();
          }
          const popupStyle = popup.style;

          popupStyle.left = videoRect.left + "px";
          popupStyle.bottom = videoRect.bottom + "px";
          popupStyle.right = videoRect.right + "px";
          popupStyle.top = videoRect.top + "px";
          popupStyle.width = videoRect.width + "px";
          popupStyle.height = videoRect.height + "px";
        });

        if (!isMoveMutationObserverApplied) {
          resizeObserver.observe(videoSizing);
          moveObserver.observe(videoSizing, {
            attributes: true,
            attributeFilter: ["style", "class"],
          });
        }

        isMutationObserverApplied = true;
      }
    }
  }

  const rr_logo = chrome.runtime.getURL("assets/RedbarLogo.svg");
  const link_logo = chrome.runtime.getURL("assets/link_8bit.svg");
  const time_logo = chrome.runtime.getURL("assets/clock_8bit.svg");
  const bookmark_logo = chrome.runtime.getURL("assets/bookmark_8bit.svg");
  const add_logo = chrome.runtime.getURL("assets/add.svg");

  const appendOverlay = () => {
    const overlay = `
    <dialog id="rr_overlay" style="${overlay_style}">
      <div id="rr_container" style="${rr_container}"> 
        <div class="redbar_title" style="${redbar_title}">
          <img src="${rr_logo}" style="${image_style}"/>
          <h1 class="rewind_text" style="${rewind_text}">Rewind®</h1>
        </div>
        <form style="${form_style}" id="jumpForm" method="dialog">
          <input style="${input_style}" autocomplete="off" type="text" id="timeInput" class="timeInput" name="timeInput" placeholder="00:00:00" maxlength="8"/>
          <div class="button_group" style="${buttons_style}">
            <button style="${button_style}" id="submitButton" type="submit" value="jump" name="action"><span>→</span></button>
            <button style="${time_button_style}" id="timeButton" type="submit" value="time" name="time" class="rr_tooltip-trigger"><img src="${time_logo}" style="${time_logo_style}"/></button>
            <button ${document.location.href.includes("youtube.com/watch") ? `` : "disabled"
      } style="${link_button_style}" id="linkButton" type="submit" value="link" name="link" class="rr_tooltip-trigger"><img src="${link_logo}" style="${link_logo_style}"/></button>
            <button style="${bookmark_button_style}" id="bookmarkButton" type="submit" value="bookmark" name="bookmark"class="rr_tooltip-trigger"><img src="${bookmark_logo}" style="${bookmark_logo_style}"/></button> 
          </div>
        </form>
        <small style="${small_style}">© 2023 ALL RIGHTS RESERVED. <span style="font-family: HelNeuMedIt">GIVE IT A DOWNLOAD.</span></small>
      </div>
      <div id="rr_bookmark" style="width: 100%; height: 100%; position: absolute; display: flex; justify-content: center; align-items: center;">
        <div id="bookmark_overlay" style="${bookmark_style}">
        </div>
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
            document.location.href.includes("spotify") &&
            document.fullscreenElement
          ) {
            document.getElementsByClassName(
              "npv-video-overlay"
            )[0].style.opacity = 0;
            document.getElementsByClassName(
              "npv-what-is-playing"
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
      inputValue = inputValue.replace(
        /(\d{0,2}):?(\d{0,2})?:?(\d{0,2})?/,
        function (match, p1, p2, p3) {
          return (
            (p1 || "") +
            (p2 ? ":" + (p2.length > 1 ? p2 : p2) : "") +
            (p3 ? ":" + (p3.length > 1 ? p3 : p3) : "")
          );
        }
      );

      e.target.value = inputValue;
    });

    const handleFullscreenChange = () => {
      const popup = document.getElementById("rr_overlay");
      if (
        document.fullscreenElement &&
        overlayVisibleBool.value &&
        modalMode !== "showModal"
      ) {
        popup.close();
        modalMode = "showModal";
        toggleOverlay();
      } else if (
        !document.fullscreenElement &&
        overlayVisibleBool.value &&
        modalMode === "showModal"
      ) {
        popup.close();
        modalMode = "show";
        toggleOverlay();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    window.addEventListener("beforeunload", function (event) {
      const popup = document.getElementById("rr_overlay");
      popup.style.opacity = 0;
      popup.close();
    });
  };

  const appendTippy = () => {
    const tippyConfig = {
      arrow: false,
      animation: "scale",
      theme: "translucent size",
      inertia: true,
      appendTo: document.getElementById("jumpForm"),
      zIndex: 1000,
    };

    tippy("#timeButton", { ...tippyConfig, content: "Copy Timecode" });
    tippy("#linkButton", { ...tippyConfig, content: "Copy Timestamp Link" });
    tippy("#bookmarkButton", { ...tippyConfig, content: "Open Bookmark" });

    const showCopiedTippy = (selector) => {
      tippy(selector, {
        trigger: "click focus",
        content: "Copied!",
        arrow: false,
        animation: "fade",
        theme: "translucent size",
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
        secondsInput = parseInt(timeInput[0], 10) || 0;
      } else if (tl === 2) {
        minutesInput = parseInt(timeInput[0], 10) || 0;
        secondsInput = parseInt(timeInput[1], 10) || 0;
      } else if (tl === 3) {
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

  function handleKeydown(event) {
    const isCtrlKey = OSName === "Mac/iOS" ? event.metaKey : event.ctrlKey;
    const isAltKey = OSName === "Mac/iOS" ? event.ctrlKey : event.altKey;

    if (isCtrlKey && isAltKey) {
      if (
        document.location.href.includes("youtube.com/watch") ||
        document.location.href.includes("open.spotify") ||
        document.location.href.includes("redbarradio")
      ) {
        overlayVisibleBool.value = !overlayVisibleBool.value;

        // const overlayDiv = document.getElementById("rr_overlay");

        // if (!overlayDiv) {
        //   appendOverlay();
        //   appendListeners();
        //   appendTippy();
        // }

        if (overlayVisibleBool.value && document.location.href.includes("redbarradio")) {
          document.addEventListener('keydown', customKeydownHandler, true);
        } else {
          document.removeEventListener('keydown', customKeydownHandler, true);
        }

        if (!spotifyOverlayBackground) {
          spotifyOverlayBackground = true;
        }

        toggleOverlay();
        document.getElementById("timeInput").value = "";

        if (!overlayBookmarkBool.value) {
          chrome.runtime.sendMessage({ command: "fetchJsonData" }, (response) => {
            if (response && response.success) {
              checkLocationAndLog(response.data)
            } else {
              console.error("Failed to fetch JSON:", response ? response.error : "No response");
            }
          });
        }
      }
    }
  }

  function customKeydownHandler(event) {
    const overlayInput = document.getElementById('timeInput');
    const isNumberKey = (event.which >= 48 && event.which <= 57) || (event.which >= 96 && event.which <= 105);

    if (isNumberKey) {
      event.preventDefault();
      event.stopPropagation();

      overlayInput.focus();

      const numberKey = event.key;

      if (overlayInput.value.length <= 7) {
        overlayInput.value += numberKey;
      } else {
        return;
      }

      const inputEvent = new Event('input', { false: true });
      overlayInput.dispatchEvent(inputEvent);
    }
  }

  function checkLocationAndLog(jsonData) {
    let currentUrl = document.location.href;

    if (jsonData.hasOwnProperty(currentUrl)) {
      console.log(jsonData[currentUrl]);

      if (!overlayBookmarkBool.value) {
        generateDynamicHtmlFromObject(jsonData[currentUrl])
      }
    } else {
      console.log("No match found for the current URL.");
    }
  }

  function removeOverlay() {
    const overlayDiv = document.getElementById("rr_overlay");
    if (overlayDiv) {
      overlayVisibleBool.value = false;
      toggleOverlay()
    }
  }

  function scrollToBottom(element) {
    console.log("SCROLLING NOW!")
    let simple = SimpleBar.instances.get(element);
    simple.getScrollElement().scrollTop = simple.getScrollElement().scrollHeight;
  }

  function appendMouseElement(description, timestamp) {
    const newMouseElement = document.createElement('li');
    newMouseElement.className = 'mouse_element';

    newMouseElement.innerHTML = `
        <span class="bookmark_label" style="${bookmark_label}">${description}</span>
        <span class="bookmark_label" style="${bookmark_label}">${timestamp}</span>
        <div class="remove_bookmark" style="${remove_bookmark}"></div>
    `;
    
    // newMouseElement.innerHTML = `
    //     <span class="bookmark_label" style="${bookmark_label}">${description}</span>
    //     <span class="bookmark_label" style="${bookmark_label}">${timestamp}</span>
    //     <div class="remove_bookmark" style="${remove_bookmark}"></div>
    // `;

    const removeBookmark = newMouseElement.querySelector('.remove_bookmark');
    if (removeBookmark) {
      removeBookmark.addEventListener("click", (event) => {
        event.target.parentNode.remove()
      });
    }

    const lastMouseElement = document.querySelector('#add_bookmark');

    const bookmarkList = document.getElementById('bookmark_list');

    if (lastMouseElement) {
      lastMouseElement.parentNode.insertBefore(newMouseElement, lastMouseElement);
    } else if (bookmarkList) {
      bookmarkList.appendChild(newMouseElement);
    } else {
      console.error("No .mouse_element found and no parent list found.");
    }
    console.log("SCROLL DOWN!")

    scrollToBottom(bookmarkList)
  }

  function generateDynamicHtmlFromObject(obj) {
    let htmlContent = `<ul id="bookmark_list" style="${bookmark_list}" data-simplebar>`;

    Object.entries(obj).forEach(([timestamp, description]) => {
      htmlContent += `<li class="mouse_element"><span class="bookmark_label" style="${bookmark_label}">${description}</span><span class="bookmark_label" style="${bookmark_label}">${timestamp}</span><div class="remove_bookmark" style="${remove_bookmark}"></div></li>`;
    });
    htmlContent += `<li id="add_bookmark" style="${add_entry}"><img id="add_logo" src="${add_logo}" style="${add_logo_style}"/></li>`

    htmlContent += '</ul>'

    document.getElementById('bookmark_overlay').innerHTML = htmlContent;
    overlayBookmarkBool.value = !overlayBookmarkBool.value

    Array.from(document.getElementsByClassName("remove_bookmark")).forEach((remove) => {
      remove.addEventListener("click", (event) => {
        event.target.parentNode.remove()
      });
    });
    document.getElementById("add_bookmark").addEventListener("click", () => appendMouseElement('New Description', '00:00:00'))
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

  window.addEventListener('popstate', removeOverlay);

  window.addEventListener('load', removeOverlay);
})();
