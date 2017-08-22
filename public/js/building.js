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
		event.preventDefault();
		var data = new FormData($(this)[0]);

		$.ajax({
			url: $(this).attr('action'),
			type: 'POST',
			data: data,
			contentType: false,
			processData: false,
			dataType: "json",
			success: function(result) {
				if (result.status == 0) {
					alert(result.error_message);
				} else {
					window.location.href = "/building";
				}
			} 
		});

	});

	$('#building_menu').on('click', 'a', function(event) {
		event.preventDefault();
		$('#building_menu li').toggleClass('active');
		$('.building-content').toggleClass('hidden');
	});
});