pragma solidity 0.4.24;

library Bytes {

    // Size of a word, in bytes.
    uint internal constant WORD_SIZE = 32;
    // Size of the header of a 'bytes' array.
    uint internal constant BYTES_HEADER_SIZE = 32;
    // Address of the free memory pointer.
    uint internal constant FREE_MEM_PTR = 0x40;

    /// @dev Converts string to bytes32 type.
    /// @param _string string data.
    /// @return string converted to bytes32.
    function stringToBytes32(string memory _string) internal pure returns (bytes32) {
        bytes memory temp = bytes(_string);
        bytes32 result;
        require(temp.length > 0, ", incorrect string lenght.");
        assembly {
            result := mload(add(_string, 32))
        }
        return result;
    }

    /// @dev Converts bytes32 to Address type.
    /// @param _bytes bytes32 hex data.
    /// @return left 20 bytes from input as address.
    function toAddress(bytes32 _bytes) internal pure returns (address) {
        require(_bytes.length == 32,", invalid conversion to Address");
        return address(bytes20(_bytes));
    }

    /// @dev Converts uint to bytes.
    /// @param _val uint value.
    function uintToBytes(uint256 _val) internal pure returns (bytes bts) {
        bts = new bytes(32);
        assembly { mstore(add(bts, 32), _val) }
    }

    /// @dev Adds extra 0 to match header.
    /// @param _bts bytes .
    /// @return the length of the provided bytes array.
    function fromBytes(bytes memory _bts) internal pure returns (uint addr, uint len) {
        len = _bts.length;
        assembly {
            addr := add(_bts, /*BYTES_HEADER_SIZE*/32)
        }
    }

    /// @dev Copy word-length chunks while possible
    /// @param _src input location .
    /// @param _dest destination loaction.
    /// @param _len input lenght.
    function copy(uint _src, uint _dest, uint _len) internal pure {

        for (; _len >= WORD_SIZE; _len -= WORD_SIZE) {
            assembly {
                mstore(_dest, mload(_src))
            }
            _dest += WORD_SIZE;
            _src += WORD_SIZE;
        }
        // Copy remaining bytes
        uint mask = 256 ** (WORD_SIZE - _len) - 1;
        assembly {
            let srcpart := and(mload(_src), not(mask))
            let destpart := and(mload(_dest), mask)
            mstore(_dest, or(destpart, srcpart))
        }
    }

    /// @dev Concatenate word-length chunks while possible
    /// @param _val input bytes .
    /// @param _val2 input bytes to add.
    /// @return concatenated bytes data.
    function concat(bytes memory _val, bytes memory _val2) internal pure returns (bytes result) {
        
        bytes memory ret = new bytes(_val.length + _val2.length);
        uint256 src;
        uint256 srcLen;
        uint256 src2;
        uint256 src2Len;
        uint256 dest;
        uint256 dest2;
        
        (src, srcLen) = fromBytes(_val);
        (src2, src2Len) = fromBytes(_val2);
        (dest,) = fromBytes(ret);
        dest2 = dest + src2Len;
        copy(src, dest, srcLen);
        copy(src2, dest2, src2Len);
        return ret;
    }
}