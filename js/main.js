// Global Application state
var state = {
  data: ""
}

function fetchTwitchData(url) {
  // Create script element, configure, and attach to div
  var script = document.createElement('script');
  script.setAttribute('src', url);
  document.getElementById('scriptRoot').appendChild(script);
  // Clean up and remove script tag
  script.parentNode.removeChild(script);
}

function handleTwitchData(response) {
  if(response.error) {
    console.log("log to crash analytics");
    // render error
    console.log(response.error);
  } else {
    // set state
    state.data = response;

    var total = state.data._total,
        links = state.data._links,
        streams = state.data.streams;

    console.log(state.data);
    renderTotal(total);
    renderPagination(total, links);
    renderResults();
  }
}

function renderTotal(total) {
  document.getElementById('resultsTotal').innerHTML = total;
}

function renderTitle(queryInput) {
  document.getElementById('currentQuery').innerHTML = queryInput;
}

function renderPagination(total, links) {
  // TODO create separate functions
  var leftArrow = document.getElementById('leftArrow'),
      rightArrow = document.getElementById('rightArrow'),
      pageInfo = document.getElementById('pageInfo'),
      displayLeftArrow = links.prev ? "inline" : "none",
      nextParams = getQueryParameters(links.next),
      displayRightArrow = (total > nextParams.offset) ? "inline" : "none",
      pages = Math.ceil(total / 10);

  leftArrow.style.display = displayLeftArrow;
  pageInfo.innerHTML = (nextParams.offset / 10) + " / " + pages;
  rightArrow.style.display = displayRightArrow;
}

function renderRow() {

}

function renderResults() {

}

// helpers
function createUrl(queryString) {
  return "https://api.twitch.tv/kraken/search/streams?callback=handleTwitchData&q=" + encodeURIComponent(queryString);
}

function getQueryParameters(url) {
  var parameters = {},
      pairs = url.slice(url.indexOf('?') + 1).split('&');

  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split('=');
    parameters[pair[0]] = pair[1];
  }

  return parameters;
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
  // clear field after submitting
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
