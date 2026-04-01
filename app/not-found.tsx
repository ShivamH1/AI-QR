import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="font-heading text-6xl font-bold gradient-text mb-4">404</h1>
      <p className="text-gray-400 text-lg mb-8">Page not found.</p>
      <Link
        href="/"
        className="bg-brand-purple hover:bg-purple-600 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
      >
        Go home
      </Link>
    </div>
  );
}
