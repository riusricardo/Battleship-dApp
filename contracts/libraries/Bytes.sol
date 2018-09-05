pragma solidity 0.4.24;

library Bytes {


    // Size of a word, in bytes.
    uint internal constant WORD_SIZE = 32;
    // Size of the header of a 'bytes' array.
    uint internal constant BYTES_HEADER_SIZE = 32;
    // Address of the free memory pointer.
    uint internal constant FREE_MEM_PTR = 0x40;

	function copy(uint src, uint dest, uint len) internal pure {
        // Copy word-length chunks while possible
        for (; len >= WORD_SIZE; len -= WORD_SIZE) {
            assembly {
                mstore(dest, mload(src))
            }
            dest += WORD_SIZE;
            src += WORD_SIZE;
        }

        // Copy remaining bytes
        uint mask = 256 ** (WORD_SIZE - len) - 1;
        assembly {
            let srcpart := and(mload(src), not(mask))
            let destpart := and(mload(dest), mask)
            mstore(dest, or(destpart, srcpart))
        }
    }

    // This function does the same as 'dataPtr(bytes memory)', but will also return the
    // length of the provided bytes array.
    function fromBytes(bytes memory bts) internal pure returns (uint addr, uint len) {
        len = bts.length;
        assembly {
            addr := add(bts, /*BYTES_HEADER_SIZE*/32)
        }
    }

    function toBytes(uint256 val) internal pure returns (bytes bts) {
        bts = new bytes(32);
        assembly { mstore(add(bts, 32), val) }
    }
    
    function concat(bytes memory self, bytes memory other) internal pure returns (bytes result) {
        
        bytes memory ret = new bytes(self.length + other.length);
        uint256 src;
        uint256 srcLen;
        uint256 src2;
        uint256 src2Len;
        uint256 dest;
        uint256 dest2;
        
        (src, srcLen) = fromBytes(self);
        (src2, src2Len) = fromBytes(other);
        (dest,) = fromBytes(ret);
        dest2 = dest + src2Len;
        copy(src, dest, srcLen);
        copy(src2, dest2, src2Len);
        return ret;
    }
}