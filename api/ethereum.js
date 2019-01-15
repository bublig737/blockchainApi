const Web3 = require('web3')
const config = require('../config')


class Ethereum {

    constructor(){
        this.web3 = new Web3(config.ETH_API_URL)
    }

    async sendTransaction(addressesFrom, privateFrom, addressTo, value) {
        let txObject = {
            from: addressesFrom,
            to: addressTo,
            value
        }
        let gasPrice = await this.web3.eth.getGasPrice()
        let gas = await this.web3.eth.estimateGas(txObject)
        txObject.gas = gas
        txObject.gasPrice = gasPrice
        txObject.value = txObject.value - (gas * gasPrice)
        let signTx = await this.web3.eth.accounts.signTransaction(txObject, privateFrom)
        return await this.web3.eth.sendSignedTransaction(signTx.rawTransaction)
    }

    createAccount() {
        return this.web3.eth.accounts.create()
    }

    async getBalance(address) {
        return await this.web3.eth.getBalance(address)
    }

}

const eth = new Ethereum()

module.exports = eth