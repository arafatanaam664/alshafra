import guidesData from '../data/core-guides.json';

type Section = { heading: string; paragraphs: string[]; bullets?: string[] };
const GUIDES = guidesData as Record<string, Section[]>;

export default function EditorialGuide({ route }: { route: string }) {
  const sections = GUIDES[route];
  if (!sections?.length) return null;
  return (
    <aside className="container-page my-10 space-y-5" aria-label="دليل الصفحة">
      {sections.map((section) => (
        <section key={section.heading} className="card p-6 text-sm leading-loose text-brand-700/85 sm:p-8">
          <h2 className="font-display text-xl font-bold text-brand-900">{section.heading}</h2>
          {section.paragraphs.map((paragraph) => <p key={paragraph} className="mt-3">{paragraph}</p>)}
          {section.bullets?.length ? <ul className="mt-3 list-disc space-y-2 pr-5">{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul> : null}
        </section>
      ))}
    </aside>
  );
}
