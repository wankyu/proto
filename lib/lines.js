class Lines {
    constructor({
        container = document.body,
        checkPositionMethod = 'center',
        line_style = {},
        drawCallback,
    }) {
        this.lines = [];
        this.checkPositionsCallback = (() => {
            switch(checkPositionMethod) {
                case 'boundary':
                    return this.getElementsBoundary;
                    break;
                case 'center':
                    return this.getElementsCenter;
                    break;
                default:
                    return this.getElementsPosition;
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
    checkPositions(els) {
        return this.checkPositionsCallback(els);
    }
    redraw() {
        // this.ctx.save();
        this.clear();
        this.lines.forEach((val, i, array) => {
            this.draw(...this.checkPositions(val));
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
    getElementsBoundary(els) {
        // let results = [{
        //     top: els[0].offsetTop,
        //     left: els[0].offsetLeft,
        // }, {
        //     top: els[1].offsetTop,
        //     left: els[1].offsetLeft,
        // }];
        // let i;
        // i = (results[0].top < results[1].top)? 0: 1;
        // results[i].top = results[i].top + els[i].offsetHeight;
        // i = (results[0].left < results[1].left)? 0: 1;
        // results[i].left = results[i].left + els[i].offsetWidth;
        // return results;
        let results = this.getElementsCenter(els.slice(0, 2));
        results.forEach((result, i) => {
            let el = els[i];
            let aspect_ratio = Math.atan2(el.offsetHeight, el.offsetWidth);
            let current_angle = Math.atan2(
                    (results[0].top - results[1].top) * Math.pow(-1, i),
                    (results[0].left - results[1].left) * Math.pow(-1, i + 1)
                ) + Math.PI * 2;
            let offset = {
                top: el.offsetWidth * Math.tan(current_angle) / 2,
                left: el.offsetHeight / Math.tan(current_angle) / 2,
                margin: {
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                }
            };
            if(current_angle < Math.PI + aspect_ratio || current_angle > Math.PI * 3 - aspect_ratio){
                sideLeft();
            }else if(current_angle < Math.PI * 2 - aspect_ratio){
                sideBottom();
            } else if(current_angle < Math.PI * 2 + aspect_ratio){
                sideRight();
            } else{
                sideTop();
            }
            function sideTop() {
                result.top = el.offsetTop - offset.margin.top;
                result.left += offset.left;
            }
            function sideBottom() {
                result.top = el.offsetTop + el.offsetHeight + offset.margin.bottom;
                result.left -= offset.left;
            }
            function sideLeft() {
                result.top += offset.top;
                result.left = el.offsetLeft - offset.margin.left;
            }
            function sideRight() {
                result.top -= offset.top;
                result.left = el.offsetLeft + el.offsetWidth + offset.margin.right;
            }
        });
        return results;
    }
    getElementsCenter(els) {
        let results = [];
        els.forEach((el) => {
            let [top, left, width, height] = [
                el.offsetTop,
                el.offsetLeft,
                el.offsetWidth,
                el.offsetHeight,
            ];
            results.push({
                top: top + (height / 2),
                left: left + (width / 2),
            });
        });
        return results;
    }
    getElementsPosition(els) {
        let results = [];
        els.forEach((el) => {
            let el_style = window.getComputedStyle(el);
            results.push({
                top: el.offsetTop - parseInt(el_style.marginTop),
                left: el.offsetLeft - parseInt(el_style.marginLeft),
            });
        });
        return results;
    }
};

export default Lines;

