$(document).ready(function() {

	// 빌딩 판매 등록
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

	// 메뉴변경
	$('#building_menu').on('click', 'a', function(event) {
		event.preventDefault();
		$('.building-content').addClass('hidden');
		$('#building_menu li').removeClass('active');

		$(this).parent('li').addClass('active');
		$('#' + $(this).data('content')).removeClass('hidden');
	});

	// 투자하기
	$('#invest_btn').on('click', function(event) {
		if (confirm('투자 ㄲ??')) {
			var campaignId = $(this).data('building-id');
			var amount = $('#amount').val();
			var userAddress = $.cookie('wallet_address');

			contract.investment(campaignId, amount, userAddress, saveTransactionHistory);
		}
	});

	function saveTransactionHistory(txId, campaignId, amount) {
		var data = new FormData();

		data.append('tx_id', txId);
		data.append('b_id', campaignId);
		data.append('invest_amount', amount);
		data.append('stake', amount / ($('#price').val() - 0) * 100);

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

	$('#stake_buy_content').on('click', '.buy-stake', function() {
		var password = prompt('password');	

		if(password) {
			var data = new FormData();
			data.append('s_id', $(this).data('stake-id'));
			data.append('password', password);

			$.ajax({
				url: '/buyStake',
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
	});
});