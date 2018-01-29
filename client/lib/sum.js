const Sum = function(){
    this.init(...arguments);
};
Sum.prototype = {
    create: function(...vals) {
        let sum = 0;
        for(let val of vals) {
            if(val < 0)
                val += this.maxVal;
            sum = sum << 2**this.digit | val;
        }
        return sum;
    },
    extract: function(sum) {
        let results = [];
        for(let i = 0; i < this.count; i++) {
            results[i] = sum >> (2**this.digit * i) & (0x10**this.digit - 1);
            if(results[i] >= this.maxVal / 2 -1) {
                results[i] -= this.maxVal;
            }
        }
        return results.reverse();
    },
    init: function(digit = 4, count = 2) {
        this.digit = digit;
        this.count = count;
        this.maxVal = 2**15;
    }
};

module.exports = Sum;
