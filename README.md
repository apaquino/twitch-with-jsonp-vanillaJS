# Twitch API using JSONP and pure vanilla javascript

This was to create a simple app without any frameworks and build tools.  It only uses pure vanilla plain old javascript objects.

JSONP was used to allow me to request cross-domain data and workaround the same-origin policy.

No UI libraries like bootstrap was used and I used flexbox as much as possible because react-native uses a very close adaptation of it.

There is room for improvements and updates in the app if it were to be deployed to production.

* minify the javascript.  
  * but humans would not be able to read the javascript but the computer would still be able to.
* minify and put the CSS directly in the head section so it would prevent a network trip.
  * again, humans would not be able to read the css but the computer would still be able to.
* use base64 for some of the stock images for error messages and have it in-line with the page so it would prevent another network call.

## NOTES
* This exercise made me appreciate react and react-native in building UI's.
* After working with the twitch API, I know graphQL would have downloaded much less data then I actually needed.
* RelayJS handles pagination better and the Twitch api give unpredictable results.
* Also, I can't wait when all browsers support ES6/2015.  String templates and destructuring is so second nature to me now.
* Opportunities to make functions re-usable and not tightly coupled.
* Opportunities to make renderRow functions DRY

### Change log

* Add cache to make performance appear better
* Wrap main.js in IIFE
* Add loading spinner
  * issue on safari
