function injectStyles() {
  const style = document.createElement("style");
  style.textContent = `
    .ytdlp-main-button {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      padding: 8px;
      margin-left: 8px;
      border-radius: 100%;
    }

    .ytdlp-main-button svg {
      width: 24px;
      height: 24px;
      fill: rgba(255, 255, 255, 0.8);
    }

    .ytdlp-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      background-color: #fff;
      border-radius: 8px;
      padding: 8px;
      min-width: 200px;
      border: 1px solid #ddd;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      display: none;
      z-index: 1000;
    }

    .ytdlp-dropdown.show {
      display: block;
    }

    .ytdlp-dropdown-item {
      display: block;
      width: 100%;
      padding: 8px 12px;
      background: none;
      border: none;
      color: #000;
      text-align: left;
      cursor: pointer;
      border-radius: 4px;
      font-size: 14px;
    }

    .ytdlp-dropdown-item:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }

    .ytdlp-dropdown-item.copied {
      background-color: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }
  `;
  document.head.appendChild(style);
}

function copyToClipboard(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

function generateCommand(url, format) {
  return `yt-dlp -f ${format} "${url}"`;
}

function createDownloadButton() {
  const button = document.createElement("button");
  button.className = "ytdlp-main-button";
  button.title = "yt-dlp Download";
  button.setAttribute("aria-label", "yt-dlp Download");

  // Download icon SVG
  button.innerHTML = `
    <svg viewBox="0 0 24 24">
      <path d="M3 19H21V21H3V19ZM13 13.1716L19.0711 7.1005L20.4853 8.51472L12 17L3.51472 8.51472L4.92893 7.1005L11 13.1716V2H13V13.1716Z"/>
    </svg>
  `;

  const dropdown = document.createElement("div");
  dropdown.className = "ytdlp-dropdown";

  const formats = [
    { label: "720p", format: "'bv[height<=720]+ba'" },
    { label: "1080p", format: "'bv*[height<=1080][ext=mp4]+ba[ext=m4a]'" },
    { label: "4K", format: "'bv*[height<=2160][ext=mp4]+ba[ext=m4a]'" },
    { label: "Audio", format: "'ba[ext=m4a]'" },
  ];

  formats.forEach(({ label, format }) => {
    const item = document.createElement("button");
    item.className = "ytdlp-dropdown-item";
    item.textContent = `Copy ${label}`;

    item.onclick = (e) => {
      e.stopPropagation();
      const videoUrl = window.location.href;
      const command = generateCommand(videoUrl, format);
      copyToClipboard(command);

      const originalText = item.textContent;
      item.textContent = "Copied!";
      item.classList.add("copied");

      setTimeout(() => {
        item.textContent = originalText;
        item.classList.remove("copied");
      }, 2000);
    };

    dropdown.appendChild(item);
  });

  button.appendChild(dropdown);

  // Toggle dropdown on click
  button.onclick = (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("show");
  };

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!button.contains(e.target)) {
      dropdown.classList.remove("show");
    }
  });

  return button;
}

function addDownloadButton() {
  if (document.querySelector(".ytdlp-main-button")) return;

  // Look for the actions div
  const actionsDiv = document.querySelector("#actions");
  if (!actionsDiv) return;

  const downloadButton = createDownloadButton();

  // Add as the last item in the actions div
  actionsDiv.appendChild(downloadButton);
}

// Initial setup
injectStyles();
setTimeout(addDownloadButton, 1000);

// Watch for navigation changes
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    if (!document.querySelector(".ytdlp-main-button")) {
      setTimeout(addDownloadButton, 1000);
    }
  }
}).observe(document, { subtree: true, childList: true });
