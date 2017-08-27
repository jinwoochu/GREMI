$(document).ready(function() {
  $('#profile_menu').on('click', function() {
    $('.profile-contents').addClass('hidden');
    $('#profile_content').removeClass('hidden');
  });

  $('#wallet_menu').on('click', function() {
    $('.profile-contents').addClass('hidden');
    $('#wallet_content').removeClass('hidden');
  });

  $('#callandar_menu').on('click', function() {
    $('.profile-contents').addClass('hidden');
    $('#callandar_content').removeClass('hidden');
  });

  $('#asset_menu').on('click', function() {
    $('.profile-contents').addClass('hidden');
    $('#asset_content').removeClass('hidden');
    //TODO
    $.ajax({
      url: '/asset',
      type: "get",
      dataType: "json",
      success: function(result) {
        var sum = 0;

        for(var i = 0 ; i < result.buyerLogs.length ; i++) {
          sum += result.buyerLogs[i].invest_amount;
        }

        $("#buyTempl").tmpl({'logs': result.buyerLogs, 'totalAmount': sum}).appendTo("#buy_list");

        sum = 0;
        for(var i = 0 ; i < result.buildings.length ; i++) {
          sum += result.buildings[i].price;
        }

        $("#sellTmpl").tmpl({'logs': result.buildings, 'totalAmount': sum}).appendTo("#sell_list");
      }
    });
  });

  $('#asset_detail_menu').on('click', 'a', function() {
    $('.asset_content').toggleClass('hidden');
  });


  $('.currency-type').on('click', 'a', function() {

    $(this).parents('.currency-form').find('.currency-info').text($(this).data('currency-info'));

    $(this).parents('.currency-form').find('.currency-input').data('type', $(this).data('currency-type'));
    
    $($(this).parents('ul').data('input-type')).keyup();
  });

  $('#deposit_input').on('keyup', function() {
    var data = {
      'type': $(this).data('type'),
      'money': $(this).val()
    };


    getExpectCoin('/expectCoin', data, function(result) {
      // {status: 1 / 0, error_message: "" ,expectCoin}
      if(result.status) {
        $('#expected_deposit_money').val(result.expectCoin);
        return;
      } 
      alert(result.error_message);
    });
  });

  $('#widthraw_input').on('keyup', function() {
    var data = {
      'type': $(this).data('type'),
      'coin': $(this).val()
    };
    getExpectCoin('/expectMoney', data, function(result) {
      // {status: 1 / 0, error_message: "" ,expectCoin}
      if(result.status) {
        $('#expected_widthraw_money').val(result.expectMoney);
        return;
      } 
      alert(result.error_message);
    });
  });

  function getExpectCoin(url, data, callback) {


    $.ajax({
      url: url,
      type: 'GET',
      data: data,
      dataType: "json",
      success: callback
    });
  }

  $('#deposit_button').on('click', function() {
    var money = $('#deposit_input').val();
    var type = $('#deposit_input').data('type');

    var data = new FormData();

    data.append('type', type);
    data.append('money', money);

    $.ajax({
      url: '/buyCoin',
      type: 'POST',
      data: data,
      contentType: false,
      processData: false,
      dataType: "json",
      success: function(result) {
        // {status: 1 / 0, error_message: "" ,expectCoin}
        if(result.status == 1) {
          $('#balance').text(result.coin);
          return;
        } 
        alert(result.error_message);
      }
    });
  });

  $('#widthraw_button').on('click', function() {
    var password = prompt("Please enter your password:");
    var coin = $('#widthraw_input').val();
    var type = $('#widthraw_input').data('type');

    var data = new FormData();

    data.append('type', type);
    data.append('coin', coin);
    data.append('password', password);

    $.ajax({
      url: '/sellCoin',
      type: 'POST',
      data: data,
      contentType: false,
      processData: false,
      dataType: "json",
      success: function(result) {
        if(result.status == 1) {
          $('#balance').text(result.coin);
          return;
        } 
        alert(result.error_message);
      }
    });
  });

  $('#profile_image_form').on('submit',  function(event) {
    event.preventDefault();
    var data = new FormData($(this)[0]);

    $.ajax({
      url: '/profileImageUpload',
      type: 'POST',
      data: data,
      contentType: false,
      processData: false,
      dataType: "json",
      success: function(result) {
        if(result.status == 1) {
          window.location.href = '/profile';
          return;
        } 
        alert(result.error_message);
      }
    });

  });

  $('#calendar').fullCalendar({
    header: {
      left: 'prev',
      right: 'next',
      center: 'title',
    },
    defaultDate: new Date(),
    selectable: true,
    selectHelper: true,
    editable: true,
    eventLimit: true,
    events: []
  });

});