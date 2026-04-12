import {
  FaFacebookF,
  FaYoutube,
  FaLinkedinIn,
  FaTelegramPlane,
  FaInstagram,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

function env(key) {
  return String(import.meta.env[key] || "").trim();
}

const FALLBACK_HREF = "/contact";

/** Official profile — opens in app/browser when env override is not set. */
const DEFAULT_INSTAGRAM_URL = "https://www.instagram.com/bharat_skill_academy/";
const DEFAULT_FACEBOOK_URL =
  "https://www.facebook.com/profile.php?id=61572054090601";

export function getFooterSocialLinks() {
  return [
    {
      id: "facebook",
      label: "Facebook",
      href: env("VITE_SOCIAL_FACEBOOK") || DEFAULT_FACEBOOK_URL,
      Icon: FaFacebookF,
    },
    { id: "twitter", label: "X", href: env("VITE_SOCIAL_TWITTER") || FALLBACK_HREF, Icon: FaXTwitter },
    { id: "youtube", label: "YouTube", href: env("VITE_SOCIAL_YOUTUBE") || FALLBACK_HREF, Icon: FaYoutube },
    { id: "linkedin", label: "LinkedIn", href: env("VITE_SOCIAL_LINKEDIN") || FALLBACK_HREF, Icon: FaLinkedinIn },
    { id: "telegram", label: "Telegram", href: env("VITE_SOCIAL_TELEGRAM") || FALLBACK_HREF, Icon: FaTelegramPlane },
    {
      id: "instagram",
      label: "Instagram",
      href: env("VITE_SOCIAL_INSTAGRAM") || DEFAULT_INSTAGRAM_URL,
      Icon: FaInstagram,
    },
  ];
}
