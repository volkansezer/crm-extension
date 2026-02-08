console.log('Arkaplan Geldi!');

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: 'openSidePanel',
      title: 'Open side panel',
      contexts: ['all']
    });
    chrome.tabs.create({ url: 'welcome.html' });
  });

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'openSidePanel') {
      // This will open the panel in all the pages on the current window.
      chrome.sidePanel.open({ windowId: tab.windowId });
    }
  });

//chrome.windows.create({'url': 'create.html', 'type': 'popup'}, function(window) {});
// chrome.tabs.onUpdated.addListener((tabId, tab) => {
//     if (tab.url && tab.url.includes("ankaser")) {
//         console.log('onUpdated');
//     }
// });

// chrome.tabs.onActivated.addListener(tab=>{
//     console.log('onActivated');
// });

// // chrome.tabs.onActivated.addListener(tab=>{
// //     console.log('test');
// //     chrome.tabs.get(tab.tabId, current_tab_info=>{
// //         console.log(current_tab_info.url);
// //         // if(/^https:\/\/ankaserelektronik/.test(current_tab_info.url)){
// //         //     console.log('geldi');
// //         //     chrome.tabs.executeScript(null, {file:'./ankaser.js'});
// //         // chrome.tabs.inserCSS(null, ankaser.css);
// //         // }
// //     })
// // });