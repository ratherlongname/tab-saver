browser.browserAction.onClicked.addListener(saveSession);

browser.runtime.onStartup.addListener(getSesh);

function saveSession() {
    console.log("Browser action clicked");

    // Get all open windows, tabs
    const gettingAll = browser.windows.getAll();
    const querying = browser.tabs.query({});
    Promise.all([gettingAll, querying])
        .then(saveTabs, onError);
}

function saveTabs(values) {
    let windows = values[0];
    let tabs = values[1];
    console.log("values:");
    console.log(values);
    // console.log("windows.getAll result:");
    // for (let window of windows) {
    //     console.log(window);
    // }
    // console.log("tabs.query result:");
    // for (let tab of tabs) {
    //     console.log(tab);
    // }

    // Extract useful information from
    // windows - id, focused, height, left, state, top, type, width
    // tabs - active, index, pinned, url, windowId

    let windows_to_save = windows.map(trimWindowObject);
    console.log("windows_to_save:");
    for (let window of windows_to_save) {
        console.log(window);
    }

    let tabs_to_save = tabs.map(trimTabObject);
    console.log("tabs_to_save:");
    for (let tab of tabs_to_save) {
        console.log(tab);
    }

    for(let window of windows_to_save) {
        for(let tab of tabs_to_save) {
            if (tab.windowId === window.id) {
                window.tabs.push(tab);
            }
        }
    }

    console.log("windows_to_save final:");
    for (let window of windows_to_save) {
        console.log(window);
    }

    let sesh = {
        "saved_windows": windows_to_save
    }

    // Save windows to local storage
    browser.storage.local.set({ sesh })
        .then(setSesh, onError);

}

function trimWindowObject(window) {
    return {
        "id": window.id,
        "state": window.state,
        "focused": window.focused,
        "left": window.left,
        "top": window.top,
        "width": window.width,
        "height": window.height,
        "type": window.type,
        "tabs": []
    };
}

function trimTabObject(tab) {
    return {
        "windowId": tab.windowId,
        "active": tab.active,
        "index": tab.index,
        "pinned": tab.pinned,
        "url": tab.url
    };
}

function setSesh() {
    console.log("Sesh stored");
}

function getSesh() {
    console.log("onStartup event triggered");

    // Try to get sesh from local storage
    browser.storage.local.get("sesh")
        .then(checkTabs, onError);

}

function checkTabs(results) {
    // Check if Storage is empty or has sesh
    if (Object.keys(results).length === 0 && results.constructor === Object) {
        // Storage is empty
        console.log("Storage is empty");
        return;
    }

    // Storage is not empty
    let windows_to_restore = results.sesh.saved_windows
    console.log("Windows to restore:");
    for (let window of windows_to_restore) {
        console.log(window)
    }

    // TODO: Restore windows
    windows_to_restore.forEach(window => {
        browser.windows.create({
            //"focused": window.focused,
            "left": window.left,
            "top": window.top,
            "width": window.width,
            "height": window.height,
            "type": window.type
        }).then(new_window => {onWindowCreated(new_window, window)}, onError);
    });

    // TODO: Restore tabs
    
    // tabs_to_restore.forEach(tab => {
    //     browser.tabs.create(tab)
    //         .then(onTabCreated, onError);
    // });

    // TODO: Close extra New Tabs


    // TODO: Close initial window
    browser.windows.remove(1).then(onWindowRemoved, onError);

    // TODO: Empty local storage if all tabs were opened succesfully
    browser.storage.local.clear();
}

function onWindowCreated(new_window, window) {
    let new_window_id = new_window.id;
    console.log(`Window created: ${new_window_id} from ${window.id}`);
    for (let tab of window.tabs) {
        tab.windowId = new_window_id;
        browser.tabs.create(tab)
            .then(onTabCreated, onError);
    }

    browser.windows.update(new_window_id, {"state": window.state})
        .then(onWindowUpdated, onError);

    browser.tabs.query({"windowId": new_window_id, "title": "New Tab"})
        .then(removeNewTabs, onError);
}

function onTabCreated(tab) {
    console.log(`Tab created: ${tab.url}`);
}

function onWindowUpdated(window) {
    console.log(`Window ${window.id} state ${window.state}`);
}

function onWindowRemoved() {
    console.log(`Window removed`);
}

function removeNewTabs(tabs) {
    tabs.forEach(tab => {
        browser.tabs.remove(tab.id).then(onNewTabRemove, onError);
    });
}

function onNewTabRemove() {
    console.log("New Tab removed");
}

function onError(error) {
    console.log(`Error: ${error}`);
}