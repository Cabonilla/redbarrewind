const yt_logo = chrome.runtime.getURL("assets/yt.svg");
const tw_logo = chrome.runtime.getURL("assets/tw.svg");
const sp_logo = chrome.runtime.getURL("assets/yt.svg");

loading = true

document.addEventListener('DOMContentLoaded', () => {
  shiftView()
});

const loaderRender = () => {
  const container = document.getElementById('video-previews');
  container.innerHTML = `<span id="loader"></span>`
}

function shiftView() {
  loaderRender()
  pushBookmarksToPopup();
}

//320px 240px, 285px 149px, 100px 100px, 236px 30px

function pushBookmarksToPopup() {
  chrome.storage.local.get(['bookmarks'], function (result) {
    if (result.bookmarks) {
      chrome.runtime.sendMessage(
        { type: 'fetchVideoInfo', bookmarks: result.bookmarks },
        function (response) {
          if (chrome.runtime.lastError) {
            console.error('Error receiving response:', chrome.runtime.lastError.message);
          } else if (response && response.videoInfoArray) {
            loading = false
            if (!loading) {
              displayVideoPreviews(response.videoInfoArray);
            }
          } else {
            console.error('No response or videoInfoArray was empty.');
          }
        }
      );
    }
  });
}

function displayLogo(link) {
  if (link.includes('youtube')) {
    return yt_logo
  } else if (link.includes('twitch')) {
    return tw_logo
  } else if (link.includes('spotify')) {
    return sp_logo
  }
}

function displayVideoPreviews(videoInfoArray) {
  const container = document.getElementById('video-previews');
  container.innerHTML = '';

  console.log(videoInfoArray.length)

  if (videoInfoArray.length !== 0) {
    videoInfoArray.forEach(video => {
      const previewElement = document.createElement('div');
      previewElement.innerHTML = `
      <a href="${video.url}" target="_blank" class="video_link">
        <div class="thumbnail_card">
          <div class="thumbnail_container">
            <div class="remove_bookmark_popup"></div>
              <img class="preview_image" src="${video.preview}" alt="${video.title}">
              <div class="preview_label">
                <img class="preview_site" src=${displayLogo(video.url)}/>
                <p class="preview_text" > ${video.title} </p>
              </div>
          </div>
        </div>
      </div>
      </a> 
    `;

      const removeBookmarkPopup = previewElement.querySelector('.remove_bookmark_popup');
      if (removeBookmarkPopup) {
        removeBookmarkPopup.addEventListener("click", (event) => {
          event.preventDefault()
          event.target.parentNode.parentNode.parentNode.parentNode.remove();
          removeEveryBookmarkEntry(video.url)
        });
      }


      function removeEveryBookmarkEntry(videoUrl) {
        chrome.storage.local.get(['bookmarks'], function (result) {
          let bookmarks = result.bookmarks || {};

          if ((bookmarks[videoUrl])) {
            delete bookmarks[videoUrl];

            chrome.storage.local.set({ bookmarks: bookmarks }, function () {
              if (Object.keys(bookmarks).length === 0) {
                console.log(bookmarks.length)
                const container = document.getElementById('video-previews');
                const previewElement = document.createElement('div');
                previewElement.innerHTML = `
                <div class="empty_container">
                  <div class="empty_bookmark">
                    <p>No bookmarks.</p>
                  </div>
                </div>`;

                container.appendChild(previewElement);
              }
            });
          }
        });
      }


      container.appendChild(previewElement);

          // Initialize Tippy on elements with the 'preview_text' class
      tippy('.preview_text', {
        arrow: false,
        animation: "shift-toward",
        theme: "translucent custom",
        placement: 'top',
        inertia: true,
        zIndex: 1000,
        followCursor: true,
        appendTo: document.getElementById("video-previews"),
        trigger: 'mouseenter focus', // Default trigger on hover and focus
        hideOnClick: false, // Prevent hiding when clicking on the element
        duration: [200, 0], // Customize show and hide duration
        content(reference) {
          return reference.innerText; // Set tooltip content dynamically based on the hovered element
        }
      });
    });
  } else {
    const previewElement = document.createElement('div');
    previewElement.innerHTML = `
    <div class="empty_container">
      <div class="empty_bookmark">
        <p>No bookmarks.</p>
      </div>
    </div>`;


    // Append the preview element to the container
    container.appendChild(previewElement);
  }
}
