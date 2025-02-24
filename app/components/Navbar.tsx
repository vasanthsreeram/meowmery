'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { User } from '../types';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const loadUserAndProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          
          // Fetch profile data
          const { data: profileData } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profileData) {
            setProfile(profileData);
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        // Fetch profile data on auth state change
        const { data: profileData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profileData) {
          setProfile(profileData);
        }
      } else {
        setProfile(null);
      }
      
      if (_event === 'USER_UPDATED') {
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    router.refresh();
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-gray-900">Meowmery</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {!loading && (
              user ? (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/meowmery/create"
                    className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    Share a Memory
                  </Link>
                  <div className="relative">
                    <button 
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="flex items-center space-x-2 focus:outline-none"
                    >
                      <div className="w-8 h-8 relative rounded-full overflow-hidden">
                        <Image
                          key={profile?.avatar_url || 'default'}
                          src={profile?.avatar_url || '/default-avatar.png'}
                          alt={profile?.username || 'User'}
                          fill
                          className="object-cover"
                          priority
                        />
                      </div>
                    </button>
                    {isMenuOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-10"
                          onClick={() => setIsMenuOpen(false)}
                        />
                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-20">
                          <Link
                            href="/profile/posts"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            My Posts
                          </Link>
                          <Link
                            href="/profile/settings"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            Profile Settings
                          </Link>
                          <button
                            onClick={() => {
                              handleSignOut();
                              setIsMenuOpen(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Sign out
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <Link
                  href="/auth"
                  className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Sign in / Sign up
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 