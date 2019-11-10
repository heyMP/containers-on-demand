var assert = require('assert');
const validImage = require('../validImage.js')

describe('Unit tests', function() {
  describe('validImage', function() {
    it('should deny non whitelisted item', function() {
      assert.equal(false, validImage('badMP/notebook', '^(?!.*[\/| ]).*$, ^heymp\/, ^rocker\/rstudio$'));
    });
    it('should allow whitelisted item', function() {
      assert.equal(true, validImage('heymp/notebook', '^(?!.*[\/| ]).*$, ^heymp\/, ^rocker\/rstudio$'));
    });
  });
});
