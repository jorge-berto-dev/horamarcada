export const dynamic = 'force-dynamic';
import { createServerSupabase } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: businesses } = await supabase.from('businesses').select('*').eq('owner_id', user.id).order('created_at');

  const bizIds = (businesses || []).map((b) => b.id);
  let appointments: unknown[] = [];
  let services: unknown[] = [];
  let professionals: unknown[] = [];
  if (bizIds.length > 0) {
    const [a, s, p] = await Promise.all([
      supabase.from('appointments').select('*').in('business_id', bizIds).order('inicio', { ascending: true }).limit(100),
      supabase.from('services').select('*').in('business_id', bizIds),
      supabase.from('professionals').select('*').in('business_id', bizIds),
    ]);
    appointments = a.data || [];
    services = s.data || [];
    professionals = p.data || [];
  }

  return (
    <DashboardClient
      userEmail={user.email || ''}
      businesses={businesses || []}
      appointments={appointments as never[]}
      services={services as never[]}
      professionals={professionals as never[]}
    />
  );
}
