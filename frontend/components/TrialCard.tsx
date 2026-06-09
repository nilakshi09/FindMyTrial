import { MapPin, Clock, DollarSign, User } from 'lucide-react';

export interface TrialData {
  title: string;
  status: string;
  conditions: string[];
  phase: string;
  summary: string;
  location: string;
  duration: string;
  compensation: string;
  ages: string;
}

export default function TrialCard({ trial }: { trial: TrialData }) {
  return (
    <div className="group flex flex-col h-full bg-white rounded-2xl p-6 md:p-8 shadow-[0_2px_16px_rgba(0,0,0,0.05)] border border-warm-gray/40 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1">
      {/* 1. Status badge */}
      <span className="text-[11px] font-semibold tracking-wide uppercase bg-amber/10 text-amber px-3 py-1 rounded-full self-start shrink-0">
        {trial.status || 'Actively Recruiting'}
      </span>

      {/* 2-4. Card body — grows to fill space */}
      <div className="flex-1 flex flex-col mt-4">
        {/* 2. Title — line-clamped to 3 */}
        <h3 className="font-serif text-lg font-bold text-navy leading-snug line-clamp-3">
          {trial.title}
        </h3>

        {/* 3. Condition + Phase tags */}
        <div className="mt-3 flex flex-wrap gap-2 shrink-0">
          {trial.conditions.slice(0, 3).map((c) => (
            <span
              key={c}
              className="text-[11px] text-slate bg-secondary rounded-full px-3 py-0.5"
            >
              {c}
            </span>
          ))}
          {trial.phase && (
            <span className="text-[11px] text-slate bg-secondary rounded-full px-3 py-0.5">
              {trial.phase}
            </span>
          )}
        </div>

        {/* 4. Summary — flex-grow, line-clamped to 4 */}
        <p className="mt-4 text-sm text-slate leading-relaxed line-clamp-4 flex-1">
          {trial.summary}
        </p>
      </div>

      {/* 5. Details row — fixed, 2x2 grid */}
      <div className="mt-5 grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-slate shrink-0">
        {trial.location && (
          <div className="flex items-center gap-1.5">
            <MapPin size={13} className="text-amber shrink-0" />
            <span className="truncate">{trial.location}</span>
          </div>
        )}
        {trial.duration && (
          <div className="flex items-center gap-1.5">
            <Clock size={13} className="text-amber shrink-0" />
            <span>{trial.duration}</span>
          </div>
        )}
        {trial.compensation && (
          <div className="flex items-center gap-1.5">
            <DollarSign size={13} className="text-amber shrink-0" />
            <span>{trial.compensation}</span>
          </div>
        )}
        {trial.ages && (
          <div className="flex items-center gap-1.5">
            <User size={13} className="text-amber shrink-0" />
            <span>{trial.ages}</span>
          </div>
        )}
      </div>

      {/* 6. Buttons — always pinned to bottom */}
      <div className="mt-auto pt-6 flex gap-3 shrink-0">
        <button className="flex-1 text-sm font-medium text-navy border border-navy rounded-xl px-4 py-2.5 hover:bg-navy/5 transition-colors duration-200">
          Learn More
        </button>
        <button className="flex-1 text-sm font-medium text-white bg-amber rounded-xl px-4 py-2.5 hover:scale-[1.03] hover:shadow-[0_0_16px_4px_rgba(200,146,42,0.2)] transition-all duration-200">
          Save Trial
        </button>
      </div>
    </div>
  );
}
