var cron = require('cron');

var distribution_job = new cron.CronJob({
  cronTime: '10 * * * * *',
  onTick: function() {
    var date = new Date();
    var current_hour = date.getSeconds(); 
    console.log(current_hour);
    var Web3 = require('web3');
    var web3 = new Web3();

    var contractAddress = "0xe40b2734311cbc2e62dbc4f8f039f42de076651d";
    var ownerAddress = "0x072fc66f7505db74e9dc242afd2df8a861271d4a";
    web3 = new Web3(new Web3.providers.HttpProvider("http://61.75.63.149:8545"));

    var abi = [{"constant":false,"inputs":[{"name":"_campaignId","type":"uint256"}],"name":"revenuecontributecheck","outputs":[{"name":"reached_","type":"bool"},{"name":"revenue_","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_campaignId","type":"uint256"}],"name":"revenuecontribute","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"_campaignId","type":"uint256"},{"name":"seller","type":"address"},{"name":"buyer","type":"address"}],"name":"sellfunder","outputs":[{"name":"reached_","type":"bool"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"_campaignId","type":"uint256"}],"name":"checkGoalReached","outputs":[{"name":"reached_","type":"bool"},{"name":"goal_","type":"uint256"},{"name":"funders_","type":"uint256"},{"name":"amount_","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_campaignId","type":"uint256"}],"name":"distribution","outputs":[{"name":"revenue_","type":"uint256"},{"name":"revenue_result","type":"uint256"},{"name":"totalrevenue","type":"uint256"},{"name":"goal","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_campaignId","type":"uint256"}],"name":"contribute","outputs":[{"name":"reached_","type":"bool"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"_campaignId","type":"uint256"},{"name":"funder","type":"address"}],"name":"checkfunders","outputs":[{"name":"reached_","type":"bool"},{"name":"fund_","type":"address"},{"name":"amount_","type":"uint256"},{"name":"num","type":"uint256"},{"name":"funda_","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_beneficiary","type":"address"},{"name":"_goal","type":"uint256"},{"name":"_compaignId","type":"uint256"}],"name":"newCampaign","outputs":[{"name":"m","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_campaignId","type":"uint256"},{"name":"funder","type":"address"}],"name":"returncontribute","outputs":[],"payable":true,"stateMutability":"payable","type":"function"}];

    var crowd = web3.eth.contract(abi).at(contractAddress);
    var campaignID = "35"
    web3.personal.unlockAccount(ownerAddress,"1");

    var txHash = crowd.distribution.sendTransaction(campaignID,{
      from:ownerAddress,
      gas:500000
    });

    console.log("checkTx TX Hash : " , txHash);

    web3.personal.lockAccount(ownerAddress);
  },
  start: true,
  timeZone: 'Asia/Seoul'
});

distribution_job.start();

console.log(distribution_job.runing);