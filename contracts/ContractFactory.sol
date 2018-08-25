pragma solidity 0.4.24;

import "zos-lib/contracts/upgradeability/AdminUpgradeabilityProxy.sol";
import "ethr-did-registry/contracts/EthereumDIDRegistry.sol";
import "./libraries/Bytes.sol";

contract ContractFactory {

    using Bytes for *;

    address public owner;
    address public ethReg;
    address public gameReg;
    uint public creationTime;
    bytes internal bytecode;
    bool internal locked;
    
    constructor(address _ethReg, address _gameReg) public {
        owner = msg.sender;
        ethReg = _ethReg;
        gameReg = _gameReg;
        bytecode = hex"0000000000000000000000000000000000000000";
        locked = false;
        creationTime = block.timestamp;
    }

    event ContractDeployed(address emiter, address deployedAddress);
    event BytecodeChanged(address owner, string message);
    event FabricLocked(address owner, string message);

    modifier ifOwner() {
        if(msg.sender == owner) {
            _;
        } else {
            revert("Not owner");
        }
    }

    modifier ifNotLocked(){
        if(!locked){
            _;
        } else{
            revert("Contract Locked");
        }
    }

    modifier lockAfter(uint _time) {
        require(block.timestamp < (creationTime + _time),"The function is locked by time.");
        _;
    }
    
    function concatBytecode(bytes _data) external ifOwner lockAfter(3 weeks) ifNotLocked{
        bytecode = Bytes.concat(bytecode, _data);
        emit BytecodeChanged(owner, "The owner updated the code.");
    }
    
    function setBytecode(bytes _data) external ifOwner lockAfter(3 weeks) ifNotLocked{
        bytecode = _data;
        emit BytecodeChanged(owner, "The owner updated the code.");
    }
    
    function getBytecode() external view ifOwner returns(bytes){
        return bytecode;
    }

    function lockFabric() external ifOwner ifNotLocked{
        locked = true;
        emit FabricLocked(owner, "The fabric bytecode became not upgradable.");
    }

    function createAndCall(address _actor, bytes _data) external payable {
        address deployed = _deployCode(bytecode);
        require(gameReg.call(bytes4(keccak256("setFactoryGame(address,address)")), abi.encode(deployed,_actor)));
        require(deployed.call(bytes4(keccak256("setEthReg(address)")), abi.encode(ethReg)));
        require(deployed.call(bytes4(keccak256("setGameReg(address)")), abi.encode(gameReg)));
        require(deployed.call.value(msg.value)(_data),"Failed to send data.");
        emit ContractDeployed(_actor, deployed);
    }

    function createContract(address _actor) external {
        address deployed = _deployCode(bytecode);
        require(gameReg.call(bytes4(keccak256("setFactoryGame(address,address)")), abi.encode(deployed,_actor)));
        require(deployed.call(bytes4(keccak256("setEthReg(address)")), abi.encode(ethReg)));
        require(deployed.call(bytes4(keccak256("setGameReg(address)")), abi.encode(gameReg)));
        emit ContractDeployed(_actor, deployed);      
    }

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