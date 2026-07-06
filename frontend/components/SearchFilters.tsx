'use client';

export interface FilterState {
  phases: string[];           // e.g. ['PHASE2', 'PHASE3']
  studyType: string;          // 'ALL' | 'INTERVENTIONAL' | 'OBSERVATIONAL'
  minAge: number;             // 0–100
  maxAge: number;             // 0–100
}

export const DEFAULT_FILTERS: FilterState = {
  phases: [],
  studyType: 'ALL',
  minAge: 0,
  maxAge: 100,
};

interface SearchFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  resultCount: number;
}

const PHASES = [
  { value: 'EARLY_PHASE1', label: 'Pre-Phase 1' },
  { value: 'PHASE1', label: 'Phase 1' },
  { value: 'PHASE2', label: 'Phase 2' },
  { value: 'PHASE3', label: 'Phase 3' },
  { value: 'PHASE4', label: 'Phase 4' },
];

export function SearchFilters({ filters, onChange, resultCount }: SearchFiltersProps) {
  function togglePhase(phase: string) {
    const next = filters.phases.includes(phase)
      ? filters.phases.filter(p => p !== phase)
      : [...filters.phases, phase];
    onChange({ ...filters, phases: next });
  }

  function resetFilters() {
    onChange(DEFAULT_FILTERS);
  }

  const hasActiveFilters = 
    filters.phases.length > 0 || 
    filters.studyType !== 'ALL' ||
    filters.minAge > 0 ||
    filters.maxAge < 100;

  return (
    <div className="bg-white border border-warm-gray 
                    rounded-xl p-5 space-y-5">
      
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-navy">
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-xs text-amber hover:underline"
          >
            Reset all
          </button>
        )}
      </div>

      {/* Phase filter */}
      <div>
        <p className="text-xs font-medium text-slate-500 
                      uppercase tracking-wide mb-2">
          Trial Phase
        </p>
        <div className="space-y-1.5">
          {PHASES.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.phases.includes(value)}
                onChange={() => togglePhase(value)}
                className="accent-amber"
              />
              <span className="text-sm text-navy">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Study type */}
      <div>
        <p className="text-xs font-medium text-slate-500 
                      uppercase tracking-wide mb-2">
          Study Type
        </p>
        <select
          value={filters.studyType}
          onChange={e => onChange({ ...filters, studyType: e.target.value })}
          className="w-full border border-warm-gray rounded-lg 
                     px-3 py-2 text-sm bg-white 
                     text-navy focus:outline-none focus:border-amber"
        >
          <option value="ALL">All types</option>
          <option value="INTERVENTIONAL">Interventional</option>
          <option value="OBSERVATIONAL">Observational</option>
        </select>
      </div>

      {/* Results count */}
      <div className="pt-2 border-t border-warm-gray">
        <p className="text-xs text-slate-500">
          {resultCount} result{resultCount !== 1 ? 's' : ''} match filters
        </p>
      </div>

    </div>
  );
}
