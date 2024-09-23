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