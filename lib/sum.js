const Sum = function(){
    this.init(...arguments);
};
Sum.prototype = {
    create: function(...vals) {
        let sum = 0;
        for(let val of vals) {
            sum = sum << 2**this.digit | val;
        }
        return sum;
    },
    extract: function(sum) {
        let results = [];
        for(let i = 0; i < this.count; i++) {
            results[i] = sum >> (2**this.digit * i) & (0x10**this.digit - 1);
        }
        return results.reverse();
    },
    init: function(digit = 4, count = 2) {
        this.digit = digit;
        this.count = count;
    }
};

module.exports = Sum;
