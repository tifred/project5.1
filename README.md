### TO RUN AND TEST APPLICATION:

1. Load dist/index.html in a browser

  * List of 10 locations should appear in list
  * Map of 10 locations with 10 markers should appear
  * Filter input field should read "Type Locations Here.."
  * Locations that are parks will have green markers on the map
  * Other locations will have red markers

2. Click on any marker on map

  * Marker should bounce for two seconds
  * Info Window should open
  * Info Window for neighborhoods should include three URL links and text from
  * the New York Times's data API (the three most recent articles on this location)
  * Info Window for parks should show link(s) to wikipedia

3. Click on link in Info Window

  * Should open URL in another tab in the browser

4. Click on a marker while another marker is already bouncing

  * The first marker should stop bouncing
  * Only the most recently clicked marker should bounce

5. Click on a marker while another info Window is already open

  * The info window of the first marker should disappear

6. Hover over names of locations in list panel

  * The color of text and background should change

7. Click on name of location in list

  * Marker should bounce
  * Info Window should open

8. Enter text in Filter Input Field

  * Text should be matched, in real time, letter by letter,
  * against locations (case insensitive, full-text search)
  * For instance, typing "ho" should match the location "Soho"
  * Matched location (only) should appear in list
  * Matched marker (only) should appear on map
  * InfoWindow should NOT open
  * Marker should NOT bounce

9. Resize window to less than 768px in width

  * "Menu" icon should appear in top right corner
  * Purple margin should appear around map image to allow for scrolling on mobile
  * (otherwise, one could only scroll the map itself)
  * In landscape mode on mobile, the height of map is reduced to fit better on the screen

10. Click on "Menu" icon (only visible below 768 px)

  * List view panel should disappear
  * Click again and it should reappear

11. Error Handling:

  * If the Google places library can't be reached, an alert window displays in browser
  * If Google's service.textSearch doesn't respond, the map element displays an error
  * If the New York Times API doesn't respond, the InfoWindow displays an error
  * If the Wikipedia API doesn't respond, the InfoWindow displays an error
  * If the submit on Input Filter Field has no matches, the list view panel shows an error

12. Build Environment:

  * Unzip nodes.modules.zip
  * Run "gulp build"
  * This will minimize relevant files in src/ and put the results in dist/
