### :warning: This project will continue its development on the develop branch. :warning:

# Battleship-dApp ![CI status](https://img.shields.io/badge/build-passing-brightgreen.svg)

The Battleship dApp is a decentralized game. The application uses Ethereum Whisper as its principal communication layer. Each move has a nonce and is signed by the player enabling a fast and fluid game without the need to wait mined blocks. The identities and signers are managed on the EthrDID Registry.

You can play against anyone in the other side of the world and even bet on the final outcome without compromising your location.

## Installation

### Requirements
* Linux
* Geth 1.8 and up
* Truffle Framework
* Yarn
* Ganache-cli
* uPort App

```
$ (Terminal 1)yarn install
$ (Terminal 1)truffle compile
```

## Usage

```
$ (Terminal 2)yarn run ganache_dev
$ (Terminal 1)truffle migrate --network ganache_dev
$ (Terminal 3)yarn geth-dev:whisper
$ (Terminal 1)yarn start
```
Login with your mobile uPort App.


```
Available Accounts
==================
(0) 0x0b774fa1bcdcefb52b490f6879be8f8da0dbd954
(1) 0x417ed433e325a5e9d1f76396af5a4268b92a6bf1
(2) 0x47837f58b407550a4dfe4308f5e52c4d8f8f748e
(3) 0xc7dfca9d08ea64d4c40afc7c872ac268d68e8780
(4) 0x82294465b79cda4f493d7adccb504fce327d823d
(5) 0x2a61115c69a083d34f9da75f498e4733401bf280

Private Keys
==================
(0) 13f6560c7f90ec8b7bd6541c79750947fc92e3a5fb8ff08113c81e9c8223adbf
(1) 55669318c333ab8cb8b5f2d93ea2d18e28923d63e0eaac4cbbe80e58c5bcadea
(2) fa1364888538510d9ed2ed915683763e091487c2ae632b576b0b98ce3e8b7bf6
(3) a6308f58c310ca7be22e19c58e584c12325dbc793a5da2cf1a8058fd78d09d93
(4) e2bcfc9112fcd3cc6d4259d7c50d4d012b571d206aa0084201dcc1219c097bbf
(5) 7d761d675a2f87532f04f7e55e3525e1b43624502f23ed406e3e84d5c2efb131
```


## Tests

`$ truffle test --network ganache`

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[Apache-2.0](https://choosealicense.com/licenses/apache-2.0/)
