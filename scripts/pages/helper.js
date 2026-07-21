function saveToStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getFromStorage(key) {
    const savedValue = localStorage.getItem(key);

    try {
        return savedValue ? JSON.parse(savedValue) : null;
    } catch {
        return null;
    }
}

function removeFromStorage(key) {
    localStorage.removeItem(key);
}
