# bockchainApi
HTTP API for simple works with transactions on BTC(blockcypher) and ETH(rinkeby) testnetworks.
Also can works with main networks.
Additionally a collection of postman requests in the root folder

### Methods:

##### BTC create account
method: GET
url: localhost:8088/btc/create
response: 
```sh
{
"address":"CAbzRwsQRMpaBPeHr5QbGbmVEa4WMRVH6W",
"wif":"Bs3My1H2qxq8diNBFbdzgtL47Qg9AbdCQH7HkMBbo5xx7fn9mD4M"
}
```
##### BTC balance
method: POST
request body: 
```sh
{
	"address": "CBbw5H8ZSKjFzvgV1iUtxQY5madFx7qdDs"
}
```
```sh
response: info about address balance
```

##### BTC crane
method: POST
url: localhost:8088/btc/crane
request body: 
```sh
{
	"address": "By2NL7EuoF5DViS4GKVhSUnViL6tYNzDQP",
	"amount": 500000
}
```
response: 
```sh
transaction ref
```

##### BTC sendTransaction
you should defines amount in satoshi
fees takes from defined amount

method: POST
url: localhost:8088/btc/sendTransaction
request body: 
```sh
{
	"wifFrom": "BqY2CXUThbHKX3vojuZ9x3cdw521Buw41jGpCyhM4xaqweNefveb",
	"addressTo": "CBbw5H8ZSKjFzvgV1iUtxQY5madFx7qdDs",
	"amount": 200000 
}
```
response: 
```sh
your transaction in JSON
```

##### ETH create
method: GET
url: localhost:8088/eth/create
response: 
```sh
{
"address":"0x3efAD935F678CaC2bC0b1d6aD2651Bf8B1011de8",
"privateKey":"0x4eaee186965a256aaca9c7ae7f6db1421b668036bfebee1d5ca0e6582c9b86a0"
}
```
##### ETH balance
method: POST
url: localhost:8088/eth/getBalance
request body: 
```sh
{
	"address": "0xf67d647f4bb3d912c9a4a4b1d3d2860de7f54cb1"
}
```
response: 
```sh
balance
```
##### ETH sendTransaction
you should defines amount in wei
fees takes from the balance not from selected amount

method: POST
request body: 
```sh
{
	"addressesFrom": "0x222F205a34dF8dd42c8E30750F2a605a61442Ae8", 
	"privateFrom": "0xc30185ffe995bb5db1d826d41a69b5b87fe316d36f315d7d829b6386e77ea2ab",
	"addressTo": "0xf67d647f4bb3d912c9a4a4b1d3d2860de7f54cb1", 
	"value": 500000000000000
}
```
response: 
```sh
info about your transaction
```
