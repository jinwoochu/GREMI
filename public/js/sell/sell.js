
var myCenter = new google.maps.LatLng(37.250943, 127.028344);
var iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';

function initMap() {
  map = new google.maps.Map(
    document.getElementById('map'), {
      zoom: 12,
      center: {lat: -34.397, lng: 150.644}
    });

  var geocoder = new google.maps.Geocoder();

  $('#submit').on('click', function() {
    geocodeAddress(geocoder, map);
  }); 

  $('#address').on('keypress', function(event) {
    if((event.keyCode ? event.keyCode : event.which) == 13){
      geocodeAddress(geocoder, map);
    }
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
  $('#investment_menu').on('click', 'a', function(event) {
    event.preventDefault();
    $('#investment_menu li').removeClass('active');
    $(this).addClass('active');

    $('.profile_item').css('display', 'none');
    $($(this).attr('href')).css('display', 'block');
  });

  $('#calendar').fullCalendar({
    header: {
          // lef  t: 'prev,next today',
          // center: 'title',
          // right: 'month,agendaWeek,agendaDay'
        },
        defaultDate: '2017-05-12',
      selectable: true,
      selectHelper: true,
      height: 420,
      select: function(start, end) {
        var title = prompt('Event Title:');
        var eventData;
        if (title) {
          eventData = {
            title: title,
            start: start,
            end: end
          };
          $('#calendar').fullCalendar('renderEvent', eventData, true); // stick? = true
        }
        $('#calendar').fullCalendar('unselect');
      },
      editable: true,
      eventLimit: true, // allow "more" link when too many events
      events: [{
        title: 'All Day Event',
        start: '2017-05-01'
      }]
    });
});