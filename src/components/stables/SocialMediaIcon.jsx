import React from "react";
import {
  Link2,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Linkedin,
  Pinterest,
  TikTok,
} from "lucide-react";

const SocialMediaIcon = ({ linkType, url }) => {
  const icons = {
    website: <Link2 size={20} />,
    instagram: <Instagram size={20} />,
    facebook: <Facebook size={20} />,
    youtube: <Youtube size={20} />,
    x: <Twitter size={20} />,
    linkedin: <Linkedin size={20} />,
    pinterest: <Pinterest size={20} />,
    tiktok: <TikTok size={20} />,
  };
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-gray-600 hover:text-primary transition-colors"
    >
      {icons[linkType] || <Link2 size={20} />}
    </a>
  );
};

export default SocialMediaIcon; 