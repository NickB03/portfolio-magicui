'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, FileText, Palette, LogOut } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase';

export default function AdminDashboard() {
    const router = useRouter();

    const handleLogout = async () => {
        const supabase = createSupabaseBrowserClient();
        await supabase.auth.signOut();
        router.push('/admin/login');
        router.refresh();
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <LayoutDashboard className="h-6 w-6" />
                        <h1 className="text-xl font-bold">Admin Dashboard</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
                            View Site →
                        </Link>
                        <Button variant="outline" size="sm" onClick={handleLogout}>
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Page Editor Card */}
                    <Link href="/admin/editor">
                        <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Palette className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle>Page Editor</CardTitle>
                                        <CardDescription>Visual drag-and-drop editor</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Edit your homepage layout with the visual UI Builder. Drag and drop components to customize your site.
                                </p>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Use Cases Card */}
                    <Link href="/admin/use-cases">
                        <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-500/10 rounded-lg">
                                        <FileText className="h-6 w-6 text-green-500" />
                                    </div>
                                    <div>
                                        <CardTitle>Use Cases</CardTitle>
                                        <CardDescription>Manage use case content</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Create, edit, and delete use cases with full markdown support.
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </main>
        </div>
    );
}
