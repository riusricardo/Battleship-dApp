import drizzleTab from './drizzleTab'
import { drizzleConnect } from 'drizzle-react'

// May still need this even with data function to refresh component on updates for this contract.
const mapStateToProps = state => {
  return {
    accounts: state.accounts,
    ContractFactory: state.contracts.ContractFactory,
    GameRegistry: state.contracts.GameRegistry,
    //Battleship: state.contracts.Battleship,
    drizzleStatus: state.drizzleStatus
  }
}

const drizzleTabContainer = drizzleConnect(drizzleTab, mapStateToProps);

export default drizzleTabContainer
