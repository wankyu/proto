import Lines from './lines.js';

const Stems = function(){
    this.init(...arguments);
};
Stems.prototype = {
    addAscendent: function(from, to) {
        this.ascendentLine.add(from, to);
    },
    removeAscendent: function(from) {
        this.ascendentLine.remove(from);
    },
    drawAscendent: function(from, to) {
        this.ascendentLine.draw(from, to);
    },
    addEquivalent: function(from, to) {
        this.equivalentLine.add(from, to);
    },
    removeEquivalent: function(from, to) {
        this.equivalentLine.remove(from, to);
    },
    drawEquivalent: function(from, to) {
        this.equivalentLine.draw(from, to);
    },
    redraw: function() {
        this.ascendentLine.redraw();
        this.equivalentLine.redraw();
    },
    init: function(args) {
        let container_element = args.container_element;

        this.ascendentLine = new Lines({
            container: container_element,
            checkPositionMethod: 'center',
            line_style: {
                strokeStyle: 'rgba(255, 0, 0, 1)',
                lineWidth: '0.7',
            },
            drawCallback: (ctx, from, to) => {
                ctx.beginPath();
                ctx.moveTo(from.left, from.top);
                ctx.bezierCurveTo(
                    to.left - (to.left - from.left) / 3, to.top - (to.top - from.top) / 3,
                    to.left - (to.left - from.left) * 2 / 3, to.top - (to.top - from.top) / 5,
                    to.left, to.top
                );
                ctx.stroke();
            },
        });

        this.equivalentLine = new Lines({
            container: container_element,
            checkPositionMethod: 'center',
            line_style: {
                strokeStyle: 'rgba(0, 0, 0, 0.7)',
                fillStyle: 'rgba(0, 0, 0, 0.7)',
                lineWidth: '0.7',
            },
            drawCallback: (ctx, from, to) => {
                function drawTriangle(angle, length) {
                    let t = Math.atan2(from.top - to.top, from.left - to.left);
                    let aa = angle * Math.PI / 180;
                    let y1 = Math.sin(t - aa / 2) * length;
                    let x1 = Math.cos(t - aa / 2) * length;
                    let y2 = Math.sin(t + aa / 2) * length;
                    let x2 = Math.cos(t + aa / 2) * length;
                    ctx.beginPath();
                    ctx.moveTo(to.left, to.top);
                    ctx.lineTo(to.left + x1, to.top + y1);
                    ctx.lineTo(to.left + x2, to.top + y2);
                    ctx.closePath();
                    ctx.fill();
                }
                ctx.beginPath();
                ctx.moveTo(from.left, from.top);
                ctx.lineTo(to.left, to.top);
                ctx.stroke();
                drawTriangle(57, 12);
            },
        });
    }
};

module.exports = Stems;

