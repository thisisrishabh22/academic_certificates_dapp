// contracts/Certificates.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract Certificates {
    mapping(address => mapping(string => bool)) public certificates;

    function verifyCertificate(address student, string memory certificateHash) external view returns (bool) {
        return certificates[student][certificateHash];
    }

    function addCertificate(address student, string memory certificateHash) external {
        certificates[student][certificateHash] = true;
    }
}
