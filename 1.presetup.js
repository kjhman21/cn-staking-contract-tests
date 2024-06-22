const Caver = require('caver-js')
const cnv2 = require('./CnStakingV2.json')
const cnv3 = require('./CnStakingV3.json')
const stakingtracker = require('./StakingTracker.json')
const kir = require('./KirContract.json')
const poc = require('./PocContract.json')
const addressBook = require('./AddressBook.json')
const pd = require('./PublicDelegation.json')

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

const sleep = ms => new Promise(r => setTimeout(r, ms));
var stakingAmount = caver.utils.toPeb(10, "KLAY")

var cn1 = {
    id:1,
    nodeid: caver.klay.accounts.wallet.add(privateKey1),
    reward: caver.klay.accounts.wallet.add(privateKey2),
    admin: caver.klay.accounts.wallet.add(privateKey3),
    cnv2_addr:"0x89865cad05e81739Cf4cB744Ce8aaD2f52a29B28",
}

var cn2 = {
    id:2,
    nodeid: caver.klay.accounts.wallet.add(privateKey4),
    reward: caver.klay.accounts.wallet.add(privateKey5),
    admin: caver.klay.accounts.wallet.add(privateKey6),
    cnv2_addr:"0xc1f641f2fa528aBde96294502f68a94B7e103C7e",
}

var stakingtracker_addr="0xe29dA308B6e8229Ba0134c71490451ad6ACfcc7e";
var kir_addr = "0x8A3a9F92D469C3ee5885079E59E666e765d0D75e"
var poc_addr = "0x53Ed0B2fbe7fc481854b77ECc3bb2f1F9Eadbdc0"
var addressBookAddr = '0000000000000000000000000000000000000400'

const requestStates = {0:"Unknown", 1:"NotConfirmed", 2:"Executed", 3:"ExecutionFailed", 4:"Canceled", "Unknown":0, "NotConfirmed":1, "Executed":2, "ExecutionFailed":3, "Canceled":4};
const functionIds = {0:"Unknown", 1:"AddAdmin", 2:"DeleteAdmin", 3:"UpdateRequirement", 4:"ClearRequest", 5:"WithdrawLockupStaking", 6:"ApproveStakingWithdrawal", 7:"CancelApprovedStakingWithdrawal", 8:"UpdateRewardAddress",
"Unknown":0, "AddAdmin":1, "DeleteAdmin":2, "UpdateRequirement":3, "ClearRequest":4, "WithdrawLockupStaking":5, "ApproveStakingWithdrawal":6, "CancelApprovedStakingWithdrawal":7, "UpdateRewardAddress":8};
const WithdrawalStakingStates = { 0:"Unknown", 1:"Transferred", 2:"Canceled", "Unknown":0, "Transferred":1, "Canceled":2};


async function deploy_v2(cn) {
  var c = new caver.klay.Contract(cnv2.abi)

  var unlocktime = Math.round(new Date().getTime()/1000+1000);

  console.log(`[${cn.id}] Deploying Cnv2 contract...`)
  var p = c.deploy({
    data: cnv2.bytecode,
    arguments: [cn.nodeid.address, cn.nodeid.address, cn.reward.address, [cn.admin.address], 1, [unlocktime], [stakingAmount]]
  })
  .send({ from: cn.admin.address, gas: 40000000, value: 0 })

  var r = await p;
  cn.cnv2_addr = r._address;
  console.log(`[${cn.id}] cnv2 contract addr = ${cn.cnv2_addr}`);
}

async function deploy_stakingtracker() {
  var c = new caver.klay.Contract(stakingtracker.abi)

  console.log(`Deploying StakingTracker contract...`)
  var p = c.deploy({
    data: stakingtracker.bytecode,
  })
  .send({ from: cn1.admin.address, gas: 40000000, value: 0 })

  var r = await p;
  stakingtracker_addr = r._address;
  console.log(`staking tracker contract addr = ${stakingtracker_addr}`);
}

async function init_v2(cn) {
  var c = new caver.klay.Contract(cnv2.abi, cn.cnv2_addr);

  console.log(`[${cn.id}] calling setStakingTracker...`);
  await c.methods.setStakingTracker(stakingtracker_addr).send({from:cn.admin.address, gas:4000000, value:0})

  console.log(`[${cn.id}] calling setGCId...`);
  await c.methods.setGCId(cn.id).send({from:cn.admin.address, gas:4000000, value:0})
}

async function reviewInitialConditionsv2(cn) {
  var c = new caver.klay.Contract(cnv2.abi, cn.cnv2_addr);

  console.log(`[${cn.id}] Reviewing the condition and approving the contract...`)

  await c.methods.reviewInitialConditions().send({from:cn.admin.address, gas:4000000, value:0});
  await c.methods.reviewInitialConditions().send({from:cn.nodeid.address, gas:4000000, value:0});

  console.log(`[${cn.id}] Initializing the contract...`)
  await c.methods.depositLockupStakingAndInit().send({from:cn.admin.address, gas:4000000, value:stakingAmount});
}

async function stake5MKLAYv2(cn) {
  var c = new caver.klay.Contract(cnv2.abi, cn.cnv2_addr);

  console.log(`[${cn.id}] Staking 5M KLAY...`)
  await c.methods.stakeKlay().send({from:cn.admin.address, gas:4000000, value:caver.utils.toPeb(5_000_000, "KLAY")})
}

async function setupCnV2() {
  // Deploy CN V3 staking contract.
  await deploy_v2(cn1);
  await deploy_v2(cn2);

  // Deploy StakingTracker contract
  await deploy_stakingtracker();

  // initialize cn v3 contract.
  await init_v2(cn1);
  await init_v2(cn2);

  // initialize CN staking contract.
  await reviewInitialConditionsv2(cn1);
  await reviewInitialConditionsv2(cn2);

  // stake initial 5M KLAYs.
  await stake5MKLAYv2(cn1);
  await stake5MKLAYv2(cn2);
}

async function deployKIRContract() {
  var c = new caver.klay.Contract(kir.abi)

  console.log("Deploying KIR contract...")
  var p = c.deploy({
    data: kir.bytecode,
    arguments:[[cn1.nodeid.address], 1]
  }).send({from: cn1.nodeid.address, gas:40000000, value:0})
  var r = await p;
  kir_addr = r._address;
  console.log("kir contract addr = " +kir_addr);
}

async function deployPOCContract() {
  var c = new caver.klay.Contract(poc.abi)

  console.log("Deploying PoC contract...")
  var p = c.deploy({
    data: poc.bytecode,
    arguments:[[cn1.nodeid.address], 1]
  }).send({from: cn1.nodeid.address, gas:40000000, value:0})
  var r = await p;
  poc_addr = r._address;
  console.log("poc contract addr = " +poc_addr);
}

async function constructAddressBook() {
  var c = new caver.klay.Contract(addressBook.abi, addressBookAddr);

  console.log(`Calling Addressbook.constructContract().. ${cn1.nodeid.address}`);
  await c.methods.constructContract([cn1.nodeid.address],1).send({from:cn1.nodeid.address, gas:4000000})

  console.log("Calling Addressbook.submitUpdatePocContract()..");
  await c.methods.submitUpdatePocContract(poc_addr, 1).send({from:cn1.nodeid.address, gas:4000000})

  console.log("Calling Addressbook.submitUpdateKirContract()..");
  await c.methods.submitUpdateKirContract(kir_addr, 1).send({from:cn1.nodeid.address, gas:4000000})

  console.log("Calling Addressbook.submitRegisterCnStakingContract().. cn1");
  await c.methods.submitRegisterCnStakingContract(cn1.nodeid.address, cn1.cnv2_addr, cn1.reward.address).send({from:cn1.nodeid.address, gas:4000000})
  console.log("Calling Addressbook.submitRegisterCnStakingContract().. cn2");
  await c.methods.submitRegisterCnStakingContract(cn2.nodeid.address, cn2.cnv2_addr, cn2.reward.address).send({from:cn1.nodeid.address, gas:4000000})

  console.log("Calling Addressbook.submitActivateAddressBook()..");
  await c.methods.submitActivateAddressBook().send({from:cn1.nodeid.address, gas:4000000})

  console.log("Calling Addressbook.isActivated()..");
  console.log(await c.methods.isActivated().call({from:cn1.nodeid.address, gas:4000000}))

  console.log("Calling Addressbook.getAllAddress()..");
  console.log(await c.methods.getAllAddress().call({from:cn1.nodeid.address, gas:4000000}))
}

async function setupAddressBook() {
  // deploy KIR contract
  await deployKIRContract();

  // deploy POC contract
  await deployPOCContract();

  // setup address book.
  await constructAddressBook();
}

async function fullExec() {
  //---- setting up CN v3 contract
  await setupCnV2();

  // --- setting up address book
  await setupAddressBook();

  await sleep(40 * 1000);
  // check staking info
  console.log(await caver.rpc.governance.getStakingInfo())
}

fullExec();