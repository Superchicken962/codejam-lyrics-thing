function generateRandomCode(length = 12) {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";

    for (let i = 0; i < length; i++) {
        let randomCharIndex = Math.floor(Math.random() * chars.length);
        code += chars[randomCharIndex];
    }

    return code;
}

// Add hide and show functions to elements.
HTMLElement.prototype.hide = function() {
    this.style.display = "none";
}
HTMLElement.prototype.show = function() {
    this.style.display = "block";
}

HTMLElement.prototype.classHide = function() {
    this.classList.add("hidden");
}
HTMLElement.prototype.classShow = function() {
    this.classList.remove("hidden");
}

function shuffleArray(arr) {
    if (!Array.isArray(arr)) return;

    let currentIndex = arr.length;
    while (currentIndex != 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]];
    }
}