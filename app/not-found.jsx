import Layout from './components/Layout';

export default function NotFound() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">404</h1>
        <h2 className="text-xl font-semibold text-foreground mb-2">Page Not Found</h2>
        <p className="text-muted mb-6">The page you're looking for doesn't exist.</p>
        <a
          href="/"
          className="flex min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-accent text-white text-sm font-bold leading-normal tracking-[0.015em]"
        >
          Go Home
        </a>
      </div>
    </Layout>
  );
} 