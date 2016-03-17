// Replace this later
var userEmail = 'buoyantpyramid2@gmail.com';

describe('Login processes', function() {
  browser.get('http://localhost:3000');

  describe('index', function() {
    it('should display correct title', function() {
      expect(browser.getTitle()).toEqual('Jam Record');
    });

    it('allow new users to signup', function() {
      var email = element(by.model('user.email'));
      var pass = element(by.model('user.password'));
      var signupButton = element(by.id('signup'));

      email.sendKeys(userEmail);
      pass.sendKeys('password');

      signupButton.click();

      var header = element(by.css('#profile > h2'))
      expect(header.getText()).toEqual('Profile');
    });
  });
});
