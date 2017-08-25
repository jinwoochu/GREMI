$(document).ready(function() {
  // var url = "http://61.75.63.149:8545"
  // var web3 = new Web3();
  // var provider = new web3.providers.HttpProvider(url);
  // web3.setProvider(provider);

  // var abi = [{"constant":false,"inputs":[{"name":"_campaignId","type":"uint256"}],"name":"revenuecontributecheck","outputs":[{"name":"reached_","type":"bool"},{"name":"revenue_","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_campaignId","type":"uint256"}],"name":"revenuecontribute","outputs":[],"payable":true,"type":"function"},{"constant":false,"inputs":[{"name":"_campaignId","type":"uint256"}],"name":"checkGoalReached","outputs":[{"name":"reached_","type":"bool"},{"name":"goal_","type":"uint256"},{"name":"amount_","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_campaignId","type":"uint256"}],"name":"distribution","outputs":[{"name":"reached_","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_campaignId","type":"uint256"}],"name":"contribute","outputs":[],"payable":true,"type":"function"},{"constant":false,"inputs":[{"name":"_campaignId","type":"uint256"},{"name":"funder","type":"address"}],"name":"checkfunders","outputs":[{"name":"reached_","type":"bool"},{"name":"amount_","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_beneficiary","type":"address"},{"name":"_goal","type":"uint256"},{"name":"_compaignId","type":"uint256"}],"name":"newCampaign","outputs":[{"name":"m","type":"uint256"}],"payable":false,"type":"function"}];

  // var Contract = web3.eth.contract(abi);
  // var broker = "0x072fc66f7505db74e9dc242afd2df8a861271d4a";
  // var paddword = '1';
  // var contractAddress = "0xddcf21647499a8f839a329d57160e75874ca3091";
  // var crowd = Contract.at(contractAddress);

  // $('.confirm-building').on('click', function(event) {
  //   event.preventDefault();

  //   var buildingId = $(this).data('building-id'); // user-wallet-address
  //   var price = $(this).data('price');
  //   var userWalletAddress = '0x072fc66f7505db74e9dc242afd2df8a861271d4a'; // user-wallet-address

  //   var goalAmountWei = web3.toWei(price, 'ether'); //goal-price

  //   // buildingId : 판매 빌딩
  //   // userWalletAddress : 돈받을사람
  //   // goalAmountWei : 목표금액
  //   var result = crowd.newCampaign.call(userWalletAddress, goalAmountWei, buildingId, {
  //     from: userWalletAddress
  //   });

  //   web3.personal.unlockAccount(broker, paddword);
  //   var txId = crowd.newCampaign.sendTransaction(userWalletAddress, goalAmountWei, buildingId, {
  //     from: userWalletAddress,
  //     gas: 500000 // toWei
  //   });
  //   web3.personal.lockAccount(broker);

  //   var data = new FormData();

  //   data.append('b_id', buildingId);
  //   data.append('tx_id', txId);

  //   $.ajax({
  //     url: '/admin/building/confirm',
  //     type: 'POST',
  //     data: data,
  //     contentType: false,
  //     processData: false,
  //     dataType: "json",
  //     success: function(result) {
  //       if (result.status == 0) {
  //         alert(result.error_message);
  //       } else {
  //         window.location.href = "/admin/building";
  //       }
  //     } 
  //   });
  // });

  $('.confirm-building').on('click', function(event) {
    event.preventDefault();

    var buildingId = $(this).data('building-id'); // user-wallet-address
    var price = $(this).data('price');
    var userWalletAddress = $(this).data('address'); // user-wallet-address
    
    contract.createCampaign(buildingId, price, userWalletAddress,updateBuildingStatus);
  });

  function updateBuildingStatus(txId, buildingId) {
    var data = new FormData();

    data.append('tx_id', txId);
    data.append('b_id', buildingId);

    $.ajax({
      url: '/admin/building/confirm',
      type: 'POST',
      data: data,
      contentType: false,
      processData: false,
      dataType: "json",
      success: function(result) {
        if (result.status == 0) {
          alert(result.error_message);
        } else {
          window.location.href = "/admin/building";
        }
      }  
    });
  }
});