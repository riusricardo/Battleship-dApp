pragma solidity 0.4.24;

contract GameRegistry {

    address public factory;
    address public owner;

    struct Game{
        address gameContract;
        address player1;
        address player2;
        address gameWinner;
        uint potAmount;
        uint8[100] gamePlayerBoard1;
        uint8[100] gamePlayerBoard2;
    }
    
    mapping(address => bool) public gameList;
    mapping(address => Game) public games;
    mapping(address => uint) public changed;
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
    event CreatedGame(address indexed gameAddress, address indexed player1, address indexed player2, uint previousChange);

    function setFactory(address _factory) external ifOwner{
        factory = _factory;
    }

    function setFactoryGame(address _contract, address _actor, address _actor2) external ifFactory{
        gameList[_contract] = true;
        setGame(_contract, _actor, _actor2);
    }

    function setGame(address _gameAddress, address _actor, address _actor2) internal ifFactory{
        changed[_actor] = block.number;
        emit CreatedGame(_gameAddress, _actor, _actor2, changed[_actor]);
    }

    function setGameOwner() external ifFactoryGame{
        games[msg.sender].gameContract = msg.sender;
        emit GameOwnerSet(msg.sender, msg.sender, "Game address set.");
    }

    function setPlayer(address _player, uint _amount, uint _num) external ifGameOwner ifFactoryGame{
        if(_num == 1){games[msg.sender].player1 = _player;}
        if(_num == 2){games[msg.sender].player2 = _player;}
        games[msg.sender].potAmount = _amount * 2;
        playerGames[_player].push(msg.sender);
        emit PlayerSet(msg.sender, "Player set.");
    }

    function setWinner(address _player) external ifGameOwner ifFactoryGame{
        games[msg.sender].gameWinner = _player;
        emit WinnerSet(msg.sender, "Winner set.");
    }

    function setPlayerBoard(address _player, uint8[100] _board, uint _num) external ifGameOwner ifFactoryGame{
        if(_num == 1){games[msg.sender].gamePlayerBoard1 = _board;}
        if(_num == 2){games[msg.sender].gamePlayerBoard2 = _board;}
        emit PlayerBoardSet(msg.sender, _player, "Player gameboard set.");
    }

    function getPlayerGames(address _player) external view returns(address[]){
        address[] storage list = playerGames[_player];
        return list;
    }

}