'use strict';
/*
   The initial locations.
   Using an object for each array element.
   Some are neighborhoods, some are parks.

   The "park" variable is necessary, I believe.
   These parks happen to have "Park" in their name,
   but that's not a given (e.g. "Stony Brook Playground").
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
   The marker and infoLinks do not need to be observables
   and will be populated with data later on.
*/
var Location = function(data) {
  this.name = ko.observable(data.name);
  this.state = ko.observable(data.state);
  this.park = ko.observable(data.park);
  this.marker = null;
  this.infoLinks = null;
};

var ViewModel = function() {
  var self = this;

  /*
     allLocs is the normal Array that
     holds all the objects built with the
     "Location" constructor.
  */

  this.allLocs = [];
  this.toggleListView = ko.observable(false);
  this.showFilterError = ko.observable(false);
  this.searchInputValue = ko.observable("");
  this.listViewClasses = ko.observable("col-xs-3");
  this.mapViewClasses = ko.observable("col-xs-9");

  // Build the allLocs from the initialLocations array.

  initialLocations.forEach(function(locItem) {
    self.allLocs.push(new Location(locItem));
  });

  /*
    Run initializeMap (defined in the the googleMap.js file)
    for each object in allLocs.
    They will get values in their marker and infoLinks properties.
  */

  self.allLocs.forEach(function(loc) {
    var location = '' + loc.name() + ', ' + loc.state() + '';
    var isPark = loc.park();
    initializeMap(location, isPark, loc);
  });

  // visLocs: an observable array of everything visible at the moment.
  self.visLocs = ko.observableArray();

  // At the start, make all locations visible.
  self.allLocs.forEach(function(loc) {
    self.visLocs.push(loc);
  });

  /*
    filterListRealTime: Filter list and map of locations based on user input.
    Do it with every character typed, as it is typed.
    The observable "searchInputvalue" is updated via a 'textInput" binding.

    Note: the visLocs observable array needs to be rebuilt from scratch
    AND the visible property on each marker in allLocs needs to be changed to false.
    AND the visible property on each marker in visLocs needs to be changed to true.
    I believe that before a filter happens, the visible property in allLocs
    is in effect; afterwards, only the value in visLocs matters.
  */

  this.filterListRealTime = function() {
    var regexp = new RegExp(this.searchInputValue(), 'i');
    self.visLocs.removeAll();
    self.showFilterError(true); // set error message to show unless a match is found.

    self.allLocs.forEach(function(loc) {
      loc.marker.setVisible(false);  // set all markers to not show, for now.
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
      loc.marker.setVisible(true); // set all the markers in visLocs to be visible.
    });
  };

  self.nameClicked = function(loc) {
    google.maps.event.trigger(loc.marker, 'click');
  };

  /*
     toggleListPanel: Clicking on menu icon (only visible below 768px in width)
     will either hide or show the entire list panel.
     The map element will expand or shrink to fill the width.
     toggleListView is data-bound to the div of the entire list view panel
     and to the map element.

     Note: one tricky case is where the view starts below 768,
     then the menu bar is used to make the map full width,
     then the view is expanded again.
     You can't do that on mobile, but you can on a desktop.
     Following only the rules below, the map element will expand to 100% in width
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
  We don't want to build model until we know google maps could be reached.
  Keeping it here as a comment just for comprehension's sake.

  ko.applyBindings(new ViewModel());
*/
