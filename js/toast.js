const generateTemplate = ({text, buttons}) => {
    const div = document.createElement('div');
    div.classList.add('toast');
    div.setAttribute('tabindex', '-1');
    div.innerHTML = `
      <div id="toast-message" class="toast-content">${text}</div>
      ${buttons.map((name) => `<button class="unbutton">${name}</button>`).join('')}
    `
    return div
};

class Toast {
    constructor(text, duration, buttons) {
        this.trapTabKey = this.trapTabKey.bind(this)
        this.hide = this.hide.bind(this)

        this.container = generateTemplate({
            text,
            buttons
        })

        this.answer = new Promise((resolve) => {
            this._answerResolver = resolve;
        });

        this.gone = new Promise((resolve) => {
            this._goneResolver = resolve;
        });

        if (duration) {
            this._hideTimeout = setTimeout(() => {
                this.hide();
            }, duration);
        }

        this.container.addEventListener('click', (event) => {
            const button = event.target.closest('button');
            if (!button) return;
            this._answerResolver(button.textContent);
            this.hide();
        });

        this.focusedElementBeforeModal = document.activeElement;
        this.container.addEventListener('keydown', this.trapTabKey);
        const focusableElementsString = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';
        let focusableElements = this.container.querySelectorAll(focusableElementsString);
        // Convert NodeList to Array
        focusableElements = Array.prototype.slice.call(focusableElements);

        this.firstTabStop = focusableElements[0];
        this.lastTabStop = focusableElements[focusableElements.length - 1];
    }

    hide () {
        clearTimeout(this._hideTimeout);
        this._answerResolver();
        this._goneResolver();

        this.container.classList.remove('show');

        this.focusedElementBeforeModal.focus();

        return this.gone;
    };

    trapTabKey (e) {
        // Check for TAB key press
        if (e.keyCode === 9) {

            // SHIFT + TAB
            if (e.shiftKey) {
                if (document.activeElement === this.firstTabStop) {
                    e.preventDefault();
                    this.lastTabStop.focus();
                }

                // TAB
            } else {
                if (document.activeElement === this.lastTabStop) {
                    e.preventDefault();
                    this.firstTabStop.focus();
                }
            }
        }

        // ESCAPE
        if (e.keyCode === 27) {
            this.hide();
        }
    }
}

class Toasts {
    constructor(appendToEl) {
        this._container = document.createElement('div');
        this._container.classList.add('toasts');
        this._container.setAttribute('role', 'alertdialog')
        this._container.setAttribute('aria-labelledby', 'toast-message')
        appendToEl.appendChild(this._container);
    }

    show (message, opts) {
        opts = Object.assign({}, {
            duration: 0,
            buttons: ['dismiss']
        }, opts);

        const toast = new Toast(message, opts.duration, opts.buttons);
        this._container.appendChild(toast.container);

        toast.container.classList.add('show');

        debugger

        toast.firstTabStop.focus()

        toast.gone.then(() => {
            toast.container.parentNode.removeChild(toast.container);
        });

        return toast;
    };
}