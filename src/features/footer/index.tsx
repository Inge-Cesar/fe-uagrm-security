import DarkModeButton from '@/components/DarkModeButton';
import { ShieldCheck } from 'lucide-react';

const navigation = {
  legal: [
    { name: 'Términos de Servicio', href: '#' },
    { name: 'Política de Privacidad', href: '#' },
  ],
  social: [
    {
      name: 'Facebook',
      href: '#',
      icon: (props: any) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path
            fillRule="evenodd"
            d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      name: 'X',
      href: '#',
      icon: (props: any) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5685 21H20.8131L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z" />
        </svg>
      ),
    },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Left: Logo and Copyright */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-red-600 text-white shadow">
              <ShieldCheck size={16} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">UAGRM SSO</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                &copy; {new Date().getFullYear()} Universidad Autónoma Gabriel René Moreno
              </p>
            </div>
          </div>

          {/* Center: Legal Links */}
          <div className="flex gap-6">
            {navigation.legal.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Right: Social and Dark Mode */}
          <div className="flex items-center gap-4">
            <DarkModeButton />
            {navigation.social.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
              >
                <span className="sr-only">{item.name}</span>
                <item.icon aria-hidden="true" className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
