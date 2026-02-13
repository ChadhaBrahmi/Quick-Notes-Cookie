chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "toggle_sidebar") return;

  const tabs = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  if (!tabs.length || !tabs[0].id) {
    console.warn("No valid active tab");
    return;
  }

  const tabId = tabs[0].id;

  try {
    await chrome.tabs.sendMessage(tabId, { action: "toggle" });
  } catch {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["content.js"]
    });

    await chrome.scripting.insertCSS({
      target: { tabId },
      files: ["styles.css"]
    });

    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    await chrome.tabs.sendMessage(tabId, { action: "toggle" });
  }
});