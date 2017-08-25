$(document).ready(function() {

	// 빌딩 판매 등록
	$('#building_register_form').on('submit', function(event) {
		event.preventDefault();
		var data = new FormData($(this)[0]);

		/*
			data = {
				'country': 'korea',
				'state': 'seoul',
				'city': 'seoul',
				'street': '379',
				'price': 1000,
				'lat': 37,
				'lng': 133,
				'images': [] 
			}

			bulding = {
				'b_id': 1,
				'email': 'stompesi@gmail.com',
				'status': 0 / 1 / 2

				'country': 'korea',
				'state': 'seoul',
				'city': 'seoul',
				'street': '379',
				'price': 1000,
				'lat': 37,
				'lng': 133
			}
			*/

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

	// 메뉴변경
	$('#building_menu').on('click', 'a', function(event) {
		event.preventDefault();
		$('#building_menu li').toggleClass('active');
		$('.building-content').toggleClass('hidden');
	});

	// 투자하기
	$('#invest_btn').on('click', function(event) {
		if (confirm('투자 ㄲ??')) {
			var campaignId = $(this).data('building-id');
			var amount = $('#amount').val();
			// var userAddress = $.cookie('wallet_address');
			var userAddress = "0x072fc66f7505db74e9dc242afd2df8a861271d4a";

			contract.investment(campaignId, amount, userAddress, saveTransactionHistory);
		}
	});

	function saveTransactionHistory(txId, campaignId, amount) {
		var data = new FormData();

		data.append('tx_id', txId);
		data.append('b_id', campaignId);
		data.append('invest_amount', amount);
		data.append('stake', amount / ($('#price').val() - 0) * 100);

		debugger;

		$.ajax({
			url: '/investment',
			type: 'POST',
			data: data,
			contentType: false,
			processData: false,
			dataType: "json",
			success: function(result) {
				if (result.status == 0) {
					alert(result.error_message);
				} else {
					alert('완료!');  
					window.location.href = "/building";
				}
			}  
		}); 
	}
	// 빌딩 판매 주소 검색
	$('#country, #state, #city, #street').on('change', function(event) {
		var address = 
		(((($('#country').val() + ' ' + $('#state').val()).trim() + ' ' + $('#city').val()).trim()) + ' ' + $('#street').val()).trim();
		map.moveMap(address, setLocation);
	});	

	function setLocation(location) {
		$('#lat').val(location.lat());
		$('#lng').val(location.lng());
	}
});