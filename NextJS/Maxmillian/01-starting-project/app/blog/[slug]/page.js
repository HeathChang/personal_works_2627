export default function BlogPostPage({ params }) {
    const { slug } = params;
    console.log(slug);
    return (
        <main>
            <h1>Blog Post {slug}</h1>
            <p>

            </p>
        </main>
    );
}