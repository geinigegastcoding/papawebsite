"use client";

import { FormEvent, useState } from "react";

type ContactFormProps = {
  contactEmail: string;
};

export function ContactForm({ contactEmail }: ContactFormProps) {
  const [status, setStatus] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const organization = String(formData.get("organization") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const question = String(formData.get("question") ?? "").trim();

    const subject = `Kennismaking via Magis Data Intelligence - ${organization || name || "nieuwe aanvraag"}`;
    const body = [
      `Naam: ${name}`,
      `Organisatie: ${organization || "-"}`,
      `E-mail: ${email}`,
      "",
      "Vraagstuk:",
      question,
    ].join("\n");

    const href = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    setStatus("Je e-mailprogramma wordt geopend met je ingevulde bericht.");
    window.location.href = href;
  }

  return (
    <form onSubmit={handleSubmit} className="paper-panel rounded-[2rem] p-6 md:p-8">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2 text-sm font-semibold text-[#18274a]">
          Naam
          <input className="input-field" name="name" placeholder="Je naam" required />
        </label>
        <label className="space-y-2 text-sm font-semibold text-[#18274a]">
          Organisatie
          <input className="input-field" name="organization" placeholder="Naam van je organisatie" />
        </label>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <label className="space-y-2 text-sm font-semibold text-[#18274a]">
          E-mailadres
          <input className="input-field" name="email" type="email" placeholder="naam@organisatie.nl" required />
        </label>
        <label className="space-y-2 text-sm font-semibold text-[#18274a]">
          Gewenste ondersteuning
          <input
            className="input-field"
            name="focus"
            placeholder="Bijv. dashboard, analyse, benchmark of interim"
          />
        </label>
      </div>

      <label className="mt-5 block space-y-2 text-sm font-semibold text-[#18274a]">
        Waar wil je mee verder komen?
        <textarea
          className="input-field min-h-40 resize-y"
          name="question"
          placeholder="Beschrijf kort je vraagstuk, context of informatiebehoefte."
          required
        />
      </label>

      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-[#53658f]">
          Dit formulier opent je eigen e-mailprogramma met een vooringevuld bericht aan {contactEmail}.
        </div>
        <button type="submit" className="button-primary border-0">
          Verstuur aanvraag
        </button>
      </div>

      {status ? <p className="mt-4 text-sm text-[#1d72f2]">{status}</p> : null}
    </form>
  );
}
