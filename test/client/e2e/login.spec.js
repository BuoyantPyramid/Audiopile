describe('Login processes', function() {
  describe("index", function() {
    it('should display correct title', function() {
      browser.get('http://localhost:3000');
      expect(browser.getTitle()).toEqual('Jam Record');
    });
    
  })
});
