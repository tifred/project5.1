/*
The rough order of events:

  "map" variable is set up to attach final map to an HTML element.
  "initializeMap calls "pinPoster".
  "pinPoster" loops through locations array, gets "results" object from Google.
  "callback" is run on each set of results.
  "callback" does ajax query with New York Times API for extra info on each location.
  "callback" calls "createMapMarker".
  "createMapMarker" makes the marker, makes the info window.
  "createMapMarker" sets up event listener to bounce marker on click OR starts a bounce now.
*/

var map;                      // declares a global map variable
var currentMarker = null;     // used to ensure only one marker bounces at a time.
var currentInfoWindow = null; // used to ensure only one infoWindow is open at once.
var oneMarkerOnly = false;    // used to keep zoom level at 15 when window resized on one marker.

/*
   initializeMap: the main function.

   Run from ViewModel in the "app.js" file.
   "locations" is an array with elements like: "Brooklyn, NY"
   "bounce" is a boolean:
      true means to set one single location's marker bouncing right now.
      false means to set an event listener to make that happen later.

   Note: if bounce was set to true when initializeMap was called,
   then the "locations" array was also set to only have a single location in it.
   That is the marker that will be set to bounce now.
*/

function initializeMap(locations, bounce) {

  // Empty now, but may be useful in future.
  var mapOptions = {};

  // Determine number of locations to display.
  var markerCount = locations.length;

  // Set the global variable to true/false, depending on number of locations.
  // One location is used when filtering to one item or when bouncing upon a click.
  markerCount === 1 ? oneMarkerOnly = true : oneMarkerOnly = false ;

  // build instance of map from Google's constructor.
  // the final map image will be part of the "#map" element in the HTML.

  map = new google.maps.Map(document.querySelector('#map'), mapOptions);

  // Build map marker and info window per location.

  function createMapMarker(placeData, infoLinks, isPark) {

    var lat = placeData.geometry.location.lat();  // latitude from the place service
    var lon = placeData.geometry.location.lng();  // longitude from the place service
    var name = placeData.formatted_address;       // name of the place from the place service
    var bounds = window.mapBounds;                // current boundaries of the map window

    // If it is a park, use the dark green icon instead of standard red one.

    if (isPark) {
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

    var infoWindow = new google.maps.InfoWindow({
      content: infoLinks
    });

    /*
       oneBounceOnly: a helper function.
       When marker is clicked, stop bouncing on any other bouncing markers.
       Uses the currentMarker variable, which must be global.
    */

    function oneBounceOnly(marker) {
      if (currentMarker) currentMarker.setAnimation(null);
      currentMarker = marker;
      marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function() {
        marker.setAnimation(null);
      }, 2000);
    }

    /*
       oneInfoWindowOnly: a helper function.
       When marker is clicked, close the infoWindow open already.
       Uses the currentInfoWindow variable, which must be global.
    */

    function oneInfoWindowOnly(map, marker, infoWindow) {
      if (currentInfoWindow) currentInfoWindow.close();
      currentInfoWindow = infoWindow;
      infoWindow.open(map, marker);
    }

    /*
       Here is where the boolean parameter "bounce" matters.
       If bounce is true, open the info window and bounce the marker NOW.
       There will only be one location in the locations array.

       Otherwise, set up an event listener to open the info window
       and bounce the marker when there is a click LATER.
       The zoom will be set to accomodate all the markers.

       In fact, even a deliberately bounced marker needs an event listener
       to bounce later, because the infoWindow can be closed and then clicked on again.
       So the event listener happens whether it is a bounce or not.
    */

    if (bounce) {
        oneInfoWindowOnly(map, marker, infoWindow);
        oneBounceOnly(marker);
    } 
    google.maps.event.addListener(marker, 'click', function() {
      oneInfoWindowOnly(map, marker, infoWindow);
      oneBounceOnly(marker);
    });

    /*
       This is where the pin actually gets added to the map.
       bounds.extend() takes in a map location object
    */
    bounds.extend(new google.maps.LatLng(lat, lon));

    /*
       If there is more than one marker, use the default zooming.
       If there is just one marker, which happens when clicking
       on the list of locations or filtering on them, set zoom to 15.
    */

    // Fit the map to the new marker
    map.fitBounds(bounds);

    // Center the map
    map.setCenter(bounds.getCenter());

    // Set zoom to 15, about a 1 mile radius around the single marker.
    if (markerCount === 1) {
      map.setZoom(15);
    }
  }

  /*
     callback: run by service.textSearch when it gets results back.
     This handles data from both Google's Map API and the NYT's API.
     and WikiPedia's API.
     There is error handling for all three.

     Use "status" parameter to be sure results were received from Google's Map API.
     If results don't come back, return error message to #map element.
     You can test this by mangling "google.maps.places.PlacesServiceStatus.OK" below.
     Change "OK" to "XXOK" and it will fail.

     If results come back from Google, test to see if the marker is a park.
     If it is, run the API for wikipedia, using the jquery ajax method.

     If it is not a park, call New York Times data API.
     Build string "infoLinks" of "li"s with the first three most recent articles about location.
     Uses an AJAX call with a done and fail method.

     It's important to acquire this info before running createMapMarker.
     Otherwise, it will have no info to display.

     If results don't come back from NYT or Wikipedia, display error in infoWindow.
     You can test this by changing "api.nytimes" to "apiXX.nytimes".

     Finally, call createMapMarker with results array and infoLinks string,
     and a true/false to say whether the marker is a park or not.
  */

  function callback(results, status, isPark) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      // The "name" property is the raw name; it is the best thing to hand to the APIs.
      var name = results[0].name;

      if (isPark) {
        var wikiRequestTimeout = setTimeout(function() {
          var failText = "<p>Failed to get wikipedia resources.  Sorry.</p>";
          var infoLinks = failText;
          createMapMarker(results[0], infoLinks, true);
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
            createMapMarker(results[0], infoLinks, true);
            clearTimeout(wikiRequestTimeout);
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
            createMapMarker(results[0], infoLinks, false);
          })
          .fail(function() {
            var failText = "<p>Failed to Load the NYT articles.  Sorry.</p>";
            var infoLinks = failText;
            createMapMarker(results[0], infoLinks, false);
          });
      }
    } else {
       /*
         Four second delay before showing error.  This isn't perfect, but it helps.
         Without it, the error shows a lot, even though good results are on the way.
         Especially noticeable on mobile.
       */
       setTimeout(function() {
         $('#map').append('<h3>No results from Google Maps API.</h3>');
       }, 4000);
    }
  }

  function pinPoster(locations) {

    var service = new google.maps.places.PlacesService(map);

    /*
       Iterate through the array of locations.
       Create a search object for each location.
       The callback will then go on to call createMapMarker.
    */

    for (var i = 0; i < locations.length; i++) {
      // The search request object:
      var request = {
        query: locations[i].location
      };
      var isPark = locations[i].park;

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
  }

  // Sets the boundaries of the map based on pin locations
  window.mapBounds = new google.maps.LatLngBounds();

  // pinPoster(locations) creates pins on the map for each location.
  pinPoster(locations);
}

/*
Vanilla JS way to listen for resizing of the window and adjust map bounds
If there is only one marker viewed right now, put zoom at 15.
Otherwise, the zoom will be way too zoomed.
*/

window.addEventListener('resize', function(e) {
  map.fitBounds(mapBounds);
  map.setCenter(mapBounds.getCenter());
  if (oneMarkerOnly) {
    map.setZoom(15);
  }
});
