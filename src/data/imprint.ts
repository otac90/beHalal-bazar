export interface ImprintSection {
  number: number;
  title: { de: string; en: string };
  body: { de: string[]; en: string[] };
}

export const IMPRINT_SECTIONS: ImprintSection[] = [
  {
    number: 1,
    title: { de: 'Angaben gemäß den gesetzlichen Informationspflichten', en: 'Information according to statutory requirements' },
    body: {
      de: ['Online Bazar, betrieben durch Boxify KG', 'Simmeringer Hauptstraße 68-74/1/2, Lokal Grillbox, 1110 Wien, Österreich'],
      en: ['Online Bazar, operated by Boxify KG', 'Simmeringer Hauptstraße 68-74/1/2, Lokal Grillbox, 1110 Vienna, Austria'],
    },
  },
  {
    number: 2,
    title: { de: 'Kontakt', en: 'Contact' },
    body: {
      de: ['E-Mail: support@onlinebazar.at'],
      en: ['Email: support@onlinebazar.at'],
    },
  },
  {
    number: 3,
    title: { de: 'Unternehmensdaten', en: 'Company details' },
    body: {
      de: ['Rechtsform: Kommanditgesellschaft (KG)', 'Firmenbuchnummer: FN 508127x', 'Firmenbuchgericht: Handelsgericht Wien', 'Unternehmensgegenstand / Gewerbe: IT-Dienstleistung'],
      en: ['Legal form: limited partnership (KG)', 'Company register number: FN 508127x', 'Company register court: Commercial Court of Vienna', 'Business purpose / trade: IT services'],
    },
  },
  {
    number: 4,
    title: { de: 'Vertretungsbefugnis', en: 'Authorised representation' },
    body: {
      de: ['Geschäftsführer / vertretungsbefugter Vertreter: Adnan Hamidovic'],
      en: ['Managing director / authorised representative: Adnan Hamidovic'],
    },
  },
  {
    number: 5,
    title: { de: 'Aufsichts- und Gewerbebehörde', en: 'Supervisory and trade authority' },
    body: {
      de: ['Zuständige Gewerbebehörde: Magistrat der Stadt Wien.', 'Die Zuständigkeit ergibt sich aus dem Unternehmensstandort und den jeweils geltenden gewerberechtlichen Vorschriften.'],
      en: ['Competent trade authority: Municipal Authority of the City of Vienna.', 'The competent authority is determined by the company location and the applicable trade regulations.'],
    },
  },
  {
    number: 6,
    title: { de: 'Mitgliedschaften', en: 'Memberships' },
    body: {
      de: ['Mitglied der Wirtschaftskammer Wien (WKO).', 'Fachgruppe bzw. Fachvertretung entsprechend dem ausgeübten Gewerbe.'],
      en: ['Member of the Vienna Chamber of Commerce (WKO).', 'The relevant professional group or representation corresponds to the trade carried out.'],
    },
  },
  {
    number: 7,
    title: { de: 'Anwendbare Rechtsvorschriften', en: 'Applicable legal provisions' },
    body: {
      de: ['Für die Tätigkeit gelten insbesondere die einschlägigen österreichischen Vorschriften des Gewerberechts und des E-Commerce-Rechts.', 'Die maßgeblichen Rechtsvorschriften können über das Rechtsinformationssystem des Bundes (RIS) abgerufen werden.'],
      en: ['The relevant Austrian provisions, particularly trade law and e-commerce law, apply to this activity.', 'The applicable legal provisions can be accessed through the Austrian Legal Information System (RIS).'],
    },
  },
  {
    number: 8,
    title: { de: 'Online-Streitbeilegung', en: 'Online dispute resolution' },
    body: {
      de: ['Die frühere Plattform der Europäischen Union zur Online-Streitbeilegung (ODR-Plattform) wurde mit Wirkung zum 20. Juli 2025 eingestellt und wird daher nicht als Kontaktstelle angegeben.', 'Für Verbraucher bestehen je nach Streitigkeit gegebenenfalls andere gesetzliche Möglichkeiten der außergerichtlichen Streitbeilegung.'],
      en: ['The former European Union Online Dispute Resolution platform was discontinued with effect from 20 July 2025 and is therefore not listed as a contact point.', 'Depending on the dispute, consumers may have other statutory options for out-of-court dispute resolution.'],
    },
  },
  {
    number: 9,
    title: { de: 'Verantwortlichkeit für Inhalte', en: 'Responsibility for content' },
    body: {
      de: ['Als Diensteanbieter sind wir für eigene Inhalte nach den allgemeinen gesetzlichen Vorschriften verantwortlich.', 'Für fremde Inhalte, insbesondere Inserate, Nachrichten, Bilder und sonstige Nutzerinhalte, gelten die gesetzlichen Bestimmungen über die Verantwortlichkeit von Diensteanbietern.', 'Rechtswidrige Inhalte können über die vorgesehenen Melde- und Kontaktmöglichkeiten an support@onlinebazar.at gemeldet werden.'],
      en: ['As a service provider, we are responsible for our own content under the general statutory provisions.', 'For third-party content, particularly listings, messages, images, and other user content, the statutory rules on service-provider liability apply.', 'Illegal content can be reported through the designated reporting and contact channels at support@onlinebazar.at.'],
    },
  },
  {
    number: 10,
    title: { de: 'Online-Marktplatz', en: 'Online marketplace' },
    body: {
      de: ['Online Bazar ist eine digitale Plattform, auf der Nutzer eigene Inserate veröffentlichen und miteinander in Kontakt treten können.', 'Soweit nicht ausdrücklich anders angegeben, ist Online Bazar nicht Vertragspartei der zwischen Nutzern geschlossenen Kauf-, Tausch- oder sonstigen Verträge.', 'Die jeweiligen Anbieter sind für ihre Inserate und angebotenen Waren selbst verantwortlich. Gesetzlich erforderliche Informationen werden am jeweiligen Inserat oder an den dafür vorgesehenen Stellen bereitgestellt.'],
      en: ['Online Bazar is a digital platform where users can publish listings and contact one another.', 'Unless expressly stated otherwise, Online Bazar is not a party to sales, exchange, or other contracts concluded between users.', 'The respective providers are responsible for their listings and goods. Legally required information is provided with the relevant listing or in the designated areas of the platform.'],
    },
  },
  {
    number: 11,
    title: { de: 'Haftungshinweis', en: 'Disclaimer' },
    body: {
      de: ['Die Inhalte dieser Website werden mit größtmöglicher Sorgfalt erstellt. Eine Gewähr für Vollständigkeit, Aktualität oder Richtigkeit sämtlicher Inhalte kann nicht übernommen werden.', 'Für von Nutzern veröffentlichte Inhalte sind grundsätzlich die jeweiligen Nutzer verantwortlich.', 'Die Nutzung erfolgt nach Maßgabe der geltenden AGB und der Datenschutzerklärung.'],
      en: ['The contents of this website are prepared with the greatest possible care. No guarantee can be given for the completeness, timeliness, or accuracy of all content.', 'The respective users are generally responsible for content they publish.', 'Use of the platform is governed by the applicable Terms of Service and Privacy Notice.'],
    },
  },
  {
    number: 12,
    title: { de: 'Urheberrecht', en: 'Copyright' },
    body: {
      de: ['Selbst erstellte Texte, Grafiken, Logos, Designs, Softwarebestandteile und sonstige Inhalte unterliegen dem österreichischen Urheberrecht und anderen Schutzrechten.', 'Verwendung, Vervielfältigung, Bearbeitung, Verbreitung oder sonstige Verwertung außerhalb der gesetzlichen Schranken bedarf der Zustimmung des jeweiligen Rechteinhabers.', 'Von Nutzern veröffentlichte Inhalte verbleiben grundsätzlich im Verantwortungs- und Rechtebereich der jeweiligen Nutzer.'],
      en: ['Original text, graphics, logos, designs, software components, and other content are protected by Austrian copyright and other intellectual property rights.', 'Use, reproduction, modification, distribution, or other exploitation beyond statutory exceptions requires the relevant rights holder’s consent.', 'Content published by users generally remains within the responsibility and rights sphere of the respective users.'],
    },
  },
  {
    number: 13,
    title: { de: 'Datenschutz', en: 'Privacy' },
    body: {
      de: ['Informationen zur Verarbeitung personenbezogener Daten finden Sie in unserer Datenschutzerklärung.', 'Bei Fragen zum Datenschutz: support@onlinebazar.at'],
      en: ['Information about the processing of personal data is provided in our Privacy Notice.', 'For privacy questions: support@onlinebazar.at'],
    },
  },
  {
    number: 14,
    title: { de: 'Stand und Copyright-Hinweis', en: 'Version and copyright notice' },
    body: {
      de: ['Stand: 30. September 2026', '© Online Bazar / Boxify KG'],
      en: ['Version: 30 September 2026', '© Online Bazar / Boxify KG'],
    },
  },
];
