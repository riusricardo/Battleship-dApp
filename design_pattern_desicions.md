# Design Patterns. 

### Some of the key features presented in this project are:

* Privacy
* Upgradability
* Speed
* Modularity

## Description

The application uses Ethereum Whisper as its protocol communication layer. This technology enables many features. One of them is the "total darkness" that allows the possibility of sending encrypted messages to many nodes without knowing which one will decipher it.

The project uses OpenZepellin OwnedUpgradabilityProxy. Using a proxy enables us to "upgrade" our code by pointing to a new contract instance. In this case it is used to redirect the calls to the Factory contract which is in charge of deploying new game contracts. The Factory contract can upgrade the deployable bytecode but it gets locked after 3 weeks. In this case it will be necesary to use the proxy to point into a new factoy instance.

![alt text](https://i2.wp.com/blog.zeppelinos.org/wp-content/uploads/2018/04/5Fixed.png)

The game uses a state machine pattern where only a defined set of functions can be called in each state. 

All the final results and stats of each game are recorded on a Game Registry. Having a central point to read the final outcomes gives us the same information as if the final outcomes are only stored on the playable game contract.

Deploying a new smart contract per game, is better than moving money from a common pot. In this case every game is isolated only to the players and the factory. Restricting the smart contract to 3 identities increases exponentially the security on each game.

Each move has a nonce and is signed by the player enabling a fast and fluid game without the need to wait mined blocks. The identities are managed on the EthrDID Registry and can be validated from the client side with javascript or inside the blockchain through smart contract calls. This registry enhances the capabilities of a simple ethereum account. The identity owner generates a temporary signer delegate with an expiration time on the EthrDID registry.


