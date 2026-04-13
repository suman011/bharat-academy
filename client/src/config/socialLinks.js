import { FaFacebookF, FaYoutube, FaLinkedinIn, FaInstagram } from "react-icons/fa";

function env(key) {
  return String(import.meta.env[key] || "").trim();
}

const FALLBACK_HREF = "/contact";

/** Official profile — opens in app/browser when env override is not set. */
const DEFAULT_INSTAGRAM_URL = "https://www.instagram.com/bharat_skill_academy/";
const DEFAULT_FACEBOOK_URL =
  "https://www.facebook.com/profile.php?id=61572054090601";
const DEFAULT_LINKEDIN_URL = "https://www.linkedin.com/company/bharat-skill-academy/";

export function getFooterSocialLinks() {
  return [
    {
      id: "instagram",
      label: "Instagram",
      href: env("VITE_SOCIAL_INSTAGRAM") || DEFAULT_INSTAGRAM_URL,
      Icon: FaInstagram,
    },
    {
      id: "facebook",
      label: "Facebook",
      href: env("VITE_SOCIAL_FACEBOOK") || DEFAULT_FACEBOOK_URL,
      Icon: FaFacebookF,
    },
    {
      id: "youtube",
      label: "YouTube",
      href: env("VITE_SOCIAL_YOUTUBE") || FALLBACK_HREF,
      Icon: FaYoutube,
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      href: env("VITE_SOCIAL_LINKEDIN") || DEFAULT_LINKEDIN_URL,
      Icon: FaLinkedinIn,
    },
  ];
}
