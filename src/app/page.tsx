import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-8 py-3 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="#0a66c2"
            className="w-8 h-8"
          >
            <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
          </svg>
          <span className="text-2xl font-semibold text-linkedin-blue">Linked</span>
          <span className="sr-only">in</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-linkedin-text-gray hover:text-linkedin-text-dark">
            Sign in
          </Link>
          <Link href="/register" className="btn-secondary">
            Join now
          </Link>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-8 py-16 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-5xl font-light text-linkedin-text-dark leading-tight">
            Welcome to your professional community
          </h1>
          <div className="mt-8 space-y-4">
            <Link
              href="/register"
              className="btn-primary block text-center text-lg py-3"
            >
              Join now
            </Link>
            <Link
              href="/login"
              className="btn-secondary block text-center text-lg py-3"
            >
              Sign in
            </Link>
          </div>
        </div>
        <div className="hidden md:block">
          <div className="w-full h-96 bg-gradient-to-br from-linkedin-light-blue/20 to-linkedin-blue/20 rounded-lg flex items-center justify-center">
            <p className="text-linkedin-text-gray">Hero illustration</p>
          </div>
        </div>
      </section>
    </main>
  );
}
