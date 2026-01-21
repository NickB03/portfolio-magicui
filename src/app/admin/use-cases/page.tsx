'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Pencil, FileText } from 'lucide-react';
import { DATA } from '@/data/resume';

// Transform resume.tsx use cases to the format we need
const USE_CASES = DATA.useCases.map((uc) => ({
    id: uc.href.replace('/use-cases/', ''),
    title: uc.title,
    slug: uc.href.replace('/use-cases/', ''),
    description: uc.description,
    image: uc.image,
}));

export default function UseCasesPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/admin">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <div className="flex items-center gap-2">
                            <FileText className="h-6 w-6" />
                            <h1 className="text-xl font-bold">Use Cases</h1>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <div className="grid gap-4">
                    {USE_CASES.map((useCase) => (
                        <Card key={useCase.id} className="hover:border-border/80 transition-colors">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg">{useCase.title}</CardTitle>
                                        <CardDescription>/use-cases/{useCase.slug}</CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={`/admin/use-cases/${useCase.id}`}>
                                            <Button variant="outline" size="sm">
                                                <Pencil className="h-4 w-4 mr-2" />
                                                Edit
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardHeader>
                            {useCase.description && (
                                <CardContent>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {useCase.description}
                                    </p>
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>
            </main>
        </div>
    );
}
