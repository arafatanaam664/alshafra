import guides from '../data/tool-guides.json';

export default function ToolGuide({ tool }: { tool: 'age' | 'converter' }) {
  return (
    <section className="mt-8 card p-6" aria-labelledby={`${tool}-questions`}>
      <h2 id={`${tool}-questions`} className="font-display text-lg font-bold text-brand-900">أسئلة عن الأداة</h2>
      <div className="mt-4 space-y-4 text-sm leading-relaxed text-brand-700/85">
        {guides[tool].map(item => <div key={item.question}><h3 className="font-bold text-brand-900">{item.question}</h3><p className="mt-1">{item.answer}</p></div>)}
      </div>
    </section>
  );
}
