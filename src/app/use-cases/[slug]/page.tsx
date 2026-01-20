
export default function UseCasePage({ params }: { params: { slug: string } }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">
                Use Case: {params.slug}
            </h1>
            <p className="text-muted-foreground text-lg text-center max-w-2xl">
                This is a placeholder page for the use case. Detailed case study content coming soon.
            </p>
        </div>
    );
}
