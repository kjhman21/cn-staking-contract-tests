const Caver = require('caver-js')
const cnv3 = require('./CnStakingV3MultiSig.json')
const pd = require('./PublicDelegation.json')

const caver = new Caver("http://localhost:8551")
const privateKey1 = "0x6355336d831705b82e24f0b13f553d9f8ad2d90420478957e57b16b08e47d6e1"
const addr1 = "0x7b6a8527e0aa483c08fc305cf39a244e65bae545"
const privateKey2 = "0x396d712edc1547126990664659275fbdab4828d049d04409f346c7581331c4ea"
const addr2 = "0xa951bd1a6c81fcf38966e036c876752ab97a35e5"
const privateKey3 = "0x1e8c4101c972e66513fc73b18636e3bcd1fdefe488f2fce606b089d260c73366"
const addr3 = "0x93b753a3be04b1353b78c0ac221061fcbd48fae0"

var cn1_fakeaddr = "0x7b6a8527e0aa483c08fc305cf39a244e65bae546"
var stakingtracker_addr="0xe29dA308B6e8229Ba0134c71490451ad6ACfcc7e";
var cn1 = {
    id:1,
    nodeid: caver.klay.accounts.wallet.add(privateKey1),
    reward: caver.klay.accounts.wallet.add(privateKey2),
    admin: caver.klay.accounts.wallet.add(privateKey3),
    cnv2_addr:"0x89865cad05e81739Cf4cB744Ce8aaD2f52a29B28",
    cnv3_addr:"0xFc756C6D2F2e48711C57027F4532b79CECf78685",
}

async function deploy_v3() {
  var c = new caver.klay.Contract(cnv3.abi)

  console.log("Deploying cnv3 contract...")
  var p = c.deploy({
    data: cnv3.bytecode,
    arguments: [cn1.nodeid.address, cn1_fakeaddr, cn1.reward.address, [cn1.admin.address], 1, [], []]
  })
  .send({ from: cn1.nodeid.address, gas: 40000000, value: 0 })

  var r = await p;
  cn1.cnv3_addr = r._address;
  console.log("cnv3 contract addr = " +cn1.cnv3_addr);
}

async function init_v3() {
  var c = new caver.klay.Contract(cnv3.abi, cn1.cnv3_addr);

  console.log('calling setStakingTracker...');
  await c.methods.setStakingTracker(stakingtracker_addr).send({from:cn1.nodeid.address, gas:4000000, value:0})

  console.log('calling setGCId...');
  await c.methods.setGCId(cn1.id).send({from:cn1.nodeid.address, gas:4000000, value:0})

}

async function reviewInitialConditions() {
  var c = new caver.klay.Contract(cnv3.abi, cn1.cnv3_addr);

  console.log("Reviewing the condition and approving the contract...")

  await c.methods.reviewInitialConditions().send({from:cn1.nodeid.address, gas:4000000, value:0})
  await c.methods.reviewInitialConditions().send({from:cn1.admin.address, gas:4000000, value:0})
}

async function init() {
  var c = new caver.klay.Contract(cnv3.abi, cn1.cnv3_addr);

  console.log("Initializing the contract...")
  await c.methods.depositLockupStakingAndInit().send({from:cn1.admin.address, gas:4000000, value:0});
}

async function setupCnV3() {
  // Deploy CN V3 staking contract.
  await deploy_v3();

  // initialize cn v3 contract.
  await init_v3();

  // initialize CN staking contract.
  await reviewInitialConditions();
  await init();
}

setupCnV3();