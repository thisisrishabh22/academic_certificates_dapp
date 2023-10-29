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

    await certificatesInstance.addCertificate(student, certificateHash, certificateCID);
  });

  it('should verify certificates', async () => {
    const student = accounts[0];
    const certificateCID = 'certificate123';
    const certificateHash = 'certificateHash123';

    await certificatesInstance.addCertificate(student, certificateHash, certificateCID);

    const isCertificateValid = await certificatesInstance.verifyCertificate(student, certificateHash);
    assert.equal(isCertificateValid, true, 'Certificate should be valid');
  });

  it('should fetch certificate CIDs for a student', async () => {
    const student = accounts[0];
    const certificateCID1 = 'certificate456';
    const certificateHash1 = 'certificateHash456';
    const certificateCID2 = 'certificate789';
    const certificateHash2 = 'certificateHash789';

    await certificatesInstance.addCertificate(student, certificateHash1, certificateCID1);
    await certificatesInstance.addCertificate(student, certificateHash2, certificateCID2);
    const expectedCertificates = [certificateCID1, certificateCID2];

    const fetchedCertificates = await certificatesInstance.fetchStudentCertificates(student);

    assert.deepEqual(fetchedCertificates, expectedCertificates, 'Certificate CIDs should match');
  });
});
