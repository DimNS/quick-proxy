document.addEventListener('DOMContentLoaded', () => {
    const proxyInfoAddress = document.getElementById('proxyInfoAddress');

    const proxyForm = document.getElementById('proxyForm');
    const proxyType = document.getElementById('proxyType');
    const proxyHost = document.getElementById('proxyHost');
    const proxyPort = document.getElementById('proxyPort');

    const toggleCheckbox = document.getElementById('toggleCheckbox');
    const toggleLabel = document.getElementById('toggleLabel');

    const statusMessage = document.getElementById('statusMessage');

    if (!proxyInfoAddress) {
        console.error('Proxy info address not found');

        return;
    }

    if (proxyForm instanceof HTMLFormElement === false) {
        console.error('Form not found');

        return;
    }

    if (proxyType instanceof HTMLSelectElement === false) {
        console.error('Type not found');

        return;
    }

    if (proxyHost instanceof HTMLInputElement === false) {
        console.error('Host not found');

        return;
    }

    if (proxyPort instanceof HTMLInputElement === false) {
        console.error('Port not found');

        return;
    }

    if (toggleCheckbox instanceof HTMLInputElement === false) {
        console.error('Toggle not found');

        return;
    }

    if (!toggleLabel) {
        console.error('Toggle label not found');

        return;
    }

    // Показать сообщение о статусе с таймаутом.
    function showStatusMessage(message, isError = false) {
        if (!statusMessage) return;

        statusMessage.textContent = message;
        statusMessage.className = isError ? 'status-message error' : 'status-message success';
        statusMessage.style.display = 'block';

        setTimeout(() => {
            statusMessage.style.display = 'none';
        }, 3000);
    }

    // Функциональность переключения вкладки.
    function setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach((button) => {
            button.addEventListener('click', () => {
                // Деактивация всех кнопок и скрытие всех вкладок
                tabButtons.forEach((btn) => btn.classList.remove('active'));
                tabContents.forEach((content) => content.classList.add('hidden'));

                // Активация кнопки и показ вкладки
                button.classList.add('active');
                const tabId = button.getAttribute('data-tab');
                const tab = document.getElementById(`${tabId}-tab`);
                if (tab) {
                    tab.classList.remove('hidden');
                }
            });
        });
    }

    setupTabs();

    // Получение информации о состоянии.
    chrome.runtime.sendMessage({action: 'getState'}, (response) => {
        if (response) {
            proxyType.value = response.settings.type || 'http';
            proxyHost.value = response.settings.host || '';
            proxyPort.value = response.settings.port || '';

            toggleCheckbox.checked = response.enabled || false;

            toggleLabel.textContent = response.enabled ? 'Включено' : 'Выключено';
            toggleLabel.classList.toggle('color-green', response.enabled);

            proxyInfoAddress.textContent = `${proxyHost.value.trim()}:${proxyPort.value.trim()}`;
        }
    });

    // Обработка изменения состояния.
    toggleCheckbox.addEventListener('change', () => {
        const enabled = toggleCheckbox.checked;

        toggleLabel.textContent = enabled ? 'Включено' : 'Выключено';
        toggleLabel.classList.toggle('color-green', enabled);

        chrome.runtime.sendMessage({
            action: 'toggleProxy',
            enabled: enabled,
            settings: {
                type: proxyType.value,
                host: proxyHost.value.trim(),
                port: proxyPort.value.trim(),
            },
        });
    });

    // Обработка отправки формы.
    proxyForm.addEventListener('submit', (e) => {
        e.preventDefault();

        chrome.runtime
            .sendMessage({
                action: 'setState',
                enabled: toggleCheckbox.checked,
                settings: {
                    type: proxyType.value,
                    host: proxyHost.value.trim(),
                    port: proxyPort.value.trim(),
                },
            })
            .then(() => {
                proxyInfoAddress.textContent = `${proxyHost.value.trim()}:${proxyPort.value.trim()}`;
                showStatusMessage('Настройки прокси сохранены');
            })
            .catch((error) => {
                console.error('Error saving proxy settings:', error);
                showStatusMessage('Не удалось сохранить настройки прокси', true);
            });
    });
});
