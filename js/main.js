// Global Application state
var state = {
  data: ""
}

function fetchTwitchData(url) {
  // clear out children to retrieve new results from page
  var twitchResults = document.getElementById('twitchResults');
  while (twitchResults.hasChildNodes()) {
    twitchResults.removeChild(twitchResults.lastChild);
  }
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
    // set global application state
    state.data = response;
    console.log(state.data);

    var total = state.data._total,
        links = state.data._links,
        streams = state.data.streams;

    renderTotal(total);
    renderPagination(total, links);
    renderResults(state.data.streams);
  }
}

function renderTotal(total) {
  document.getElementById('resultsTotal').innerHTML = "Total Results: " + total;
}

function renderTitle(queryInput) {
  document.getElementById('currentQuery').innerHTML = "Results for the search term: " + queryInput;
}

function renderPagination(total, links) {
  renderLeftArrow(links);
  renderPageInfo(total, links);
  renderRightArrow(total, links);
}

function renderLeftArrow(links) {
  var leftArrow = document.getElementById('leftArrow'),
      displayLeftArrow = links.prev ? "inline" : "none";

  leftArrow.style.display = displayLeftArrow;
}

function renderRightArrow(total, links) {
  var rightArrow = document.getElementById('rightArrow'),
      nextParams = getQueryParameters(links.next),
      displayRightArrow = (total > nextParams.offset) ? "inline" : "none";

  rightArrow.style.display = displayRightArrow;
}

function renderPageInfo(total, links) {
  var pageInfo = document.getElementById('pageInfo'),
      nextParams = getQueryParameters(links.next),
      pages = Math.ceil(total / 10);

  pageInfo.innerHTML = (nextParams.offset / 10) + " / " + pages;
}

function renderRow(stream) {
  var rowDiv = document.createElement('div'),
      textDiv = document.createElement('div'),
      twitchResults = document.getElementById('twitchResults');

  rowDiv.setAttribute("class", "resultRow");
  textDiv.setAttribute("class", "resultText");
  rowDiv.insertAdjacentHTML("beforeEnd", '<img src="' + stream.preview.medium + '" />');
  textDiv.insertAdjacentHTML("beforeEnd", "<div class='displayName'>" + stream.channel.display_name + "</div>");
  textDiv.insertAdjacentHTML("beforeEnd", "<div class='game'>" + stream.game + " - " + stream.viewers + " viewers</div>");
  textDiv.insertAdjacentHTML("beforeEnd", "<div class ='status'>" + stream.channel.status + "</div>");

  twitchResults.appendChild(rowDiv);
  rowDiv.appendChild(textDiv);

}

function renderResults(streams) {
  var i = streams.length;
  while(i--) {
    renderRow(streams[i]);
  }
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
    parameters[pair[0]] = decodeURIComponent(pair[1]);
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
