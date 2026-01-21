'use client';

export const runtime = 'edge';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Eye, Code, Loader2 } from 'lucide-react';
import type { UseCase } from '@/lib/supabase';

interface UseCaseEditorPageProps {
    params: { id: string };
}

export default function UseCaseEditorPage({ params }: UseCaseEditorPageProps) {
    const [useCase, setUseCase] = useState<UseCase | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState('');
    const router = useRouter();

    useEffect(() => {
        fetchUseCase();
    }, [params.id]);

    const fetchUseCase = async () => {
        try {
            const res = await fetch(`/api/admin/use-cases/${params.id}`);
            if (res.ok) {
                const data = await res.json();
                setUseCase(data);
                setTitle(data.title);
                setDescription(data.description || '');
                setContent(data.content || '');
                setImage(data.image || '');
            }
        } catch (error) {
            console.error('Error fetching use case:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/use-cases/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description, content, image }),
            });

            if (res.ok) {
                // Success feedback
                const button = document.querySelector('[data-save-button]');
                if (button) {
                    button.classList.add('bg-green-500');
                    setTimeout(() => button.classList.remove('bg-green-500'), 1000);
                }
            }
        } catch (error) {
            console.error('Error saving use case:', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!useCase) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-muted-foreground">Use case not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="border-b shrink-0">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/use-cases">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <h1 className="text-xl font-bold">{title || 'Edit Use Case'}</h1>
                    </div>
                    <Button onClick={handleSave} disabled={saving} data-save-button>
                        {saving ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4 mr-2" />
                        )}
                        Save
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-6 overflow-hidden">
                <div className="grid lg:grid-cols-[300px_1fr] gap-6 h-full">
                    {/* Sidebar - Metadata */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                placeholder="Brief description for cards..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="image">Preview Image</Label>
                            <Input
                                id="image"
                                value={image}
                                onChange={(e) => setImage(e.target.value)}
                                placeholder="/path/to/image.jpg"
                            />
                        </div>
                    </div>

                    {/* Main Editor */}
                    <Tabs defaultValue="edit" className="flex flex-col h-full">
                        <TabsList className="w-fit">
                            <TabsTrigger value="edit" className="gap-2">
                                <Code className="h-4 w-4" />
                                Edit
                            </TabsTrigger>
                            <TabsTrigger value="preview" className="gap-2">
                                <Eye className="h-4 w-4" />
                                Preview
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="edit" className="flex-1 mt-4">
                            <Textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="h-full min-h-[500px] font-mono text-sm resize-none"
                                placeholder="Write your use case content in Markdown...

# Example Heading

This is a paragraph with **bold** and *italic* text.

## Features

- Feature 1
- Feature 2
- Feature 3

```javascript
// Code blocks are supported
const example = 'Hello World';
```
"
                            />
                        </TabsContent>

                        <TabsContent value="preview" className="flex-1 mt-4">
                            <div className="prose dark:prose-invert max-w-none p-6 border rounded-lg min-h-[500px] overflow-auto bg-card">
                                {content ? (
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {content}
                                    </ReactMarkdown>
                                ) : (
                                    <p className="text-muted-foreground">
                                        Start writing to see the preview...
                                    </p>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    );
}
