import Web3 from 'web3'
import Battleship from './contracts/Battleship.json'
import ContractFactory from './contracts/ContractFactory.json'
import GameRegistry from './contracts/GameRegistry.json'
import EthereumDIDRegistry from './contracts/EthereumDIDRegistry.json'
import AdminUpgradeabilityProxy from './contracts/AdminUpgradeabilityProxy.json'

let drizzleOptions = {
  web3: {
    fallback: {
      //type: 'ws',
      //url: 'ws://localhost:8545'
    }
  },
  contracts: [
    ContractFactory,
    GameRegistry,
    EthereumDIDRegistry,
    AdminUpgradeabilityProxy,
    Battleship
  ],
  events: {
    GameRegistry: ['GameOwnerSet','PlayerSet','WinnerSet','PlayerBoardSet'],
    ContractFactory: ['ContractDeployed']
  },
  polls: {
    blocks: 3000,
    accounts: 3000
  },
  syncAlways: true
}

// Add websocket port; ganache-dev:'8545' or geth-dev:'8546'.
const provider = new Web3.providers.WebsocketProvider('ws://localhost:8545')
const web3Instance = new Web3(provider)

web3Instance.eth.net.isListening()
.then(() => { 
  // Ganache enables RCP and WS connections on the same port.
  web3Instance.currentProvider.connection.close()
  drizzleOptions.web3.fallback.type = 'ws'
  drizzleOptions.web3.fallback.url = 'ws://localhost:8545'
})
.catch(
  (err) => { 
    //Geth ports RCP -> 8545 and WS -> 8546.
    console.log('%c IGNORE PREVIOUS ERROR MESSAGE: Error during WebSocket... , just testing for ganache on 8545.', 'background: #222; color: #bada55')
    web3Instance.currentProvider.connection.close()
    drizzleOptions.web3.fallback.type = 'ws'
    drizzleOptions.web3.fallback.url = 'ws://localhost:8546'
  });

export default drizzleOptions
