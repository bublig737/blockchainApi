module.exports = {
    MINIMUM_SATOSHIS_SEND: 550,
    BCY_TEST_API_URL: 'https://api.blockcypher.com/v1/bcy/test',
    BTC_API_URL: 'https://blockchain.info',
    ETH_API_URL: 'https://rinkeby.infura.io/v3/b80aae8fabf94b239512647808ef8a5f',
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