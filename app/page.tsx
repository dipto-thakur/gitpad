// file: app/page.tsx
import { getCurrentUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { Nav } from '@/components/landing/Nav';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { About } from '@/components/landing/About';
import { Creator } from '@/components/landing/Creator';

export default async function HomePage() {
  const user = await getCurrentUser();

  if (user) {
    redirect('/repos');
  }

  return (
    <main className="min-h-dvh">
      <Nav />
      <Hero />
      <HowItWorks />
      <About />
      <Creator />
    </main>
  );
}