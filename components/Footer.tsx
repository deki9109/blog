export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-100 bg-slate-50/50 py-8 dark:border-slate-900 dark:bg-slate-950/50 transition-colors duration-300">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row text-center sm:text-left">
          {/* 저작권 표시 */}
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} Tech.Log. Built with Next.js, MDX, and Tailwind CSS.
          </p>

          {/* 링크 영역 */}
          <div className="flex gap-6 text-sm text-slate-500 dark:text-slate-400">
            <a
              href="mailto:example@email.com"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Contact
            </a>
            <a
              href="https://vercel.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Deploy on Vercel
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
