module.exports = {
    api: {
        buildError: (code, name, message) => {
            return {
                "code": code,
                "name": name,
                "message": message
            }
        }
    }
};