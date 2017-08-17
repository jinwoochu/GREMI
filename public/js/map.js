
var myCenter = new google.maps.LatLng(37.250943, 127.028344);
var iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';


function initMap() {
 var map = new google.maps.Map(
  document.getElementById('map'), {
    zoom: 12,
    center: {lat: -34.397, lng: 150.644}
  });

 var geocoder = new google.maps.Geocoder();

 $('#submit').on('click', function() {
  geocodeAddress(geocoder, map);
}); 
}

function geocodeAddress(geocoder, resultsMap) {
  var address = document.getElementById('address').value;
  geocoder.geocode({'address': address}, function(results, status) {
    if (status === 'OK') {
      resultsMap.setCenter(results[0].geometry.location);
      marker = new google.maps.Marker({
        map: resultsMap,
        position: results[0].geometry.location
      });

      var myCity = new google.maps.Circle({
        center: results[0].geometry.location,
        radius:800,
        strokeColor:"#0000FF",
        strokeOpacity:0.8,
        strokeWeight:2,
        fillOpacity:0.0,
        map: resultsMap
      });
      var cityCircle = new google.maps.Circle(myCity);

    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}
$(document).ready(function() {
  $(window).on('resize', function() {
    $('#map').css('height', this.innerHeight - 106);
    $('#product_list').css('height', this.innerHeight - 114);
  }).resize();
});