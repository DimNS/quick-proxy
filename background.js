// Глобальные переменные.
let proxyEnabled = false;
let proxySettings = {
    type: 'http',
    host: '',
    port: '',
};

// Получение сохраненных настроек при запуске.
chrome.storage.local.get(['proxyEnabled', 'proxySettings']).then((result) => {
    if (result.proxyEnabled !== undefined) {
        proxyEnabled = result.proxyEnabled;
    }
    if (result.proxySettings) {
        proxySettings = result.proxySettings;
    }

    updateIcon();
});

// Обработчик сообщений.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'getState':
            sendResponse({
                enabled: proxyEnabled,
                settings: proxySettings,
            });
            break;
        case 'setState':
            proxyEnabled = request.enabled;
            proxySettings = request.settings || proxySettings;

            chrome.storage.local.set({
                proxyEnabled: proxyEnabled,
                proxySettings: proxySettings,
            });

            sendResponse({success: true});
            break;
        case 'toggleProxy':
            proxyEnabled = request.enabled;
            proxySettings = request.settings || proxySettings;

            chrome.storage.local.set({
                proxyEnabled: proxyEnabled,
                proxySettings: proxySettings,
            });

            updateProxy();
            updateIcon();
            sendResponse({success: true});
            break;
    }

    return true;
});

// Обновление настроек прокси.
function updateProxy() {
    if (proxyEnabled && proxySettings.host && proxySettings.port) {
        chrome.proxy.settings.set({
            value: {
                mode: 'fixed_servers',
                rules: {
                    singleProxy: {
                        scheme: proxySettings.type,
                        host: proxySettings.host,
                        port: parseInt(proxySettings.port),
                    },
                    bypassList: [],
                },
            },
            scope: 'regular',
        });

        return;
    }

    chrome.proxy.settings.clear({scope: 'regular'});
}

// Обновление иконки.
function updateIcon() {
    chrome.action.setIcon({path: proxyEnabled ? 'icons/icon16.png' : 'icons/icon_off16.png'});
}
