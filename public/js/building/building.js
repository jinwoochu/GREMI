var url = "http://192.168.40.173:8545"
var web3 = new Web3();
var provider = new web3.providers.HttpProvider(url);
web3.setProvider(provider);
var code = "0x6060604052341561000f57600080fd5b5b6104008061001f6000396000f30060606040526000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680635b2329d414610054578063c1cbbca71461009d578063f7572cf3146100b5575b600080fd5b341561005f57600080fd5b610075600480803590602001909190505061010b565b6040518084151515158152602001838152602001828152602001935050505060405180910390f35b6100b36004808035906020019091905050610230565b005b34156100c057600080fd5b6100f5600480803573ffffffffffffffffffffffffffffffffffffffff16906020019091908035906020019091905050610304565b6040518082815260200191505060405180910390f35b600080600080600160008681526020019081526020016000209050806001015492508060030154915080600101548160030154101561014d5760009350610228565b8060000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166108fc82600301549081150290604051600060405180830381858888f193505050501515610219578060000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166108fc82600301549081150290604051600060405180830381858888f19350505050151561021857600080fd5b5b60019350600081600301819055505b509193909250565b600060016000838152602001908152602001600020905060408051908101604052803373ffffffffffffffffffffffffffffffffffffffff1681526020013481525081600401600083600201600081548092919060010191905055815260200190815260200160002060008201518160000160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550602082015181600101559050503481600301600082825401925050819055505b5050565b60008060008154809291906001019190505590506080604051908101604052808473ffffffffffffffffffffffffffffffffffffffff1681526020018381526020016000815260200160008152506001600083815260200190815260200160002060008201518160000160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506020820151816001015560408201518160020155606082015181600301559050505b929150505600a165627a7a72305820d0d6c99e52db24e9ba14cfa3745ea26d7204ccb6f149362f1b8c64d270b8b43f0029";
var abi = [{ "constant": false, "inputs": [{ "name": "_campaignId", "type": "uint256" }], "name": "checkGoalReached", "outputs": [{ "name": "reached_", "type": "bool" }, { "name": "goal_", "type": "uint256" }, { "name": "amount_", "type": "uint256" }], "payable": false, "type": "function" }, { "constant": false, "inputs": [{ "name": "_campaignId", "type": "uint256" }], "name": "contribute", "outputs": [], "payable": true, "type": "function" }, { "constant": false, "inputs": [{ "name": "_beneficiary", "type": "address" }, { "name": "_goal", "type": "uint256" }], "name": "newCampaign", "outputs": [{ "name": "campaignId_", "type": "uint256" }], "payable": false, "type": "function" }];
var Contract = web3.eth.contract(abi);
var crowd = null;
var user_name = "0x538a2c42fb907c2b7679811f493e512c555cd235";
web3.personal.unlockAccount(user_name, "1");


$(document).ready(function() {
    $('#building_register_form').on('submit', function(event) {

        formData = $(this).serialize();

        crowd = Contract.new({
            data: code,
            gas: 1000000,
            from: user_name
        }, function(error, contract) {
            if (!error) {
                if (!contract.address) {
                    console.log("Creating Contract : " + contract.transactionHash);
                } else {
                    address = contract.address;
                    formData += "&contract_address=" + address;
                    console.log("Contract Deployed : " + contract.address);
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
                }
            } else {}
        });





        event.preventDefault();
    });

    $('#building_menu').on('click', 'a', function(event) {
        event.preventDefault();
        $('#building_menu li').toggleClass('active');
        $('.building-content').toggleClass('hidden');
    });
});