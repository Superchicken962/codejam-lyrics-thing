const errors = require("./errors");

module.exports = {
    /**
     * Require the user to be logged in to access the page. Redirects to home if not logged in.
     * @param { import("express").Request } req 
     * @param { import("express").Response } res 
     */
    requireLoggedIn: (req, res, next) => {
        if (!req.session.isLoggedIn) {
            res.redirect("/");
            return;
        }

        next();
    },

    /**
     * Require the user sending the request to be logged in to make the request. Sends 401 if not logged in.
     * @param { import("express").Request } req 
     * @param { import("express").Response } res 
     */
    requireLoggedInAPI: (req, res, next) => {
        if (!req.session.isLoggedIn) {
            res.status(401).json(errors.api.buildError(401, "Unauthorised", "Login to access this endpoint!"));
            return;
        }

        next();
    }
};