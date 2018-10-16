pragma solidity 0.4.24;

import "./libraries/openzeppelin/lifecycle/Destructible.sol";

contract GameRegistry is Destructible {

    address public factory;

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

    /// @dev Verifies if caller is owner. Owner is inherited from Ownable <- Destructible
    modifier ifOwner() {
        if(msg.sender == owner) {
            _;
        } else {
            revert(", not owner.");
        }
    }

    /// @dev Verifies if caller is the contract factory. 
    modifier ifFactory() {
        if(msg.sender == factory) {
            _;
        } else {
            revert(", not factory.");
        }
    }

    /// @dev Verifies if caller is GameOwner. Game owner is the game instance address. 
    modifier ifGameOwner() {
        require (msg.sender == games[msg.sender].gameContract,", game not found.");
        _;
    }

    /// @dev Verifies if the game instance was created by the contract factory.
    modifier ifFactoryGame(){
        require(gameList[msg.sender],", game not created by the factory.");
        _;
    }

    event GameOwnerSet(address indexed gameAddress, address owner, string message);
    event PlayerSet(address indexed gameAddress, string message);
    event WinnerSet(address indexed gameAddress, string message);
    event PlayerBoardSet(address indexed gameAddress, address player, string message);
    event CreatedGame(address indexed gameAddress, address indexed player1, address indexed player2, uint previousChange);

    /// @dev Set the factory contract address. Only by owner.
    /// @param _factory Factory contract address.
    function setFactory(address _factory) external ifOwner{
        factory = _factory;
    }

    /// @dev Add a new game instance address to list. Only by the contract factory.
    /// @param _gameAddress game instance address.
    /// @param _actor Player1 address.
    /// @param _actor2 Player2 address.
    function setFactoryGame(address _gameAddress, address _actor, address _actor2) external ifFactory{
        gameList[_gameAddress] = true;
        changed[_actor] = block.number;
        emit CreatedGame(_gameAddress, _actor, _actor2, changed[_actor]);
    }

    /// @dev Set game instance owner. Game instance address set as owner.
    function setGameOwner() external ifFactoryGame{
        games[msg.sender].gameContract = msg.sender;
        emit GameOwnerSet(msg.sender, msg.sender, "Game address set.");
    }
    
    /// @dev Register game instance player.
    /// @param _player player address.
    /// @param _amount bet amount.
    /// @param _num player number.
    function setPlayer(address _player, uint _amount, uint _num) external ifGameOwner ifFactoryGame{
        if(_num == 1){games[msg.sender].player1 = _player;}
        if(_num == 2){games[msg.sender].player2 = _player;}
        games[msg.sender].potAmount = _amount * 2;
        playerGames[_player].push(msg.sender);
        emit PlayerSet(msg.sender, "Player set.");
    }

    /// @dev Register game instance winner.
    /// @param _player player address.
    function setWinner(address _player) external ifGameOwner ifFactoryGame{
        games[msg.sender].gameWinner = _player;
        emit WinnerSet(msg.sender, "Winner set.");
    }

    /// @dev Register game board.
    /// @param _player player address.
    /// @param _board player board.
    /// @param _num player number.
    function setPlayerBoard(address _player, uint8[100] _board, uint _num) external ifGameOwner ifFactoryGame{
        if(_num == 1){games[msg.sender].gamePlayerBoard1 = _board;}
        if(_num == 2){games[msg.sender].gamePlayerBoard2 = _board;}
        emit PlayerBoardSet(msg.sender, _player, "Player gameboard set.");
    }

    /// @dev Looks for player games.
    /// @param _player player address.
    /// @return an array of games.
    function getPlayerGames(address _player) external view returns(address[]){
        address[] storage list = playerGames[_player];
        return list;
    }

    /* fallback */
    function () public {
        revert();
    }
}