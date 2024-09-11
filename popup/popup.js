const yt_logo = chrome.runtime.getURL("assets/yt.svg");
const tw_logo = chrome.runtime.getURL("assets/tw.svg");
const sp_logo = chrome.runtime.getURL("assets/yt.svg");

document.addEventListener('DOMContentLoaded', () => {
  pushBookmarksToPopup();
});

function pushBookmarksToPopup() {
  chrome.storage.local.get(['bookmarks'], function (result) {
    if (result.bookmarks) {
      chrome.runtime.sendMessage(
        { type: 'fetchVideoInfo', bookmarks: result.bookmarks },
        function (response) {
          if (chrome.runtime.lastError) {
            console.error('Error receiving response:', chrome.runtime.lastError.message);
          } else if (response && response.videoInfoArray) {
            displayVideoPreviews(response.videoInfoArray);
          } else {
            console.error('No response or videoInfoArray was empty.');
          }
        }
      );
    }
  });
}

function displayLogo (link) {
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

      const removeBookmark = previewElement.querySelector('.remove_bookmark_popup');
      if (removeBookmark) {
        removeBookmark.addEventListener("click", (event) => {
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

      const imgElement = previewElement.querySelector('img');

      imgElement.addEventListener('mouseenter', () => {
        tippySingleton.setContent(video.title);
        tippySingleton.setProps({ reference: imgElement });
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

const tippySingleton = tippy(document.createElement('div'), {
  arrow: false,
  animation: "shift-toward",
  theme: "translucent custom",
  placement: 'top',
  inertia: true,
  zIndex: 1000,
  followCursor: true,
  appendTo: document.getElementById("video-previews"),
  content: '', // Initial empty content
  trigger: 'manual', // Manual trigger to control when it's shown/hidden
  hideOnClick: false, // Prevent the tooltip from staying visible after clicking
  duration: [200, 0] // Customize show and hide duration: [showDuration, hideDuration]
});

// Add event listeners to manually control the singleton tooltip visibility
document.addEventListener('mouseover', (event) => {
  const target = event.target;
  if (target.classList.contains('preview_text')) {
    tippySingleton.show();
  } else {
    tippySingleton.hide();
  }
});