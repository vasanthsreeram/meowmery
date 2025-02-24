import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile Settings - Meowmery',
  description: 'Update your profile settings and preferences.',
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 