pragma solidity 0.4.24;

import "./libraries/openzeppelin/migrations/Initializable.sol";
import "./libraries/openzeppelin/lifecycle/Destructible.sol";
import "./libraries/Bytes.sol";

contract ContractFactory is Initializable,Destructible {

    address public ethReg;
    address public gameReg;
    uint public creationTime;
    bool internal locked;
    bytes internal bytecode;
    
    function initialize(address _ethReg, address _gameReg) external isInitializer {
        ethReg = _ethReg;
        gameReg = _gameReg;
        bytecode = hex"0000000000000000000000000000000000000000";
        locked = false;
        creationTime = block.timestamp;
    }

    event ContractDeployed(address emiter, address deployedAddress);
    event BytecodeChanged(address owner, string message);
    event FabricLocked(address owner, string message);

    /// @dev Verifies if caller is owner. Owner is inherited from Ownable <- Destructible
    modifier ifOwner() {
        if(msg.sender == owner) {
            _;
        } else {
            revert(", not owner.");
        }
    }

    /// @dev Verifies if the contract has not been manually locked.
    modifier ifNotLocked(){
        if(!locked){
            _;
        } else{
            revert(", contract locked.");
        }
    }

    /// @dev Verifies the required time to automatically lock the contract.
    modifier lockAfter(uint _time) {
        require(block.timestamp < (creationTime + _time),", the function is locked by time.");
        _;
    }
    
    /// @dev It enables a way to update the bytecode by concatenation.
    /// @param _data The extra bytecode data.
    function concatBytecode(bytes _data) external ifOwner lockAfter(3 weeks) ifNotLocked{
        uint len = _data.length;
        uint len2 = bytecode.length;
        require(len == len2, "incorrect bytecode size.");
        bytecode = Bytes.concat(bytecode, _data);
        emit BytecodeChanged(owner, ", the owner updated the code.");
    }
    
    /// @dev It enables a way to update the bytecode by replacing it.
    /// @param _data The new bytecode data.
    function setBytecode(bytes _data) external ifOwner lockAfter(3 weeks) ifNotLocked{
        uint len = _data.length;
        require(len >= 20, "incorrect bytecode size.");
        bytecode = _data;
        emit BytecodeChanged(owner, ", the owner updated the code.");
    }
    
    /// @dev Only owner can retrieve the loaded bytecode.
    function getBytecode() external view ifOwner returns(bytes){
        return bytecode;
    }

    /// @dev Manually lock the contract by not letting it change the bytecode.
    function lockFabric() external ifOwner ifNotLocked{
        locked = true;
        emit FabricLocked(owner, ", the fabric bytecode became not upgradable.");
    }

    /// @dev Creates a new game instance and calls the encoded data after creation.
    /// @dev Initialize the game instance and creates a new entry in the game registry.
    /// @param _actor player1 address.
    /// @param _actor2 player2 address.
    /// @param _data encoded data to call a specific function in the new instance.
    function createAndCall(address _actor, address _actor2, bytes _data) external payable {
        address deployed = _deployCode(bytecode);
        require(gameReg.call(bytes4(keccak256("setFactoryGame(address,address,address)")), abi.encode(deployed,_actor,_actor2)));
        require(deployed.call(bytes4(keccak256("initialize(address,address)")), abi.encode(ethReg,gameReg)));
        require(deployed.call.value(msg.value)(_data),", failed to send _data.");
        emit ContractDeployed(_actor, deployed);
    }
    
    /// @dev Creates a new game instance and a new entry in the game registry.
    /// @param _actor player1 address.
    /// @param _actor2 player2 address.
    function createContract(address _actor, address _actor2) external {
        address deployed = _deployCode(bytecode);
        require(gameReg.call(bytes4(keccak256("setFactoryGame(address,address,address)")), abi.encode(deployed,_actor,_actor2)));
        require(deployed.call(bytes4(keccak256("initialize(address,address)")), abi.encode(ethReg,gameReg)));
        emit ContractDeployed(_actor, deployed);      
    }

    /// @dev Function that deploys a new contract/instance.
    /// @param _data bytecode that will be deployed.
    function _deployCode(bytes memory _data) internal returns (address deployedAddress) {
        assembly {
            deployedAddress := create(0, add(_data, 0x20), mload(_data))
            if eq(deployedAddress, 0x0) {
                revert(0, 0)
            }
        }
    }
    
    /* fallback */
    function () public {
        revert();
    }
}