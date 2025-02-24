'use client';

import ProfileSettings from '../../components/ProfileSettings';

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        Profile Settings
      </h1>
      <ProfileSettings />
    </div>
  );
} 