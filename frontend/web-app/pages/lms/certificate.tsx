import Certificate from '../../components/cert/Certificate';
import PageHeader from '../../components/ui/PageHeader';

export default function CertificatePage() {
  return (
    <main>
      <PageHeader title="Certificate" subtitle="Download your completion certificate" />
      <Certificate name="Demo Learner" course="Intro to Logic" />
    </main>
  );
}
