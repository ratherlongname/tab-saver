# tab-saver

On startup && (tabs in storage) --> restore tabs, empty storage
On browser_action --> save tabs to storage

browser.windows.getAll populate is not well supported by Edge, so tabs.query and windows.getAll both are used.

"background": {
    "scripts": ["background-script.js"],
    "persistent": true
}

"browser_specific_settings": {
    "gecko": {
        "id": "tabsaver@tabsaver.com"
    }
}

initial windowId and final windowId should have no connection