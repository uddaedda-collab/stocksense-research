import type { CompanyProfile } from '@platform/shared';

export function CompanyProfileCard({ profile }: { profile: CompanyProfile }) {
  return (
    <div className="card">
      <h3 className="mb-2 font-semibold">Company Profile</h3>
      <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-xs text-gray-500 dark:text-gray-400">Exchange</dt>
          <dd className="font-semibold">{profile.exchange}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500 dark:text-gray-400">Sector</dt>
          <dd className="font-semibold">{profile.sector ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500 dark:text-gray-400">Industry</dt>
          <dd className="font-semibold">{profile.industry ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500 dark:text-gray-400">Employees</dt>
          <dd className="font-semibold">{profile.employees?.toLocaleString('en-IN') ?? '—'}</dd>
        </div>
      </dl>
      {profile.description && (
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{profile.description}</p>
      )}
      {profile.website && (
        <a
          href={profile.website}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-sm text-brand-600 hover:underline"
        >
          Visit company website ↗
        </a>
      )}
    </div>
  );
}
