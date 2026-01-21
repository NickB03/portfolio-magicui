'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import UIBuilder from '@/components/ui/ui-builder';
import { primitiveComponentDefinitions } from '@/lib/ui-builder/registry/primitive-component-definitions';
import { complexComponentDefinitions } from '@/lib/ui-builder/registry/complex-component-definitions';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import type { ComponentRegistry, ComponentLayer } from '@/components/ui/ui-builder/types';
import { toast } from 'sonner';

// Combine registries for the editor
const componentRegistry: ComponentRegistry = {
    ...primitiveComponentDefinitions,
    ...complexComponentDefinitions,
};

// Default home page layout
const defaultLayout: ComponentLayer[] = [
    {
        id: 'home-root',
        type: 'div',
        name: 'Home Page',
        props: {
            className: 'min-h-screen p-8 max-w-4xl mx-auto',
        },
        children: [
            {
                id: 'hero-heading',
                type: 'h1',
                name: 'Hero Heading',
                props: {
                    className: 'text-4xl font-bold mb-4',
                },
                children: 'Welcome to Your Portfolio',
            },
            {
                id: 'hero-text',
                type: 'p',
                name: 'Hero Description',
                props: {
                    className: 'text-lg text-gray-600 mb-8',
                },
                children: 'Start editing this page with the visual editor. Drag components from the left panel to build your layout.',
            },
        ],
    },
];

export default function PageEditorPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [initialLayers, setInitialLayers] = useState<ComponentLayer[]>(defaultLayout);
    const [currentLayers, setCurrentLayers] = useState<ComponentLayer[]>(defaultLayout);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        fetchPageLayout();
    }, []);

    const fetchPageLayout = async () => {
        try {
            const res = await fetch('/api/admin/pages?id=home');
            if (res.ok) {
                const data = await res.json();
                if (data.layout) {
                    setInitialLayers(data.layout);
                    setCurrentLayers(data.layout);
                }
            }
        } catch (error) {
            console.error('Error fetching page layout:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle onChange from UIBuilder - it passes an array of layers
    const handleChange = useCallback((layers: ComponentLayer[]) => {
        setCurrentLayers(layers);
        setHasChanges(true);
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/pages', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: 'home',
                    name: 'Home Page',
                    layout: currentLayers,
                }),
            });

            if (res.ok) {
                toast.success('Page saved successfully!');
                setHasChanges(false);
            } else {
                toast.error('Failed to save page');
            }
        } catch (error) {
            console.error('Error saving page:', error);
            toast.error('Failed to save page');
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

    return (
        <div className="h-screen flex flex-col overflow-hidden">
            <UIBuilder
                componentRegistry={componentRegistry}
                initialLayers={initialLayers}
                onChange={handleChange}
                persistLayerStore={false}
                navLeftChildren={
                    <div className="flex items-center gap-2">
                        <Link href="/admin">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <span className="text-sm font-medium">Page Editor</span>
                    </div>
                }
                navRightChildren={
                    <Button
                        onClick={handleSave}
                        disabled={saving || !hasChanges}
                        size="sm"
                        className="gap-2"
                    >
                        {saving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        {hasChanges ? 'Save Changes' : 'Saved'}
                    </Button>
                }
            />
        </div>
    );
}
