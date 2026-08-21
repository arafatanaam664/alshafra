import { useMemo, useState } from 'react';
import {
  applyDiscount,
  bodyMassIndex,
  convertLength,
  convertMass,
  convertTemperature,
  countText,
  decodeBase64,
  decodeUrl,
  encodeBase64,
  encodeUrl,
  formatJson,
  generateUuid,
  loanPayment,
  percentChange,
  percentIs,
  percentOf,
} from '@alshafra/tools';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-brand-700/80">{label}</span>
      {children}
    </label>
  );
}

const inputClass = 'w-full rounded-xl bg-sand-50 p-2 ring-1 ring-brand-200';

function PercentageTool() {
  const [mode, setMode] = useState<'of' | 'is' | 'change'>('of');
  const [a, setA] = useState(15);
  const [b, setB] = useState(200);
  const result = useMemo(() => {
    try {
      if (mode === 'of') return `${percentOf(a, b).toFixed(2)}`;
      if (mode === 'is') return `${percentIs(a, b).toFixed(2)}٪`;
      return `${percentChange(a, b).toFixed(2)}٪`;
    } catch {
      return 'تعذر الحساب';
    }
  }, [mode, a, b]);
  return (
    <div className="card my-6 space-y-3 p-6">
      <select className={inputClass} value={mode} onChange={(e) => setMode(e.target.value as typeof mode)}>
        <option value="of">كم يساوي س٪ من ص</option>
        <option value="is">س هي كم٪ من ص</option>
        <option value="change">نسبة التغيّر من س إلى ص</option>
      </select>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={mode === 'of' ? 'النسبة ٪' : 'القيمة الأولى'}>
          <input className={inputClass} type="number" value={a} onChange={(e) => setA(+e.target.value)} />
        </Field>
        <Field label={mode === 'change' ? 'القيمة الجديدة' : 'الكل'}>
          <input className={inputClass} type="number" value={b} onChange={(e) => setB(+e.target.value)} />
        </Field>
      </div>
      <p className="font-display text-lg font-bold">النتيجة: {result}</p>
    </div>
  );
}

function DiscountTool() {
  const [price, setPrice] = useState(100);
  const [percent, setPercent] = useState(25);
  const out = applyDiscount(price, percent);
  return (
    <div className="card my-6 grid gap-3 p-6 sm:grid-cols-2">
      <Field label="السعر الأصلي">
        <input className={inputClass} type="number" value={price} onChange={(e) => setPrice(+e.target.value)} />
      </Field>
      <Field label="الخصم ٪">
        <input className={inputClass} type="number" value={percent} onChange={(e) => setPercent(+e.target.value)} />
      </Field>
      <p className="sm:col-span-2">النهائي: {out.final.toFixed(2)} — الموفَّر: {out.saved.toFixed(2)}</p>
    </div>
  );
}

function BmiTool() {
  const [kg, setKg] = useState(70);
  const [cm, setCm] = useState(170);
  const out = useMemo(() => {
    try {
      return bodyMassIndex(kg, cm);
    } catch {
      return null;
    }
  }, [kg, cm]);
  return (
    <div className="card my-6 grid gap-3 p-6 sm:grid-cols-2">
      <Field label="الوزن كغ">
        <input className={inputClass} type="number" value={kg} onChange={(e) => setKg(+e.target.value)} />
      </Field>
      <Field label="الطول سم">
        <input className={inputClass} type="number" value={cm} onChange={(e) => setCm(+e.target.value)} />
      </Field>
      <p className="sm:col-span-2">
        {out ? `BMI = ${out.bmi.toFixed(1)} (${out.category})` : 'أدخل قيماً موجبة'}
      </p>
      <p className="sm:col-span-2 text-xs text-brand-600">ليست تشخيصاً طبياً.</p>
    </div>
  );
}

function LoanTool() {
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(5);
  const [months, setMonths] = useState(60);
  const out = useMemo(() => {
    try {
      return loanPayment(principal, rate, months);
    } catch {
      return null;
    }
  }, [principal, rate, months]);
  return (
    <div className="card my-6 grid gap-3 p-6 sm:grid-cols-3">
      <Field label="أصل القرض">
        <input className={inputClass} type="number" value={principal} onChange={(e) => setPrincipal(+e.target.value)} />
      </Field>
      <Field label="النسبة السنوية ٪">
        <input className={inputClass} type="number" value={rate} onChange={(e) => setRate(+e.target.value)} />
      </Field>
      <Field label="الأشهر">
        <input className={inputClass} type="number" value={months} onChange={(e) => setMonths(+e.target.value)} />
      </Field>
      <p className="sm:col-span-3">
        {out
          ? `القسط ≈ ${out.monthly.toFixed(2)} — الإجمالي ≈ ${out.total.toFixed(2)} — الفائدة ≈ ${out.interest.toFixed(2)}`
          : 'تعذر الحساب'}
      </p>
      <p className="sm:col-span-3 text-xs text-brand-600">تقدير حسابي وليس عرض تمويل.</p>
    </div>
  );
}

function UnitsTool() {
  const [value, setValue] = useState(1);
  const [kind, setKind] = useState<'length' | 'mass' | 'temp'>('length');
  const [from, setFrom] = useState('m');
  const [to, setTo] = useState('cm');
  const result = useMemo(() => {
    try {
      if (kind === 'length') return convertLength(value, from as 'm', to as 'cm');
      if (kind === 'mass') return convertMass(value, from as 'kg', to as 'g');
      return convertTemperature(value, from as 'C', to as 'F');
    } catch {
      return NaN;
    }
  }, [value, kind, from, to]);
  const options =
    kind === 'length' ? ['m', 'cm', 'km', 'in', 'ft'] : kind === 'mass' ? ['kg', 'g', 'lb'] : ['C', 'F'];
  return (
    <div className="card my-6 space-y-3 p-6">
      <select
        className={inputClass}
        value={kind}
        onChange={(e) => {
          const next = e.target.value as typeof kind;
          setKind(next);
          setFrom(next === 'length' ? 'm' : next === 'mass' ? 'kg' : 'C');
          setTo(next === 'length' ? 'cm' : next === 'mass' ? 'g' : 'F');
        }}
      >
        <option value="length">طول</option>
        <option value="mass">وزن</option>
        <option value="temp">حرارة</option>
      </select>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="القيمة">
          <input className={inputClass} type="number" value={value} onChange={(e) => setValue(+e.target.value)} />
        </Field>
        <Field label="من">
          <select className={inputClass} value={from} onChange={(e) => setFrom(e.target.value)}>
            {options.map((unit) => (
              <option key={unit}>{unit}</option>
            ))}
          </select>
        </Field>
        <Field label="إلى">
          <select className={inputClass} value={to} onChange={(e) => setTo(e.target.value)}>
            {options.map((unit) => (
              <option key={unit}>{unit}</option>
            ))}
          </select>
        </Field>
      </div>
      <p className="font-display text-lg font-bold">{Number.isFinite(result) ? result.toFixed(4) : '—'}</p>
    </div>
  );
}

function WordTool() {
  const [text, setText] = useState('');
  const counts = countText(text);
  return (
    <div className="card my-6 space-y-3 p-6">
      <textarea className={`${inputClass} min-h-32`} value={text} onChange={(e) => setText(e.target.value)} />
      <p>
        كلمات: {counts.words} — أحرف: {counts.chars} — بلا مسافات: {counts.charsNoSpace}
      </p>
    </div>
  );
}

function UuidTool() {
  const [value, setValue] = useState(() => generateUuid());
  return (
    <div className="card my-6 space-y-3 p-6">
      <code className="block break-all rounded-xl bg-sand-50 p-3">{value}</code>
      <button className="btn-primary" type="button" onClick={() => setValue(generateUuid())}>
        توليد جديد
      </button>
    </div>
  );
}

function Base64Tool() {
  const [text, setText] = useState('Alshafra');
  const [mode, setMode] = useState<'enc' | 'dec'>('enc');
  const out = useMemo(() => {
    try {
      return mode === 'enc' ? encodeBase64(text) : decodeBase64(text);
    } catch {
      return 'تعذر التحويل';
    }
  }, [text, mode]);
  return (
    <div className="card my-6 space-y-3 p-6">
      <select className={inputClass} value={mode} onChange={(e) => setMode(e.target.value as typeof mode)}>
        <option value="enc">ترميز</option>
        <option value="dec">فك</option>
      </select>
      <textarea className={`${inputClass} min-h-24`} value={text} onChange={(e) => setText(e.target.value)} />
      <pre className="overflow-auto rounded-xl bg-sand-50 p-3 text-sm">{out}</pre>
    </div>
  );
}

function UrlTool() {
  const [text, setText] = useState('أم القرى');
  const [mode, setMode] = useState<'enc' | 'dec'>('enc');
  const out = useMemo(() => {
    try {
      return mode === 'enc' ? encodeUrl(text) : decodeUrl(text);
    } catch {
      return 'تعذر التحويل';
    }
  }, [text, mode]);
  return (
    <div className="card my-6 space-y-3 p-6">
      <select className={inputClass} value={mode} onChange={(e) => setMode(e.target.value as typeof mode)}>
        <option value="enc">ترميز</option>
        <option value="dec">فك</option>
      </select>
      <textarea className={`${inputClass} min-h-24`} value={text} onChange={(e) => setText(e.target.value)} />
      <pre className="overflow-auto rounded-xl bg-sand-50 p-3 text-sm">{out}</pre>
    </div>
  );
}

function JsonTool() {
  const [text, setText] = useState('{"ok":true}');
  const out = useMemo(() => {
    try {
      return formatJson(text);
    } catch (error) {
      return error instanceof Error ? error.message : 'JSON غير صالح';
    }
  }, [text]);
  return (
    <div className="card my-6 space-y-3 p-6">
      <textarea className={`${inputClass} min-h-32 font-mono`} value={text} onChange={(e) => setText(e.target.value)} />
      <pre className="overflow-auto rounded-xl bg-sand-50 p-3 text-sm">{out}</pre>
    </div>
  );
}

export default function ToolIsland({ engineKey }: { engineKey: string }) {
  if (engineKey === 'calc.percentage') return <PercentageTool />;
  if (engineKey === 'calc.discount') return <DiscountTool />;
  if (engineKey === 'calc.bmi') return <BmiTool />;
  if (engineKey === 'calc.loan') return <LoanTool />;
  if (engineKey === 'convert.units') return <UnitsTool />;
  if (engineKey === 'text.count') return <WordTool />;
  if (engineKey === 'dev.uuid') return <UuidTool />;
  if (engineKey === 'dev.base64') return <Base64Tool />;
  if (engineKey === 'dev.url') return <UrlTool />;
  if (engineKey === 'dev.json') return <JsonTool />;
  return <p className="text-sm text-brand-700">أداة غير معروفة.</p>;
}
