const Caver = require('caver-js')
const cnv3 = require('./CnStakingV3MultiSig.json')
const pdfactory = require('./PublicDelegationFactory.json')
const pd = require('./PublicDelegation.json')
const stakingtracker = require('./StakingTracker.json')
const addressBook = require('./AddressBook.json')
const kir = require('./KirContract.json')
const poc = require('./PocContract.json')

const caver = new Caver("http://localhost:8551")
const privateKey1 = "0x6355336d831705b82e24f0b13f553d9f8ad2d90420478957e57b16b08e47d6e1"
const addr1 = "0x7b6a8527e0aa483c08fc305cf39a244e65bae545"
const privateKey2 = "0x396d712edc1547126990664659275fbdab4828d049d04409f346c7581331c4ea"
const addr2 = "0xa951bd1a6c81fcf38966e036c876752ab97a35e5"
const privateKey3 = "0x1e8c4101c972e66513fc73b18636e3bcd1fdefe488f2fce606b089d260c73366"
const addr3 = "0x93b753a3be04b1353b78c0ac221061fcbd48fae0"
const privateKey4 = "0x30c34401e33c1b1ab0fe3d619b44ce245dbe62824ab0669752ed29deb2905f4e"
const addr4 = "0x73843d1ed1c9f7ea74cfab3ffe9b4ca2bfbdd815"
const privateKey5 = "0x09b64fc25b8d7833d4d9236c95399d1ad50085fd32da92c9f0e4cb1584ea7233"
const addr5 = "0x264e567ae5b9678ce068c8bdd09a599713a678ce"
const privateKey6 = "0xc90431a4f939387006a8c6f43bec95d77022ae342d695864deefd80a30476c0a"
const addr6 = "0x6b44ad54e5dbd62d5a6d3ed62ce954a2ba23f2a6"
const privateKey7 = "0xd7deb7e2537939bb8c8bf2c0d181501228bf9db5c48439dcb49e7e59053a848f"

var u1 = caver.klay.accounts.wallet.add(privateKey1)
var u2 = caver.klay.accounts.wallet.add(privateKey2)
var u3 = caver.klay.accounts.wallet.add(privateKey3)
var u4 = caver.klay.accounts.wallet.add(privateKey4)
var u5 = caver.klay.accounts.wallet.add(privateKey5)
var u6 = caver.klay.accounts.wallet.add(privateKey6)
var staker = caver.klay.accounts.wallet.add(privateKey7)

const requestStates = {0:"Unknown", 1:"NotConfirmed", 2:"Executed", 3:"ExecutionFailed", 4:"Canceled", "Unknown":0, "NotConfirmed":1, "Executed":2, "ExecutionFailed":3, "Canceled":4};
const functionIds = {0:"Unknown", 1:"AddAdmin", 2:"DeleteAdmin", 3:"UpdateRequirement", 4:"ClearRequest", 5:"WithdrawLockupStaking", 6:"ApproveStakingWithdrawal", 7:"CancelApprovedStakingWithdrawal", 8:"UpdateRewardAddress",
"Unknown":0, "AddAdmin":1, "DeleteAdmin":2, "UpdateRequirement":3, "ClearRequest":4, "WithdrawLockupStaking":5, "ApproveStakingWithdrawal":6, "CancelApprovedStakingWithdrawal":7, "UpdateRewardAddress":8};
const WithdrawalStakingStates = { 0:"Unknown", 1:"Transferred", 2:"Canceled", "Unknown":0, "Transferred":1, "Canceled":2};

var cnv3_addr = "0x8A58B3e7FD2F1910861F3ee597d85757Da027ded";
var pd_factory_addr  = "0x57c300bDAABa514378858761c8d34c2e91383a8C";
var stakingtracker_addr = "0x21aA1F333304d2E509AeD477352193f2Fe589955";
var kir_addr = "0xd9888e1CF46f04FFEcb6F2354dAe43b6A145144F";
var poc_addr = "0x26f44f193658D2AB41866F568F74e45e6bBCF71a";
var addressBookAddr = '0000000000000000000000000000000000000400'
var gcid = 1;

async function fillKlay() {
  // fill up klay first
  console.log("filling up KLAY to accounts...")
  var tx = {
    from: u1.address,
    to: u3.address,
    value: caver.utils.toPeb(100, "KLAY"),
    gas: '0x3b9ac9ff',
  };
  console.log(await caver.klay.sendTransaction(tx));
  var tx = {
    from: u1.address,
    to: u4.address,
    value: caver.utils.toPeb(100, "KLAY"),
    gas: '0x3b9ac9ff',
  };
  console.log(await caver.klay.sendTransaction(tx));
  var tx = {
    from: u1.address,
    to: u5.address,
    value: caver.utils.toPeb(100, "KLAY"),
    gas: '0x3b9ac9ff',
  };
  console.log(await caver.klay.sendTransaction(tx));

  var tx = {
    from: u1.address,
    to: staker.address,
    value: caver.utils.toPeb(10000, "KLAY"),
    gas: '0x3b9ac9ff',
  };
  console.log(await caver.klay.sendTransaction(tx));

  console.log("Checking balances...")
  console.log(await caver.klay.getBalance(u1.address));
  console.log(await caver.klay.getBalance(u2.address));
  console.log(await caver.klay.getBalance(u3.address));
  console.log(await caver.klay.getBalance(u4.address));
  console.log(await caver.klay.getBalance(u5.address));
  console.log(await caver.klay.getBalance(staker.address));

}

async function deploy_v3() {
  var c = new caver.klay.Contract(cnv3.abi)

  var unlocktime = Math.round(new Date().getTime()/1000+1000);

  console.log("Deploying cnv3 contract...")
  var p = c.deploy({
    data: cnv3.bytecode,
    arguments: [u1.address, u2.address, "0x0000000000000000000000000000000000000000", [addr2, addr3, addr4, addr5], 2, [], []]
  })
  .send({ from: u1.address, gas: 40000000, value: 0 })

  var r = await p;
  cnv3_addr = r._address;
  console.log("cnv3 contract addr = " +cnv3_addr);
}

async function deployKIRContract() {
  var c = new caver.klay.Contract(kir.abi)

  console.log("Deploying KIR contract...")
  var p = c.deploy({
    data: kir.bytecode,
    arguments:[[u1.address], 1]
  }).send({from: u1.address, gas:40000000, value:0})
  var r = await p;
  kir_addr = r._address;
  console.log("kir contract addr = " +kir_addr);
}

async function deployPOCContract() {
  var c = new caver.klay.Contract(poc.abi)

  console.log("Deploying PoC contract...")
  var p = c.deploy({
    data: poc.bytecode,
    arguments:[[u1.address], 1]
  }).send({from: u1.address, gas:40000000, value:0})
  var r = await p;
  poc_addr = r._address;
  console.log("poc contract addr = " +poc_addr);
}

async function deploy_pdfactory() {
  var c = new caver.klay.Contract(pdfactory.abi)

  var unlocktime = Math.round(new Date().getTime()/1000+1000);

  console.log("Deploying pd factory contract...")
  var p = c.deploy({
    data: pdfactory.bytecode,
  })
  .send({ from: u1.address, gas: 40000000, value: 0 })

  var r = await p;
  pd_factory_addr = r._address;
  console.log("pdfactory contract addr = " +pd_factory_addr);
}

async function deploy_stakingtracker() {
  var c = new caver.klay.Contract(stakingtracker.abi)

  var unlocktime = Math.round(new Date().getTime()/1000+1000);

  console.log("Deploying StakingTracker contract...")
  var p = c.deploy({
    data: stakingtracker.bytecode,
  })
  .send({ from: u1.address, gas: 40000000, value: 0 })

  var r = await p;
  stakingtracker_addr = r._address;
  console.log("stakking tracker contract addr = " +stakingtracker_addr);
}


async function init_v3() {
  var c = new caver.klay.Contract(cnv3.abi, cnv3_addr);

  console.log('calling setStakingTracker...');
  console.log(await c.methods.setStakingTracker(stakingtracker_addr).send({from:u1.address, gas:4000000, value:0}))

  console.log('calling setGCId...');
  console.log(await c.methods.setGCId(gcid).send({from:u1.address, gas:4000000, value:0}))

  console.log('calling setPublicDelegation...');
  var pdargs = caver.abi.encodeParameters(["tuple(address, address,  uint256, string)"],
   [[u1.address, u1.address, 1000, 'GC1']])

  console.log(await c.methods.setPublicDelegation(pd_factory_addr,pdargs).send({from:u1.address, gas:4000000, value:0}))
}

async function reviewInitialConditions() {
  var c = new caver.klay.Contract(cnv3.abi, cnv3_addr);

  console.log("Reviewing the condition and approving the contract...")

  console.log(await c.methods.reviewInitialConditions().send({from:u1.address, gas:4000000, value:0}));
  console.log(await c.methods.reviewInitialConditions().send({from:u2.address, gas:4000000, value:0}));
  console.log(await c.methods.reviewInitialConditions().send({from:u3.address, gas:4000000, value:0}));
  console.log(await c.methods.reviewInitialConditions().send({from:u4.address, gas:4000000, value:0}));
  console.log(await c.methods.reviewInitialConditions().send({from:u5.address, gas:4000000, value:0}));
}

async function init() {
  var c = new caver.klay.Contract(cnv3.abi, cnv3_addr);

  console.log("Initializing the contract...")
  console.log(await c.methods.depositLockupStakingAndInit().send({from:u1.address, gas:4000000, value:0}));
}

async function stake5MKLAY() {
  var c = new caver.klay.Contract(cnv3.abi, cnv3_addr);

  var pdaddr = await c.methods.publicDelegation().call({from:u1.address, gas:400000, value:0})
  console.log('PublicDelegation addr = ', pdaddr)
  var pdc = new caver.klay.Contract(pd.abi, pdaddr)

  console.log("Staking initial 5M KLAY...")
  console.log(await pdc.methods.stake().send({from:u1.address, gas:4000000, value:caver.utils.toPeb(500_0000, "KLAY")}));
}

async function getPdAddr() {
  var c = new caver.klay.Contract(cnv3.abi, cnv3_addr);

  return await c.methods.publicDelegation().call({from:u1.address, gas:400000, value:0})
}

async function stakeKlay() {
  var c = new caver.klay.Contract(cnv3.abi, cnv3_addr);

  var pdaddr = await c.methods.publicDelegation().call({from:u1.address, gas:400000, value:0})
  console.log('PublicDelegation addr = ', pdaddr)
  var pdc = new caver.klay.Contract(pd.abi, pdaddr)

  console.log("Staking 100 KLAY...")
  console.log(await pdc.methods.stake().send({from:staker.address, gas:4000000, value:caver.utils.toPeb(100, "KLAY")}));
}

async function constructAddressBook() {
  var pdaddr = await getPdAddr();
  var c = new caver.klay.Contract(addressBook.abi, addressBookAddr);

  console.log("Calling Addressbook.constructContract()..");
  console.log(await c.methods.constructContract([u1.address],1).send({from:u1.address, gas:4000000}))

  console.log("Calling Addressbook.submitUpdatePocContract()..");
  console.log(await c.methods.submitUpdatePocContract(poc_addr, 1).send({from:u1.address, gas:4000000}))

  console.log("Calling Addressbook.submitUpdateKirContract()..");
  console.log(await c.methods.submitUpdateKirContract(kir_addr, 1).send({from:u1.address, gas:4000000}))

  console.log("Calling Addressbook.submitRegisterCnStakingContract()..");
  console.log(await c.methods.submitRegisterCnStakingContract(u2.address, cnv3_addr, pdaddr).send({from:u1.address, gas:4000000}))

  console.log("Calling Addressbook.submitActivateAddressBook()..");
  console.log(await c.methods.submitActivateAddressBook().send({from:u1.address, gas:4000000}))

  console.log("Calling Addressbook.getAllAddress()..");
  console.log(await c.methods.getAllAddress().call({from:u1.address, gas:4000000}))
}

async function checkBalance() {
  var pdaddr = await getPdAddr();
  var pdc = new caver.klay.Contract(pd.abi, pdaddr)

  console.log("Checking the balance of the staker...")
  console.log(await pdc.methods.balanceOf(staker.address).call({from:staker.address, gas:4000000, value:0}));
}

async function checkMaxRedeem() {
  var pdaddr = await getPdAddr();
  var pdc = new caver.klay.Contract(pd.abi, pdaddr)

  console.log("Checking the maximum redeemable shares...")
  console.log(await pdc.methods.maxRedeem(staker.address).call({from:staker.address, gas:4000000, value:0}));
}

async function checkMaxWithdraw() {
  var pdaddr = await getPdAddr();
  var pdc = new caver.klay.Contract(pd.abi, pdaddr)

  console.log("Checking the maximum withdrawable KAIA...")
  console.log(await pdc.methods.maxWithdraw(staker.address).call({from:staker.address, gas:4000000, value:0}));
}

async function transferToken() {
  var pdaddr = await getPdAddr();
  var pdc = new caver.klay.Contract(pd.abi, pdaddr)

  console.log("Checking the balance of the staker...")
  var balance = await pdc.methods.balanceOf(staker.address).call({from:staker.address, gas:4000000, value:0});
  console.log(`balance = ${balance}`)

  var bnHalfBalance = caver.utils.BigNumber(balance).idiv(2);

  console.log(`sending half balance ${bnHalfBalance.toString()} to ${u6.address}`)
  await pdc.methods.transfer(u6.address, bnHalfBalance.toString()).send({from:staker.address, gas:4000000, value:0})

  console.log(`checking staker's balance`)
  console.log(await pdc.methods.balanceOf(staker.address).call({from:staker.address, gas:4000000, value:0}));
  console.log(`checking u6's balance`)
  console.log(await pdc.methods.balanceOf(u6.address).call({from:staker.address, gas:4000000, value:0}));
}

async function sweep() {
  var c = new caver.klay.Contract(cnv3.abi, cnv3_addr);

  var pdaddr = await c.methods.publicDelegation().call({from:u1.address, gas:400000, value:0})
  console.log('PublicDelegation addr = ', pdaddr)
  var pdc = new caver.klay.Contract(pd.abi, pdaddr)

  console.log(`manual sweep...`);
  console.log(await pdc.methods.sweep().send({from:u1.address, gas:4000000, value:0}));
}

async function withdrawHalf() {
  var pdaddr = await getPdAddr();
  var pdc = new caver.klay.Contract(pd.abi, pdaddr)

  console.log("Checking the maximum withdrawable KAIA...")
  var withdrawable = await pdc.methods.maxWithdraw(staker.address).call({from:staker.address, gas:4000000, value:0});

  var bnWithdrawable = caver.utils.BigNumber(withdrawable).idiv(2)

  console.log(`withdraw half ${bnWithdrawable.toString()}...`);
  console.log(await pdc.methods.withdraw(staker.address, bnWithdrawable.toString()).send({from:staker.address, gas:4000000, value:0}));
}

async function withdrawAll() {
  var pdaddr = await getPdAddr();
  var pdc = new caver.klay.Contract(pd.abi, pdaddr)

  console.log("Checking the maximum redeemable shares...")
  var redeemable = await pdc.methods.maxRedeem(staker.address).call({from:staker.address, gas:4000000, value:0});

  var bnRedeemable = caver.utils.BigNumber(redeemable)

  console.log(`withdraw ${bnRedeemable.toString()}...`);
  console.log(await pdc.methods.redeem(staker.address, bnRedeemable.toString()).send({from:staker.address, gas:4000000, value:0}));
}

async function checkTotalAssets() {
  var c = new caver.klay.Contract(cnv3.abi, cnv3_addr);

  var pdaddr = await c.methods.publicDelegation().call({from:u1.address, gas:400000, value:0})
  console.log('PublicDelegation addr = ', pdaddr)
  var pdc = new caver.klay.Contract(pd.abi, pdaddr)

  console.log("Checking the totalAssets...")
  console.log(await pdc.methods.totalAssets().call({from:staker.address, gas:4000000, value:0}));
}

async function getAddressBookState() {
  var c = new caver.klay.Contract(addressBook.abi, addressBookAddr);;

  console.log(await c.methods.getState().call({from:staker.address, gas:4000000, value:0}));
}

async function getAddressBookAddressInfo() {
  var c = new caver.klay.Contract(addressBook.abi, addressBookAddr);;

  console.log(await c.methods.getAllAddressInfo().call({from:staker.address, gas:4000000, value:0}));
}

async function setupCnV3() {
  // Deploy CN V3 staking contract.
  await deploy_v3();

  // Deploy PublicDelegationFactory contract.
  await deploy_pdfactory();

  // Deploy StakingTracker contract
  await deploy_stakingtracker();

  // initialize cn v3 contract.
  await init_v3();

  // initialize CN staking contract.
  await reviewInitialConditions();
  await init();

  // stake initial 5M KLAYs.
  await stake5MKLAY();
}

async function setupAddressBook() {
  // deploy KIR contract
  await deployKIRContract();

  // deploy POC contract
  await deployPOCContract();

  // setup address book.
  await constructAddressBook();
}

async function checkStakeBalance() {
  // check total assets
  await checkTotalAssets();

  // check maximum redeemable share
  await checkMaxRedeem();

  // check max withdrawable KAIA
  await checkMaxWithdraw();
}

async function fullExec() {
  // filling KLAY before execution.
  // await fillKlay();

  // //---- setting up CN v3 contract
  // await setupCnV3();

  // // --- setting up address book
  // await setupAddressBook();

  // // staking 100 KLAYs as staker account.
  // await stakeKlay();

  // // checkStakeBalance()
  // await checkStakeBalance()

  // // withdraw half.
  // await withdrawHalf();

  // // checkStakeBalance()
  // await checkStakeBalance();

  // // send LST to someone else
  // await transferToken();

  // // checkStakeBalance()
  // await checkStakeBalance();

  // withdraw all using redeem
  await withdrawAll();

  // checkStakeBalance()
  await checkStakeBalance()
}

fullExec();