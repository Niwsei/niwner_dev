import Head from 'next/head';

export default function Seo({ title, description }: { title?: string; description?: string }) {
  const finalTitle = title ? `${title} • SkillFlow` : 'SkillFlow';
  const finalDesc = description || 'Complete online learning platform with courses, logic training, flows, and projects.';
  return (
    <Head>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDesc} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>
  );
}

