// var url = "http://172.30.25.101:8545"
$(document).ready(function() {
    $('#login_form').on('submit', function(event) {
        event.preventDefault();
        var data = $(this).serialize();
        request_ajax('POST', $(this).attr('action'), data, main);
    });

    $('#user_register_form').on('submit', function(event) {
        event.preventDefault();

        var url = "http://202.30.30.121:8545"
        var web3 = new Web3();
        var provider = new web3.providers.HttpProvider(url);
        web3.setProvider(provider);

        var passwoard = $('#password').val(),
            passwoard_check = $('#password_check').val();

        if (passwoard != passwoard_check) {
            alert("비밀번호화 비밀번호확인을 확인하여주세요.");
            return;
        }



        var address = web3.personal.newAccount(passwoard);
        $('#wallet_address').val(address);

        var data = $(this).serialize();

        request_ajax('POST', $(this).attr('action'), data, main);

    });

    function main(result) {
        if (result.status == 0) {
            alert(result.error_message);
        } else {
            window.location.href = "/building";
        }
    }
});