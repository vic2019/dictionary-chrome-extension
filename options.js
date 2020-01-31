chrome.storage.local.get('mode', store => {
  if (!store) return;
  if (store.mode === "context") {
    document.getElementById('context').checked = true;
  } else {
    document.getElementById('dblclick').checked = true;
  }
});

document.getElementById('setMode').addEventListener('change', (event) => {
  chrome.storage.local.set({ mode: event.target.value });
});