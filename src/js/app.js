/*
   The initial locations.
   Using an object for each array element.
   Some are neighborhoods, some are parks.
*/

var initialLocations = [
  {
     name: "Brooklyn",
     state: "NY",
     park: false
  },
  {
     name: "Queens",
     state: "NY",
     park: false
  },
  {
     name: "Harlem",
     state: "NY",
     park: false
  },
  {
     name: "Lower East Side",
     state: "NY",
     park: false
  },
  {
     name: "Washington Heights",
     state: "NY",
     park: false
  },
  {
     name: "Soho",
     state: "NY",
     park: false
  },
  {
     name: "Washington Square Park",
     state: "NY",
     park: true
  },
  {
     name: "Central Park",
     state: "NY",
     park: true
  },
  {
     name: "Astoria Park",
     state: "NY",
     park: true
  },
  {
     name: "Madison Square Park",
     state: "NY",
     park: true
  }
];

/*
   Location: Constructor that will be used for each location.
   All properties are observables.
*/ 
var Location = function(data) {
  this.name = ko.observable(data.name);
  this.state = ko.observable(data.state);
  this.park = ko.observable(data.park);
  this.marker = null;
  this.infoLinks = null;
  this.bounds = null;
};

var ViewModel = function() {
  var self = this;

  /*
     locList is the main observable Array.
     It will hold all the objects built with the
     "Location" constructor.
  */

  this.allLocs = [];
  this.toggleListView = ko.observable(false);
  this.showFilterError = ko.observable(false);
  this.searchInputValue = ko.observable("");
  this.listViewClasses = ko.observable("col-xs-3");
  this.mapViewClasses = ko.observable("col-xs-9");

  /*
     Build the locList from the initialLocations array.
     This is how the initial list is displayed,
     in which all locations are visible.
  */

  initialLocations.forEach(function(locItem) {
    self.allLocs.push(new Location(locItem));
  });


  self.allLocs.forEach(function(loc) {
    var location = '' + loc.name() + ', ' + loc.state() + '';
    var isPark = loc.park();
    initializeMap(location, isPark, loc);
  });

  self.visLocs = ko.observableArray();

  // At the start, make all locations visible.
  self.allLocs.forEach(function(loc) {
    self.visLocs.push(loc);
  });


  /*
    filterListRealTime: Filter list and map of locations based on user input.
    but do it with every character typed, as it is typed.
    the observable "searchInputvalue" is updated via a 'textInput" binding.
  */

  this.filterListRealTime = function() {
    var regexp = new RegExp(this.searchInputValue(), 'i');
    self.visLocs.removeAll();
    self.showFilterError(true); // set error message to show unless a match is found.

    self.allLocs.forEach(function(loc) {
      var place =  loc.name() + loc.state();
      if (regexp.test(place)) {
        self.visLocs.push(loc);
      }
      // if any single match is found, set error message to NOT show.
      if (regexp.test(place)) {
        self.showFilterError(false);
      }
    });

    self.visLocs().forEach(function(loc) {
      loc.marker.setVisible(true);
    });
  };

/* Think I can erase this....
  self.nameClicked = function(loc) {
    console.log("loc.infoLinks: " + loc.infoLinks); 
    console.log("infoWindow.content 1" + infoWindow.content);
    infoWindow.content = null;
    console.log("infoWindow.content 2" + infoWindow.content);
    map.setZoom(15);
    loc.marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
      loc.marker.setAnimation(null);
    }, 2000);

    infoWindow.content = loc.infoLinks;
    console.log("infoWindow.content 3" + infoWindow.content);
    infoWindow.open(map, loc.marker);

    // Fit the map to the new marker
    map.fitBounds(loc.bounds);
    // Center the map
    map.setCenter(loc.bounds.getCenter());
  };
*/

  self.nameClicked = function(loc) {
    google.maps.event.trigger(loc.marker, 'click');
  };




  /*
     toggleListPanel: Clicking on menu icon (only visible below 768px in width)
     will either hide or show the entire list panel.
     the map element will expand or shrink to fill the width.
     toggleListView is data bound to the div of the entire list view panel.
     and to the map element.

     Note: one tricky case is where the view starts below 768,
     then the menu bar is used to make the map full width, then the view is expanded again.
     You can't do that on mobile, but you can on a desktop.
     With the rules below, the map element will expand to 100% in width
     and stay that way when the width increases above 768.  That's not right.
     A media query in the css handles this event, setting the size back to 75% if
     the viewport gets larger.
  */

  this.toggleListPanel = function() {
    this.toggleListView(!this.toggleListView());
    if (this.toggleListView()) {
      this.listViewClasses("col-xs-3 hidden-xs");
      this.mapViewClasses("col-xs-12");
    } else {
      this.listViewClasses("col-xs-3");
      this.mapViewClasses("col-xs-9");
    }
  };

};
/*
  The line below will be run from the googleSuccess function
  in the "googleCallback.js" file.
  Don't want to build model until we know google maps could be reached.
  Keeping it here as a comment just for comprehension's sake.

  ko.applyBindings(new ViewModel());
*/
