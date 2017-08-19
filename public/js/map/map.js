var map = map || {};

map.markers = [];

map.initMap = function () {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(this.createMap);
  }
};

map.createMap = function (position) {
  var geocoder = new google.maps.Geocoder();
  var  wplatlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
  var wpOptions = {
    zoom:17,       
    center: wplatlng,    //지도에서 가운데로 위치할 위도와 경도(변수) 
    mapTypeId:google.maps.MapTypeId.ROADMAP 
  };

  var googleMap = new google.maps.Map(document.getElementById("googleMap"), wpOptions);

  google.maps.event.addListenerOnce(googleMap, 'tilesloaded', request_buildings);
  google.maps.event.addListener(googleMap, 'zoom_changed', request_buildings);
  google.maps.event.addListener(googleMap, 'dragend', request_buildings);
  google.maps.event.addListener(googleMap, 'click', function(event) {
    geocoder.geocode({'location': event.latLng}, function(results, status) {
      if (status === 'OK') {
        // TODO
        console.log(results[1].formatted_address);
      } else {
        alert(status);
      }
    });
  });


  $('#search_address').on('click', function() {
    var address = $('#address').val();

    geocoder.geocode({'address': address}, function(results, status) {
      if (status === 'OK') {
        googleMap.setCenter(results[0].geometry.location);
        request_buildings();
      } else {
        alert(status);
      }
    });
  });

  function resetMarker() {
    for(var i in map.markers) {
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
    var data = {
      northeast_lat: bounds.getNorthEast().lat(),
      northeast_lng: bounds.getNorthEast().lng(),
      southwest_lat: bounds.getSouthWest().lat(),
      southwest_lng:  bounds.getSouthWest().lng() 
    };


    var buildingInfos = [{
      building_id: 1, 
      lat: 37.509143,
      lng: 127.065562,
      pictures: [{'url': ''}],
      title: "aaa", 
      participant_count: 3, 
      address: "서울특별시 관악구 신림로 379 502호", 
      price: 100, 
      fundraising_amount: 50
    }, {
      building_id: 2, 
      lat: 37.510243,
      lng: 127.065562,
      pictures: [{'url': ''}],
      title: "aaa", 
      participant_count: 3, 
      address: "서울특별시 관악구 신림로 379 502호", 
      price: 3000, 
      fundraising_amount: 500
    }, {
      building_id: 3, 
      lat: 37.511243,
      lng: 127.065562,
      pictures: [{'url': ''}],
      title: "aaa", 
      participant_count: 3, 
      address: "서울특별시 관악구 신림로 379 502호", 
      price: 3000, 
      fundraising_amount: 500
    }, {
      building_id: 4, 
      lat: 37.512243,
      lng: 127.065562,
      pictures: [{'url': ''}],
      title: "aaa", 
      participant_count: 3, 
      address: "서울특별시 관악구 신림로 379 502호", 
      price: 3000, 
      fundraising_amount: 500
    }, {
      building_id: 5, 
      lat: 37.513243,
      lng: 127.065562,
      pictures: [{'url': ''}],
      title: "aaa", 
      participant_count: 3, 
      address: "서울특별시 관악구 신림로 379 502호", 
      price: 3000, 
      fundraising_amount: 500
    }, {
      building_id: 6, 
      lat: 37.514243,
      lng: 127.065562,
      pictures: [{'url': ''}],
      title: "aaa", 
      participant_count: 3, 
      address: "서울특별시 관악구 신림로 379 502호", 
      price: 3000, 
      fundraising_amount: 500
    }, {
      building_id: 7, 
      lat: 37.515243,
      lng: 127.065562,
      pictures: [{'url': ''}],
      title: "aaa", 
      participant_count: 3, 
      address: "서울특별시 관악구 신림로 379 502호", 
      price: 3000, 
      fundraising_amount: 500
    }];

    resetMarker();

    for(var i in buildingInfos) {
      var position = new google.maps.LatLng(buildingInfos[i].lat, buildingInfos[i].lng);
      makeMarker(buildingInfos[i].building_id, position);
    }

    $("#building_list").html('');
    $("#movieTmpl").tmpl(buildingInfos).appendTo("#building_list");
  }
}

$(document).ready(function() {
  $(window).on('resize', function() {
    $('#googleMap').css('height', this.innerHeight - 106);
    $('#building_list').css('height', this.innerHeight - 114);
  }).resize();
});

