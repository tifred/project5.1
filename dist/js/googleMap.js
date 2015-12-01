function initializeMap(e,n){function a(e,a,o){function t(e){currentMarker&&currentMarker.setAnimation(null),currentMarker=e,e.setAnimation(google.maps.Animation.BOUNCE),setTimeout(function(){e.setAnimation(null)},2e3)}function r(e,n,a){currentInfoWindow&&currentInfoWindow.close(),currentInfoWindow=a,a.open(e,n)}var s=e.geometry.location.lat(),p=e.geometry.location.lng(),l=e.formatted_address,c=window.mapBounds;if(o)var u=new google.maps.Marker({map:map,position:e.geometry.location,title:l,icon:"img/darkgreen_MarkerP.png"});else var u=new google.maps.Marker({map:map,position:e.geometry.location,title:l});var m=new google.maps.InfoWindow({content:a});n&&(r(map,u,m),t(u)),google.maps.event.addListener(u,"click",function(){r(map,u,m),t(u)}),c.extend(new google.maps.LatLng(s,p)),map.fitBounds(c),map.setCenter(c.getCenter()),1===i&&map.setZoom(15)}function o(e,n,o){if(n==google.maps.places.PlacesServiceStatus.OK){var t=e[0].name;if(o){var r=setTimeout(function(){var n="<p>Failed to get wikipedia resources.  Sorry.</p>",o=n;a(e[0],o,!0)},8e3);$.ajax({url:"https://en.wikipedia.org/w/api.php?action=opensearch&search="+t+"&format=json",dataType:"jsonp",success:function(n){var o=n[3],t=n[1],i=[];i.push("<ul>");for(var s=0;s<o.length;s++)i.push("<li class='article'> <a href='"+o[s]+"' target='_blank'> "+t[s]+"</a></li>");i.push("</ul>");var p=i.join("");a(e[0],p,!0),clearTimeout(r)}})}else{var i="http://api.nytimes.com/svc/search/v2/articlesearch.json?q="+t+"&sort=newest&api-key=8d6910d8cc45e32cb31931220a4d3c4b:5:73416722";$.getJSON(i).done(function(n){var o=[];o.push("<ul>");for(var t=0;3>t;t++)o.push("<li class='article'> <a href='"+n.response.docs[t].web_url+"' target='_blank'> "+n.response.docs[t].headline.main+"</a> <p>"+n.response.docs[t].snippet+"</p> </li>");o.push("</ul>");var r=o.join("");a(e[0],r,!1)}).fail(function(){var n="<p>Failed to Load the NYT articles.  Sorry.</p>",o=n;a(e[0],o,!1)})}}else setTimeout(function(){$("#map").append("<h3>No results from Google Maps API.</h3>")},4e3)}function t(e){for(var n=new google.maps.places.PlacesService(map),a=0;a<e.length;a++){var t={query:e[a].location},r=e[a].park;r?n.textSearch(t,function(e,n){o(e,n,!0)}):n.textSearch(t,function(e,n){o(e,n,!1)})}}var r={},i=e.length;oneMarkerOnly=1===i?!0:!1,map=new google.maps.Map(document.querySelector("#map"),r),window.mapBounds=new google.maps.LatLngBounds,t(e)}var map,currentMarker=null,currentInfoWindow=null,oneMarkerOnly=!1;window.addEventListener("resize",function(e){map.fitBounds(mapBounds),map.setCenter(mapBounds.getCenter()),oneMarkerOnly&&map.setZoom(15)});