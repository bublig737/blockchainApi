const {
  get,
  post
} = require('axios')
const bitcoinjs = require('bitcoinjs-lib')

/* 
  The test API provides by blockcypher.com 
  The main API provides by blockchain.info
  get recommended fee bitcoinfees.earn.com
  Utils provides by bitcoinjs-lib
  **/

const config = {
  MINIMUM_SATOSHIS_SEND: 550,
  BCY_TEST_API_URL: 'https://api.blockcypher.com/v1/bcy/test',
  BTC_API_URL: 'https://blockchain.info',
  BTC_FEE_API_URL: 'https://bitcoinfees.earn.com/api/v1/fees/recommended',
  TEST_BTC_NETWORK: {
    messagePrefix: '\x18Bitcoin Signed Message:\n',
    bech32: 'bc',
    bip32: {
      public: 0x0488b21e,
      private: 0x0488ade4
    },
    pubKeyHash: 0x1b,
    scriptHash: 0x1f,
    wif: 0x49
  },
  INPUT_SIZE: 147,
  OUTPUT_SIZE: 34,
  EMPTY_TX_SIZE: 11,
}

class BtcApi {
  constructor(networkType) {
    this.networkType = networkType
    this.network = networkType === 'test' ? config.TEST_BTC_NETWORK : bitcoinjs.networks.bitcoin
  }

  async getTxsFromBlock(height) {
    if (this.networkType === 'test') {
      let block = (await get(config.BCY_TEST_API_URL + '/blocks/' + height)).data
      // transformation txs outputs to the blockchain.info version 
      let tx = []
      for (let txHash of block.txids) {
        let transaction = await this.getTx(txHash)
        for (let output of transaction.outputs) {
          output.addr = output.addresses[0]
          delete output.addresses[0]
        }
        transaction.out = transaction.outputs
        delete transaction.outputs
        tx.push(transaction)
      }
      return tx
    }
    return (await get(config.BTC_API_URL + '/block-height/' + height + '?format=json')).data.blocks[0].tx
  }

  async getLatestBlockHeight() {
    if (this.networkType === 'test') {
      return (await get(config.BCY_TEST_API_URL)).data.height
    }
    return (await get(config.BTC_API_URL + '/latestblock')).data.height
  }

  async getTx(hash) {
    if (this.networkType === 'test') {
      return (await get(config.BCY_TEST_API_URL + '/txs/' + hash)).data
    }
    return (await get(config.BTC_API_URL + '/rawtx/' + hash)).data
  }

  async genAddress() {
    const keyPair = bitcoinjs.ECPair.makeRandom({
      network: this.network
    })
    const {
      address
    } = bitcoinjs.payments.p2pkh({
      pubkey: keyPair.publicKey,
      network: this.network
    })
    const wif = keyPair.toWIF()
    return {
      address,
      wif
    }
  }

  async getBalance(address) {
    if (this.networkType === 'test') {
      return (await get(config.BCY_TEST_API_URL + '/addrs/' + address + '/balance?')).data
    }
    return (await get(config.BTC_API_URL + '/balance?active=' + address)).data[`${address}`]
  }

  async sendRawTransaction(rawTransaction) {
    if (this.networkType === 'test') {
      return (await post(config.BCY_TEST_API_URL + '/txs/push',
        JSON.stringify({
          tx: rawTransaction
        }))).data
    }
    return (await post(config.BTC_API_URL + '/pushtx',
      'tx=' + rawTransaction)).data
  }

  async getUtxos(address) {
    let utxo = []
    if (this.networkType === 'test') {
      let refs = (await get(config.BCY_TEST_API_URL + '/addrs/' + address)).data.txrefs
      if (!refs) {
        throw new Error('address from has empty confirmed tx list')
      }
      utxo = refs.filter((ref) => {
        return ref.spent === false
      })
    } else {
      utxo = (await get(config.BTC_API_URL + '/unspent?active=' + address)).data.unspent_outputs.map((el) => {
        return {
          tx_hash: el.tx_hash_big_endian,
          value: el.value,
          tx_output_n: el.tx_output_n,
        }
      })
    }
    if (utxo.length === 0) {
      throw new Error('address from is not have utxo that can be spent')
    }
    return utxo
  }

  async getFeePerByte() {
    return (await get('https://bitcoinfees.earn.com/api/v1/fees/recommended')).data
  }

  async createSignSendTx(wifFrom, addressTo, amount) {
    const keyPair = bitcoinjs.ECPair.fromWIF(wifFrom, this.network)
    const {
      address
    } = (bitcoinjs.payments.p2pkh({
      pubkey: keyPair.publicKey,
      network: this.network
    }))
    const txb = new bitcoinjs.TransactionBuilder(this.network)
    txb.setVersion(1)
    const feePerByte = (await this.getFeePerByte()).fastestFee
    let size = config.EMPTY_TX_SIZE
    let electUtxos = []
    let amountBtcInElectInputs = 0
    const balanceFrom = (await this.getBalance(address)).final_balance
    const value = amount || balanceFrom
    if (balanceFrom < value) {
      throw new Error('Not enough balance. Target value is less than ' + balanceFrom)
    }
    let utxos = await this.getUtxos(address)
    utxos.sort((a, b) => {
      if (a.value < b.value) return 1
      if (a.value > b.value) return -1
      return 0
    })
    // electing utxos
    for (let i = utxos.length - 1; i > 0; i--) {
      if (utxos[i].value >= value) {
        electUtxos.push(utxos[i])
        amountBtcInElectInputs = utxos[i].value
        break
      }
    }
    if (electUtxos.length === 0) {
      for (let i = 0; i < utxos.length; i++) {
        electUtxos.push(utxos[i])
        amountBtcInElectInputs += utxos[i].value
        if (amountBtcInElectInputs >= value) break
      }
    }
    // calculate fees
    size += config.INPUT_SIZE * electUtxos.length
    size += config.OUTPUT_SIZE
    let fees = size * feePerByte
    if (value < fees + config.MINIMUM_SATOSHIS_SEND) {
      throw new Error('Target value less than fees + minimum satoshis to send. Need rather than ' + (fees + config.MINIMUM_SATOSHIS_SEND))
    }
    let uotputValue = value - fees
    let changeFees = config.OUTPUT_SIZE * feePerByte
    // adds change output if need (cash back)
    if (amountBtcInElectInputs > uotputValue + fees) {
      if (amountBtcInElectInputs > uotputValue + changeFees + config.MINIMUM_SATOSHIS_SEND) {
        console.log('change output added', amountBtcInElectInputs - (uotputValue + changeFees + fees));
        txb.addOutput(address, amountBtcInElectInputs - (uotputValue + changeFees + fees))
      } else {
        uotputValue = amountBtcInElectInputs - fees
      }
    }
    // adds main output
    txb.addOutput(addressTo, uotputValue)
    // adds inputs
    for (let utxo of electUtxos) {
      txb.addInput(utxo.tx_hash, utxo.tx_output_n)
    }
    // sign inputs
    for (let inputIndex in electUtxos) {
      txb.sign(parseInt(inputIndex), keyPair)
    }
    // build and send transaction
    let rawTransaction = txb.build().toHex()
    return this.sendRawTransaction(rawTransaction)
  }
}

class Btc extends BtcApi {
  constructor() {
    super('main')
  }
}

// Need token for crane on test network. You can get token on blockcypher.com
class TestBtc extends BtcApi {
  constructor(token) {
    super('test')
    this.token = token
  }

  async crane(address, amount) {
    return (await post(config.BCY_TEST_API_URL + '/faucet?token=' + this.token, {
      address,
      amount
    })).data
  }
}

const btc = new TestBtc('fb1c8427fd9b4e4e977d4fc8a525fd58')

module.exports = btc