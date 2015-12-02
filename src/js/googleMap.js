'use strict';
/*
The rough order of events:

  "map" variable is set up to attach final map to an HTML element.
  "initializeMap calls "pinPoster".
  "pinPoster" takes a single location, gets "results" object from Google.
  "callback" is run on the result
  "callback" does ajax query with New York Times and Wikipedia API for info.
  "callback" calls "createMapMarker" (in four distinct cases).
  "createMapMarker" makes the marker, makes the info window.
  "createMapMarker" sets up event listener to bounce marker and show info on click.
*/

var map;
var currentMarker = null;     // used to ensure only one marker bounces at a time.
var infoWindow;

/*
  initializeMap: called for each object in the allLocs array (in app.js).
    location = the name of the place.
    isPark = boolean.
    loc = the whole object in the allLocs array (built from the Location constructor).

  The loc is useful because we can add to the marker and infoWindow properties.
  Then those can be accessed in the viewmodel.
*/

function initializeMap(location, isPark, loc) {

    // create a map object with Google's constructor.

    var mapOptions = {};  // empty now, may be useful later.
    map = new google.maps.Map(document.querySelector('#map'), mapOptions);

    // create an infoWindow  object with Google's constructor.

    infoWindow = new google.maps.InfoWindow();

  /*
     Build map marker and info window.
     This is the last step executed by the program.
     It makes edits to the "loc" object.
  */

  function createMapMarker(placeData, infoLinks) {

    var lat = placeData.geometry.location.lat();  // latitude from the place service
    var lon = placeData.geometry.location.lng();  // longitude from the place service
    var name = placeData.formatted_address;       // name of the place from the place service
    var bounds = window.mapBounds;                // current boundaries of the map window

    // A park gets a green icon for a marker.
    if (loc.park()) {
      var marker = new google.maps.Marker({
        map: map,
        position: placeData.geometry.location,
        title: name,
        icon: 'img/darkgreen_MarkerP.png'
      });
    } else {
      var marker = new google.maps.Marker({
        map: map,
        position: placeData.geometry.location,
        title: name,
      });
    }

    /*
      Set up the event listener for each marker.
      Note the immediately run function, which is needed to
      "hard-code" the event listener with data that will
      be accessed later.
    */

    google.maps.event.addListener(marker, 'click', (function(markerCopy, infoLinksCopy) {
      return function() {
        // Stop any currently bouncing markers, then bounce this marker.
        if (currentMarker) currentMarker.setAnimation(null);
        currentMarker = markerCopy;
        markerCopy.setAnimation(google.maps.Animation.BOUNCE);

        // Stop bouncing after 2 seconds.
        setTimeout(function() {
          markerCopy.setAnimation(null);
        }, 2000);

        // Close open window, change content of window, open it again for this marker.
        infoWindow.close();
        infoWindow.setContent(infoLinksCopy);
        infoWindow.open(map, markerCopy);
      };
    })(marker, infoLinks));

    // This populates each location with marker and infoLink data.
    loc.marker = marker;
    loc.infoLinks = infoLinks;

    // bounds.extend() takes in a map location object
    bounds.extend(new google.maps.LatLng(lat, lon));

    // Fit the map to the new marker
    map.fitBounds(bounds);

    // Center the map
    map.setCenter(bounds.getCenter());
  }

  /*
     callback: run by service.textSearch when it gets results back.
     This handles data from both Google's Map API and the NYT's API
     and WikiPedia's API.  There is error handling for all three.

     Use "status" parameter to be sure results were received from Google's Map API.
     If results don't come back, return error message to #map element.
     You can test this by mangling "google.maps.places.PlacesServiceStatus.OK" below.
     Change "OK" to "XXOK" and it will fail.

     If results come back from Google, test to see if the marker is a park.
     If it is, run the API for wikipedia, using the jquery ajax method.

     If it is not a park, call New York Times data API.
     Build string "infoLinks" of "li"s with the first three most recent articles about location.
     Use an AJAX call with a done and fail method.

     It's important to acquire this info before running createMapMarker.
     Otherwise, it will have no info to display.

     If results don't come back from NYT or Wikipedia, prepare an error for infoWindow.
     You can test this by changing "api.nytimes" to "apiXX.nytimes".

     Finally, call createMapMarker with results array and infoLinks string.
     Note there are four distinct cases for calling createMapMarker.
     Only one of them will be called.
  */

  function callback(results, status, isPark) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      // The "name" property is the raw name; it is the best thing to hand to the APIs.
      var name = results[0].name;

      if (isPark) {
        // An error is assumed after 8 seconds.  Best we can do.
        var wikiRequestTimeout = setTimeout(function() {
          var failText = "<p>Failed to get wikipedia resources.  Sorry.</p>";
          var infoLinks = failText;
          createMapMarker(results[0], infoLinks);
        }, 8000);

        $.ajax({
          url: 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + name + '&format=json',
          dataType: "jsonp",
          success: function (response) {
            var wikiURL = response[3];
            var wikiStr = response[1];
            var items = [];
            items.push("<ul>");
            for (var i = 0; i < wikiURL.length; i++) {
              items.push( "<li class='article'> <a href='" + wikiURL[i] + "' target='_blank'> " + wikiStr[i] + "</a></li>");
            }
            items.push("</ul>");
            var infoLinks = items.join("");
            createMapMarker(results[0], infoLinks);
            clearTimeout(wikiRequestTimeout); // query worked, so clear the error message.
          }
        });
      } else {
        var nytQuery = 'http://api.nytimes.com/svc/search/v2/articlesearch.json?q=' + name + '&sort=newest&api-key=8d6910d8cc45e32cb31931220a4d3c4b:5:73416722';
        $.getJSON(nytQuery)
          .done(function(data) {
            var items = [];
            items.push("<ul>");
            for (var i = 0; i < 3; i++ ) {
              items.push( "<li class='article'> <a href='" + data.response.docs[i].web_url + "' target='_blank'> " + data.response.docs[i].headline.main + "</a> <p>" + data.response.docs[i].snippet + "</p> </li>");
            }
            items.push("</ul>");
            var infoLinks = items.join("");
            createMapMarker(results[0], infoLinks);
          })
          .fail(function() {
            var failText = "<p>Failed to Load the NYT articles.  Sorry.</p>";
            var infoLinks = failText;
            createMapMarker(results[0], infoLinks);
          });
      }
    } else {
      $('#map').append('<h3>No results from Google Maps API.</h3>');
    }
  }

  function pinPoster(location, isPark) {
    var service = new google.maps.places.PlacesService(map);

    var request = {
      query: location
    };

    /*
      Go get results for the given query from Google.
      When the results arrive, run the callback function.

      Note: I ran into trouble passing along the "isPark" variable.
      Don't know why, but resorted to using the "if" below to directly
      pass along a true or false.

      Note: I had to use the format below to pass a new argument to the callback
      run by textSearch.  Otherwise, it wouldn't take the last boolean argument.
    */

    if (isPark) {
      service.textSearch(request, function(results, status) { callback(results, status, true);});
    } else {
      service.textSearch(request, function(results, status) { callback(results, status, false);});
    }
  }

  // Sets the boundaries of the map based on pin locations
  window.mapBounds = new google.maps.LatLngBounds();

  // pinPoster(locations) creates pins on the map for each location.
  pinPoster(location, isPark);
}

/*
  Vanilla JS way to listen for resizing of the window and adjust map bounds.
  Any resize of the window will set the bounds back to their original parameters.
  I think that's ok.
*/

window.addEventListener('resize', function(e) {
  map.fitBounds(mapBounds);
  map.setCenter(mapBounds.getCenter());
});
