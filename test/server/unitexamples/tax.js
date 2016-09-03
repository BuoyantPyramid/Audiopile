// src/part1/tax.js
module.exports = {
  calculate: function(subtotal, state, done) {
    // implemented later or in parallel by our coworker
    console.log('INSIDE calculate')
    if (state === 'NY') {
      done({
        amount: subtotal * .10
      });
    } else {
      done(null);
    }
  }
};