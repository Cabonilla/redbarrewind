(function () {
  gsap.registerPlugin(ScrollToPlugin);

  const OSName = window.navigator.userAgent.includes("Mac")
    ? "Mac/iOS"
    : "Windows/Linux";
  const overlayVisibleBool = { value: false };
  const overlayBookmarkBool = {
    value: false,
    open: false
  };
  let overlayAppended = false;
  let modalMode;

  let isMoveMutationObserverApplied = false;
  let spotifyOverlayBackground = true;

  let savedScrollPos = 0;
  let isAnimating = false;

  let youtubeVariations = ["watch", "live"]

  let keydownHandler = null; // Define outside to keep the reference
  let keydownListenerAdded = false; // Flag to track if listener is attached

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
    const colorList = {
      "nonhover": "rgba(14, 14, 14, 0.25);",
      "hover": "rgba(103, 103, 103, 0.25);",
      "danger": "rgba(182, 0, 0, 0.25);"
    }
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

      #bookmarkButton:disabled {
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
        background-color: rgba(14, 14, 14, 0.25);
        pointer-events: auto;
        display: grid;
        grid-template-columns: 3fr 1fr auto;
        gap: 1vw; 
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
        background-color: ${colorList["hover"]}
      }

      .bookmark_input:disabled {
        opacity: 0.65;
        color: #fff;
      }

      .mouse_element:hover .bookmark_input:disabled {
        opacity: 0.95;
        color: #fff;
      }

      .mouse_element:has(.remove_bookmark:hover) {
        background-color: ${colorList["danger"]}
      }

      .remove_bookmark {
        opacity: .5;
      }

      .remove_bookmark:hover {
        opacity: 1;
      }

      #add_bookmark {
        background-color: ${colorList["nonhover"]};
      }

      #add_bookmark:hover {
        background-color: ${colorList["hover"]};
      }

      #add_bookmark.dragover {
        background-color: ${colorList["hover"]};
        cursor: grabbing;
      }

      #add_bookmark.dragover #add_logo {
        opacity: .95;
        pointer-events: none;
      }

      #add_logo {
        opacity: .65;
      }

      #add_bookmark:hover #add_logo {
        opacity: .95;
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

      .simplebar-content {
        display: grid;
      }

      .flash-effect {
        animation: flashAnimation .5s cubic-bezier(.25, 0, .3, 1) 2;
      }

      @keyframes flashAnimation {
        0% {inp.style.pointerEvents = "auto";
          background-color: ${colorList["nonhover"]}
        }
        50% {
          background-color: ${colorList["danger"]}
        }
        100% {
          background-color: ${colorList["nonhover"]}
        }
      }

      .shrunk {
        width: 96%;
      }

      #bookmark_time, #current_time {
        text-align: center;
      }
    `;

    document.head.appendChild(style);
  }

  addPreloadStyle();
  addDialogStyles();

  function toggleOverlay() {
    const videoSizing = document.location.href.includes("youtube.com/watch")
      ? document.getElementById("movie_player")
      : document.location.href.includes("redbarradio.net/archives/")
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
        } else {
          modalMode = "close";
          popup.style.opacity = 0;
          if (popupBook) {
            popupBook.style.opacity = 0;
            popupBook.style.visibility = "hidden";
          }
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

  function toggleBookmark(boolean) {
    const bookmarkOverlay = document.getElementById("rr_bookmark")
    if (boolean) {
      bookmarkOverlay.style.visibility = "visible"
      bookmarkOverlay.style.opacity = 1
    } else {
      bookmarkOverlay.style.opacity = 0
      document.getElementById("timeInput").focus();
      setTimeout(() => {
        bookmarkOverlay.style.visibility = "hidden"
      }, 250)
    }
  }

  const rr_logo = chrome.runtime.getURL("assets/RedbarLogo.svg");
  const link_logo = chrome.runtime.getURL("assets/link_8bit.svg");
  const time_logo = chrome.runtime.getURL("assets/clock_8bit.svg");
  const arrow_logo = chrome.runtime.getURL("assets/link_arrow.svg");
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
            <button style="${button_style}" id="submitButton" type="submit" value="jump" name="action"><img src="${arrow_logo}" style="${time_logo_style}"/></button>
            <button style="${time_button_style}" id="timeButton" type="submit" value="time" name="time" class="rr_tooltip-trigger"><img src="${time_logo}" style="${time_logo_style}"/></button>
            <button ${youtubeVariations.some((el) => window.location.href.includes("youtube.com/" + el)) ? `` : "disabled"} style="${link_button_style}" id="linkButton" type="submit" value="link" name="link" class="rr_tooltip-trigger"><img src="${link_logo}" style="${link_logo_style}"/></button>
            <button ${youtubeVariations.some((el) => window.location.href.includes("youtube.com/" + el)) ? `` : "disabled"} style="${bookmark_button_style}" id="bookmarkButton" type="submit" value="bookmark" name="bookmark" class="rr_tooltip-trigger"><img src="${bookmark_logo}" style="${bookmark_logo_style}"/></button> 
          </div>
        </form>
        <small style="${small_style}">© 2023 ALL RIGHTS RESERVED. <span style="font-family: HelNeuMedIt">GIVE IT A DOWNLOAD.</span></small>
      </div>
      <div id="rr_bookmark" style="${rr_bookmark}">
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

    document.getElementById("bookmarkButton").addEventListener("click", () => {
      overlayBookmarkBool.value = true
      overlayBookmarkBool.open = true
      toggleBookmark(overlayBookmarkBool.value)
    });

    document.getElementById("rr_bookmark").addEventListener("click", (event) => {
      if (event.target === document.getElementById("rr_bookmark")) {
        overlayBookmarkBool.value = false
        overlayBookmarkBool.open = false
        toggleBookmark(overlayBookmarkBool.value)
      }
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
      theme: "translucent",
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

  function handleKeydown(event) {
    const isCtrlKey = OSName === "Mac/iOS" ? event.metaKey : event.ctrlKey;
    const isAltKey = OSName === "Mac/iOS" ? event.ctrlKey : event.altKey;

    if (isCtrlKey && isAltKey) {
      if (
        document.location.href.includes("youtube.com/watch") ||
        document.location.href.includes("youtube.com/live") ||
        document.location.href.includes("open.spotify") ||
        document.location.href.includes("redbarradio")
      ) {
        overlayVisibleBool.value = !overlayVisibleBool.value;
        if (!overlayVisibleBool.value && overlayBookmarkBool.open) {
          overlayBookmarkBool.value = false
        } else if (overlayVisibleBool.value && overlayBookmarkBool.open) {
          overlayBookmarkBool.value = true
        }

        if (!overlayAppended) {
          appendOverlay();
          appendListeners();
          appendTippy();
          overlayAppended = true;
        }

        if (!keydownHandler) {
          keydownHandler = (e) => customKeydownHandler(e, 'timeInput');
        }

        if (overlayVisibleBool.value && document.location.href.includes("redbarradio")) {
          if (!keydownListenerAdded) {
            document.addEventListener('keydown', keydownHandler, true);
            keydownListenerAdded = true; // Mark listener as added
          }
        } else {
          if (keydownListenerAdded) {
            document.removeEventListener('keydown', keydownHandler, true);
            keydownListenerAdded = false; // Mark listener as removed
          }
        }

        if (!spotifyOverlayBackground) {
          spotifyOverlayBackground = true;
        }

        toggleOverlay();
        toggleBookmark(overlayBookmarkBool.value);

        document.getElementById("timeInput").value = "";

        if (chrome.storage) {
          let location = window.location.href

          getBookmarksForVideo(location, function (videoBookmarks) {
            if (videoBookmarks) {
              generateDynamicHtmlFromObject(videoBookmarks)
            } else {
              generateDynamicHtmlFromObject(videoBookmarks)
            }
          });
        } else {
          console.error("chrome.storage API is not available.");
        }
      }
    }
  }

  function customKeydownHandler(event, element) {
    // debugger;
    const overlayInput = document.getElementById(`${element}`);
    const isNumberKey = event.key >= '0' && event.key <= '9';

    if (!overlayInput) {
      console.error("Element not found: ", element);
      return;
    }

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

      const inputEvent = new Event('input', { bubbles: true });
      overlayInput.dispatchEvent(inputEvent);
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
    let simple = SimpleBar.instances.get(element);
    simple.getScrollElement().scrollTop = simple.getScrollElement().scrollHeight;
  }


  function horizontalLoopInput(input, config) {
    if (isAnimating) return; // Prevent duplicate animations
    isAnimating = true;

    config = config || {};
    const scrollDistance = input.scrollWidth - input.clientWidth;
    const duration = scrollDistance / (config.speed || 50);

    gsap.timeline({
      onComplete: () => {
        isAnimating = false;
      }
    })
      .to(input, {
        scrollTo: { x: scrollDistance },
        duration: duration,
        ease: "none",
        modifiers: {
          scrollTo(value) {
            return Math.round(value); // Ensure rounded values to avoid jitter
          }
        },
        onUpdate: () => {
          // console.log('Current Scroll Position:', input.scrollLeft);
        },
        onComplete: () => {
          isAnimating = false;
        }
      });
  }

  function onHoldComplete(event, el, curr) {
    const firstInput = el.querySelector("input.bookmark_input");
    gsap.killTweensOf(firstInput);  // Stop scrolling on mouseout
    firstInput.scrollLeft = 0;
    firstInput.style.textOverflow = 'ellipsis';

    if (firstInput) {
      // inp.style.pointerEvents = "auto"
      firstInput.disabled = false;

      firstInput.focus();
      firstInput.setSelectionRange(0, 0);
      firstInput.scrollLeft = 0; // Reset scroll position to the start
    }

    prepInput(firstInput, curr ? firstInput.parentNode.querySelector("#current_time").value : firstInput.parentNode.querySelector("#bookmark_time").value)
    holdCompleted = true;
    event.preventDefault();
  }

  function appendMouseElement(timestamp) {
    isAnimating = false;
    const newMouseElement = document.createElement('li');
    newMouseElement.className = 'mouse_element';

    newMouseElement.innerHTML = `
        <input class="bookmark_input" autocomplete="off" id="current_input" type="text" autofocus style="${bookmark_input}"/>
        <input class="bookmark_input" autocomplete="off" id="current_time" style="${bookmark_input}" value="${timestamp}" disabled/>
        <div class="remove_bookmark" style="${remove_bookmark}"></div>
      `;

    const firstInput = newMouseElement.querySelector("input.bookmark_input");

    const removeBookmark = newMouseElement.querySelector('.remove_bookmark');

    if (removeBookmark) {
      removeBookmark.addEventListener("click", (event) => {
        event.target.parentNode.remove()
        removeBookmarkEntry(window.location.href, timestamp)
        event.preventDefault();
      });
    }

    const lastMouseElement = document.querySelector('#add_bookmark');

    const bookmarkList = document.getElementById('bookmark_list');

    if (lastMouseElement) {
      lastMouseElement.parentNode.insertBefore(newMouseElement, lastMouseElement);
      // debugger;
    } else if (bookmarkList) {
      bookmarkList.appendChild(newMouseElement);
      // debugger;
    } else {
      console.error("No .mouse_element found and no parent list found.");
    }

    const thisInput = document.getElementById('current_input')

    prepInput(thisInput, timestamp)

    scrollToBottom(bookmarkList)
    thisInput.focus();

    const cancelInput = newMouseElement.querySelector('.bookmark_input');
    if (removeBookmark) {
      cancelInput.addEventListener('blur', function (event) {
        if (event.target.value !== "") {
          event.target.setAttribute('disabled', 'on');
        } else {
          let par = event.target.parentNode
          par.remove();
        }
      });
    }

    let holdTimer;
    let holdCompleted = false;

    newMouseElement.addEventListener("mouseover", (event) => {
      event.preventDefault();
      // Find the first input element inside the .mouse_element
      if (firstInput && firstInput.disabled) {
        const isOverflowing = firstInput.scrollWidth > firstInput.clientWidth;
        if (isOverflowing && !isAnimating) {
          firstInput.style.textOverflow = 'clip';
          setTimeout(() => {
            horizontalLoopInput(firstInput, { speed: 50 }, isAnimating);  // Start marquee effect
          }, 500)
        }
      }

      event.preventDefault();
    });

    newMouseElement.addEventListener("mouseout", () => {
      const firstInput = newMouseElement.querySelector("input.bookmark_input");
      gsap.killTweensOf(firstInput);  // Stop scrolling on mouseout
      isAnimating = false;
      firstInput.scrollLeft = 0; // Reset scroll position to the start
      firstInput.style.textOverflow = 'ellipsis';
    });

    newMouseElement.addEventListener("mousedown", (event) => {
      holdCompleted = false;

      clearTimeout(holdTimer);

      const firstInput = newMouseElement.querySelector("input.bookmark_input");
      gsap.killTweensOf(firstInput);  // Stop scrolling on mouseout
      isAnimating = false;

      holdTimer = setTimeout(() => {
        onHoldComplete(event, el, true)
        holdCompleted = true
      }, 1000);
    });

    newMouseElement.addEventListener("mouseup", (event) => {
      clearTimeout(holdTimer);

      if (holdCompleted) {
        event.preventDefault();
      } else {
        simulateKeyPress();
      }

      let inp = event.target.querySelector("#current_input");
      if (inp) {
        inp.style.pointerEvents = "none";
      }
    });

    newMouseElement.addEventListener("mouseleave", (event) => {
      clearTimeout(holdTimer);
      isAnimating = false;
      gsap.killTweensOf(firstInput);  // Stop scrolling on mouseout

      let inp = event.target.querySelector("#current_input");
      if (inp) {
        inp.style.pointerEvents = "none";
      }
    });
  }

  function appendTextElement(timestamp, description) {
    isAnimating = false;
    const newMouseElement = document.createElement('li');
    newMouseElement.className = 'mouse_element';

    newMouseElement.innerHTML = `
        <input class="bookmark_input" autocomplete="off" id="current_input" type="text" autofocus style="${bookmark_input}" value="${description}" disabled/>
        <input class="bookmark_input" autocomplete="off" id="current_time" style="${bookmark_input}" value="${timestamp}" disabled/>
        <div class="remove_bookmark" style="${remove_bookmark}"></div>
      `;

    const removeBookmark = newMouseElement.querySelector('.remove_bookmark');
    const firstInput = newMouseElement.querySelector('input.bookmark_input');

    let tl = firstInput.gsapTimeline || gsap.timeline({
      onComplete: () => {
        isAnimating = false;
      }
    });

    if (!firstInput.gsapTimeline) {
      tl.to(firstInput, {
        scrollTo: { x: firstInput.scrollWidth - firstInput.clientWidth },
        duration: 50,  // Adjust speed as needed
        ease: "none",
        onComplete: () => {
          tl.restart(); // Loop animation
        }
      });

      firstInput.gsapTimeline = tl;  // Cache timeline
    }

    if (removeBookmark) {
      removeBookmark.addEventListener("click", (event) => {
        event.target.parentNode.remove()
        removeBookmarkEntry(window.location.href, timestamp)
        event.preventDefault();
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

    scrollToBottom(bookmarkList)

    let holdTimer;
    let holdCompleted = false;

    newMouseElement.addEventListener("mouseover", (event) => {
      if (firstInput && firstInput.disabled) {
        const isOverflowing = firstInput.scrollWidth > firstInput.clientWidth;
        if (isOverflowing && !isAnimating) {
          firstInput.style.textOverflow = 'clip';
          setTimeout(() => {
            horizontalLoopInput(firstInput, { speed: 50 }, isAnimating);  // Start marquee effect
          }, 500)
        }
      }

      event.preventDefault();
    });

    newMouseElement.addEventListener("mouseout", () => {
      const firstInput = newMouseElement.querySelector("input.bookmark_input");
      tl.pause();  // Stop scrolling
      firstInput.scrollLeft = 0; // Reset scroll position to the start
      isAnimating = false;
      firstInput.style.textOverflow = 'ellipsis';
    });

    newMouseElement.addEventListener("mousedown", (event) => {
      holdCompleted = false;

      clearTimeout(holdTimer);
      const firstInput = newMouseElement.querySelector("input.bookmark_input");
      gsap.killTweensOf(firstInput);  // Stop scrolling on mouseout
      isAnimating = false;

      holdTimer = setTimeout(() => {
        onHoldComplete(event, newMouseElement, true)
        holdCompleted = true
      }, 1000);
    });

    newMouseElement.addEventListener("mouseup", (event) => {
      clearTimeout(holdTimer);

      let inp = event.target.querySelector("#bookmark_input");
      if (inp !== null) {
        inp.style.pointerEvents = "none";
        event.preventDefault();
      }

      if (holdCompleted) {
        event.preventDefault();
      }
    });

    newMouseElement.addEventListener("mouseleave", (event) => {
      clearTimeout(holdTimer);

      let inp = event.target.querySelector("#current_input");
      inp.style.pointerEvents = "none";

      const firstInput = newMouseElement.querySelector("input.bookmark_input");
      gsap.killTweensOf(firstInput);  // Stop scrolling on mouseout
      isAnimating = false;
      firstInput.scrollLeft = 0;
      firstInput.style.textOverflow = 'ellipsis';
    });

    newMouseElement.addEventListener("click", (event) => {
      if (holdCompleted && event.target === newMouseElement) {
        event.preventDefault();
        holdCompleted = false;
        return;
      }

      let inp = event.target.querySelector("#current_time");
      if (event.target === newMouseElement && !holdCompleted) {
        manageBookmarkTime(inp);
        simulateKeyPress();
      }
    });
  }

  function generateDynamicHtmlFromObject(obj) {
    let htmlContent = `<ul id="bookmark_list" style="${bookmark_list}">`;

    if (obj) {
      Object.entries(obj).forEach(([timestamp, description]) => {
        htmlContent += `<li class="mouse_element">
        <input class="bookmark_input" autocomplete="off" id="bookmark_input" type="text" disabled value="${description}" style="${bookmark_input}"/>
          <input class="bookmark_input" autocomplete="off" id="bookmark_time" style="${bookmark_input}" value="${timestamp}" disabled/>
        <div class="remove_bookmark" style="${remove_bookmark}"></div></li>`;
      });
    }

    htmlContent += `<li id="add_bookmark" style="${add_entry}"><img id="add_logo" src="${add_logo}" style="${add_logo_style}"/></li>`

    htmlContent += '</ul>'

    document.getElementById('bookmark_overlay').innerHTML = htmlContent;

    Array.from(document.getElementsByClassName("remove_bookmark")).forEach((remove) => {
      remove.addEventListener("click", (event) => {
        event.currentTarget.parentNode.remove();
        removeBookmarkEntry(window.location.href, event.currentTarget.parentNode.querySelector("#bookmark_time").value);
        event.preventDefault();
      });
    });

    Array.from(document.getElementsByClassName("mouse_element")).forEach((el) => {
      const firstInput = el.querySelector("input.bookmark_input");

      el.addEventListener("mouseover", (event) => {

        if (firstInput && firstInput.disabled) {
          const isOverflowing = firstInput.scrollWidth > firstInput.clientWidth;
          if (isOverflowing && !isAnimating) {
            firstInput.style.textOverflow = 'clip';
            setTimeout(() => {
              horizontalLoopInput(firstInput, { speed: 50 }, isAnimating);  // Start marquee effect
            }, 500)
          }
        }
      });

      el.addEventListener("mouseout", () => {
        const firstInput = el.querySelector("input.bookmark_input");
        isAnimating = false;
        gsap.killTweensOf(firstInput);  // Stop scrolling on mouseout
        firstInput.scrollLeft = 0; // Reset scroll position to the start
        firstInput.style.textOverflow = 'ellipsis';
      });

      el.addEventListener("click", (event) => {
        if (holdCompleted && event.target === el) {
          event.preventDefault();
          holdCompleted = false;
          return;
        }

        let inp = event.target.querySelector("#bookmark_time");
        if (event.target === el && !holdCompleted) {
          manageBookmarkTime(inp);
          simulateKeyPress();
        }
      });

      let holdTimer;
      let holdCompleted = false;

      el.addEventListener("mousedown", (event) => {
        holdCompleted = false;
        clearTimeout(holdTimer);

        const firstInput = el.querySelector("input.bookmark_input");
        gsap.killTweensOf(firstInput);  // Stop scrolling on mouseout
        isAnimating = false;
        firstInput.scrollLeft = 0;
        firstInput.style.textOverflow = 'ellipsis';

        holdTimer = setTimeout(() => {
          onHoldComplete(event, el, false)
          holdCompleted = true
        }, 1000);
      });

      el.addEventListener("mouseup", (event) => {
        clearTimeout(holdTimer);

        let inp = event.target.querySelector("#bookmark_input");
        if (inp !== null) {
          inp.style.pointerEvents = "none";
        }

        if (holdCompleted) {
          event.preventDefault();
        }
      });

      el.addEventListener("mouseleave", (event) => {
        clearTimeout(holdTimer);
        isAnimating = false;
        let inp = event.target.querySelector("#bookmark_input");
        inp.style.pointerEvents = "none"
      });
    });

    const bookmarkList = document.getElementById('bookmark_list');
    if (bookmarkList) {
      const simpleBarInstance = new SimpleBar(bookmarkList);
      const scrollElement = simpleBarInstance.getScrollElement();

      scrollElement.addEventListener('scroll', function () {
        savedScrollPos = scrollElement.scrollTop;
      });

      if (overlayBookmarkBool.value) {
        scrollElement.scrollTop = savedScrollPos;
      }
    }

    const simplebarContent = document.querySelector(".simplebar-content");

    function toggleShrunkClass() {
      if (bookmarkList.classList.contains("simplebar-scrollable-y")) {
        simplebarContent.classList.add("shrunk");
      } else {
        simplebarContent.classList.remove("shrunk");
      }
    }

    const observer = new MutationObserver(toggleShrunkClass);
    observer.observe(bookmarkList, {
      attributes: true,
      attributeFilter: ["class"]
    });

    let add = document.getElementById("add_bookmark")

    add.addEventListener("click", (event) =>
      getBookmarksForVideo(location, function (videoBookmarks) {
        let currTime = handleTimeAdd()
        if (videoBookmarks) {
          getBookmarksForVideo(location, function (videoBookmarks) {
            if (videoBookmarks && currTime in videoBookmarks === false) {
              appendMouseElement(currTime)
            } else {
              if (document.querySelectorAll('.mouse_element').length === 1) {
                applyFlashEffect(document.querySelector('.mouse_element'));
              } else {
                document.querySelectorAll('.mouse_element').forEach(bookmarkTimeElement => {
                  if (!bookmarkTimeElement.querySelector("#bookmark_time")) {
                    applyFlashEffect(bookmarkTimeElement)
                  } else if (bookmarkTimeElement.querySelector("#bookmark_time").value === currTime) {
                    applyFlashEffect(bookmarkTimeElement);
                  }
                });
              }
            }
          }
          );
        } else {
          appendMouseElement(currTime)
        }
      })
    )

    add.addEventListener(('dragover'), (event) => {
      event.preventDefault();
      event.target.classList.add('dragover');
    });

    add.addEventListener(('dragleave'), (event) => {
      event.target.classList.remove('dragover');
    });

    const createTippyInstance = (selector) => {
      return tippy(selector, {
        content: "Added",
        placement: "top",
        arrow: false,
        animation: "scale",
        theme: "translucent size",
        duration: 200,
        trigger: '',
        onShow(instance) {
          setTimeout(() => {
            instance.hide();
          }, 1000); // Hide after 1 second
        },
        appendTo: document.getElementsByClassName("simplebar-content")[0], // Adjust this if necessary
      });
    };

    // Create the Tippy instance
    const tippyInstance = createTippyInstance("#add_bookmark")[0];

    add.addEventListener('drop', (event) => {
      event.preventDefault();
      add.classList.remove('dragover');

      const file = event.dataTransfer.files[0];
      if (file && file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = function (e) {
          let textObj = convertToObj(e.target.result)
          addMultipleEntries(textObj)

          tippyInstance.show();

          for (let [key, value] of Object.entries(textObj)) {
            if (key == window.location.href) {
              for (let [time, desc] of Object.entries(value)) {
                let replace = document.querySelector(`.mouse_element input[value="${time}"]`)
                if (!replace) {
                  appendTextElement(time, desc)
                } else {
                  replace.parentElement.querySelector('#bookmark_input').value = desc
                }
              }
            }
          }
        };
        reader.readAsText(file);
      } else {
        applyFlashEffect(add);
      }
    });
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

  function getBookmarksForVideo(videoUrl, callback) {
    chrome.storage.local.get(['bookmarks'], function (result) {
      let bookmarks = result.bookmarks || {};
      callback(bookmarks[videoUrl] || null);
    });
  }

  function addBookmarkEntry(videoUrl, time, description) {
    chrome.storage.local.get(['bookmarks'], function (result) {
      let bookmarks = result.bookmarks || {};

      if (!bookmarks[videoUrl]) {
        bookmarks[videoUrl] = {};
      }

      bookmarks[videoUrl][time] = description;

      if (description !== '') {
        chrome.storage.local.set({ bookmarks: bookmarks }, function () {
          console.log('Updated storage:', bookmarks);
        });
      }
    });
  }

  function addMultipleEntries(newObj) {
    chrome.storage.local.get(['bookmarks'], function (result) {
      let bookmarks = result.bookmarks || {};

      for (let [newUrl, newEntries] of Object.entries(newObj)) {
        if (!bookmarks[newUrl]) {
          bookmarks[newUrl] = newEntries;
        } else {
          for (let [newTime, newDescription] of Object.entries(newEntries)) {
            bookmarks[newUrl][newTime] = newDescription;
          }
        }
      }

      chrome.storage.local.set({ bookmarks: bookmarks }, function () {
        console.log('Updated storage:', bookmarks);
      });
    });
  }

  function removeBookmarkEntry(videoUrl, time) {
    chrome.storage.local.get(['bookmarks'], function (result) {
      let bookmarks = result.bookmarks || {};

      if ((bookmarks[videoUrl] && bookmarks[videoUrl][time]) || (bookmarks[videoUrl] && bookmarks[videoUrl][time] === '')) {
        delete bookmarks[videoUrl][time];

        if (Object.keys(bookmarks[videoUrl]).length === 0) {
          delete bookmarks[videoUrl];
        }

        chrome.storage.local.set({ bookmarks: bookmarks }, function () {
        });
      }
    });
  }

  function manageTime(e) {
    const action = e.submitter.value;
    if (action === "jump") {
      const timeInput = document.getElementById("timeInput").value.split(":");
      tl = timeInput ? timeInput.length : 0;

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

  function manageBookmarkTime(timeEl) {
    const timeInput = timeEl ? timeEl.value.split(":") : null;
    tl = timeInput ? timeInput.length : 0;

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
  }

  function prepInput(thisInput, timestamp) {
    thisInput.addEventListener('blur', function () {
      this.setAttribute('disabled', 'on');
      addBookmarkEntry(window.location.href, timestamp, this.value)
    });

    thisInput.addEventListener('keydown', function (event) {
      if (event.key === "Enter") {
        this.setAttribute('disabled', 'on');
        addBookmarkEntry(window.location.href, timestamp, this.value)
      }
    });
  }
})();
