// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract Certificates {
    struct CertificateInfo {
        string imageCID;
        string fileName; // Added field to store the filename
    }

    mapping(address => mapping(string => CertificateInfo)) public certificates;
    mapping(address => string[]) public studentCertificates;

    function verifyCertificate(
        address student,
        string memory certificateHash
    ) external view returns (bool) {
        return bytes(certificates[student][certificateHash].imageCID).length > 0;
    }

    event CertificateAdded(
        address student,
        string certificateHash,
        string imageCID,
        string fileName
    );

    function addCertificate(
        address student,
        string memory certificateHash,
        string memory imageCID,
        string memory fileName
    ) external {
        certificates[student][certificateHash] = CertificateInfo({
            imageCID: imageCID,
            fileName: fileName
        });

        studentCertificates[student].push(certificateHash);

        emit CertificateAdded(student, certificateHash, imageCID, fileName);
    }

    function fetchStudentCertificates(
        address student
    ) external view returns (CertificateInfo[] memory) {
        uint256 length = studentCertificates[student].length;
        CertificateInfo[] memory result = new CertificateInfo[](length);

        for (uint256 i = 0; i < length; i++) {
            string memory certificateHash = studentCertificates[student][i];
            result[i] = certificates[student][certificateHash];
        }

        return result;
    }
}
