function injectStyles() {
  const style = document.createElement("style");
  style.textContent = `
    .ytdlp-container {
      margin: 1rem;
      padding: 1rem;
      background-color: #f3f4f6;
      border-radius: 0.5rem;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    @media (prefers-color-scheme: dark) {
      .ytdlp-container {
        background-color: #1f2937;
        box-shadow: 0 1px 2px rgba(255, 255, 255, 0.05);
      }
    }

    .ytdlp-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 0.5rem;
      width: 100%;
    }

    .ytdlp-button {
      background-color: #065fd4;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 500;
      border: none;
      cursor: pointer;
      transition: background-color 0.2s;
      outline: none;
    }

    @media (prefers-color-scheme: dark) {
      .ytdlp-button {
        background-color: #3b82f6;
      }
    }

    .ytdlp-button:hover {
      background-color: #0355b9;
    }

    @media (prefers-color-scheme: dark) {
      .ytdlp-button:hover {
        background-color: #2563eb;
      }
    }

    .ytdlp-button:focus {
      box-shadow: 0 0 0 2px #065fd4, 0 0 0 4px rgba(6, 95, 212, 0.3);
    }

    @media (prefers-color-scheme: dark) {
      .ytdlp-button:focus {
        box-shadow: 0 0 0 2px #3b82f6, 0 0 0 4px rgba(59, 130, 246, 0.3);
      }
    }

    .ytdlp-button.copied {
      background-color: #059669;
    }

    @media (prefers-color-scheme: dark) {
      .ytdlp-button.copied {
        background-color: #10b981;
      }
    }

    .ytdlp-instructions {
      margin-top: 0.75rem;
      text-align: center;
      color: #666;
      font-size: 0.875rem;
    }

    @media (prefers-color-scheme: dark) {
      .ytdlp-instructions {
        color: #9ca3af;
      }
    }

    @media (max-width: 640px) {
      .ytdlp-grid {
        grid-template-columns: repeat(2, 1fr);
      }
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

function createDownloadUI() {
  const container = document.createElement("div");
  container.className = "ytdlp-container";

  const buttonGrid = document.createElement("div");
  buttonGrid.className = "ytdlp-grid";

  const formats = [
    { label: "720p", format: "'bv[height<=720]+ba'" },
    { label: "1080p", format: "'bv*[height<=1080][ext=mp4]+ba[ext=m4a]'" },
    { label: "4K", format: "'bv*[height<=2160][ext=mp4]+ba[ext=m4a]'" },
    { label: "Audio", format: "'ba[ext=m4a]'" },
  ];

  formats.forEach(({ label, format }) => {
    const button = document.createElement("button");
    button.className = "ytdlp-button";
    button.textContent = `Copy ${label}`;

    button.onclick = () => {
      const videoUrl = window.location.href;
      const command = generateCommand(videoUrl, format);
      copyToClipboard(command);

      const originalText = button.textContent;
      button.textContent = "Copied!";
      button.classList.add("copied");

      setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove("copied");
      }, 2000);
    };

    buttonGrid.appendChild(button);
  });

  container.appendChild(buttonGrid);

  const instructions = document.createElement("div");
  instructions.className = "ytdlp-instructions";
  instructions.textContent =
    "Paste the copied command in terminal/PowerShell to download";
  container.appendChild(instructions);

  return container;
}

function addDownloadButtons() {
  if (document.querySelector(".ytdlp-container")) return;

  const possibleContainers = [
    document.querySelector("ytd-watch-metadata"),
    document.querySelector("#below"),
    document.querySelector("#info-contents"),
    document.querySelector("#top-row"),
  ];

  const targetContainer = possibleContainers.find((el) => el);
  if (!targetContainer) return;

  const downloadUI = createDownloadUI();
  targetContainer.insertBefore(downloadUI, targetContainer.firstChild);
}

// Initial setup
injectStyles();
setTimeout(addDownloadButtons, 1000);

// Watch for navigation changes
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    if (!document.querySelector(".ytdlp-container")) {
      setTimeout(addDownloadButtons, 1000);
    }
  }
}).observe(document, { subtree: true, childList: true });
