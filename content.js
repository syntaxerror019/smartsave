console.log("SmartSave for Classroom active - Version 1.0 - www.mileshilliard.com");

let lastSaveTime = 0;

function saveDraft(e) {
    const now = Date.now();
    const key = "draft_" + location.pathname;
    const value = e.target.value;

    // max save time of once/ 600ms (or about 100 times/ min)
    if (now - lastSaveTime < 600) return;

    lastSaveTime = now;

    const obj = {};
    obj[key] = value;
    chrome.storage.sync.set(obj, () => {
        console.log("[SmartSave] Saved draft:", value);
        chrome.storage.sync.set({ [key + "_time"]: now });
        message(
            "Draft saved successfully by&nbsp;<a href='https://www.mileshilliard.com/' target='_blank' rel='noopener'>SmartSave for Classroom</a>",
            icon = "📁"
        );
    });
}

// restore draft from chrome.storage.sync
function restoreDraft(el) {
  const key = "draft_" + location.pathname;
  chrome.storage.sync.get([key], (result) => {
    const saved = result[key];
    if (saved && !el.value) {
      el.value = saved;

      // Trigger Classroom UI update
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
      el.focus();

      console.log("[SmartSave] Restored draft: ", saved);
      message(
        "Draft restored successfully by&nbsp;<a href='https://www.mileshilliard.com/' target='_blank' rel='noopener'>SmartSave for Classroom</a>", 
        icon="📂"
    );
    } else {
        message(
            "Start typing to save your draft with&nbsp;<a href='https://www.mileshilliard.com/' target='_blank' rel='noopener'>SmartSave for Classroom</a>",
            icon="💾"
        );
    }
  });
}

function message(msg, icon) {
    try {
        const targetDiv = document.querySelector(".GOm7re.QRiHXd");
        if (!targetDiv) return;

        // create/ update message container
        let msgContainer = targetDiv.querySelector(".smart-message-container");
        if (!msgContainer) {
            msgContainer = document.createElement("div");
            msgContainer.className = "smart-message-container";
            msgContainer.style.display = "flex";
            msgContainer.style.alignItems = "center";
            // msgContainer.style.background = "#f1f3f4";
            msgContainer.style.borderRadius = "8px";
            msgContainer.style.padding = "4px 8px";
            msgContainer.style.margin = "4px 0";
            msgContainer.style.fontFamily = "Arial, sans-serif";
            msgContainer.style.fontSize = "12px";
            targetDiv.appendChild(msgContainer);
        }
        msgContainer.innerHTML = `${icon} ${msg}&nbsp;-&nbsp;<span style="font-size:10px; color:gray;">${new Date().toLocaleTimeString()}</span>`;
        msgContainer.style.color = "black";
    } catch (e) {
        console.error("[SmartSave] Error displaying message:", e);
        console.warn("[SmartSave] Div Container likely changed due to UI update!");
    }
}

// watch out for dynamic textareas.
const observer = new MutationObserver(() => {
  document.querySelectorAll("textarea").forEach(el => {
    if (!el.dataset.draftSaver) {
      el.dataset.draftSaver = "1";
      restoreDraft(el);
      setTimeout(() => {
          el.addEventListener("input", saveDraft);
      }, 500); // minimal delay to avoid interfering with initial input
    }
  });
});
observer.observe(document.body, { childList: true, subtree: true });