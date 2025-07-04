import { SiteConfig } from "@/types";
import { env } from "@/env.mjs";

const site_url = env.NEXT_PUBLIC_APP_URL;

export const siteConfig: SiteConfig = {
  name: "Starter",
  description:"Starter",
  url: site_url,
  ogImage: `${site_url}/_static/opengraph-image.jpg`,
  links: {
    twitter: "https://twitter.com/JoaoCarlosAssis",
    github: "https://github.com/JoaoCarlosAssis/starter",
  },
  mailSupport: "support@starter.com",
};
