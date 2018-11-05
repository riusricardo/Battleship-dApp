# Battleship-dApp 
![Project Status: WIP – Initial development is in progress, but there has not yet been a stable, usable release suitable for the public.](https://www.repostatus.org/badges/latest/wip.svg)
[![CircleCI](https://circleci.com/gh/riusricardo/Battleship-dApp.svg?style=svg)](https://circleci.com/gh/riusricardo/Battleship-dApp)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/riusricardo/Battleship-dApp/pulls)



The Battleship dApp is a decentralized game. The application uses Ethereum Whisper as its principal communication layer. Each move has a nonce and is signed by the player enabling a fast and fluid game without the need to wait mined blocks. The identities and signers are managed on the EthrDID Registry.

You can play against anyone in the other side of the world and even bet on the final outcome without compromising your location.

## Installation

### Requirements
* [Geth 1.8+](https://github.com/ethereum/go-ethereum/wiki/Building-Ethereum)
* [NodeJS/LTS](https://nodejs.org/en/download/package-manager/)
* [uPort App](https://www.uport.me/)


```sh
(Terminal 1)$ npm install
```

## Usage

```sh
(Terminal 2)$ npm run truffle_migration
(Terminal 3)$ npm run geth_dev:whisper
(Terminal 1)$ npm start
```
Login with your uPort mobile App.

### Ports
```
Ganache - rpc:8545, ws:8545
Geth - rpc:8545, ws:8546
```
```
App runs on http://localhost:3000
```


## Tests

```
$ npm run truffle_tests
```

Truffle tests are useful to understand the game complexity.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[Apache-2.0](https://choosealicense.com/licenses/apache-2.0/)
