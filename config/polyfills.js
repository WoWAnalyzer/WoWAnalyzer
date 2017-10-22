/**
 * Previously used the polyfill service:
 <!-- The minified version of the polyfill service causes an error in PhantomJS: "Attempting to configurable attribute of unconfigurable property.", ~~but we shouldn't need PhantomJS anymore and it's deprecated anyway.~~ Actually it appears Google's "how a visitor sees the page" uses PhantomJS-like rendering so it does need to be unminified (assuming that part is meaningful, it probably is). -->
 <!-- Do NOT use `unknown=polyfill` as this breaks Googlebot/Headless Chrome -->
 <script src="https://ft-polyfill-service.herokuapp.com/v2/polyfill.js?features=es6" crossorigin="anonymous"></script>
 * But Googlebot still doesn't work with that.
 */

require('babel-polyfill');
