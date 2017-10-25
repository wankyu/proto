class EscListener {
    constructor() {
        this.handlers = [];
        document.addEventListener('keydown', (e) => {
            if(e.keyCode != 27) return;
            this.handlers.forEach((val, i, arr) => {
                val(e);
            });
        });
    }
    addHandler(func) {
        this.handlers.push(func);
    }
}

export const Esc = new EscListener();

