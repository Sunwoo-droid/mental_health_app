import React from 'react';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

const RESOURCE_LINKS = [
  {
    label: '988 Suicide & Crisis Lifeline (US)',
    href: 'https://988lifeline.org',
    detail: 'Call or text 988 for immediate crisis support.',
  },
  {
    label: 'NAMI HelpLine',
    href: 'https://www.nami.org/help',
    detail: 'Guidance and referrals for mental health support.',
  },
  {
    label: 'Psychology Today Therapist Directory',
    href: 'https://www.psychologytoday.com/us/therapists',
    detail: 'Find licensed therapists by location and specialty.',
  },
];

function SupportResources({ className = '' }) {
  return (
    <div className={`bg-slate-800/60 border border-slate-700 rounded-lg p-4 ${className}`}>
      <h3 className="text-slate-100 font-semibold mb-3">Support resources</h3>
      <div className="space-y-2">
        {RESOURCE_LINKS.map((resource) => (
          <a
            key={resource.href}
            href={resource.href}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-slate-300 hover:text-slate-100 transition-colors"
          >
            <span className="inline-flex items-center gap-1 font-medium">
              {resource.label}
              <ArrowTopRightOnSquareIcon className="w-4 h-4" />
            </span>
            <span className="block text-xs text-slate-400">{resource.detail}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

export default SupportResources;

