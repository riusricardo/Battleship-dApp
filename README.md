### :warning: You are in the develop branch. :warning:
This branch will continuously receive updates.
The master branch is paused due to the developer program.

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
$ (Terminal 2)yarn run ganache-dev
$ (Terminal 1)truffle migrate --network ganache_dev
$ (Terminal 3)yarn geth-dev:whisper
$ (Terminal 1)yarn start
```
Login with your mobile uPort App.


```
Available Accounts
==================
(0) 0xf18f16eebae0912a17885d743754c943b548a630 (~100 ETH)
(1) 0x04c4b39e60ab3655af44cb928ac0da196188dd65 (~100 ETH)
(2) 0x2eb6b952af9ef44f376e799ca44a76a28d3e8957 (~100 ETH)
(3) 0xd84d3cd384604375a115d697e838b5b4ed681c9d (~100 ETH)
(4) 0x1435b9664159cc908d67c46b2f92ecb414ec8190 (~100 ETH)
(5) 0x5fc5cea687718fbdb529f19a2fffb621aa828405 (~100 ETH)
(6) 0x8d36227d3549846490fdf61e51a07ce5c84cfd56 (~100 ETH)
(7) 0xcf2069750e3ce70f971f7f0af9538af7fd773e47 (~100 ETH)
(8) 0xeee054834b10c5c76e2e25c8b00b0499f2916df2 (~100 ETH)
(9) 0x46bbce669bd8b37660695d4f863da4665079c596 (~100 ETH)

Private Keys
==================
(0) 0x91fa90449a0223e9182bcd2badb6069fae3dcdc0097ab7cc051d8c0a765daaa4
(1) 0x5ee066211bddbae18c19616b8c17ffaf5b01b69a37942634dec990e8df305d0c
(2) 0x6aa6c344e007cd84752c55a1d505deca6af11e0375283a462df13ba73532fb38
(3) 0x0b1d875cf1a1956bb4e4eb5d0e5601c69b34e9f82df985427dc2baf117098ab0
(4) 0x09cfe3564bcec527292ee6e0de5b29cef3cebc98d0e9cf3ae956eb34eb1746c3
(5) 0xa5efb71f436420c688ba78437f372f780f80307d2f994d982efd03e08ca1546f
(6) 0xb8b856d9dcf4e2ee47ede23fb4dba9dff0e5df17deb4a92c07c8de38939d6fe3
(7) 0xc7fd249149a81e7a18886399b84b5aa40872fb6117e6896d7643fb8aa10ec4b2
(8) 0xb0039d4fd4eeb659bcc8315a06953ec9843387deb7164b7bc652d493db941fdd
(9) 0x18c5172e35128682db94f7fb64d6031269c10bbf943a1ee80f7f4b9d5b8dc3b9
```


## Tests

`$ truffle test --network ganache`

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[Apache-2.0](https://choosealicense.com/licenses/apache-2.0/)
