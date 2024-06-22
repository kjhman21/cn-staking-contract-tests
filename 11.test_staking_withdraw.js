const Caver = require('caver-js')
const cnv2 = require('./CnStakingV2.json')
const cnv3 = require('./CnStakingV3MultiSig.json')
const addressBook = require('./AddressBook.json')
const pd = require('./PublicDelegation.json')

const caver = new Caver("http://localhost:8551")
const privateKey1 = "0x6355336d831705b82e24f0b13f553d9f8ad2d90420478957e57b16b08e47d6e1"
const addr1 = "0x7b6a8527e0aa483c08fc305cf39a244e65bae545"
const privateKey2 = "0x396d712edc1547126990664659275fbdab4828d049d04409f346c7581331c4ea"
const addr2 = "0xa951bd1a6c81fcf38966e036c876752ab97a35e5"
const privateKey3 = "0x1e8c4101c972e66513fc73b18636e3bcd1fdefe488f2fce606b089d260c73366"
const addr3 = "0x93b753a3be04b1353b78c0ac221061fcbd48fae0"
const privateKey7 = "0xd7deb7e2537939bb8c8bf2c0d181501228bf9db5c48439dcb49e7e59053a848f"
const addr7 = "0x09778c52f93e089d22e2e0e3f591b20a79a7bbfe"
const privateKey8 = "0x21372369b9d5011d99b1cf3aa0b83e3059d3fb32dec312dc846e877c1b3c591a"
const addr8 = "0xc3769bfad4b20ec271eae97385951cb4ef9317f3"

const requestStates = {0:"Unknown", 1:"NotConfirmed", 2:"Executed", 3:"ExecutionFailed", 4:"Canceled", "Unknown":0, "NotConfirmed":1, "Executed":2, "ExecutionFailed":3, "Canceled":4};
const functionIds = {0:"Unknown", 1:"AddAdmin", 2:"DeleteAdmin", 3:"UpdateRequirement", 4:"ClearRequest", 5:"WithdrawLockupStaking", 6:"ApproveStakingWithdrawal", 7:"CancelApprovedStakingWithdrawal", 8:"UpdateRewardAddress",
"Unknown":0, "AddAdmin":1, "DeleteAdmin":2, "UpdateRequirement":3, "ClearRequest":4, "WithdrawLockupStaking":5, "ApproveStakingWithdrawal":6, "CancelApprovedStakingWithdrawal":7, "UpdateRewardAddress":8};
const WithdrawalStakingStates = { 0:"Unknown", 1:"Transferred", 2:"Canceled", "Unknown":0, "Transferred":1, "Canceled":2};

var addressBookAddr = '0000000000000000000000000000000000000400'
var addrBookAdmin = addr1;
var cn1_fakeaddr = "0x7b6a8527e0aa483c08fc305cf39a244e65bae546"
var stakingtracker_addr="0xe29dA308B6e8229Ba0134c71490451ad6ACfcc7e";
var cn1 = {
    id:1,
    nodeid: caver.klay.accounts.wallet.add(privateKey1),
    reward: caver.klay.accounts.wallet.add(privateKey2),
    admin: caver.klay.accounts.wallet.add(privateKey3),
    new_admin: caver.klay.accounts.wallet.add(privateKey8),
    cnv2_addr:"0x89865cad05e81739Cf4cB744Ce8aaD2f52a29B28",
    cnv3_addr:"0xFc756C6D2F2e48711C57027F4532b79CECf78685",
    pd_addr:"0x26f44f193658D2AB41866F568F74e45e6bBCF71a"
}
var staker = caver.klay.accounts.wallet.add(privateKey7)
var unstakingAmount = caver.utils.toPeb(5_000_000, "KLAY")
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function stakeKlay() {
  var c = new caver.klay.Contract(cnv3.abi, cn1.cnv3_addr);
  var pdc = new caver.klay.Contract(pd.abi, cn1.pd_addr)

  console.log("Staking 100 KLAY...")
  console.log(await pdc.methods.stake().send({from:staker.address, gas:4000000, value:caver.utils.toPeb(100, "KLAY")}));
}

async function checkTotalAssets() {
  var c = new caver.klay.Contract(cnv3.abi, cn1.cnv3_addr);
  var pdc = new caver.klay.Contract(pd.abi, cn1.pd_addr)

  console.log("Checking the totalAssets...")
  console.log(await pdc.methods.totalAssets().call({from:staker.address, gas:4000000, value:0}));
}

async function checkMaxRedeem() {
  var pdc = new caver.klay.Contract(pd.abi, cn1.pd_addr)

  console.log("Checking the maximum redeemable shares...")
  console.log(await pdc.methods.maxRedeem(staker.address).call({from:staker.address, gas:4000000, value:0}));
}

async function checkMaxWithdraw() {
  var pdc = new caver.klay.Contract(pd.abi, cn1.pd_addr)

  console.log("Checking the maximum withdrawable KAIA...")
  console.log(await pdc.methods.maxWithdraw(staker.address).call({from:staker.address, gas:4000000, value:0}));
}

async function withdrawHalf() {
  var pdc = new caver.klay.Contract(pd.abi, cn1.pd_addr)

  console.log("Checking the maximum withdrawable KAIA...")
  var withdrawable = await pdc.methods.maxWithdraw(staker.address).call({from:staker.address, gas:4000000, value:0});

  var bnWithdrawable = caver.utils.BigNumber(withdrawable).idiv(2)

  console.log(`withdraw half ${bnWithdrawable.toString()}...`);
  console.log(await pdc.methods.withdraw(staker.address, bnWithdrawable.toString()).send({from:staker.address, gas:4000000, value:0}));
}

async function withdrawAll() {
  var pdc = new caver.klay.Contract(pd.abi, cn1.pd_addr)

  console.log("Checking the maximum redeemable shares...")
  var redeemable = await pdc.methods.maxRedeem(staker.address).call({from:staker.address, gas:4000000, value:0});

  var bnRedeemable = caver.utils.BigNumber(redeemable)

  console.log(`withdraw ${bnRedeemable.toString()}...`);
  console.log(await pdc.methods.redeem(staker.address, bnRedeemable.toString()).send({from:staker.address, gas:4000000, value:0}));
}

async function transferToken() {
  var pdc = new caver.klay.Contract(pd.abi, cn1.pd_addr)

  console.log("Checking the balance of the staker...")
  var balance = await pdc.methods.balanceOf(staker.address).call({from:staker.address, gas:4000000, value:0});
  console.log(`balance = ${balance}`)

  var bnHalfBalance = caver.utils.BigNumber(balance).idiv(2);

  console.log(`sending half balance ${bnHalfBalance.toString()} to ${cn1.new_admin.address}`)
  await pdc.methods.transfer(cn1.new_admin.address, bnHalfBalance.toString()).send({from:staker.address, gas:4000000, value:0})

  console.log(`checking staker's balance`)
  console.log(await pdc.methods.balanceOf(staker.address).call({from:staker.address, gas:4000000, value:0}));
  console.log(`checking cn1.new_admin's balance`)
  console.log(await pdc.methods.balanceOf(cn1.new_admin.address).call({from:staker.address, gas:4000000, value:0}));
}

async function checkBalance() {
  console.log("Checking the balance of the staker...")
  console.log(await caver.klay.getBalance(staker.address));
}

async function claim() {
  var pdc = new caver.klay.Contract(pd.abi, cn1.pd_addr)

  var requestIds = await pdc.methods.getUserRequestIdsWithState(staker.address, 2).call({from:staker.address, gas:4000000, value:0})

  // check staker's balance
  console.log('check balance before claim')
  await checkBalance();

  for(var i = 0;i < requestIds.length; i++) {
    console.log(await pdc.methods.claim(requestIds[i]).send({ from: staker.address, gas: 4000000, value: 0 }));
  }

  // check staker's balance
  console.log('check balance after claim')
  await checkBalance();
}
async function checkStakeBalance() {
  // check total assets
  await checkTotalAssets();

  // check maximum redeemable share
  await checkMaxRedeem();

  // check max withdrawable KAIA
  await checkMaxWithdraw();
}

async function testStakingWithdraw() {
  // staking 100 KLAYs as staker account.
  await stakeKlay();

  // checkStakeBalance()
  await checkStakeBalance()

  // withdraw half.
  await withdrawHalf();

  // wait 30 seconds to claim.
  await sleep(30 *1000);
  await claim();

  // checkStakeBalance()
  await checkStakeBalance();

  // send LST to someone else
  await transferToken();

  // checkStakeBalance()
  await checkStakeBalance();

  // withdraw all using redeem
  await withdrawAll();

  // checkStakeBalance()
  await checkStakeBalance()
}

testStakingWithdraw();