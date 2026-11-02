import type { Metadata, Viewport } from "next";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/shell.css";
import "./styles/components.css";
import "./styles/den-theme.css";
import "@/components/mascot/mascot.css";
import Sidebar from "@/components/shell/Sidebar";
import Footer from "@/components/shell/Footer";
import Reveal from "@/components/ui/Reveal";
import DenEasterEgg from "@/components/mascot/DenEasterEgg";
import TimeOfDay from "@/components/shell/TimeOfDay";
import JsonLd from "@/components/ui/JsonLd";
import { hanken, instrument, plexMono } from "@/lib/fonts";
import { siteGraphJsonLd } from "@/lib/jsonLd";
import { BASE_URL } from "@/lib/site";
import { person } from "@/content/site";

const title = `${person.name} · Product Engineer + Strategist · Creator of Arcapush`;
const description =
  "Mojeeb Titilayo is a product engineer and strategist: founder of BlindspotLab and creator of Arcapush. Also behind the open-source developer tools StackBrief, StyleGraft and the Arcapush CLI.";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: { default: title, template: `%s · ${person.name}` },
  keywords: ["Mojeeb Titilayo", "Product Engineer", "Arcapush", "BlindspotLab", "StackBrief", "StyleGraft", "Arcapush CLI", "developer tools", "product strategy"],
  description,
  applicationName: person.name,
  authors: [{ name: person.name, url: `${BASE_URL}/about` }],
  creator: person.name,
  alternates: { canonical: "/" },
  openGraph: { type: "profile", siteName: person.name, locale: "en_US", url: BASE_URL, title, description, firstName: person.givenName, lastName: person.familyName, username: "MojeebMotion" },
  twitter: { card: "summary_large_image", site: "@MojeebMotion", creator: "@MojeebMotion", title, description },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0e12",
};

/**
 * Runs before first paint: sets day or night from the Lagos clock (6am–6pm is day) unless the visitor picked one in
 * the theme toggle or the URL has ?time=day|night, marks JS as available, and decides whether the
 * homepage intro should show (every load of /, unless ?intro=0). A 6 s failsafe removes the intro if its
 * script never boots, so content can never be trapped behind it.
 */
const bootScript = `(function(){var d=document.documentElement;d.classList.add('js');try{var p=new URLSearchParams(location.search),q=p.get('time'),m=null;try{m=localStorage.getItem('theme')}catch(e){}if(m==='light')m='day';if(m==='dark')m='night';var h=(new Date().getUTCHours()+1)%24,auto=(h>=18||h<6)?'night':'day';d.setAttribute('data-theme',q==='day'||q==='night'?q:m==='day'||m==='night'?m:auto);if(location.pathname==='/'&&p.get('intro')!=='0'){d.classList.add('den-pending');setTimeout(function(){if(!window.__denReady)d.classList.remove('den-pending')},6000)}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${hanken.variable} ${instrument.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <link rel="author" href="/llms.txt" type="text/plain" />
        <JsonLd data={siteGraphJsonLd} />
      </head>
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        <div className="shell">
          <Sidebar />
          <div className="main">
            <main id="main" className="content" tabIndex={-1}>
              {children}
            </main>
            <div className="content">
              <Footer />
            </div>
          </div>
        </div>
        <Reveal />
        <DenEasterEgg />
        <TimeOfDay />
      </body>
    </html>
  );
}
