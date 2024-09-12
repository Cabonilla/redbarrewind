(function () {
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
      "nonhover": "rgba(38, 42, 43, 0.25);",
      "hover": "rgba(60, 65, 68, 0.25);",
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
        background-color: rgba(38, 42, 43, 0.25);
        pointer-events: auto;
        display: grid;
        grid-template-columns: 2fr 1fr auto;
        gap: 1vw; 
        width: 90%;
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
        opacity: 0.85;
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
        opacity: .85;
        pointer-events: none;
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

      .simplebar-content {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .flash-effect {
        animation: flashAnimation .5s cubic-bezier(.25, 0, .3, 1) 2;
      }
    `;

    document.head.appendChild(style);
  }

  addPreloadStyle();
  addDialogStyles();
  // pushBookmarksToPopup();

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
          // popupBook.style.display = "flex"
        } else {
          modalMode = "close";
          popup.style.opacity = 0;
          popupBook.style.opacity = 0;
          popupBook.style.visibility = "hidden";
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
            <button ${window.location.href.includes("youtube.com/watch") ? `` : "disabled"} style="${link_button_style}" id="linkButton" type="submit" value="link" name="link" class="rr_tooltip-trigger"><img src="${link_logo}" style="${link_logo_style}"/></button>
            <button ${window.location.href.includes("youtube.com/watch") ? `` : "disabled"} style="${bookmark_button_style}" id="bookmarkButton" type="submit" value="bookmark" name="bookmark" class="rr_tooltip-trigger"><img src="${bookmark_logo}" style="${bookmark_logo_style}"/></button> 
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

    console.log("CURRENT WEBSITE:", window.location.href)

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
      // console.log("value: ", overlayBookmarkBool.value, "open: ", overlayBookmarkBool.open)
      toggleBookmark(overlayBookmarkBool.value)
    });

    document.getElementById("rr_bookmark").addEventListener("click", (event) => {
      if (event.target === document.getElementById("rr_bookmark")) {
        overlayBookmarkBool.value = false
        overlayBookmarkBool.open = false
        // console.log("value: ", overlayBookmarkBool.value, "open: ", overlayBookmarkBool.open)
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
        document.location.href.includes("open.spotify") ||
        document.location.href.includes("redbarradio")
      ) {
        overlayVisibleBool.value = !overlayVisibleBool.value;
        if (!overlayVisibleBool.value && overlayBookmarkBool.open) {
          overlayBookmarkBool.value = false
        } else if (overlayVisibleBool.value && overlayBookmarkBool.open) {
          overlayBookmarkBool.value = true
        }

        // console.log("overlay: ", overlayVisibleBool)
        // console.log("value: ", overlayBookmarkBool.value, "open: ", overlayBookmarkBool.open)
        // console.log(!overlayVisibleBool.value && overlayBookmarkBool.open)
        if (!overlayAppended) {
          appendOverlay();
          appendListeners();
          appendTippy();
          overlayAppended = true;
        }

        if (overlayVisibleBool.value && document.location.href.includes("redbarradio")) {
          document.addEventListener('keydown', customKeydownHandler(event, 'timeInput'), true);
        } else {
          document.removeEventListener('keydown', customKeydownHandler(event, 'timeInput'), true);
        }

        if (!spotifyOverlayBackground) {
          spotifyOverlayBackground = true;
        }

        toggleOverlay();
        toggleBookmark(overlayBookmarkBool.value)

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
    const overlayInput = document.getElementById(`${element}`);
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

  function appendMouseElement(timestamp) {
    const newMouseElement = document.createElement('li');
    newMouseElement.className = 'mouse_element';

    newMouseElement.innerHTML = `
        <input class="bookmark_input" autocomplete="off" id="current_input" type="text" autofocus style="${bookmark_input}"/>
        <input class="bookmark_input" autocomplete="off" id="current_time" style="${bookmark_input}" value="${timestamp}" disabled/>
        <div class="remove_bookmark" style="${remove_bookmark}"></div>
      `;

    const removeBookmark = newMouseElement.querySelector('.remove_bookmark');
    if (removeBookmark) {
      removeBookmark.addEventListener("click", (event) => {
        event.target.parentNode.remove()
        removeBookmarkEntry(window.location.href, timestamp)
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

    const thisInput = document.getElementById('current_input')

    prepInput(thisInput, timestamp)

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

    function onHoldComplete(event) {
      // console.log("Held for 2 seconds!");
      // console.log(event.target)
      let inp = event.target.querySelector("#current_input");
      inp.style.pointerEvents = "auto";
      inp.disabled = false;
      inp.focus();
      prepInput(inp, inp.parentNode.querySelector("#current_time").value)
      holdCompleted = true;
      // console.log(inp)
      event.preventDefault();
    }

    newMouseElement.addEventListener("mousedown", (event) => {
      holdCompleted = false;
      holdTimer = setTimeout(() => onHoldComplete(event), 1000);
    });

    newMouseElement.addEventListener("mouseup", (event) => {
      clearTimeout(holdTimer);

      if (holdCompleted) {
        event.preventDefault();
      }

      let inp = event.target.querySelector("#current_input");
      if (inp) {
        inp.style.pointerEvents = "none";
      }
    });

    newMouseElement.addEventListener("mouseleave", (event) => {
      clearTimeout(holdTimer);

      let inp = event.target.querySelector("#current_input");
      if (inp) {
        inp.style.pointerEvents = "none";
      }
    });
  }


  function appendTextElement(timestamp, description) {
    const newMouseElement = document.createElement('li');
    newMouseElement.className = 'mouse_element';

    newMouseElement.innerHTML = `
        <input class="bookmark_input" autocomplete="off" id="current_input" type="text" autofocus style="${bookmark_input}" value="${description}" disabled/>
        <input class="bookmark_input" autocomplete="off" id="current_time" style="${bookmark_input}" value="${timestamp}" disabled/>
        <div class="remove_bookmark" style="${remove_bookmark}"></div>
      `;

    const removeBookmark = newMouseElement.querySelector('.remove_bookmark');
    if (removeBookmark) {
      removeBookmark.addEventListener("click", (event) => {
        event.target.parentNode.remove()
        removeBookmarkEntry(window.location.href, timestamp)
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

    function onHoldComplete(event) {
      // console.log("Held for 2 seconds!");
      // console.log(event.target)
      let inp = event.target.querySelector("#current_input");
      inp.style.pointerEvents = "auto";
      inp.disabled = false;
      inp.focus();
      prepInput(inp, inp.parentNode.querySelector("#current_time").value)
      holdCompleted = true;
      // console.log(inp)
      event.preventDefault();
    }

    newMouseElement.addEventListener("mousedown", (event) => {
      holdCompleted = false;
      holdTimer = setTimeout(() => onHoldComplete(event), 1000);
    });

    newMouseElement.addEventListener("mouseup", (event) => {
      clearTimeout(holdTimer);

      if (holdCompleted) {
        event.preventDefault();
      }

      let inp = event.target.querySelector("#current_input");
      inp.style.pointerEvents = "none";
    });

    newMouseElement.addEventListener("mouseleave", (event) => {
      clearTimeout(holdTimer);

      let inp = event.target.querySelector("#current_input");
      inp.style.pointerEvents = "none";
    });
  }

  function generateDynamicHtmlFromObject(obj) {
    let htmlContent = `<ul id="bookmark_list" style="${bookmark_list}" data-simplebar>`;

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
        let par = event.target.parentNode
        par.remove();
        removeBookmarkEntry(window.location.href, par.querySelector("#bookmark_time").value)
      });
    });

    Array.from(document.getElementsByClassName("mouse_element")).forEach((el) => {
      el.addEventListener("click", (event) => {
        if (holdCompleted) {
          event.preventDefault();
          holdCompleted = false;
          return;
        }

        let inp = event.target.querySelector("#bookmark_time");
        manageBookmarkTime(inp);
        simulateKeyPress();
      });

      let holdTimer;
      let holdCompleted = false;

      function onHoldComplete(event) {
        // console.log("Held for 2 seconds!");
        let inp = event.target.querySelector("#bookmark_input");
        inp.style.pointerEvents = "auto"
        inp.disabled = false;
        inp.focus();
        prepInput(inp, inp.parentNode.querySelector("#bookmark_time").value)
        holdCompleted = true;
        // console.log(inp)
        event.preventDefault();
      }

      el.addEventListener("mousedown", (event) => {
        holdCompleted = false;
        clearTimeout(holdTimer);
        holdTimer = setTimeout(() => onHoldComplete(event), 1000);
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

        let inp = event.target.querySelector("#bookmark_input");
        inp.style.pointerEvents = "none"
      });
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

    add.addEventListener('drop', (event) => {
      event.preventDefault();
      add.classList.remove('dragover');

      const file = event.dataTransfer.files[0];
      if (file && file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = function (e) {
          let textObj = convertToObj(e.target.result)
          addMultipleEntries(textObj)

          for (let [key, value] of Object.entries(textObj)) {
            // getBookmarksForVideo(key, (entry) => {
            //   if (entry && key == window.location.href) {
            //     for (let [time, desc] of Object.entries(value)) {
            //       if (!(time in entry)) {
            //         appendTextElement(time, desc)
            //         addBookmarkEntry(key, time, desc)
            //         console.log("Additional Entry: ", key, time, desc)
            //       } else {
            //         console.log("Collision Entry: ", key, time, desc)
            //         let replace = document.querySelector(`.mouse_element input[value="${time}"]`)
            //         replace.parentElement.querySelector('#bookmark_input').value = desc
            //         addBookmarkEntry(key, time, desc)
            //       }
            //     }
            //   } else {
            //     for (let [time, desc] of Object.entries(value)) {
            //       console.log("New Entry: ", key, time, desc)
            //       addBookmarkEntry(key, time, desc)
            //     }
            //   }
            // })

            if (key == window.location.href) {
              for (let [time, desc] of Object.entries(value)) {
                let replace = document.querySelector(`.mouse_element input[value="${time}"]`)
                if (!replace) {
                  appendTextElement(time, desc)
                  console.log("Additional Entry: ", key, time, desc)
                } else {
                  replace.parentElement.querySelector('#bookmark_input').value = desc
                  console.log("Collision Entry: ", key, time, desc)
                }
              }
            }

            // if (key == window.location.href) {
            //   for (let [time, desc] of Object.entries(value)) {
            //     let replace = document.querySelector(`.mouse_element input[value="${time}"]`)
            //     if (!replace) {
            //       appendTextElement(time, desc)
            //       addBookmarkEntry(key, time, desc)
            //       console.log("Additional Entry: ", key, time, desc)
            //     } else {
            //       console.log("Collision Entry: ", key, time, desc)
            //       replace.parentElement.querySelector('#bookmark_input').value = desc
            //       addBookmarkEntry(key, time, desc)
            //     }
            //   }
            // } else {
            //   for (let [time, desc] of Object.entries(value)) {
            //     console.log("New Entry: ", key, time, desc)
            //     addBookmarkEntry(key, time, desc)
            //   }
            // }
          }
        };
        reader.readAsText(file);
      } else {
        alert("Please drop a valid text file.");
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

  // function pushBookmarksToPopup() {
  //   chrome.storage.local.get(['bookmarks'], function (result) {
  //     gatherVideoInfo(result["bookmarks"]);
  //   });
  // }

  function addBookmarkEntry(videoUrl, time, description) {
    chrome.storage.local.get(['bookmarks'], function (result) {
      let bookmarks = result.bookmarks || {};

      if (!bookmarks[videoUrl]) {
        bookmarks[videoUrl] = {};
      }

      bookmarks[videoUrl][time] = description;
      console.log("Entered: ", videoUrl, time, description);

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

  function manageBookmarkTime(timeEl) {
    const timeInput = timeEl ? timeEl.value.split(":") : null;
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
  }

  function prepInput(thisInput, timestamp) {
    thisInput.addEventListener('blur', function () {
      this.setAttribute('disabled', 'on');
      addBookmarkEntry(window.location.href, timestamp, this.value)
      // console.log("NO BLUR!")
    });

    thisInput.addEventListener('keydown', function (event) {
      if (event.key === "Enter") {
        this.setAttribute('disabled', 'on');
        addBookmarkEntry(window.location.href, timestamp, this.value)
      }
    });
  }

  //   chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  //     if (message.type === 'runGatherVideoInfo') {
  //       pushBookmarksToPopup();
  //     }
  // });
})();
