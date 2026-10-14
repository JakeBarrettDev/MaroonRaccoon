import ContactForm from "../../components/ContactForm";

export const metadata = {
  title: "Contact",
  description:
    "Tell Maroon Raccoon about your project. Get a straight answer on scope, timeline and cost for a custom website or web app — no pressure, no runaround.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return <ContactForm />;
}
