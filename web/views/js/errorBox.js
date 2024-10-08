class ErrorBox {
    /**
     * Create an error box to display to user.
     * @param { string } name - Name of error.
     * @param { string } description - Description for error.
     * @param { string } code - Error code.
     * @param { string } specificError - The specific error message to show (leave as null to not show anything).
     * @param { number } hideAfter - Miliseconds to wait before hiding error after showing.
     * @param { bool } hideOnCreate - Should the error be hidden when created? (def = false)
     * @param { bool } noTransparency - Should the background colour of the box not have transparency? (def = false)
     * @param { Element } parentElement - If provided, the box will append to this element instead of the document body.
     */
    constructor(name, description, code, specificError, hideAfter = 5000, hideOnCreate = false, noTransparency = false, parentElement) {
        this.name = name;
        this.description = description;
        this.code = code;
        this.specificError = specificError;
        this.noTransparency = noTransparency;
        this.parentElement = parentElement;

        this.hideAfter = hideAfter;
        this.hideTimer = null;

        this.init();

        // If 'hide on create' is false (ie. will show when created), show it.
        if (!hideOnCreate) this.show();
    }

    /**
     * Initialise the error box - creates or gets element.
     */
    init = () => {
        // Set element to errorBox element if it exists in document, or create a div if not.
        this.element = document.querySelector(".errorBox") || document.createElement("div");
        this.element.className = "errorBox";

        this.element.style.backgroundColor = this.noTransparency ? "rgb(120,0,0)" : "rgba(200,0,0,0.6)";
    }

    /**
     * Shows error box on page.
     */
    show = () => {
        // Clear any hide timer that is waiting if show is called again.
        clearTimeout(this.hideTimer);

        // Initialise element again if it does not exist.
        if (!this.element) this.init();
        
        // Append to body if it is not on the page.
        if (!this.existsOnPage()) {
            // Append to given parentElement if it is of type 'Element'.
            if (this.parentElement && this.parentElement instanceof Element) {
                this.parentElement.appendChild(this.element);
                return;
            }
            
            document.body.appendChild(this.element);                
        }
        
        this.element.innerHTML = `
            <h2>${this.name} (${this.code})</h2>
            <h3>${this.description}</h3>

            ${(this.specificError) ? `<p class="specific_error">${this.specificError}</p>` : ""}

            <a class="dismiss_btn">Dismiss</a>
        `;

        this.element.querySelector(".dismiss_btn").addEventListener("click", this.hide);

        this.element.style.display = "block";
        
        this.hideTimer = setTimeout(this.hide, this.hideAfter);
    }

    /**
     * Removes/hides error box from page
     */
    hide = () => {
        // Clear any hide timer that is waiting if called manually.
        clearTimeout(this.hideTimer);

        this.element?.remove();
    }

    existsOnPage = () => {
        return !!document.querySelector(".errorBox");
    }
}