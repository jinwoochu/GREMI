
var cron = require('cron');
var mysql = require('mysql');
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "mysql!!",
  database: "gremi"
});

var contract = {};

exports.init = function() {
  console.log('init');
  var Web3 = require('web3');
  var web3 = new Web3();

  contract.contractAddress = "0x995c7f8a9b6da44d27708ab62aa6582caffb17a9";
  contract.owner = {
    'address': "0x072fc66f7505db74e9dc242afd2df8a861271d4a",
    'password': '1'
  };

  web3 = new Web3(new Web3.providers.HttpProvider("http://61.75.63.149:8545"));

  var abi = [{"constant":false,"inputs":[{"name":"_campaignId","type":"uint256"}],"name":"goalchangecheck","outputs":[{"name":"cgoal","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_campaignId","type":"uint256"}],"name":"revenuecontribute","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"_campaignId","type":"uint256"},{"name":"seller","type":"address"},{"name":"buyer","type":"address"}],"name":"sellfunder","outputs":[{"name":"reached_","type":"bool"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"_campaignId","type":"uint256"},{"name":"goal_","type":"uint256"}],"name":"goalchange","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"_campaignId","type":"uint256"}],"name":"checkGoalReached","outputs":[{"name":"reached_","type":"bool"},{"name":"goal_","type":"uint256"},{"name":"funders_","type":"uint256"},{"name":"amount_","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_campaignId","type":"uint256"}],"name":"distribution","outputs":[{"name":"reached_","type":"bool"},{"name":"revenue_","type":"uint256"},{"name":"revenue_result","type":"uint256"},{"name":"totalrevenue","type":"uint256"},{"name":"goal","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_campaignId","type":"uint256"}],"name":"contribute","outputs":[{"name":"reached_","type":"bool"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"_campaignId","type":"uint256"},{"name":"funder","type":"address"}],"name":"checkfunders","outputs":[{"name":"reached_","type":"bool"},{"name":"fund_","type":"address"},{"name":"amount_","type":"uint256"},{"name":"num","type":"uint256"},{"name":"revenue_","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_beneficiary","type":"address"},{"name":"_goal","type":"uint256"},{"name":"_compaignId","type":"uint256"}],"name":"newCampaign","outputs":[{"name":"m","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_campaignId","type":"uint256"},{"name":"funder","type":"address"}],"name":"returncontribute","outputs":[],"payable":true,"stateMutability":"payable","type":"function"}];

  contract.crowd = web3.eth.contract(abi).at(contract.contractAddress);
  contract.web3 = web3;
};

exports.runDistribution = function() {
  this.distributionJob = new cron.CronJob({
    cronTime: '10 * * * * *',
    onTick: function() {
      var searchQuery = "SELECT b_id FROM buildings WHERE status=2";

      con.query(searchQuery, function(err, result, field) {
        if (err) {
          return;
        }

        for(var i = 0 ; i < result.length ; i++) {
          var campaignId = result[i].b_id;

          contract.web3.personal.unlockAccount(contract.owner.address, contract.owner.password);

          contract.crowd.distribution.sendTransaction(campaignId,{
            from: contract.owner.address,
            gas: 500000
          }, function(err, txId) {
            console.log("checkTx TX Hash : " , txId);  
            contract.web3.personal.lockAccount(contract.owner.address);
          });
        }
      });
    },
    start: true,
    timeZone: 'Asia/Seoul'
  });

  this.distributionJob.start();
}

exports.depositCoin = function(req, callback) {

  contract.web3.personal.unlockAccount(contract.owner.address, contract.owner.password);
  contract.web3.eth.sendTransaction({from: contract.owner.address, to: req.walletAddress, value: contract.web3.toWei(req.value, "ether")}, function(error, txId) {
    if(error) {
      return;
    } 
    callback(txId);
    contract.web3.personal.lockAccount(contract.owner.address);
  });
};

exports.getBalance = function(address, callback) {
  contract.web3.eth.getBalance(address, function(error, balance) {
    callback(error, balance.valueOf() / 1000000000000000000);
  });
};

exports.widthrawCoin = function(req, callback) {
  console.log(req);
  contract.web3.personal.unlockAccount(req.walletAddress, req.password, function(error) {
    if(error){
      callback(error, txId);
      return;
    }
    contract.web3.eth.sendTransaction({from: req.walletAddress, to: contract.owner.address, value: contract.web3.toWei(req.value, "ether")}, function(error, txId) {
      callback(error, txId);
      contract.web3.personal.lockAccount(req.walletAddress);
    });  
  });
  
};

exports.revenueContribute = function(req, callback) {
  console.log(req);
  contract.web3.personal.unlockAccount(req.walletAddress, req.password);
  contract.crowd.revenuecontribute.sendTransaction(req.campaignId, {
    from: req.walletAddress,
    gas: 500000,
    value: contract.web3.toWei(req.value, "ether")
  }, function(error, txId) {
    if(error) {
      return;
    } 
    callback(txId);
    contract.web3.personal.lockAccount(req.walletAddress);
  });
};

exports.checkGoalReached = function(req, callback) {
  contract.web3.personal.unlockAccount(contract.owner.address, contract.owner.password);
  contract.crowd.checkGoalReached.sendTransaction(req.campaignId, {
    from: contract.owner.address,
    gas:500000
  }, function(error, txId) {
    callback(error, txId);
    contract.web3.personal.lockAccount(contract.owner.address);
  });
}

exports.stopDistribution = function() {
  this.distributionJob.stop();
}