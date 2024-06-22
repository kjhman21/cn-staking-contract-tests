const Caver = require('caver-js')
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
const privateKey8 = "0x21372369b9d5011d99b1cf3aa0b83e3059d3fb32dec312dc846e877c1b3c591a"
const addr8 = "0xc3769bfad4b20ec271eae97385951cb4ef9317f3"

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
    pd_addr:"0x22D2f08235D99da27F8AB7F5c7e04d089851702F"
}

async function changeAdmin() {
  var c = new caver.klay.Contract(cnv3.abi, cn1.cnv3_addr);

  // print current admin.
  console.log('print current admin')
  console.log(await c.methods.getState().call({from:cn1.admin.address, gas:4000000, value:0}))

  // add new admin.
  console.log(`Adding new admin ${cn1.new_admin.address}`)
  await c.methods.submitAddAdmin(cn1.new_admin.address).send({from:cn1.admin.address, gas:4000000, value:0})

  // remove prev admin
  console.log(`Removing prev admin ${cn1.admin.address}`)
  await c.methods.submitDeleteAdmin(cn1.admin.address).send({from:cn1.admin.address, gas:4000000, value:0})

  console.log('print updated dmin')
  console.log(await c.methods.getState().call({from:cn1.admin.address, gas:4000000, value:0}))
}

changeAdmin()