const Certificates = artifacts.require('Certificates');

contract('Certificates', (accounts) => {
  let certificatesInstance;

  beforeEach(async () => {
    certificatesInstance = await Certificates.new();
  });

  it('should add certificates', async () => {
    const student = accounts[0];
    const certificateHash = 'certificate123';

    await certificatesInstance.addCertificate(student, certificateHash);
  });

  it('should verify certificates', async () => {
    const student = accounts[0];
    const certificateHash = 'certificate123';

    await certificatesInstance.addCertificate(student, certificateHash);

    const isCertificateValid = await certificatesInstance.verifyCertificate(student, certificateHash);
    assert.equal(isCertificateValid, true, 'Certificate should be valid');
  });

  it('should fetch certificates for a student', async () => {
    const student = accounts[0];
    const certificateHash1 = 'certificate456';
    const certificateHash2 = 'certificate789';

    await certificatesInstance.addCertificate(student, certificateHash1);
    await certificatesInstance.addCertificate(student, certificateHash2);

    const fetchedCertificates = await certificatesInstance.fetchStudentCertificates(student); // Update function name here
    assert.deepEqual(fetchedCertificates, [certificateHash1, certificateHash2], 'Certificates should match');
  });
});
