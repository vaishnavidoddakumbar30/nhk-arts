import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | N H K ARTS",
  description: "Get in touch for inquiries, commissions, or just to say hello.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
