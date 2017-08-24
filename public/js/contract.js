var contract = {};

$(document).ready(function() {
  contract.init();

});

contract.url = "http://61.75.63.149:8545";
contract.ownerAddress = "0x072fc66f7505db74e9dc242afd2df8a861271d4a";
contract.address = "0x6f5de9cba88c3d898340475af7eac99a4da3a65b";

contract.init = function() {
  var web3 = new Web3();
  var provider = new web3.providers.HttpProvider(this.url);
  web3.setProvider(provider);

  var abi = [{"constant":false,"inputs":[{"name":"_campaignId","type":"uint256"}],"name":"revenuecontributecheck","outputs":[{"name":"reached_","type":"bool"},{"name":"revenue_","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_campaignId","type":"uint256"}],"name":"revenuecontribute","outputs":[],"payable":true,"type":"function"},{"constant":false,"inputs":[{"name":"_campaignId","type":"uint256"}],"name":"checkGoalReached","outputs":[{"name":"reached_","type":"bool"},{"name":"goal_","type":"uint256"},{"name":"amount_","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_campaignId","type":"uint256"}],"name":"distribution","outputs":[{"name":"reached_","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_campaignId","type":"uint256"}],"name":"contribute","outputs":[],"payable":true,"type":"function"},{"constant":false,"inputs":[{"name":"_campaignId","type":"uint256"},{"name":"funder","type":"address"}],"name":"checkfunders","outputs":[{"name":"reached_","type":"bool"},{"name":"amount_","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_beneficiary","type":"address"},{"name":"_goal","type":"uint256"},{"name":"_compaignId","type":"uint256"}],"name":"newCampaign","outputs":[{"name":"m","type":"uint256"}],"payable":false,"type":"function"}];

  this.crowd = web3.eth.contract(abi).at(this.address);
  this.web3 = web3;
};

contract.createCampaign = function(campaignId, price, owner, callback) {
  var web3 = this.web3;
  var priceWei = web3.toWei(price, 'ether'); //goal-price

  var result = contract.crowd.newCampaign.call(owner, priceWei, campaignId, {
    from: owner
  });

  var password = prompt("Please enter your password:");

  web3.personal.unlockAccount(contract.ownerAddress, password, function(error) {

    if(!error) {
      var txId = contract.crowd.newCampaign.sendTransaction(owner, priceWei, campaignId, {
        from: contract.ownerAddress,
        gas: 500000 // toWei
      }, function(error) {
        if(!error) {
          callback(campaignId);
        }
        web3.personal.lockAccount(contract.ownerAddress);
      });
    }  
  });
};

contract.investment = function(campaignId, amount, buyer) {
  var web3 = this.web3;
  var password = prompt("Please enter your password:");
  amount = web3.toWei(amount, 'ether'); //goal-price

  console.log('start....');
  console.log('campaignId: ' + campaignId);
  console.log('amount: ' + amount);
  console.log('buyer: ' + buyer);

  web3.personal.unlockAccount(buyer, password, function(error) {
    if(!error) {
      var txHash = contract.crowd.contribute(campaignId, {
        from: buyer,
        gas: 500000,
        value: amount
      }, function(error) {
        if(!error) {
          alert('완료!');  
          window.location.href = "/building";
        }
        web3.personal.lockAccount(contract.ownerAddress);
      });
    }
  });
};