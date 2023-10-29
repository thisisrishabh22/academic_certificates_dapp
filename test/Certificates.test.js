const Certificates = artifacts.require('Certificates');

contract('Certificates', (accounts) => {
  let certificatesInstance;

  beforeEach(async () => {
    certificatesInstance = await Certificates.new();
  });

  it('should add certificates', async () => {
    const student = accounts[0];
    const certificateCID = 'certificate123';
    const certificateHash = 'certificateHash123';
    const fileName = 'certificate123.jpg';

    await certificatesInstance.addCertificate(student, certificateHash, certificateCID, fileName);
    const certificateInfo = await certificatesInstance.certificates(student, certificateHash);

    assert.equal(certificateInfo.imageCID, certificateCID, 'Image CID should match');
    assert.equal(certificateInfo.fileName, fileName, 'File name should match');
  });

  it('should verify certificates', async () => {
    const student = accounts[0];
    const certificateCID = 'certificate123';
    const certificateHash = 'certificateHash123';
    const fileName = 'certificate123.jpg';

    await certificatesInstance.addCertificate(student, certificateHash, certificateCID, fileName);

    const isCertificateValid = await certificatesInstance.verifyCertificate(student, certificateHash);
    assert.equal(isCertificateValid, true, 'Certificate should be valid');
  });

  it('should fetch certificate info for a student', async () => {
    const student = accounts[0];
    const certificateCID1 = 'certificate456';
    const certificateHash1 = 'certificateHash456';
    const fileName1 = 'certificate456.jpg';
    const certificateCID2 = 'certificate789';
    const certificateHash2 = 'certificateHash789';
    const fileName2 = 'certificate789.jpg';

    await certificatesInstance.addCertificate(student, certificateHash1, certificateCID1, fileName1);
    await certificatesInstance.addCertificate(student, certificateHash2, certificateCID2, fileName2);

    const expectedCertificates = [
      { imageCID: certificateCID1, fileName: fileName1 },
      { imageCID: certificateCID2, fileName: fileName2 }
    ];

    const fetchedCertificates = await certificatesInstance.fetchStudentCertificates(student);

    const formattedFetchedCertificates = fetchedCertificates.map(certificate => {
      return {
        imageCID: certificate[0],
        fileName: certificate[1]
      }
    });

    assert.deepEqual(formattedFetchedCertificates, expectedCertificates, 'Certificate info should match');
  });
});
