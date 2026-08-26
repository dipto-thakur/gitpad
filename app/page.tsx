// file: app/page.tsx
import { getCurrentUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

import { Hero } from '@/components/landing/Hero';
import { Header } from '@/components/ui/header';
import { SignInButton } from '@/components/sign/SignInButton';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { About } from '@/components/landing/About';
import { Footer } from '@/components/landing/Footer';

export default async function HomePage() {
  const user = await getCurrentUser();

  if (user) {
    redirect('/repos');
  }

  return (
    <main className="min-h-dvh">
      
      <Header actions={<SignInButton size="sm" />} />
      <Hero />
      <HowItWorks />
      <About />
      <Footer />
    </main>
  );
}