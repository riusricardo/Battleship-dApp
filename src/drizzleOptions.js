import Web3 from 'web3'
import Battleship from './../build/contracts/Battleship.json'
import ContractFactory from './../build/contracts/ContractFactory.json'
import GameRegistry from './../build/contracts/GameRegistry.json'
import EthereumDIDRegistry from './../build/contracts/EthereumDIDRegistry.json'

// Select websocket port; ganache-dev:'8545', geth-dev:'8546'.
let port
let websocket = new Web3.providers.WebsocketProvider('ws://localhost:8545')
let web30 = new Web3(websocket)
let drizzleOptions

drizzleOptions = {
  syncAlways:{},
  web3: {
    block: false,
    fallback: {
      //type: 'ws',
      //url: 'ws://localhost:'+ port
    }
  },
  contracts: [
    ContractFactory,
    GameRegistry,
    EthereumDIDRegistry,
    Battleship
  ],
  events: {
    GameRegistry: ['GameOwnerSet','PlayerSet','WinnerSet','PlayerBoardSet'],
    ContractFactory: ['ContractDeployed'],
    EthereumDIDRegistry: []
    //,Battleship: ['GameInitialized','JoinedGame','StateChanged','MoveMade','WonChallenged','GameEnded','TimeoutStarted','LogCurrentState','ValidSigner','BetClaimed']
  },
  polls: {
    accounts: 1500
  }
}


web30.eth.net.isListening()
.then(() => { 
  port = '8545' // Ganache enables RCP and WS connections on the same port.
  web30.currentProvider.connection.close()
  drizzleOptions.web3.fallback.type = 'ws'
  drizzleOptions.web3.fallback.url = 'ws://localhost:'+ port
})
.catch(
  (err) => { 
    port = '8546' //Geth RCP:8546 WS:8545
    console.log('%c IGNORE PREVIOUS ERROR MESSAGE: Error during WebSocket... , just testing for ganache on 8545.', 'background: #222; color: #bada55')
    web30.currentProvider.connection.close()
    drizzleOptions.web3.fallback.type = 'ws'
    drizzleOptions.web3.fallback.url = 'ws://localhost:'+ port
  });

export default drizzleOptions
