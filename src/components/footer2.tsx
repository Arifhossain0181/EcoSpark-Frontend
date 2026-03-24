import { Logo, LogoImage, LogoText } from "@/components/logo";
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
    src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblockscom-icon.svg",
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
        { text: "Dhaka, Bangladesh", url: "#" },
      ],
    },
    {
      title: "Social",
      links: [
        { text: "Facebook", url: "#" },
        { text: "LinkedIn", url: "#" },
        { text: "YouTube", url: "#" },
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
    <section className={cn("py-32", className)}>
      <div className="container">
        <footer>
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-6">
            <div className="col-span-2 mb-8 lg:mb-0">
              <div className="flex items-center gap-2 lg:justify-start">
                <Logo url={logo.url}>
                  <LogoImage
                    src={logo.src}
                    alt={logo.alt}
                    title={logo.title}
                    className="h-10 dark:invert"
                  />
                  <LogoText className="text-xl">{logo.title}</LogoText>
                </Logo>
              </div>
              <p className="mt-4 font-bold">{tagline}</p>
            </div>
            {menuItems.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h3 className="mb-4 font-bold">{section.title}</h3>
                <ul className="space-y-4 text-muted-foreground">
                  {section.links.map((link, linkIdx) => (
                    <li
                      key={linkIdx}
                      className="font-medium hover:text-primary"
                    >
                      <a href={link.url}>{link.text}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-24 flex flex-col justify-between gap-4 border-t pt-8 text-sm font-medium text-muted-foreground md:flex-row md:items-center">
            <p>{copyright}</p>
            <ul className="flex gap-4">
              {bottomLinks.map((link, linkIdx) => (
                <li key={linkIdx} className="underline hover:text-primary">
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
