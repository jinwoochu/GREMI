var map;

// 현재위치 동의
function getLocation_cord() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(initMap);
  }
}

// 맵 랜더링
function initMap(wp_position) {
  var wplatlng = new google.maps.LatLng(wp_position.coords.latitude, wp_position.coords.longitude);
  var wpOptions = {
    zoom:17,        // 지도 zoom단계
    center:wplatlng,    //지도에서 가운데로 위치할 위도와 경도(변수) 
    mapTypeId:google.maps.MapTypeId.ROADMAP 
  };

  map = new google.maps.Map(document.getElementById("map"), wpOptions);

  var marker = new google.maps.Marker({
        map: map,             // 마커에 마우스 포인트를 갖다댔을 때 뜨는 타이틀.
        position: wplatlng      // 마커 표시 좌표.
      });

  var geocoder = new google.maps.Geocoder();

  $('#submit').on('click', function() {
    geocodeAddress(geocoder, map);
  }); 

  google.maps.event.addListener(map, 'zoom_changed', function () {
   google.maps.event.trigger(map, 'resize');
   var bounds = map.getBounds();
   var North = bounds.getNorthEast().lat();
   var East = bounds.getNorthEast().lng();
   var South = bounds.getSouthWest().lat();
   var West = bounds.getSouthWest().lng();
   console.log(North,East,South,West)
 });

  google.maps.event.addListener(map, 'dragend', function () {
   google.maps.event.trigger(map, 'resize');
   var bounds = map.getBounds();
   var North = bounds.getNorthEast().lat();
   var East = bounds.getNorthEast().lng();
   var South = bounds.getSouthWest().lat();
   var West = bounds.getSouthWest().lng();
   console.log(North,East,South,West)
 });

}

  // 검색
  function geocodeAddress(geocoder, resultsMap) {
    var address = document.getElementById('address').value;
    
    geocoder.geocode({'address': address}, function(results, status) {
      if (status === 'OK') {
        resultsMap.setCenter(results[0].geometry.location);
        marker = new google.maps.Marker({
          map: resultsMap,
          position: results[0].geometry.location
        });

      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
  };

  $(document).ready(function() {
    $(window).on('resize', function() {
      $('#map').css('height', this.innerHeight - 106);
      $('#product_list').css('height', this.innerHeight - 114);
    }).resize();
  });

  google.maps.event.addDomListener(window, 'load', getLocation_cord);