// contracts/Certificates.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract Certificates {
    mapping(address => mapping(string => bool)) public certificates;
    mapping(address => string[]) public studentCertificates;

    function verifyCertificate(
        address student,
        string memory certificateHash
    ) external view returns (bool) {
        return certificates[student][certificateHash];
    }

    event CertificateAdded(address student, string certificateHash);

    function addCertificate(
        address student,
        string memory certificateHash
    ) external {
        certificates[student][certificateHash] = true;
        studentCertificates[student].push(certificateHash);
        emit CertificateAdded(student, certificateHash);
    }

    function fetchStudentCertificates(
        address student
    ) external view returns (string[] memory) {
        return studentCertificates[student];
    }
}
