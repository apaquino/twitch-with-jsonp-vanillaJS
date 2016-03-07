(function(global){
  // Global Application state
  var state = {
    data: ""
  };
  // add cache for performance
  var twitchStateCache = {};

  function fetchTwitchData(url) {
    renderLoadingSpinner();

    var cacheStr = cleanJSONPUrl(url);

    if (twitchStateCache[cacheStr]) {
      state.data = twitchStateCache[cacheStr];
      renderPage(state);
    } else {
      // Create script element, configure, and attach to div
      var script = document.createElement('script');
      script.setAttribute('src', url);
      document.getElementById('scriptRoot').appendChild(script);
      // Clean up and remove script tag
      script.parentNode.removeChild(script);
    }
  }
  // callback for the JSONP call
  function handleTwitchData(response) {
    if(response.error) {
      console.log("log to crash analytics", response.error);
      // render error page
      /**
        to force the error, go to line 175 and replace with this to not give it a "q" parameters
        return "https://api.twitch.tv/kraken/search/streams?callback=handleTwitchData";
      */
      renderErrorRow();
    } else {
      // set cache & global application state
      var twitchUrl = response._links.self;

      twitchStateCache[twitchUrl] = response;
      state.data = twitchStateCache[twitchUrl];

      renderPage(state);
    }
  }

  // Try to make it single responsibility functions as much as possible
  function renderTotal(total) {
    document.getElementById('resultsTotal').innerHTML = "Total Results: " + total;
  }

  function renderTitle(queryInput) {
    document.getElementById('currentQuery').innerHTML = "Results for your latest successful search term: " + queryInput;
  }
  // Create fascade to hide abstraction and make it easy to read; more declarative
  function renderPagination(total, links) {
    renderLeftArrow(links);
    renderPageInfo(total, links);
    renderRightArrow(total, links);
  }

  function renderLeftArrow(links) {
    var leftArrow = document.getElementById('leftArrow'),
        displayLeftArrow = links.prev ? "visible" : "hidden";
        // If there is no prev link, you are at the first index
    leftArrow.style.visibility = displayLeftArrow;
  }

  function renderRightArrow(total, links) {
    var rightArrow = document.getElementById('rightArrow'),
        nextParams = getQueryParameters(links.next),
        displayRightArrow = (total > nextParams.offset) ? "visible" : "hidden";
        // if the total amount if results is more than the offset, there is no next
        // you can go but you will get a blank screen.  RelayJS handles this better.
    rightArrow.style.visibility = displayRightArrow;
  }

  function renderPageInfo(total, links) {
    var pageInfo = document.getElementById('pageInfo'),
        nextParams = getQueryParameters(links.next),
        pages = Math.ceil(total / 10),
        currentIndex = (total === 0) ? 0 :  (nextParams.offset / 10);
        // If there are no records, it will render 1 / 0.
    pageInfo.innerHTML =  currentIndex + " / " + pages;
  }
  // Will be used when loops through array streams. Similiar to react native list view.
  function renderRow(stream) {
    var rowDiv = document.createElement('div'),
        textDiv = document.createElement('div'),
        twitchResults = document.getElementById('twitchResults');

    rowDiv.setAttribute("class", "resultRow");
    textDiv.setAttribute("class", "resultText");
    rowDiv.insertAdjacentHTML("beforeEnd", '<img class="resultImage" src="' + stream.preview.medium + '" />');
    textDiv.insertAdjacentHTML("beforeEnd", "<div class='displayName'>" + stream.channel.display_name + "</div>");
    textDiv.insertAdjacentHTML("beforeEnd", "<div class='game'>" + stream.game + " - " + stream.viewers + " viewers</div>");
    textDiv.insertAdjacentHTML("beforeEnd", "<div class ='status'>" + stream.channel.status + "</div>");

    twitchResults.appendChild(rowDiv);
    rowDiv.appendChild(textDiv);
  }
  // TODO: Make a single renderRow functions for results, no results, error.
  function renderErrorRow() {
    var rowDiv = document.createElement('div'),
        textDiv = document.createElement('div'),
        twitchResults = document.getElementById('twitchResults');

    clearResults("twitchResults");

    rowDiv.setAttribute("class", "resultRow");
    textDiv.setAttribute("class", "resultText");
    rowDiv.insertAdjacentHTML("beforeEnd", '<img class="errorImage" src="./sadAnakin.jpg" />');
    textDiv.insertAdjacentHTML("beforeEnd", "<div class='displayName'>Oops! Sorry</div>");
    textDiv.insertAdjacentHTML("beforeEnd", "<div class='game'>Something went wrong.</div>");
    textDiv.insertAdjacentHTML("beforeEnd", "<div class='status'>Please try again.</div>");

    twitchResults.appendChild(rowDiv);
    rowDiv.appendChild(textDiv);
  }

  function renderNoResultsRow() {
    var rowDiv = document.createElement('div'),
        textDiv = document.createElement('div'),
        twitchResults = document.getElementById('twitchResults');

    clearResults("twitchResults");

    rowDiv.setAttribute("class", "resultRow");
    textDiv.setAttribute("class", "resultText");
    rowDiv.insertAdjacentHTML("beforeEnd", '<img class="errorImage" src="./movie_poster.jpg" />');
    textDiv.insertAdjacentHTML("beforeEnd", "<div class='displayName'>Awww, no results</div>");
    textDiv.insertAdjacentHTML("beforeEnd", "<div class='game'>But here is a cool picture you can look at.</div>");

    twitchResults.appendChild(rowDiv);
    rowDiv.appendChild(textDiv);
  }

  function renderResults(streams) {
    var i = streams.length;
    // Optimized iteration.  pre-test and post-execution step combined.
    while(i--) {
      renderRow(streams[i]);
    }
  }

  function renderLoadingSpinner() {
    var twitchResults = document.getElementById('twitchResults');

    clearResults("twitchResults");

    twitchResults.insertAdjacentHTML("beforeEnd", '<img class="loadingImage" src="./loadingSpinnerIcon.gif" />');
  }

  function renderPage(newState) {
    var total = newState.data._total,
        links = newState.data._links,
        streams = newState.data.streams;

    clearResults("twitchResults");
    // check if there are no results to avoid running renderResults
    if (streams.length === 0) {
      renderNoResultsRow();
      // Technical debt, opportunity to make DRY.  to see, search for "armand"
      renderTotal(total);
      renderPagination(total, links);
    } else {
      renderTotal(total);
      renderPagination(total, links);
      renderResults(streams);
    }
  }

  // helpers
  function createUrl(queryString) {
    return "https://api.twitch.tv/kraken/search/streams?callback=handleTwitchData&q=" + encodeURIComponent(queryString);
  }
  // I want to use the offset and total in the pagination logic
  function getQueryParameters(url) {
    var parameters = {},
        pairs = url.slice(url.indexOf('?') + 1).split('&');

    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i].split('=');
      parameters[pair[0]] = decodeURIComponent(pair[1]);
    }
    return parameters;
  }
  // Required for moving from page to page or after 0 result search
  function clearResults(elementID) {
    var parentElement = document.getElementById(elementID);

    while (parentElement.hasChildNodes()) {
      parentElement.removeChild(parentElement.lastChild);
    }
  }
  // to use to check cache and remove callback from query string
  // check the self url and it does not have the callback in the URL
  function cleanJSONPUrl(url) {
    var idx = url.indexOf("&callback");
    return url.slice(0, idx);
  }
  // UI event handlers
  var queryForm = document.getElementById('queryForm'),
      leftArrow = document.getElementById('leftArrow'),
      rightArrow = document.getElementById('rightArrow');

  queryForm.addEventListener('submit', function handleSubmit(e) {
    e.preventDefault();

    var queryInput = document.getElementById('queryInput'),
        queryValue = queryInput.value,
        url = createUrl(queryValue);

    fetchTwitchData(url);
    renderTitle(queryValue);
    // clear search field after submitting
    queryInput.value = "";
  });

  leftArrow.addEventListener('click', function handleLeftArrow() {
    var leftArrowFetchUrl = state.data._links.prev + "&callback=handleTwitchData";
    fetchTwitchData(leftArrowFetchUrl);
  });

  rightArrow.addEventListener('click', function handleRightArrow() {
    var rightArrowFetchUrl = state.data._links.next + "&callback=handleTwitchData";
    fetchTwitchData(rightArrowFetchUrl);
  });

  global.handleTwitchData = handleTwitchData;
})(window)
