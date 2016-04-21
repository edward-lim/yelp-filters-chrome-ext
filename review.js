function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = tab.url;

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
  });
}

function isYelpBizUrl(url) {
    if (url.indexOf("www.yelp.com/biz/") >= 0) {
        return true;
    }
    return false;
}

function callFilterReviews(url, data, onSuccessFunc) {
    $.ajax({
        dataType: "json",
        url: "http://192.168.4.106:1234",
        data: JSON.stringify(data),
        contentType: 'application/json',
        method: "POST",
        success: onSuccessFunc
    });
}

function constructData(url, filters) {
    var data = {
        'url': url,
        'filters': filters
    }
    $.each(filters, function(i, v) {
        data['filters'].push({
            'type': v['name'],
            'value': v['value']
        });
    });
    console.log(data);
    return data;
}

function onSuccess(jsonData, status, jqXHR) {
    $( "#status" ).text("Filter again?");
    $( "#results" ).text( "Your true Yelp review score:");
    var list = $("#results").html('<ul></ul>').find('ul');
    $.each(jsonData, function(k, v) {
        if (k != "status") {
            list.append('<li>' + k + ': ' + v + '</li>');
        }
    });
}

const YELP_TAB_MSG = "This only works on an open Yelp tab!";

$(document).ready(function(){
    var isYelp = null;
    getCurrentTabUrl(function(yelpUrl) {
        isYelp = isYelpBizUrl(yelpUrl);
        if ( !isYelp ) {
            $( "#status" ).text(YELP_TAB_MSG);
            $( "input[type=submit]").prop('disabled', true);
        } else {
            $( "input[type=submit]").prop('disabled', false);
        }
    });
    $("#filter-form").submit(function (event) {
        event.preventDefault();
        getCurrentTabUrl(function(yelpUrl) {
            if ( isYelp ) {
                $( "#status" ).text( "Analyzing reviews...");
            } else {
                $( "#status" ).text(YELP_TAB_MSG);
            }
            if (isYelp){
                filters = $("#filter-form").serializeArray();
                console.log(filters);
                data = constructData(yelpUrl, filters);
                callFilterReviews(yelpUrl, data, onSuccess);
            }
        });
    });
});

