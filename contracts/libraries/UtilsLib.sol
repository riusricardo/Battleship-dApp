pragma solidity 0.4.24;

library UtilsLib {

    function stringToBytes32(string memory _string) internal pure returns (bytes32 result) {
        bytes memory temp = bytes(_string);
        require(temp.length > 0);

        assembly {
        result := mload(add(_string, 32))
        }
    }

    function splitSignature(bytes _sig) internal pure returns (uint8, bytes32, bytes32){
        require(_sig.length == 65);

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            // first 32 bytes, after the length prefix
            r := mload(add(_sig, 32))
            // second 32 bytes
            s := mload(add(_sig, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(_sig, 96)))
        }

        return (v, r, s);
    }

    function recoverSigner(bytes32 _message, bytes _sig) internal pure returns (address){
        require(_message.length == 32);
        uint8 v;
        bytes32 r;
        bytes32 s;
        
        bytes32 prefixed = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", _message));
        
        (v, r, s) = splitSignature(_sig);

        return ecrecover(prefixed, v, r, s);
    }
}
