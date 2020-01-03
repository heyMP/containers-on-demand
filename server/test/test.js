var assert = require('assert');
const validImage = require('../validImage.js')
const { getContainerHost } = require('../docker.js')

describe('Unit tests', function() {
  describe('validImage', function() {
    it('should deny non whitelisted item', function() {
      assert.equal(false, validImage('badMP/notebook', '^(?!.*[\/| ]).*$, ^heymp\/, ^rocker\/rstudio$'));
    });
    it('should allow whitelisted item', function() {
      assert.equal(true, validImage('heymp/notebook', '^(?!.*[\/| ]).*$, ^heymp\/, ^rocker\/rstudio$'));
    });
  });
  describe('docker', function() {
    it('getContainerHost', function() {
      const host = getContainerHost({ id: "e48f1b8394ab" })
      console.log('host:', host)
      assert(host);
    })
  });
});
e48f1b8394ab