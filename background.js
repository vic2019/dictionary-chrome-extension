"use strict";

let extFolder = undefined;
chrome.runtime.onMessage.addListener(router);
chrome.bookmarks.onRemoved.addListener(handleRemoved);


chrome.contextMenus.removeAll( () => {
  chrome.contextMenus.create({
    id: "Merriam-Webster dictionary extension",
    title: "Look Up in Dictionary",
    contexts: ["selection"]
  });
});


// Allows user to launch dictionary with context menu button
chrome.contextMenus.onClicked.addListener( (info, tab) => {
  if (info.menuItemId == "Merriam-Webster dictionary extension") {
    chrome.tabs.sendMessage(tab.id, {});
  }
});


function router(message, sender, sendResponse) {
  console.log(message.action);
  switch (message.action) {
    case 'update':
    case 'toggle':
      handleBookmarkAction(message, sendResponse);
      break;
    case 'openTab':
      openTab(message);
  }

  return true;
}


function handleRemoved(id, removeInfo) {
  // When a bookmark is removed, check if the removed bookmark is the extension's folder. If so, reset extFolder.
  
  chrome.storage.local.get(['extFolder'], retrieved => {
    if (retrieved.extFolder && (retrieved.extFolder.id === id) ) {
      extFolder = undefined;
      chrome.storage.local.remove('extFolder');
    }
  });
}


function handleBookmarkAction(message, sendResponse) {
  // When a popup is created for the first time during a session, set extFolder to the extension folder (or create a folder if none exists). Then, check whether the bookmark exists inside the extension folder. 

  if (extFolder) {
    getBookmark(extFolder);
  } else {
    getFolder()
  }

  function getFolder() {
    chrome.storage.local.get(['extFolder'], retrieved => {
      if (retrieved.extFolder) {
        extFolder = retrieved.extFolder;
        getBookmark(retrieved.extFolder);

      } else {
        const folderTitle = "Merriam-Webster's Learner's Dictionary - Saved Entries";
      
        chrome.bookmarks.create({
          title: folderTitle,
        }, folder => {
          extFolder = folder;
          chrome.storage.local.set({extFolder: folder});
      
          getBookmark(folder);
        });
      }
    });
  }
  
  function getBookmark(folder) {
    chrome.bookmarks.search({url: message.url}, bookmarks => {
      if (bookmarks.length > 0) {
        for (let item of bookmarks) {
          if (item.parentId === folder.id) return performAction(item.id);
        }    
      } else {
        return performAction(false);
      }
    }); 
  }
    
  function performAction(id) {
    switch (message.action) {
      case 'update':
        sendResponse(Boolean(id));
        break;
      case 'toggle':
        bookmarkToggle(id);
        break;
    }
  }

  function bookmarkToggle(id) {
      if (!id) {
        chrome.bookmarks.create({
          title: message.word,
          url: message.url
        }, bookmark => {
          chrome.bookmarks.move(bookmark.id, {parentId: extFolder.id});
        });   
        sendResponse(true);

      } else {
        chrome.bookmarks.remove(id);
        sendResponse(false);
      }
  }

}


function openTab(message) {
    chrome.tabs.create({active: false, url: message.url});
}