import { ImageResponse } from "next/og";
import { DATA } from "@/data/resume";

export const runtime = "edge";
export const alt = "Blog";
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = "image/png";

export default async function Image() {
    const title = "Blog";
    const description = "Thoughts on software development, life, and more.";

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
                        fontSize: "72px",
                        fontWeight: "bold",
                        color: "#000000",
                        marginBottom: "16px",
                    }}
                >
                    {title}
                </div>
                <div
                    style={{
                        fontSize: "32px",
                        color: "#404040",
                        maxWidth: "800px",
                    }}
                >
                    {description}
                </div>
            </div>
        ),
        size
    );
}
