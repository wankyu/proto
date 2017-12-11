class Lines {
    constructor({
        container = document.body,
        checkPositionMethod = 'center',
        line_style = {},
        drawCallback,
    }) {
        this.lines = [];
        this.checkPositionCallback = (() => {
            switch(checkPositionMethod) {
                case 'boundary':
                    return this.getElementBoundary;
                    break;
                case 'center':
                    return this.getElementCenter;
                    break;
                default:
                    return this.getElementPosition;
            }
        })();
        this.line_style = line_style;
        this.drawCallback = drawCallback;
        this.canvas = document.createElement('CANVAS')
        this.ctx = this.canvas.getContext('2d');
        Object.assign(this.canvas.style, {
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            width: '100%',
            height: '100%',
            margin: 0,
            pointerEvents: 'none',
        });
        container.appendChild(this.canvas);
        this.resizeCanvas();
        Object.assign(this.ctx, line_style);

        window.addEventListener('resize', (e) => {
            // let img = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            this.resizeCanvas();
            this.redraw();
            // this.ctx.putImageData(img, 0, 0);
        });
    }
    add(from, to) {
        this.lines.push([from, to]);
    }
    remove(from, to) {
        let test = (() => {
            if(typeof to == 'undefined') {
                return val => !(val[0] == from || val[1] == from);
            } else {
                return val => !(val[0] == from && val[1] == to);
            }
        })();
        this.lines = this.lines.filter(test);
    }
    draw(from_position, to_position) {
        this.drawCallback(this.ctx, from_position, to_position);
    }
    checkPosition(el) {
        return this.checkPositionCallback(el);
    }
    redraw() {
        // this.ctx.save();
        this.clear();
        this.lines.forEach((val, i, array) => {
            this.draw(this.checkPosition(val[0]), this.checkPosition(val[1]));
        });
        // this.ctx.restore();
    }
    resizeCanvas() {
        Object.assign(this.canvas.style, {
            width: this.canvas.offsetWidth + 'px',
            height: this.canvas.offsetHeight + 'px',
        });
        Object.assign(this.canvas, {
            width: this.canvas.offsetWidth,
            height: this.canvas.offsetHeight,
        });
    }
    clear() {
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    }
    getElementBoundary(el) {
        // [TODO] get boundaries
        return {
            top: el.offsetTop,
            right: el.offsetLeft + el.offsetWidth,
            bottom: el.offsetTop + el.offsetHeight,
            left: el.offsetLeft,
        };
    }
    getElementCenter(el) {
        let [top, left, width, height] = [
            el.offsetTop,
            el.offsetLeft,
            el.offsetWidth,
            el.offsetHeight,
        ];
        return {
            top: top + (height / 2),
            left: left + (width / 2),
        };
    }
    getElementPosition(el) {
        let el_style = window.getComputedStyle(el);
        return {
            top: el.offsetTop - parseInt(el_style.marginTop),
            left: el.offsetLeft - parseInt(el_style.marginLeft),
        };
    }
};

export default Lines;

