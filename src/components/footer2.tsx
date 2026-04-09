import { Logo, LogoImage } from "@/components/logo";
import { cn } from "@/lib/utils";

interface MenuItem {
  title: string;
  links: {
    text: string;
    url: string;
  }[];
}

interface Footer2Props {
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
  };
  className?: string;
  tagline?: string;
  menuItems?: MenuItem[];
  copyright?: string;
  bottomLinks?: {
    text: string;
    url: string;
  }[];
}

const Footer2 = ({
  logo = {
    src: "/ecospark-logo.svg",
    alt: "EcoSpark Hub",
    title: "EcoSpark Hub",
    url: "/",
  },
  className,
  tagline = "Building practical sustainability solutions together.",
  menuItems = [
    {
      title: "Portal",
      links: [
        { text: "Home", url: "/" },
        { text: "Ideas", url: "/ideas" },
        { text: "About Us", url: "/Pages/About" },
        { text: "Blog", url: "/blog" },
        { text: "Dashboard", url: "/dashboard" },
      ],
    },
    {
      title: "Support",
      links: [
        { text: "Contact", url: "mailto:support@ecosparkhub.org" },
        { text: "Help Center", url: "/blog" },
        { text: "Terms of Use", url: "/terms" },
        { text: "Privacy Policy", url: "/privacy" },
      ],
    },
    {
      title: "Contact",
      links: [
        { text: "Email: support@ecosparkhub.org", url: "mailto:support@ecosparkhub.org" },
        { text: "Phone: +880 1700-000000", url: "tel:+8801700000000" },
        { text: "Dhaka, Bangladesh", url: "https://maps.google.com/?q=Dhaka,Bangladesh" },
      ],
    },
    {
      title: "Social",
      links: [
        { text: "Facebook", url: "https://facebook.com" },
        { text: "LinkedIn", url: "https://linkedin.com" },
        { text: "YouTube", url: "https://youtube.com" },
      ],
    },
  ],
  copyright = "© 2026 EcoSpark Hub. All rights reserved.",
  bottomLinks = [
    { text: "Terms and Conditions", url: "/terms" },
    { text: "Privacy Policy", url: "/privacy" },
  ],
}: Footer2Props) => {
  return (
    <section className={cn("w-full mt-auto border-t border-emerald-100 dark:border-emerald-900/70 bg-linear-to-br from-white via-emerald-50/40 to-emerald-100/30 dark:from-emerald-950 dark:via-emerald-950/95 dark:to-emerald-900/90", className)}>
      <div className="container py-10 md:py-12">
        <footer className="px-2 md:px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:grid-cols-6 text-center sm:text-left">
            <div className="col-span-1 sm:col-span-2 mb-2 lg:mb-0">
              <div className="flex items-center justify-center gap-2 sm:justify-start">
                <Logo url={logo.url}>
                  <LogoImage
                    src={logo.src}
                    alt={logo.alt}
                    title={logo.title}
                    className="h-10 w-auto"
                  />
                </Logo>
              </div>
              <p className="mt-4 font-semibold text-emerald-900/90 dark:text-emerald-100/90 max-w-sm mx-auto sm:mx-0">{tagline}</p>
            </div>
            {menuItems.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h3 className="mb-4 font-bold text-emerald-900 dark:text-emerald-100">{section.title}</h3>
                <ul className="space-y-3 text-muted-foreground">
                  {section.links.map((link, linkIdx) => (
                    <li
                      key={linkIdx}
                      className="font-medium hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                    >
                      <a href={link.url}>{link.text}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-col justify-between gap-4 border-t border-emerald-100 dark:border-emerald-900/70 pt-6 text-sm font-medium text-muted-foreground dark:text-emerald-100/70 md:flex-row md:items-center">
            <p>{copyright}</p>
            <ul className="flex gap-4">
              {bottomLinks.map((link, linkIdx) => (
                <li key={linkIdx} className="underline hover:text-emerald-700 dark:hover:text-emerald-300">
                  <a href={link.url}>{link.text}</a>
                </li>
              ))}
            </ul>
          </div>
        </footer>
      </div>
    </section>
  );
};

export { Footer2 };
