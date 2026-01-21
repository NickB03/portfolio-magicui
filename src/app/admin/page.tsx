import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import AdminDashboard from './dashboard';

export const runtime = 'edge';

export default async function AdminPage() {
    const user = await getUser();

    if (!user) {
        redirect('/admin/login');
    }

    return <AdminDashboard />;
}
