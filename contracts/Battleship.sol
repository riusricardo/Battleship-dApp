pragma solidity 0.4.24;

import "@tokenfoundry/state-machine/contracts/StateMachine.sol";
import "./libraries/UtilsLib.sol";

contract Battleship is StateMachine {

    using UtilsLib for *;

    // Game states
    bytes32 constant STATE1 = "Create";
    bytes32 constant STATE2 = "Set";
    bytes32 constant STATE3 = "Play";
    bytes32 constant STATE4 = "GameOver";
    bytes32[] states = [STATE1, STATE2, STATE3, STATE4];

    address public owner;
    string public topic; // Whisper-channel topic
    address public player1;
    address public player2;
    address public currentPlayer;
    address public winner;
    uint8 public nonce;
    uint public betAmt;
    uint public timeout;
    mapping(address => address) public playerSigner;
    mapping(address => uint8[]) internal playerMoves;
    mapping(address => bytes32) internal hiddenBoards;
    mapping(address => uint8[]) internal playerBoard;
    mapping(address => uint8) internal hitsToPlayer;
    address internal ethrReg;// Ethr DID registry
    address internal gameReg;// Game registry
    uint internal timeoutInterval;
    


    constructor() public payable{
        owner = msg.sender;
        setupStates();
        player1 = address(0);
        player2 = address(0);
        winner = address(0);
        ethrReg = address(0);
        gameReg = address(0);
        currentPlayer = address(0);
        betAmt = 0;
        timeout = 2**256 - 1;
        timeoutInterval = 1800;

    }

    event ValidSigner(address player, address signer, bool result);
    event GameInitialized(address player);
    event JoinedGame(address player, string message);
    event StateChanged(string newState);
    event MoveMade(address currentPlayer, uint8 xy);
    event RevealedBoard(address Player, uint blockNum);
    event GameEnded(address winner);
    event TimeoutStarted();
    event BetClaimed(address player, uint amount);

    modifier ifPlayer() {
        require(msg.sender == player1 || msg.sender == player2, "Invalid Player");
        _;
    }
    
    modifier ifOwner() {
        if(msg.sender == owner) {
            _;
        } else {
            revert("Not owner");
        }
    }
    
    /// @dev Get the final revealed board.
    /// @param _player The address of the selected player..
    /// @return Board array.
    function getPlayerMoves(address _player) external returns(uint8[]){
        uint8[] storage board = playerMoves[_player];
        return board;
    }

    /// @dev Get the final revealed board.
    /// @param _player The address of the selected player..
    /// @return Board array.
    function getPlayerBoard(address _player) external returns(uint8[]){
        uint8[] storage board = playerBoard[_player];
        return board;
    }

    /// @dev Set the Ethr DID registry for identity management.
    /// @param _ethrReg The address of the Ethr DID registry.
    function setEthReg(address _ethrReg) public ifOwner{
        require(ethrReg == address(0), "Registry already set.");
        ethrReg = _ethrReg;
    }    
    
    /// @dev Set the Game registry to store game stats.
    /// @param _gameReg The address of the Game registry.
    function setGameReg(address _gameReg) public ifOwner{
        require(gameReg == address(0), "Registry already set.");
        gameReg = _gameReg;
    }

    /// @dev Claim bet if the player is the  winner. By expired timeout or moves.
    function claimBet() public checkAllowed ifPlayer {
        require(player2 != address(0), "Game has not started.");
        
        if(block.timestamp >= timeout && msg.sender == opponent(currentPlayer)){
            winner = opponent(currentPlayer);
            require(gameReg.call(bytes4(keccak256("setWinner(address)")), abi.encode(winner)));
        }
        
        if(msg.sender == winner)
        {
            winner.transfer(address(this).balance);
            emit BetClaimed(msg.sender, betAmt * 2);
        } else {
            revert("You are a loser :( ");
        }
    }

    /// @dev Join the game and set the bet. Player 1 is set by factory contract. 
    /// @dev Player 2 can join later or be set at creation time.
    /// @param _playerA Player 1 address.
    /// @param _playerB Player 2 address.
    /// @param _topic Whisper-channel topic.
    function joinGame(address _playerA, address _playerB, string _topic) public payable checkAllowed {
        require(gameReg != address(0), "Game registry not set.");
        require(_playerA != owner && _playerB != owner, "The Factory cannot play.");
        require(msg.value >= betAmt,"Invalid bet amount.");
        
        // The Factory is the contract owner and cannot register as player.
        if( _playerA != address(0) && player1 == address(0) && msg.sender == owner){
            player1 = _playerA;
            topic = _topic;
            betAmt = msg.value;
            require(gameReg.call(bytes4(keccak256("setGameOwner()")))); //Set the contract address as game owner.
            require(gameReg.call(bytes4(keccak256("setPlayer(address,uint256,uint256)")), abi.encode(player1,msg.value,1)));
            emit JoinedGame(player1, "Player1");
        }

        // Validate if _playerB parameter is set.
        if( _playerB != address(0) && player2 == address(0) && _playerB != player1){
            player2 = _playerB;
            require(gameReg.call(bytes4(keccak256("setPlayer(address,uint256,uint256)")), abi.encode(player2,msg.value,2)));
        }

        hiddenBoards[msg.sender] = bytes32(0);
        playerSigner[msg.sender] = address(0);
        hitsToPlayer[msg.sender] = 0;

        // Join as player 2 if not set in parameter, place the correct bet.
        if(player2 == address(0) && msg.sender != player1 && msg.sender != owner){
            require(msg.value == betAmt, "Wrong bet amount.");
            player2 = msg.sender;
        }

        // Player 2 was passed as parameter without bet.
        if(msg.sender == player2){
            require(msg.value == betAmt, "Wrong bet amount.");
            currentPlayer = player2;
            require(gameReg.call(bytes4(keccak256("setPlayer(address,uint256,uint256)")), abi.encode(player2,msg.value,2)));
            emit JoinedGame(msg.sender, "Player2");   
        } 

        // If not a VIP identity, get out.
        if( !(msg.sender == owner || msg.sender == player1 || msg.sender == player2)){
            revert("Invalid Player");
        } 
    }

    /// @dev Set the hash of your board.
    /// @param _boardHash The player's grid hash.
    /// @param _sig Message signature to get signer.
    function setHiddenBoard(bytes32 _boardHash, bytes _sig) public checkAllowed ifPlayer {
        require(_boardHash != bytes32(0) && _sig.length == 65);
        require(hiddenBoards[msg.sender] == bytes32(0) || playerSigner[msg.sender] == address(0));
        
        //Get signer delegate from board signature.
        address signer = UtilsLib.recoverSigner(_boardHash, _sig); // Board hash is keccak256(board[], secret, gameAddress)
        
        //isValidDelegate(msg.sender, UtilsLib.stringToBytes32('Secp256k1VerificationKey2018'), signer);
        isValidDelegate(msg.sender, hex"766572694b657900000000000000000000000000000000000000000000000000", signer);
        hiddenBoards[msg.sender] = _boardHash;
    }

    /// @dev Play on-chain.
    /// @param _xy Coordinates in the X and Y planes.
    /// @param _nonce Game moves sequence nonce.
    function move(uint8 _xy, uint8 _nonce) public checkAllowed ifPlayer {
        require(_xy >= 0 && _xy <= 99,"Out of range.");
        require(nonce >= 0 && nonce <= 200, "Incorrect sequence number.");
        require(_nonce == nonce && _nonce >= 0, "Incorrect sequence number.");
        
        playerMoves[msg.sender].push(_xy);
        currentPlayer = opponent(msg.sender);
        nonce += 1;
        
        // Reset timeout
        timeout = 2**256 - 1;

        if(nonce >= 199){
            claimWin();
        }
        emit MoveMade(msg.sender,_xy);
    }

    /// @dev Reveal board.
    /// @param _board The player's board.
    /// @param _sig Message signature to get signer.
    function revealBoard(uint8[] _board, bytes _sig, bytes4 _secret) public checkAllowed ifPlayer {
        require(_sig.length == 65 && _secret != bytes4(0));
        require(hiddenBoards[msg.sender] != bytes32(0) && playerSigner[msg.sender] != address(0));
        
        bytes32 hash = keccak256(abi.encodePacked(_board, _secret, address(this)));
        address signer = UtilsLib.recoverSigner(hash, _sig); //Get signer delegate from board signature.
        require(signer == playerSigner[msg.sender], "Invalid signer.");

        for(uint8 i = 0; i < 100; i++){
            playerBoard[msg.sender].push(_board[i]);
        }
        emit RevealedBoard(msg.sender, block.timestamp);
    }
    
    /// @dev Claim player as winner. Boards need to be revealed.
    function claimWin() public checkAllowed ifPlayer {
        uint8[] storage tmpBoard = playerBoard[msg.sender];
        uint size = tmpBoard.length; 
        uint8 requiredToWin = 20;

        
        
        if(hitsToPlayer[opponent(msg.sender)] == requiredToWin){
            winner = msg.sender;
            require(gameReg.call(bytes4(keccak256("setWinner(address)")), abi.encode(winner)));
            
        }
    }

    /// @dev Start timeout in case of game halt.
    function startTimeout() public  checkAllowed ifPlayer {
        require(currentPlayer == opponent(msg.sender),"Cannot start timeout.");
        timeout = block.timestamp + timeoutInterval;
        emit TimeoutStarted();
    }

    /// @dev Allow functions in the given state. From StateMachine@TokenFoundry.
    function setupStates() internal {
        setStates(states);

        allowFunction(STATE1, this.joinGame.selector);      //"Create"
        allowFunction(STATE2, this.setHiddenBoard.selector);//"Set"
        allowFunction(STATE3, this.move.selector);          //"Play"
        allowFunction(STATE3, this.claimWin.selector);      //"Play"
        allowFunction(STATE3, this.startTimeout.selector);  //"Play"
        allowFunction(STATE3, this.revealBoard.selector);   //"Play"
        allowFunction(STATE4, this.claimBet.selector);      //"GameOver"

        addStartCondition(STATE2, verifyPlayers);           //"Set"
        addStartCondition(STATE3, verifyBoard);             //"Play"
        addStartCondition(STATE4, verifyRevealedBoards);    //"GameOver"        
        addStartCondition(STATE4, verifyWinner);            //"GameOver"
        addStartCondition(STATE4, verifyTimeout);           //"GameOver"

    }

    /// @dev Verify player conditions to transition to next state.
    /// @return If conditions met returns true.
    function verifyPlayers(bytes32) internal returns(bool){
        if(currentPlayer == player2 && player1 != address(0) && player2 != address(0)){
            emit StateChanged("Set");
            return true;
        } else {
            return false;
        }
    }

    /// @dev Verify boards ready conditions to transition to next state.
    /// @return If conditions met returns true.
    function verifyBoard(bytes32) internal returns(bool){
        if( hiddenBoards[player1] != bytes32(0) 
            && hiddenBoards[player2] != bytes32(0)
            && playerSigner[player1] != address(0)
            && playerSigner[player2] != address(0)
        ){
            emit GameInitialized(msg.sender);
            emit StateChanged("Play");
            return true;
        }else{
            return false;
        }
    }

    /// @dev Verify revealed boards conditions to transition to next state.
    /// @return If conditions met returns true. 
    function verifyRevealedBoards(bytes32) internal returns(bool){
        if(playerBoard[player1].length == 100 && playerBoard[player2].length == 100){
            emit StateChanged("GameOver");
            emit GameEnded(winner);
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
        require(player2 != address(0), "Game has not started.");
        if (_player == player1) {
            return player2;
        } else if (_player == player2) {
            return player1;
        } else {
            revert("Invalid player.");
        }
    }

    /// @dev Verifies if the signer delegate is valid in the Ethr DID registry.
    /// @dev Similar to registry.call(bytes4(keccak256("validDelegate(address,bytes32,address)")), abi.encode(_identity, _delegateType, _delegate))
    /// @param _identity The address owner.
    /// @param _delegateType Type of delegate. Signer -> bytes32 of Secp256k1VerificationKey2018.
    /// @param _delegate The address of the signer delegate.
    function isValidDelegate(address _identity, bytes32 _delegateType, address _delegate) internal ifPlayer{
        require(ethrReg != address(0), "Ethr registry not set.");
        require(_identity != address(0) && _delegateType != bytes32(0) && _delegate != address(0),"Invalid input.");
        bool result;
        bytes4 sig = bytes4(keccak256("validDelegate(address,bytes32,address)"));
        assembly {
            // Move pointer to free memory spot.
            let ptr := mload(0x40)
            // Put function sig at memory spot.
            mstore(ptr,sig)
            // Append arguments after function signature.
            mstore(add(ptr,0x04), _identity)
            mstore(add(ptr,0x24), _delegateType)
            mstore(add(ptr,0x44), _delegate)
            let success := call(
              4000, // Gas limit.
              sload(ethrReg_slot), // Append _slot to access Ethr DID registry storage.
              0, // No ether tansfer.
              ptr, // Inputs are stored at location ptr.
              0x64, // Sum of all inputs is 100 bytes long.
              ptr,  //Store output over input.
              0x20) //Outputs are 32 bytes long.
            if eq(success, 0) {
                revert(0, 0)
            }
            result := mload(ptr) // Assign output to result var
            mstore(0x40,add(ptr,0x64)) // Set storage pointer to new space
        }  
        if(result){
            playerSigner[_identity] = _delegate;
            emit ValidSigner(_identity, _delegate, result);
        } else {
            revert("Invalid signer.");
        }
	}
    /* fallback */
    function () public {
        revert();
    }
}