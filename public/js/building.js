$(document).ready(function() {
	$('#country, #state, #city, #street').on('change', function(event) {
		var address = 
			(((($('#country').val() + ' ' + $('#state').val()).trim() + ' ' + $('#city').val()).trim()) + ' ' + $('#street').val()).trim();

		map.moveMap(address, setLocation);
	});

	function setLocation(location) {
		$('#lat').val(location.lat());
		$('#lng').val(location.lng());
	}

	$('#building_register_form').on('submit', function(event) {
		var data = new FormData($(this)[0]);

		request_ajax('POST', $(this).attr('action'), data, function(result) {
			if (result.status == 0) {
				alert(result.error_message);
			} else {
				window.location.href = "/building";
			}
		} );
	});

	$('#building_menu').on('click', 'a', function(event) {
		event.preventDefault();
		$('#building_menu li').toggleClass('active');
		$('.building-content').toggleClass('hidden');
	});
});