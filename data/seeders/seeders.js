const PROJECT_SEED_VERSION_KEY = "projectSeedVersion";
const PROJECT_SEED_VERSION = 1;

function saveFactoryDataToStorage(storageKey) {
    if (!Object.hasOwn(LOCAL_STORAGE_FACTORY, storageKey)) {
        return;
    }

    saveToStorage(storageKey, LOCAL_STORAGE_FACTORY[storageKey]);
}

function seedLocalStorage() {
    Object.keys(LOCAL_STORAGE_FACTORY).forEach(function (storageKey) {
        if (localStorage.getItem(storageKey) === null) {
            saveFactoryDataToStorage(storageKey);
        }
    });

    saveToStorage(PROJECT_SEED_VERSION_KEY, PROJECT_SEED_VERSION);
}

if (getFromStorage(PROJECT_SEED_VERSION_KEY) !== PROJECT_SEED_VERSION) {
    seedLocalStorage();
}
