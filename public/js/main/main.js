// var url = "http://172.30.25.101:8545"
$(document).ready(function() {
  $('#login_form').on('submit', function(event) {
    var formData = $(this).serialize();
    $.ajax({
      url: $(this).attr('action'),
      type: "POST",
      data: formData,
      dataType: "json",
      success: function(result) {
        if (result.status == 0) {
          alert(result.error_message);
        } else {
          document.cookie = "email=" + result.key;
          window.location.href = "/building";
        }
      }
    });
    event.preventDefault();
  });

  $('#user_register_form').on('submit', function(event) {
    event.preventDefault();

    
    var url = "http://61.75.63.149:8545"
    var web3 = new Web3();
    var provider = new web3.providers.HttpProvider(url);
    var passwoard = $('#password').val(),
        passwoard_check = $('#password_check').val();

    debugger;

    if (passwoard != passwoard_check) {
      alert("비밀번호화 비밀번호확인을 확인하여주세요.");
      return;
    }

    web3.setProvider(provider);

    var address = web3.personal.newAccount(passwoard);
    $('#wallet_address').val(address);
  
    var formData = $(this).serialize();

    debugger;

    $.ajax({
      url: $(this).attr('action'),
      type: "POST",
      data: formData,
      dataType: "json",
      success: function(result) {
        if (result.status == 0) {
          alert(result.error_message);
        } else {
          document.cookie = "email=" + result.key;
          window.location.href = "/building";
        }
      }
    });
    
  });
});