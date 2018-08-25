import create from './create'
import { drizzleConnect } from 'drizzle-react'

// May still need this even with data function to refresh component on updates for this contract.
const mapStateToProps = state => {
  return {
    ContractFactory: state.contracts.ContractFactory,
    GameRegistry: state.contracts.GameRegistry,
    Battleship: state.contracts.Battleship,
    drizzleStatus: state.drizzleStatus
  }
}

const createContainer = drizzleConnect(create, mapStateToProps);

export default createContainer
