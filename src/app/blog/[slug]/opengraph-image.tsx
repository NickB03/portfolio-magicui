import { ImageResponse } from "next/og";
import { allPosts } from "content-collections";

export const runtime = "edge";
export const alt = "Blog Post";
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = "image/png";

export default async function Image({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const post = allPosts.find((p) => p._meta.path.replace(/\.mdx$/, "") === slug);

    const title = post?.title || "Blog Post";
    const description = post?.summary || "";
    const publishedDate = post?.publishedAt
        ? new Date(post.publishedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            timeZone: "UTC",
        })
        : "";

    return new ImageResponse(
        (
            <div
                style={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    justifyContent: "flex-end",
                    backgroundColor: "#fafafa",
                    padding: "80px",
                }}
            >
                <div
                    style={{
                        fontSize: "56px",
                        fontWeight: "bold",
                        color: "#000000",
                        marginBottom: "16px",
                        maxWidth: "900px",
                    }}
                >
                    {title}
                </div>
                {description && (
                    <div
                        style={{
                            fontSize: "28px",
                            color: "#404040",
                            maxWidth: "800px",
                            marginBottom: "16px",
                        }}
                    >
                        {description}
                    </div>
                )}
                {publishedDate && (
                    <div
                        style={{
                            fontSize: "20px",
                            color: "#666666",
                        }}
                    >
                        {publishedDate}
                    </div>
                )}
            </div>
        ),
        size
    );
}
