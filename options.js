browser.storage.local.get('mode').then(result => {
  if (result.mode === "context") {
    document.getElementById('context').checked = true;
  } else {
    document.getElementById('dblclick').checked = true;
  }
});

document.getElementById('setMode').addEventListener('change', (event) => {
  browser.storage.local.set({ mode: event.target.value });
});