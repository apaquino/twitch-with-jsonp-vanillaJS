# Twitch API using JSONP and pure vanilla javascript

This was to create an simple app with any frameworks and build tools that uses pure vanilla plain old javascript objects.

JSONP was used to allow me to get the request data cross-domain and workaround the same-origin policy.

No UI libraries like bootstrap was used and I used flexbox as much as possible because react-native uses a very close adaptation of that.

There can be rooms for update in the app if it were to be deployed to production.

* minify the javascript.  
  * but humans would not be able to read the javascript but the computer can.
* minify and put the CSS directly in the head section so it would prevent a network trip.
  * again, humans would not be able to read the javascript but the computer can.
* use base64 for some of the stock images for error messages and have it in-line with the page so it prevent another network call.

This exercise made me appreciate react and react-native.
