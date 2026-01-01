import Link from 'next/link';

export default function BlogPage() {
    return (
        <main>
            <h1>Blog Post</h1>
            <p>
                <Link href="/blog/post-1">First Post</Link>
            </p>
            <p>
                <Link href="/blog/post-2">Second Post</Link>
            </p>
        </main>
    );
}