const generateTemplate = ({text, buttons}) => {
    const div = document.createElement('div')
    div.classList.add('toast')
    div.innerHTML = `
      <div class="toast-content">${text}</div>
      ${buttons.map((name) => `<button class="unbutton">${name}</button>`)}
    `
    return div
};

class Toast {
    constructor(text, duration, buttons) {
        this.container = generateTemplate({
            text: text,
            buttons: buttons
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
    }

    hide () {
        clearTimeout(this._hideTimeout);
        this._answerResolver();
        this._goneResolver();

        return this.gone;
    };
}

class Toasts {
    constructor(appendToEl) {
        this._container = document.createElement('div');
        this._container.classList.add('toasts');
        appendToEl.appendChild(this._container);
    }

    show (message, opts) {
        opts = Object.assign({}, opts, {
            duration: 0,
            buttons: ['dismiss']
        });

        const toast = new Toast(message, opts.duration, opts.buttons);
        this._container.appendChild(toast.container);

        toast.gone.then(() => {
            toast.container.parentNode.removeChild(toast.container);
        });

        return toast;
    };
}
