/* This is run upon success or error of the Google API library lookup. */

function googleSuccess() {
  // generate the ViewModel
  ko.applyBindings(new ViewModel());
}

function googleError() {
  alert("Couldn't contact Google Maps.  Consider yourself lost.");
}
