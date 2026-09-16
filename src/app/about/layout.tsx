import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | N H K ARTS",
  description: "Learn more about the artist behind N H K ARTS and the philosophy driving the collection.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
