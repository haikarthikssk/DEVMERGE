import "../styles/app.css";
import { default as Web3 } from 'web3';
import { default as contract } from 'truffle-contract'


import contract_build_artifacts from '../../build/contracts/OraclizeTest.json'

var OraclizeContract = contract(contract_build_artifacts);

var accounts;
var account;
var eventListened = false;

window.App = {

  // 'Constructor'
  start: function () {
    var self = this;

    OraclizeContract.setProvider(web3.currentProvider);

    web3.eth.getAccounts(function (err, accs) {

      if (err != null) {
        alert("error fetching accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts");
        return;
      }

      accounts = accs;
      account = accounts[0];
    });

  },

  addEventListeners: function (instance) {
    if (eventListened) {
      return;
    }
    var VerificationResult = instance.VerificationResult({}, { fromBlock: 0, toBlock: 'latest' });
    VerificationResult.watch(function (err, result) {
      console.log(err);
      console.log(result);
      result['args']['block_no'] = result.blockNumber;
      notify(result['args']);
      controller.showAlert(result['args']['res_type'], "success");
    })
    eventListened = true;
  },

  verify: function (hostname, publicKey) {
    var self = this;

    var meta;

    OraclizeContract.deployed().then(function (instance) {
      meta = instance;
      App.addEventListeners(instance);

      return meta.verifyhost.sendTransaction(hostname, publicKey, { from: accounts[0], gas: 1000000, value: web3.toWei(5, "ether") });

    }).then(function (value) {
      console.log(value);
    }).catch(function (e) {
      console.log(e);
    });
  },

  isVerified: function (hostname) {
    var self = this;

    var meta;
    OraclizeContract.deployed().then(function (instance) {
      meta = instance;
      App.addEventListeners(instance);
      return meta.isVerified.sendTransaction(hostname, { from: accounts[0], gas: 1000000, value: web3.toWei(0.01, "ether") });
    }).then(function (value) {
      console.log(value);
    }).catch(function (e) {
      console.log(e);
    });
  },
  revoke: function (hostname) {
    var self = this;

    var meta;
    OraclizeContract.deployed().then(function (instance) {
      meta = instance;
      App.addEventListeners(instance);
      return meta.revoke.sendTransaction(hostname, { from: accounts[0], gas: 1000000, value: web3.toWei(0.01, "ether") });
    }).then(function (value) {
      console.log(value);
    }).catch(function (e) {
      console.log(e);
    });
  }
};

// Front-end entry point
window.addEventListener('load', function () {
  if (typeof web3 !== 'undefined') {
    console.warn("no web3")
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected");
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9545"));
  }

  //Entry
  App.start();
});

var controller = {

  fetchInputs: function () {
    var hostname = document.getElementById("hostname").value;
    var publickey = document.getElementById("publickey").value;

    if (!hostname || !publickey) {
      this.showAlert("No Input!..", "error");
      throw "No Input";
    }

    return {
      hostname,
      publickey
    }
  },

  callVerify: function () {
    var inputs = this.fetchInputs();
    App.verify(inputs.hostname, inputs.publickey);
    console.log(inputs);
  },

  isVerified: function () {
    var inputs = this.fetchInputs();
    App.isVerified(inputs.hostname);

  },

  revoke: function () {
    var inputs = this.fetchInputs();
    App.revoke(inputs.hostname);
  },
  
  showAlert: function (msg, typ) {
    console.log(msg, "///")
    Messenger.options = {
      extraClasses: 'messenger-fixed messenger-on-bottom messenger-on-right',
      theme: 'air'
    }
    Messenger().post({
      type: typ,
      showCloseButton: true,
      message: msg
    });
  }
}
window.controller = controller;