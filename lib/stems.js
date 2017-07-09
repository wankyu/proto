const Stems = function(){
    this.init(...arguments);
};
Stems.prototype = {
    ascendents: [],
    equivalents: [],
    addAscendent: function(from, to) {
        this.ascendents.push([from, to]);
    },
    addEquivalent: function(from, to) {
        this.equivalents.push([from, to]);
    },
    removeAscendent: function(from, to) {
        to = to || from;
        this.ascendents = this.ascendents.filter((val, i, array) => val[0] != from && val[1] != to);
    },
    removeEquivalent: function(from, to) {
        let test = (val) => {
            if(typeof to == 'undefined') {
                return val[0] != from && val[1] != from;
            } else {
                return val[0] != from || val[1] != to;
            }
        };
        this.equivalents = this.equivalents.filter(test);
    },
    drawAscendent: function(from_element, to_element) {
        let ctx = this.ctx;
        let [from, to] = [
            this.getElementCenterPosition(from_element),
            this.getElementCenterPosition(to_element)
        ];
        ctx.beginPath();
        Object.assign(ctx, this.ascendent_line_style);
        ctx.moveTo(from.x, from.y);
        ctx.bezierCurveTo(
            to.x - (to.x - from.x) / 3, to.y - (to.y - from.y) / 3,
            to.x - (to.x - from.x) * 2 / 3, to.y - (to.y - from.y) / 5,
            to.x, to.y
        );
        ctx.stroke();
    },
    drawEquivalent: function(from_element, to_element) {
		let ctx = this.ctx;
        let [from, to] = [
            this.getElementCenterPosition(from_element),
            this.getElementCenterPosition(to_element)
        ];

		ctx.beginPath();
        Object.assign(ctx, this.equivalent_line_style);
		ctx.moveTo(from.x, from.y);
		ctx.lineTo(to.x, to.y);
		ctx.stroke();

		ctx.beginPath();

		let t = Math.atan2(from.y - to.y, from.x - to.x);

		let aa = 1;//radian
		let al = 12;//

		let y1 = Math.sin(t - aa / 2) * al;
		let x1 = Math.cos(t - aa / 2) * al;
		let y2 = Math.sin(t + aa / 2) * al;
		let x2 = Math.cos(t + aa / 2) * al;

		ctx.moveTo(to.x, to.y);
		ctx.lineTo(to.x + x1, to.y + y1);
		ctx.lineTo(to.x + x2, to.y + y2);
		ctx.closePath();
		ctx.fill();
    },
    getElementCenterPosition(el) {
        let [left, top, width, height] = [
            el.offsetLeft,
            el.offsetTop,
            el.offsetWidth,
            el.offsetHeight,
        ];
        return {
            x: left + (width / 2),
            y: top + (height / 2)
        };
    },
    getElementPosition(el) {
        let el_style = window.getComputedStyle(el);
        return {
            x: el.offsetLeft - parseInt(el_style.marginLeft),
            y: el.offsetTop - parseInt(el_style.marginTop)
        };
    },
    redraw: function() {
        //this.ctx.save();
        this.clear();
        this.ascendents.forEach((val, i, array) => {
            this.drawAscendent(...val);
        });
        this.equivalents.forEach((val, i, array) => {
            this.drawEquivalent(...val);
        });
        //this.ctx.restore();
    },
    clear: function() {
        this.ctx.clearRect(0,0,this.el.width,this.el.height);
    },
    resize: function() {
        Object.assign(this.el, {
            width: this.el.offsetWidth,
            height: this.el.offsetHeight,
        });
    },
    init: function(args) {
        let container_element = args.container_element;
        this.ascendent_line_style = {
            strokeStyle: 'rgba(255, 0, 0, 1)',
            lineWidth: '0.7',
        };
        this.equivalent_line_style = {
            strokeStyle: 'rgba(0, 0, 0, 0.7)',
            fillStyle: 'rgba(0, 0, 0, 0.7)',
            lineWidth: '0.7',
        };
        this.el = document.createElement('CANVAS')
        this.ctx = this.el.getContext('2d');
        Object.assign(this.el.style, {
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
        container_element.appendChild(this.el);
        this.resize();

        window.addEventListener('resize', (e) => {
            //let img = this.ctx.getImageData(0, 0, this.el.width, this.el.height);
            this.resize();
            this.redraw();
            //this.ctx.putImageData(img, 0, 0);
        });
    }
};

module.exports = Stems;

