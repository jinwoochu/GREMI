var map = map || {};

map.markers = [];

map.initMap = function() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(this.createMap);
  }
};

map.createMap = function(position) {
  var geocoder = new google.maps.Geocoder();
  var wplatlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
  var wpOptions = {
    zoom: 17,
    center: wplatlng, //지도에서 가운데로 위치할 위도와 경도(변수) 
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  var googleMap = new google.maps.Map(document.getElementById("googleMap"), wpOptions);

  google.maps.event.addListenerOnce(googleMap, 'tilesloaded', request_buildings);
  google.maps.event.addListener(googleMap, 'zoom_changed', request_buildings);
  google.maps.event.addListener(googleMap, 'dragend', request_buildings);
  google.maps.event.addListener(googleMap, 'click', function(event) {
    geocoder.geocode({ 'location': event.latLng }, function(results, status) {
      if (status === 'OK') {
        // TODO
        console.log(results[1].formatted_address);
      } else {
        alert(status);
      }
    });
  });

  map.moveMap = function(address, callback) {
    geocoder.geocode({ 'address': address }, function(results, status) {
      if (status === 'OK') {
        googleMap.setCenter(results[0].geometry.location);
        request_buildings();

        var marker = new google.maps.Marker({
          map: googleMap,
          position: results[0].geometry.location
        });

        map.markers.push(marker);

        callback(results[0].geometry.location);
      } else {
        alert(status);
      }
    });
  }

  $('#search_address').on('click', function() {
    var address = $('#address').val();

    geocoder.geocode({ 'address': address }, function(results, status) {
      if (status === 'OK') {
        googleMap.setCenter(results[0].geometry.location);
        request_buildings();
      } else {
        alert(status);
      }
    });
  });

  function resetMarker() {
    for (var i in map.markers) {
      map.markers[i].setMap(null);
    }

    map.markers = [];
  }

  function makeMarker(buildingId, position) {
    var marker = new google.maps.Marker({
      map: googleMap,
      position: position,
      buildingId: buildingId
    });

    marker.addListener('click', function() {
      // 클릭하면 상세 메뉴로가는것 추가하기
    });

    map.markers.push(marker);
  }

  function request_buildings() {
    google.maps.event.trigger(googleMap, 'resize');

    var bounds = googleMap.getBounds();
    var formData = {
      northeast_lat: bounds.getNorthEast().lat(),
      northeast_lng: bounds.getNorthEast().lng(),
      southwest_lat: bounds.getSouthWest().lat(),
      southwest_lng: bounds.getSouthWest().lng()
    };

    var type = $('#building_menu').find('li.active').data('type');

    if(type == 'building') {
      buildingSearch(formData);
    } else {
      stakeSearch(formData)
    }
  }

  function stakeSearch(formData) {
    $.ajax({
      url: '/stakeSearch',
      type: "get",
      data: formData,
      dataType: "json",
      success: function(result) {
        debugger;
        var buildings = result.buildings;
        resetMarker();

        for (var i in buildings) {
          buildings[i].address = ((((buildings[i]['country'] + ' ' + buildings[i]['state']).trim() + ' ' + buildings[i]['#city']).trim()) + ' ' + buildings[i]['street']).trim();

          var position = new google.maps.LatLng(buildings[i].lat, buildings[i].lng);
          makeMarker(buildings[i].building_id, position);
        }
        
        $("#stake_list").html('');
        $("#stakeTmpl").tmpl(buildings).appendTo("#stake_list");
      }
    });
  }

  function buildingSearch(formData) {
    debugger;
    $.ajax({
      url: '/buildingSearch',
      type: "get",
      data: formData,
      dataType: "json",
      success: function(result) {
        var buildings = result.buildings;
        resetMarker();

        for (var i in buildings) {
          buildings[i].address = ((((buildings[i]['country'] + ' ' + buildings[i]['state']).trim() + ' ' + buildings[i]['city']).trim()) + ' ' + buildings[i]['street']).trim();

          var position = new google.maps.LatLng(buildings[i].lat, buildings[i].lng);
          makeMarker(buildings[i].building_id, position);
        }

        $("#building_list").html('');
        $("#buildingTmpl").tmpl(buildings).appendTo("#building_list");
      }
    });
  }
}



$(document).ready(function() {
  $(window).on('resize', function() {
    $('.frame').css('height', this.innerHeight - 144);
    $('#googleMap').css('height', this.innerHeight - 144 - 55);
    
  }).resize();
});