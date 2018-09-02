import Web3 from 'web3'
import Battleship from './../build/contracts/Battleship.json'
import ContractFactory from './../build/contracts/ContractFactory.json'
import GameRegistry from './../build/contracts/GameRegistry.json'
import EthereumDIDRegistry from './../build/contracts/EthereumDIDRegistry.json'

// Select websocket port; ganache-dev:'8545' or geth-dev:'8546'.
const provider = new Web3.providers.WebsocketProvider('ws://localhost:8545')
const web30 = new Web3(provider)

let drizzleOptions = {
  syncAlways:{},
  web3: {
    block: false,
    fallback: {
      //type: 'ws',
      //url: 'ws://localhost:8545'
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
  },
  polls: {
    accounts: 1500
  }
}


web30.eth.net.isListening()
.then(() => { 
  // Ganache enables RCP and WS connections on the same port.
  web30.currentProvider.connection.close()
  drizzleOptions.web3.fallback.type = 'ws'
  drizzleOptions.web3.fallback.url = 'ws://localhost:8545'
})
.catch(
  (err) => { 
    //Geth ports RCP -> 8545 and WS -> 8546.
    console.log('%c IGNORE PREVIOUS ERROR MESSAGE: Error during WebSocket... , just testing for ganache on 8545.', 'background: #222; color: #bada55')
    web30.currentProvider.connection.close()
    drizzleOptions.web3.fallback.type = 'ws'
    drizzleOptions.web3.fallback.url = 'ws://localhost:8546'
  });

export default drizzleOptions
