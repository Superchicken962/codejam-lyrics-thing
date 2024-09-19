module.exports = {
    generateRandomCode: (length = 12) => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let code = "";

        for (let i = 0; i < length; i++) {
            let randomCharIndex = Math.floor(Math.random() * chars.length);
            code += chars[randomCharIndex];
        }

        return code;
    }
};