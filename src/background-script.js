browser.browserAction.onClicked.addListener(save);

browser.runtime.onStartup.addListener(restore);

async function save() {
    console.log("Browser action clicked");

    // Get all open windows, tabs
    let data_windows_tabs = await get_data_windows_tabs();
    console.log(data_windows_tabs);

    // Create unified save_data
    let save_data = {
        "windows": add_tabs_to_window(data_windows_tabs[0], data_windows_tabs[1])
    };
    console.log(save_data);

    // Set save_data in storage
    let ret_val = await browser.storage.local.set({ save_data });
    console.log("save_data stored");

    return;
}

function get_data_windows_tabs() {
    let data_windows = get_data_windows();
    let data_tabs = get_data_tabs();

    let promises = [
        data_windows,
        data_tabs
    ];
    return Promise.all(promises);
}

async function get_data_windows() {
    let all_windows = await browser.windows.getAll();
    let data_windows = trim_all_windows(all_windows);
    return data_windows;
}

function trim_all_windows(all_windows) {
    return all_windows.map(trimWindowObject);
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

async function get_data_tabs() {
    let all_tabs = await browser.tabs.query({});
    let data_tabs = trim_all_tabs(all_tabs);
    return data_tabs;
}

function trim_all_tabs(all_tabs) {
    return all_tabs.map(trimTabObject);
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

function add_tabs_to_window(windows, tabs) {
    for (const window of windows) {
        for (const tab of tabs) {
            if (tab.windowId === window.id) {
                window.tabs.push(tab);
            }
        }
    }

    return windows;
}

async function restore() {
    console.log("onStartup event triggered");

    // Get save_data from storage
    let results = await browser.storage.local.get("save_data");

    if (Object.keys(results).length === 0 && results.constructor === Object) {
        // Storage is empty
        console.log("Storage is empty");
        return;
    }

    // Storage is not empty
    let windows_to_restore = results.save_data.windows;
    await restore_windows(windows_to_restore);
    console.log("Windows restored");

    await after_restore_windows();
    console.log("Extra window closed, Storage cleared");
    return;
}

function restore_windows(windows_to_restore) {
    let promises = [];
    for (const window of windows_to_restore) {
        promises.push(restore_window(window));
    }
    return Promise.all(promises);
}

async function restore_window(window) {
    let new_window = await browser.windows.create({
        //"focused": window.focused,
        "left": window.left,
        "top": window.top,
        "width": window.width,
        "height": window.height,
        "type": window.type
    });
    console.log(`Window created. ID:${new_window.id}`);

    try {
        await after_window_create(window, new_window);
    } catch (err) {
        console.error(err);
    }
    console.log(`All tabs created, New Tab closed, Window update done for WindowID:${new_window.id}`);
    return;
}

function after_window_create(window, new_window) {
    let updated_window = browser.windows.update(new_window.id, {"state": window.state});

    let new_tabs = restore_tabs(window, new_window);

    let promises = [
        updated_window,
        new_tabs
    ];

    return Promise.all(promises);
}

async function restore_tabs(window, new_window) {
    let new_tabs = await create_tabs(window, new_window);
    for (const tab of new_tabs) {
        console.log(`Tab created. URL:${tab.url}`);
    }

    // Close extra New Tab
    let tabs_to_remove = await browser.tabs.query({"windowId": new_window.id, "title": "New Tab"});
    let tab_ids_to_remove = tabs_to_remove.map(tab => {return tab.id});
    await browser.tabs.remove(tab_ids_to_remove);    
    return;
}

function create_tabs(window, new_window) {
    let promises = [];

    for (const tab of window.tabs) {
        tab.windowId = new_window.id;
        promises.push(browser.tabs.create(tab));
    }

    return Promise.all(promises);
}

function after_restore_windows() {
    let extra_window_remove =  browser.windows.remove(1);
    let storage_clear = browser.storage.local.clear();

    let promises = [
        extra_window_remove,
        storage_clear
    ];

    return Promise.all(promises);
}
