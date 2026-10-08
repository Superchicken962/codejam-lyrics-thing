/**
 * Generate a random code of given length.
 * 
 * @param { Number } length 
 * @returns { String }
 */
function generateRandomCode(length = 12) {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";

    for (let i = 0; i < length; i++) {
        let randomCharIndex = Math.floor(Math.random() * chars.length);
        code += chars[randomCharIndex];
    }

    return code;
}
exports.generateRandomCode = generateRandomCode;

/**
 * Shuffle a given array. No return, modifies the array in place.
 * 
 * @param { any[] } arr 
 */
function shuffleArray(arr) {
    if (!Array.isArray(arr)) return;

    let currentIndex = arr.length;
    while (currentIndex != 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]];
    }
}
exports.shuffleArray = shuffleArray;