import Battleship from './../build/contracts/Battleship.json'
import ContractFactory from './../build/contracts/ContractFactory.json'
import GameRegistry from './../build/contracts/GameRegistry.json'


const drizzleOptions = {
  syncAlways:{},
  web3: {
    block: false,
    fallback: {
      type: 'ws',
      url: 'ws://localhost:9546'
    }
  },
  contracts: [
    ContractFactory,
    GameRegistry
    ,Battleship
  ],
  events: {
    GameRegistry: ['GameOwnerSet','PlayerSet','WinnerSet','PlayerBoardSet'],
    ContractFactory: ['ContractDeployed']
    //,Battleship: ['GameInitialized','JoinedGame','StateChanged','MoveMade','WonChallenged','GameEnded','TimeoutStarted','LogCurrentState','ValidSigner','BetClaimed']
  },
  polls: {
    accounts: 1500
  }
}

export default drizzleOptions