pragma solidity 0.4.24;

import "./libraries/openzeppelin/migrations/Initializable.sol";
import "./libraries/tokenfoundry/StateMachine.sol";
import "./libraries/openzeppelin/ECRecovery.sol";
import "./libraries/Bytes.sol";

/// @title Battleship game over state channels.
/// @author Ricardo Rius  - <ricardo@rius.info>
contract Battleship is StateMachine,Initializable {

    using ECRecovery for bytes32;

    // GAME STATES
    bytes32 constant STATE1 = "Create";
    bytes32 constant STATE2 = "Set";
    bytes32 constant STATE3 = "Play";
    bytes32 constant STATE4 = "GameOver";
    bytes32[] states = [STATE1, STATE2, STATE3, STATE4];

    // FUNCTION SIGNATURES
    bytes4 private constant REGISTRY_PLAYERS_FSIG = bytes4(keccak256("setPlayer(address,uint256,uint256)"));
    bytes4 private constant REGISTRY_GAME_OWNER_FSIG = bytes4(keccak256("setGameOwner()"));    
    bytes4 private constant REGISTRY_WINNER_FSIG = bytes4(keccak256("setWinner(address)"));

    // STATE VARIABLES
    address public owner;
    address public player1;
    address public player2;
    address public playerTurn;
    address public winner;
    uint public nonce;
    uint public betAmt;
    uint public timeout;
    mapping(address => address) public playerSigner;
    mapping(address => bytes32) internal hiddenShips;
    mapping(address => uint[]) internal playerShips;
    mapping(address => uint[]) internal playerMoves;
    mapping(address => uint[]) internal hitsToPlayer;
    mapping(address => uint[]) internal notHitsToPlayer;
    mapping(address => bytes4) internal secret;
    address internal ethrReg;// Ethr DID Registry
    address internal gameReg;// Game Registry
    string internal topic;   // Whisper Channel Topic
    uint internal timeoutInterval;
    bool internal fairGame;
    
    /// @dev Initializing variables here and in the Initialize function. 
    constructor() public {
        owner = msg.sender;
        setupStates();
        player1 = address(0);
        player2 = address(0);
        winner = address(0);
        ethrReg = address(0);
        gameReg = address(0);
        playerTurn = address(0);
        betAmt = 0;
        timeout = 2**256 - 1;
        timeoutInterval = 1 days;
        fairGame = false;
    }

    // EVENTS
    event ValidSigner(address player, address signer, bool result);
    event JoinedGame(address player, string message);
    event StateMove(address player, uint shot);
    event StateChanged(string newState);
    event RevealedBoard(address player, uint blockNum);
    event GameEnded(address winner);
    event TimeoutStarted(uint timestamp);
    event TimeoutReseted(uint timestamp);
    event BetClaimed(address player, uint amount, uint timestamp);

    // MODIFIERS
    modifier ifPlayer() {
        require(player1 != address(0) && player2 != address(0),", players not set.");
        require(msg.sender == player1 || msg.sender == player2, ", not a valid player.");
        _;
    }
    
    modifier ifOwner() {
        if(msg.sender == owner) {
            _;
        } else {
            revert(", not game contract owner.");
        }
    }

    /*
    EXTERNAL FUNCTIONS
    */
    /// @dev Get the final revealed board.
    /// @param _player The address of the selected player.
    /// @return Board array.
    function getPlayerShips(address _player) external view returns(uint[]){
        uint[] storage board = playerShips[_player];
        return board;
    }

    /// @dev Get topic for whisper channel if joined as player. 
    /// @return String topic.
    function getTopic() external view ifPlayer returns(string){
        return topic;
    }

    /// @dev Initialize registries addresses.
    /// @param _ethrReg The address of the Ethr DID registry.
    /// @param _gameReg The address of the Game registry.
    function initialize(address _ethrReg, address _gameReg) external isInitializer ifOwner{
        require(gameReg == address(0) && ethrReg == address(0), ", registry already set.");
        ethrReg = _ethrReg;
        gameReg = _gameReg;
    }

    /// @dev Claim bet if the player is the  winner. By expired timeout or moves.
    function claimBet() external checkAllowed ifPlayer {
        
        if(block.timestamp >= timeout && msg.sender == opponent(playerTurn)){
            winner = opponent(playerTurn);
            require(gameReg.call(REGISTRY_WINNER_FSIG, abi.encode(winner)));
        }
        
        if(msg.sender == winner)
        {
            winner.transfer(address(this).balance);
            emit BetClaimed(msg.sender, address(this).balance,  block.timestamp);
        } else {
            revert("... You are a loser :( ");
        }
    }

    /*
    PUBLIC FUNCTIONS
    */
    /// @dev Fallback function
    function () public {
        revert();
    }

    /// @dev Join the game and set the bet. Player 1 is set by factory contract. 
    /// @dev Player 2 can join later or be set at creation time.
    /// @param _playerA Player 1 address.
    /// @param _playerB Player 2 address.
    /// @param _topic Whisper-channel topic.
    function joinGame(address _playerA, address _playerB, string _topic) public payable checkAllowed {
        require(gameReg != address(0), ", game registry not set.");
        require(_playerA != owner && _playerB != owner, ", factory contract cannot play.");
        require(msg.value >= betAmt,", invalid bet amount.");
        
        // The Factory is the contract owner and cannot register as player.
        if( _playerA != address(0) && player1 == address(0) && msg.sender == owner){
            player1 = _playerA;
            topic = _topic;
            betAmt = msg.value;

            // Set the contract address as game owner.
            require(gameReg.call(REGISTRY_GAME_OWNER_FSIG));
            // Set player1 in registry.
            require(gameReg.call(REGISTRY_PLAYERS_FSIG, abi.encode(player1,msg.value,1)));
            emit JoinedGame(player1, "Player1");
        }

        // Validate if _playerB parameter is set.
        if( _playerB != address(0) && player2 == address(0) && _playerB != player1){
            player2 = _playerB;
            require(gameReg.call(REGISTRY_PLAYERS_FSIG, abi.encode(player2,msg.value,2)));
        }

        hiddenShips[msg.sender] = bytes32(0);
        playerSigner[msg.sender] = address(0);

        // Join as player 2 if not set in parameter, place the correct bet.
        if(player2 == address(0) && msg.sender != player1 && msg.sender != owner){
            require(msg.value == betAmt, ", player2 incorrect bet amount.");
            player2 = msg.sender;
        }

        // Player 2 was passed as parameter without bet.
        if(msg.sender == player2){
            require(msg.value == betAmt, ", player2 incorrect bet amount.");
            playerTurn = player2;
            require(gameReg.call(REGISTRY_PLAYERS_FSIG, abi.encode(player2,msg.value,2)));
            emit JoinedGame(msg.sender, "Player2");   
        } 

        // If not a VIP identity, get out.
        if( !(msg.sender == owner || msg.sender == player1 || msg.sender == player2)){
            revert(", not a VIP identity.");
        } 
    }

    /// @dev Set the hash of your board.
    /// @param _shipsHash The player's grid hash.
    /// @param _sig Message signature to get signer.
    function setHiddenShips(bytes32 _shipsHash, bytes _sig) public checkAllowed ifPlayer {
        require(_shipsHash != bytes32(0) && _sig.length == 65);
        require(hiddenShips[msg.sender] == bytes32(0) || playerSigner[msg.sender] == address(0));
        
        //Get signer delegate from board signature. _shipsHash is keccak256(board[], secret, gameAddress)
        address signer = ECRecovery.recover(_shipsHash.toEthSignedMessageHash(),_sig);

        //Validate signer delegate from Ethr registry. Secp256k1VerificationKey2018 -> "veriKey"
        bool result = isValidDelegate(msg.sender, "veriKey", signer, ethrReg); 
        require(result == true, ", not a valid ethr signer delegate.");
        emit ValidSigner(msg.sender, signer, result);

        hiddenShips[msg.sender] = _shipsHash;
        playerSigner[msg.sender] = signer;
    }

    /// @dev Used to start timeout or recreate game history for last dispute resolution. State moves need to be ordered by nonce.
    /// @param _xy player's move.
    /// @param _nonce sequence of game moves.
    /// @param _sig player's signature.
    /// @param _replySig opponent's signature on agreed player's move.
    function stateMove(uint _xy, uint _nonce,  address _nextTurn, bytes _sig, bytes _replySig) public checkAllowed ifPlayer {
        require(_sig.length == 65 && _replySig.length == 65,", incorrect signature size");
        require(_xy >= 0 && _xy <= 99,", out of range shot.");
        require(_nonce == nonce, ", incorrect nonce number.");
        require(_nonce >= 0 && _nonce <= 200, ", out of range nonce.");

        address player;
        bytes32 hash = keccak256(abi.encodePacked(_xy, _nonce, address(this)));
        address signer = ECRecovery.recover(hash.toEthSignedMessageHash(), _sig); 

        if(signer == playerSigner[player1]){
            player = player1;
        }else if(signer == playerSigner[player2]){
            player = player2;
        }else {
            revert(", invalid signer.");
        }

        bytes32 replyHash = keccak256(abi.encodePacked(hash, _nonce, _nextTurn, address(this)));
        address replySigner = ECRecovery.recover(replyHash.toEthSignedMessageHash(), _replySig); 
        require(replySigner == playerSigner[opponent(player)], ", invalid replySigner.");

        nonce = _nonce + 1;
        playerTurn = _nextTurn;

        if(msg.sender == opponent(playerTurn)){ 
            startTimeout();
        }else{
            resetTimeout();
        }
        playerMoves[player].push(_xy);

        emit StateMove(player, _xy);

    }

    /// @dev Reveal my board.
    /// @param _ships The player's board.
    /// @param _secret Player's secret.
    function revealMyBoard(uint[] _ships, uint[] _hits, uint[] _notHits, bytes4 _secret) public checkAllowed ifPlayer {
        require(_ships.length == 20,", incorrect ships input lenght.");
        require(_hits.length > 0 && _hits.length <= 20 && _notHits.length > 0 && _notHits.length <= 80,", incorrect revealed board size.");
        require(_secret != bytes4(0), ", incorrect secret type.");
        require(hiddenShips[msg.sender] != bytes32(0) && playerSigner[msg.sender] != address(0));
        require(hiddenShips[opponent(msg.sender)] != bytes32(0) && playerSigner[opponent(msg.sender)] != address(0));
        
        //Hash inputs to recreate hidden board.
        bytes32 hash = keccak256(abi.encodePacked(_ships, _secret, address(this)));
        require(hash == hiddenShips[msg.sender], ", invalid revealed board.");

        secret[msg.sender] == _secret;

        uint i;
        for(i = 0; i < 20; i++){
            playerShips[msg.sender].push(_ships[i]);
        }
        // _hits length > 0 and <= 20
        for(i = 0; i < _hits.length; i++){
            hitsToPlayer[msg.sender].push(_hits[i]);
        }
        // _notHits length > 0 and <= 80
        for(i = 0; i < _notHits.length; i++){
            notHitsToPlayer[msg.sender].push(_notHits[i]);
        }

        emit RevealedBoard(msg.sender, block.timestamp);
    }

    /// @dev Reveal played board.
    function revealOtherBoard(uint[] _hits, uint[] _notHits) public checkAllowed ifPlayer {
        require(_hits.length > 0 && _hits.length <= 20 && _notHits.length > 0 && _notHits.length <= 80,", incorrect revealed board size.");
        require(hiddenShips[msg.sender] != bytes32(0) && playerSigner[msg.sender] != address(0));
        require(hiddenShips[opponent(msg.sender)] != bytes32(0) && playerSigner[opponent(msg.sender)] != address(0));

        address playerAddrHash = Bytes.toAddress(keccak256(abi.encodePacked(msg.sender)));
        uint i;
        // _hits length > 0 and <= 20
        for(i = 0; i < _hits.length; i++){
            hitsToPlayer[playerAddrHash].push(_hits[i]);
        }
        // _notHits length > 0 and <= 80
        for(i = 0; i < _notHits.length; i++){
            notHitsToPlayer[playerAddrHash].push(_notHits[i]);
        }

        emit RevealedBoard(playerAddrHash, block.timestamp);
    }
    
    /// @dev Claim victory. Boards need to be revealed and match. Use stateMove in case of cheaters.
    function claimVictory() public checkAllowed ifPlayer {
        uint[] storage Board1 = playerShips[msg.sender];
        uint[] storage Board2 = playerShips[opponent(msg.sender)];
        require(Board1.length == 20 && Board2.length == 20,", invalid revealed board size.");
        uint requiredToWin = 20;
        address player;
        address playerOpponentHash;
        
        playerOpponentHash = Bytes.toAddress(keccak256(abi.encodePacked(opponent(player1))));
        bytes32 hash1 = keccak256(abi.encodePacked(hitsToPlayer[player1]));
        bytes32 hash2 = keccak256(abi.encodePacked(hitsToPlayer[playerOpponentHash]));
        bytes32 hash3 = keccak256(abi.encodePacked(notHitsToPlayer[player1]));
        bytes32 hash4 = keccak256(abi.encodePacked(notHitsToPlayer[playerOpponentHash]));

        playerOpponentHash = Bytes.toAddress(keccak256(abi.encodePacked(opponent(player2))));
        bytes32 hash5 = keccak256(abi.encodePacked(hitsToPlayer[player2]));
        bytes32 hash6 = keccak256(abi.encodePacked(hitsToPlayer[playerOpponentHash]));
        bytes32 hash7 = keccak256(abi.encodePacked(notHitsToPlayer[player2]));
        bytes32 hash8 = keccak256(abi.encodePacked(notHitsToPlayer[playerOpponentHash]));

        if((hash1 == hash2) && (hash3 == hash4) && (hash5 == hash6) && (hash7 == hash8)){
            fairGame = true;
        } else{
            fairGame = false;
        }

        //hitsToPlayer[opponent(msg.sender)].lenght == requiredToWin;
        //winner = msg.sender;
        //require(gameReg.call(bytes4(keccak256("setWinner(address)")), abi.encode(winner)));
    
        
    }

    /*
    INTERNAL FUNCTIONS
    */
    /// @dev Start timeout in case of game halt.
    function startTimeout() internal ifPlayer {
        timeout = block.timestamp + timeoutInterval;
        emit TimeoutStarted(block.timestamp);
    }

    /// @dev Set timeout to initial state.
    function resetTimeout() internal ifPlayer {
        timeout = 2**256 - 1;
        emit TimeoutReseted(block.timestamp);
    }

    /// @dev Allow functions in the given state.
    function setupStates() internal {
        setStates(states);

        allowFunction(STATE1, this.joinGame.selector);        //"Create"
        allowFunction(STATE2, this.setHiddenShips.selector);  //"Set"
        allowFunction(STATE3, this.stateMove.selector);       //"Play"
        allowFunction(STATE3, this.revealMyBoard.selector);   //"Play"
        allowFunction(STATE4, this.stateMove.selector);       //"GameOver"
        allowFunction(STATE4, this.revealMyBoard.selector);   //"GameOver"
        allowFunction(STATE4, this.revealOtherBoard.selector);//"GameOver"
        allowFunction(STATE4, this.claimVictory.selector);    //"GameOver"
        allowFunction(STATE4, this.claimBet.selector);        //"GameOver"

        addStartCondition(STATE2, verifyPlayers);         //"Set"
        addStartCondition(STATE3, verifyBoard);           //"Play"
        addStartCondition(STATE4, verifyRevealedBoards);  //"GameOver"        
        addStartCondition(STATE4, verifyWinner);          //"GameOver"
        addStartCondition(STATE4, verifyTimeout);         //"GameOver"

    }

    /// @dev Verify player conditions to transition to next state.
    /// @return If conditions met returns true.
    function verifyPlayers(bytes32) internal returns(bool){
        if(playerTurn == player2 && player1 != address(0) && player2 != address(0)){
            emit StateChanged("Set");
            return true;
        } else {
            return false;
        }
    }

    /// @dev Verify boards ready conditions to transition to next state.
    /// @return If conditions met returns true.
    function verifyBoard(bytes32) internal returns(bool){
        if( hiddenShips[player1] != bytes32(0) 
            && hiddenShips[player2] != bytes32(0)
            && playerSigner[player1] != address(0)
            && playerSigner[player2] != address(0)
        ){
            emit StateChanged("Play");
            return true;
        }else{
            return false;
        }
    }

    /// @dev Verify revealed boards conditions to transition to next state.
    /// @return If conditions met returns true. 
    function verifyRevealedBoards(bytes32) internal returns(bool){
        if(playerShips[player1].length > 0 || playerShips[player2].length > 0){
            emit StateChanged("GameOver");
            return true;
        }else {
            return false;
        }
    }

    /// @dev Verify winner player conditions to transition to next state.
    /// @return If conditions met returns true. 
    function verifyWinner(bytes32) internal returns(bool){
        if(winner != address(0)){
            emit StateChanged("GameOver");
            emit GameEnded(winner);
            return true;
        }else {
            return false;
        }
    }

    /// @dev Verify timeout to finalize game.
    /// @return If conditions met returns true.
    function verifyTimeout(bytes32) internal returns(bool){
        if(block.timestamp >= timeout){
            emit StateChanged("GameOver");
            return true;
        }else {
            return false;
        }
    }

    /// @dev Get the opponent player.
    /// @param _player The address of the selected player to find out who the opponent is.
    /// @return Address of the opponent player.
    function opponent(address _player) internal view returns (address) {
        require(player2 != address(0), ", game has not started.");
        if (_player == player1) {
            return player2;
        } else if (_player == player2) {
            return player1;
        } else {
            revert(", invalid opponent player.");
        }
    }

    /// @dev Verifies if the signer delegate is valid in the Ethr DID registry.
    /// @param _identity The address owner.
    /// @param _delegateType Type of delegate. Signer -> Secp256k1VerificationKey2018 -> bytes32("veriKey").
    /// @param _delegate The address of the signer delegate.
    /// @param _registry The address of the Ethr DID registry.
    function isValidDelegate(
        address _identity, 
        string _delegateType, 
        address _delegate, 
        address _registry
    ) internal ifPlayer view returns(bool result){
        require(ethrReg != address(0), ", ethr registry not set.");
        require(_identity != address(0) && bytes(_delegateType).length > 0 && _delegate != address(0),", invalid delegate input.");
        bytes memory data = abi.encodeWithSignature("validDelegate(address,bytes32,address)", _identity, Bytes.stringToBytes32(_delegateType), _delegate);
        /* solium-disable-next-line security/no-inline-assembly */
        assembly {
            let ptr := mload(0x40)
            let success := staticcall(sub(gas, 3800), _registry, add(data, 0x20), mload(data), ptr, 0x20)
            if eq(success, 0) {
                revert(0, 0)
            }
            result := mload(ptr)
        } 
    }    
}
