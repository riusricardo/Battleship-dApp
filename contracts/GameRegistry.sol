pragma solidity 0.4.24;

contract GameRegistry {

    address public factory;
    address public owner;

    struct Game{
        address gameContract;
        address[] gamePlayers;
        address gameWinner;
        uint potAmount;
        mapping(address => uint8[100]) gamePlayerBoard;
    }
    
    mapping(address => bool) public gameList;
    mapping(address => Game) public games;
    mapping(address => address[]) public playerGames;

    constructor() public {
        owner = msg.sender;
    }

    modifier ifOwner() {
        if(msg.sender == owner) {
            _;
        } else {
            revert("Not owner");
        }
    }

    modifier ifFactory() {
        if(msg.sender == factory) {
            _;
        } else {
            revert("Not factory");
        }
    }

    modifier ifGameOwner() {
        require (msg.sender == games[msg.sender].gameContract,"Game not found.");
        _;
    }

    modifier ifFactoryGame(){
        require(gameList[msg.sender],"Game not created by the factory.");
        _;
    }

    event GameOwnerSet(address indexed gameAddress, address owner, string message);
    event PlayerSet(address indexed gameAddress, string message);
    event WinnerSet(address indexed gameAddress, string message);
    event PlayerBoardSet(address indexed gameAddress, address player, string message);

    function setFactory(address _factory) external ifOwner{
        factory = _factory;
    }

    function setFactoryContract(address _contract) external ifFactory{
        gameList[_contract] = true;
    }

    function setGameOwner() external ifFactoryGame{
        games[msg.sender].gameContract = msg.sender;
        emit GameOwnerSet(msg.sender, msg.sender, "Game address set.");
    }

    function setPlayer(address _player, uint _amount) external ifGameOwner ifFactoryGame{
        games[msg.sender].gamePlayers.push(_player);
        games[msg.sender].potAmount = _amount * 2;
        playerGames[_player].push(msg.sender);
        emit PlayerSet(msg.sender, "Player set.");
    }

    function setWinner(address _player) external ifGameOwner ifFactoryGame{
        games[msg.sender].gameWinner = _player;
        emit WinnerSet(msg.sender, "Winner set.");
    }

    function setPlayerBoard(address _player, uint8[100] _board) external ifGameOwner ifFactoryGame{
        games[msg.sender].gamePlayerBoard[_player] = _board;
        emit PlayerBoardSet(msg.sender, _player, "Player gameboard set.");
    }

}