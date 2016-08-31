var tax = require('./tax');

var CartSummary = function(items) {
  this._items = items;
};

CartSummary.prototype.getSubtotal = function() {
  // var total = 0;

  if (this._items.length) {
    return this._items.reduce(function(subtotal, item) {
      return subtotal + (item.price * item.quantity);
    }, 0);
  }

  return 0;
};

CartSummary.prototype.getTax = function(state, done) {
  tax.calculate(this.getSubtotal(), state, function(res) {
    done(res);
  });
};

module.exports = CartSummary;