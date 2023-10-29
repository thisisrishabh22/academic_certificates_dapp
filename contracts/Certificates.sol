// contracts/Certificates.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract Certificates {
    mapping(address => mapping(string => bool)) public certificates;

    function verifyCertificate(
        address student,
        string memory certificateHash
    ) external view returns (bool) {
        return certificates[student][certificateHash];
    }

    function addCertificate(
        address student,
        string memory certificateHash
    ) external {
        certificates[student][certificateHash] = true;
    }

    function fetchCertificates(
        address student
    ) external view returns (string[] memory) {
        string[] memory hashes = new string[](100); // Assuming a maximum of 100 certificates per student

        uint256 count = 0;
        for (uint256 i = 0; i < 100; i++) {
            bytes32 hash = keccak256(abi.encodePacked(student, i));
            if (certificates[student][bytes32ToString(hash)]) {
                hashes[count] = bytes32ToString(hash);
                count++;
            }
        }

        string[] memory result = new string[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = hashes[i];
        }
        return result;
    }

    function bytes32ToString(
        bytes32 _bytes32
    ) internal pure returns (string memory) {
        uint8 i = 0;
        while (i < 32 && _bytes32[i] != 0) {
            i++;
        }
        bytes memory bytesArray = new bytes(i);
        for (i = 0; i < 32 && _bytes32[i] != 0; i++) {
            bytesArray[i] = _bytes32[i];
        }
        return string(bytesArray);
    }
}
