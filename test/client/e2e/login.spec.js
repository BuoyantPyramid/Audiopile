// Replace this userEmail field later
var userEmail = 'buoyantpyramid22@gmail.com';

describe('Login processes', function() {

  describe('index', function() {
    browser.get('http://localhost:3000');
    it('should display correct title', function() {
      expect(browser.getTitle()).toEqual('Jam Record');
    });

    it('allow new users to signup', function() {
      var email = element(by.model('user.email'));
      var pass = element(by.model('user.password'));
      var signupButton = element(by.buttonText('Signup'));

      email.sendKeys(userEmail);
      pass.sendKeys('password');

      signupButton.click();

      var header = element(by.css('#profile > h2'));
      expect(header.getText()).toEqual('Profile');
    });

    it('allow existing users to sign in', function() {
      browser.get('http://localhost:3000');
      var email = element(by.model('user.email'));
      var pass = element(by.model('user.password'));
      var loginButton = element(by.id('loginButton'));

      email.sendKeys(userEmail);
      pass.sendKeys('password');

      loginButton.click();

      var profileLink = element(by.css('#container > .navigation > ul > li > a'));
      expect(uploadLink.getText()).toEqual('Profile!');

    });
  });
});
