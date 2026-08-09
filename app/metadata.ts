import type { Metadata } from "next";

const siteName = "Magis Data Intelligence";

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  image: string;
  socialTitle?: string;
  socialDescription?: string;
};

export function createPageMetadata({
  title,
  description,
  path,
  image,
  socialTitle = title,
  socialDescription = description,
}: PageMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "nl_NL",
      siteName,
      title: socialTitle,
      description: socialDescription,
      url: path,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: socialDescription,
      images: [image],
    },
  };
}
