export type ToolRuntime = 'static' | 'island';
export type ToolDataMode = 'none' | 'build_snapshot' | 'client_compute' | 'server_fetch';

export interface ToolDefinition {
  key: string;
  path: string;
  engineKey: string;
  runtime: ToolRuntime;
  dataMode: ToolDataMode;
}

/** Legacy public URLs — do not change paths. */
export const LEGACY_TOOLS: readonly ToolDefinition[] = [
  { key: 'date-converter', path: '/date-converter', engineKey: 'calendar.hijri_convert', runtime: 'island', dataMode: 'client_compute' },
  { key: 'hijri-calendar', path: '/hijri-calendar', engineKey: 'calendar.month', runtime: 'island', dataMode: 'client_compute' },
  { key: 'today', path: '/today', engineKey: 'calendar.today_riyadh', runtime: 'island', dataMode: 'client_compute' },
  { key: 'age-calculator', path: '/age-calculator', engineKey: 'calendar.age', runtime: 'island', dataMode: 'client_compute' },
  { key: 'salaries', path: '/salaries', engineKey: 'gov.salary_next', runtime: 'island', dataMode: 'client_compute' },
  { key: 'school-calendar', path: '/school-calendar', engineKey: 'calendar.school', runtime: 'static', dataMode: 'none' },
  { key: 'holidays', path: '/holidays', engineKey: 'calendar.holidays', runtime: 'static', dataMode: 'none' },
  { key: 'countdown', path: '/countdown', engineKey: 'calendar.countdown', runtime: 'island', dataMode: 'client_compute' },
  { key: 'gold-price', path: '/gold-price', engineKey: 'market.gold_gram', runtime: 'island', dataMode: 'build_snapshot' },
  { key: 'usd-rate', path: '/usd-rate', engineKey: 'market.usd_rate', runtime: 'island', dataMode: 'build_snapshot' },
  { key: 'name-decoration', path: '/name-decoration', engineKey: 'text.decorate', runtime: 'island', dataMode: 'none' },
];
