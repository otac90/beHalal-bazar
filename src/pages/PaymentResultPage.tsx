import React, { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, Clock3, CreditCard, LoaderCircle, ShieldCheck, XCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getListingPaymentStatus } from '../utils/stripe';
import { storage } from '../services/storage';

interface PaymentResultPageProps {
  success: boolean;
}

interface PaymentDetails {
  paid: boolean;
  status: string;
  listing: { id: string; title: string; listingFee: number; durationDays: number; expiresAt: string | null };
}

export const PaymentResultPage: React.FC<PaymentResultPageProps> = ({ success }) => {
  const { navigate } = useApp();
  const [details, setDetails] = useState<PaymentDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const sessionId = new URLSearchParams(window.location.search).get('session_id');

  useEffect(() => {
    if (!success || !sessionId) return;
    let cancelled = false;
    let attempts = 0;

    const loadStatus = async () => {
      try {
        const nextDetails = await getListingPaymentStatus(sessionId);
        if (cancelled) return;
        setDetails(nextDetails);
        if (nextDetails.paid) {
          const pendingKey = `behalal_pending_listing_${nextDetails.listing.id}`;
          const pendingDraft = sessionStorage.getItem(pendingKey);
          const localListing = pendingDraft
            ? JSON.parse(pendingDraft) as ReturnType<typeof storage.getListingById>
            : storage.getListingById(nextDetails.listing.id);
          if (localListing) {
            storage.saveListing({
              ...localListing,
              status: 'ACTIVE',
              publishedAt: new Date().toISOString(),
              expiresAt: nextDetails.listing.expiresAt || undefined,
            });
          }
          sessionStorage.removeItem(pendingKey);
        }
        if (!nextDetails.paid && attempts < 8) {
          attempts += 1;
          window.setTimeout(loadStatus, 1500);
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : 'Zahlungsstatus nicht verfügbar.');
      }
    };

    void loadStatus();
    return () => { cancelled = true; };
  }, [sessionId, success]);

  if (!success) {
    return (
      <ResultShell>
        <XCircle className="mx-auto h-14 w-14 text-[#B94A48]" />
        <h1 className="mt-6 font-serif text-4xl font-bold text-[#171A17] dark:text-white">Zahlung abgebrochen</h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          Es wurde nichts abgebucht und dein Inserat wurde nicht veröffentlicht. Du kannst den Vorgang später erneut starten.
        </p>
        <button onClick={() => navigate('account')} className="mt-8 inline-flex items-center gap-3 bg-[#123D2A] px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-white hover:bg-[#171A17]">
          Zu meinen Inseraten <ArrowRight className="h-4 w-4" />
        </button>
      </ResultShell>
    );
  }

  if (error) {
    return (
      <ResultShell>
        <XCircle className="mx-auto h-14 w-14 text-[#B94A48]" />
        <h1 className="mt-6 font-serif text-4xl font-bold text-[#171A17] dark:text-white">Zahlung wird geprüft</h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-gray-600 dark:text-gray-300">{error}</p>
        <button onClick={() => navigate('account')} className="mt-8 inline-flex items-center gap-3 border border-[#123D2A] px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#123D2A] dark:border-white dark:text-white">
          Zum Konto <ArrowRight className="h-4 w-4" />
        </button>
      </ResultShell>
    );
  }

  if (!details || !details.paid) {
    return (
      <ResultShell>
        <LoaderCircle className="mx-auto h-14 w-14 animate-spin text-[#F4C430]" />
        <h1 className="mt-6 font-serif text-4xl font-bold text-[#171A17] dark:text-white">Zahlung wird bestätigt</h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-gray-600 dark:text-gray-300">Wir warten noch auf die Bestätigung von Stripe. Diese Seite aktualisiert sich automatisch.</p>
      </ResultShell>
    );
  }

  const formattedExpiry = details.listing.expiresAt
    ? new Intl.DateTimeFormat('de-AT', { dateStyle: 'medium' }).format(new Date(details.listing.expiresAt))
    : `${details.listing.durationDays} Tage`;

  return (
    <ResultShell>
      <CheckCircle2 className="mx-auto h-14 w-14 text-[#123D2A] dark:text-[#F4C430]" />
      <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[#123D2A] dark:text-[#F4C430]">Zahlung erfolgreich</p>
      <h1 className="mt-2 font-serif text-4xl font-bold text-[#171A17] dark:text-white">Dein Inserat ist online</h1>
      <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-gray-600 dark:text-gray-300">Stripe hat die Zahlung bestätigt. Dein Inserat wurde jetzt veröffentlicht.</p>

      <div className="mx-auto mt-10 max-w-xl border border-gray-200 bg-white text-left dark:border-white/10 dark:bg-white/5">
        <div className="border-b border-gray-200 p-6 dark:border-white/10">
          <div className="flex items-center gap-3"><CreditCard className="h-5 w-5 text-[#F4C430]" /><span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Zahlungsübersicht</span></div>
          <h2 className="mt-3 font-serif text-2xl font-bold text-[#171A17] dark:text-white">{details.listing.title}</h2>
        </div>
        <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-3">
          <SummaryItem label="Bezahlt" value={`€ ${details.listing.listingFee.toFixed(2)}`} />
          <SummaryItem label="Laufzeit" value={`${details.listing.durationDays} Tage`} />
          <SummaryItem label="Online bis" value={formattedExpiry} />
        </div>
      </div>

      <div className="mx-auto mt-6 flex max-w-xl items-start gap-3 text-left text-xs text-gray-500"><ShieldCheck className="h-4 w-4 shrink-0 text-[#123D2A] dark:text-[#F4C430]" />Die Zahlung wurde sicher über Stripe verarbeitet. Dein Inserat kann jetzt von anderen gefunden werden.</div>
      <button onClick={() => navigate('listing-detail', { id: details.listing.id })} className="mt-8 inline-flex items-center gap-3 bg-[#123D2A] px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-white hover:bg-[#171A17]">Inserat ansehen <ArrowRight className="h-4 w-4" /></button>
    </ResultShell>
  );
};

const SummaryItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div><p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</p><p className="mt-2 text-sm font-bold text-[#171A17] dark:text-white">{value}</p></div>
);

const ResultShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <main className="mx-auto flex min-h-[65vh] max-w-4xl items-center justify-center px-4 py-20 text-center">
    <div className="w-full">{children}</div>
  </main>
);
