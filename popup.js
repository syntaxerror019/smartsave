const lastSavedEl = document.getElementById("lastSaved");
const clearBtn = document.getElementById("clearBtn");

// Update the last saved time
chrome.storage.sync.get(null, (items) => {
  const keys = Object.keys(items).filter(k => k.startsWith("draft_"));
  if (keys.length) {
    let latestTime = 0;
    keys.forEach(k => {
      const t = items[k + "_time"] || 0;
      if (t > latestTime) latestTime = t;
    });
    if (latestTime) {
      lastSavedEl.textContent = "Last saved: " + new Date(latestTime).toLocaleTimeString();
    }
  }
});

// Clear all saved drafts
clearBtn.addEventListener("click", () => {
  if (!confirm("Are you sure you want to clear all saved drafts?")) {
    return;
  }
  chrome.storage.sync.get(null, (items) => {
    const draftKeys = Object.keys(items).filter(k => k.startsWith("draft_"));
    chrome.storage.sync.remove(draftKeys, () => {
      lastSavedEl.textContent = "Last saved: --";
      alert("All drafts cleared!");
    });
  });
});
