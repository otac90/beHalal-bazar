import { createClient } from './client';

export type ControlCenterReportStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
export type SupportTicketStatus = 'NEW' | 'OPEN' | 'IN_PROGRESS' | 'WAITING_USER' | 'RESOLVED';
export type StaffRole = 'USER' | 'MEMBER' | 'MODERATOR' | 'SUPPORT' | 'ADMIN';

export interface ControlCenterProfile {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  role: StaffRole;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ControlCenterReport {
  id: string;
  source: 'LISTING' | 'USER' | 'CONVERSATION' | 'CONTENT';
  reporter_id: string | null;
  reported_user_id: string | null;
  listing_id: string | null;
  conversation_id: string | null;
  reason: string;
  description: string;
  status: ControlCenterReportStatus;
  assigned_to: string | null;
  resolution_note: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface ControlCenterTicket {
  id: string;
  requester_id: string | null;
  requester_name: string;
  requester_email: string;
  subject: string;
  message: string;
  status: SupportTicketStatus;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface ControlCenterAuditLog {
  id: string;
  actor_id: string | null;
  action: string;
  target_type: string;
  target_id: string | null;
  reason: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ControlCenterListing {
  id: string;
  user_id: string;
  title: string;
  category_id: string;
  status: string;
  price: number;
  created_at: string;
  expires_at: string | null;
  description: string;
  type: string;
  subcategory_id: string | null;
  brand: string | null;
  condition: string;
  negotiable: boolean;
  is_free: boolean;
  delivery_type: string;
  country: string;
  postal_code: string;
  city: string;
  moderation_reason: string | null;
  published_at: string | null;
  updated_at: string;
}

export interface ControlCenterListingImage {
  id: string;
  listing_id: string;
  url: string;
  sort_order: number;
  is_cover: boolean;
}

export interface ControlCenterWarning {
  id: string;
  user_id: string;
  issued_by: string;
  report_id: string | null;
  reason: string;
  internal_note: string | null;
  created_at: string;
}

export interface ControlCenterSuspension {
  id: string;
  user_id: string;
  issued_by: string;
  report_id: string | null;
  starts_at: string;
  ends_at: string | null;
  reason: string;
  revoked_at: string | null;
  created_at: string;
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_id: string | null;
  body: string;
  is_internal: boolean;
  created_at: string;
}

export interface ModerationConversationMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
}

const throwIfError = (error: { message: string } | null, fallback: string) => {
  if (error) throw new Error(error.message || fallback);
};

export async function loadControlCenterData() {
  const supabase = createClient();
  const [profiles, reports, tickets, listings, listingImages, auditLogs, warnings, suspensions] = await Promise.all([
    supabase.from('profiles').select('id, username, first_name, last_name, avatar_url, role, status, created_at, updated_at').order('created_at', { ascending: false }).range(0, 199),
    supabase.from('moderation_reports').select('*').order('created_at', { ascending: false }).range(0, 199),
    supabase.from('support_tickets').select('*').order('created_at', { ascending: false }).range(0, 199),
    supabase.from('listings').select('*').order('created_at', { ascending: false }).range(0, 199),
    supabase.from('listing_images').select('id, listing_id, url, sort_order, is_cover').order('sort_order', { ascending: true }).range(0, 999),
    supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).range(0, 99),
    supabase.from('user_warnings').select('*').order('created_at', { ascending: false }).range(0, 199),
    supabase.from('user_suspensions').select('*').order('created_at', { ascending: false }).range(0, 199),
  ]);

  throwIfError(profiles.error, 'Benutzer konnten nicht geladen werden.');
  throwIfError(reports.error, 'Meldungen konnten nicht geladen werden.');
  throwIfError(tickets.error, 'Support-Anfragen konnten nicht geladen werden.');
  throwIfError(listings.error, 'Inserate konnten nicht geladen werden.');
  throwIfError(listingImages.error, 'Inseratsbilder konnten nicht geladen werden.');
  throwIfError(auditLogs.error, 'Aktivitäten konnten nicht geladen werden.');
  throwIfError(warnings.error, 'Verwarnungen konnten nicht geladen werden.');
  throwIfError(suspensions.error, 'Sperren konnten nicht geladen werden.');

  return {
    profiles: (profiles.data ?? []) as ControlCenterProfile[],
    reports: (reports.data ?? []) as ControlCenterReport[],
    tickets: (tickets.data ?? []) as ControlCenterTicket[],
    listings: (listings.data ?? []) as ControlCenterListing[],
    listingImages: (listingImages.data ?? []) as ControlCenterListingImage[],
    auditLogs: (auditLogs.data ?? []) as ControlCenterAuditLog[],
    warnings: (warnings.data ?? []) as ControlCenterWarning[],
    suspensions: (suspensions.data ?? []) as ControlCenterSuspension[],
  };
}

export async function loadSupportMessages(ticketId: string) {
  const { data, error } = await createClient().from('support_messages').select('*').eq('ticket_id', ticketId).order('created_at', { ascending: true });
  throwIfError(error, 'Support-Verlauf konnte nicht geladen werden.');
  return (data ?? []) as SupportMessage[];
}

export async function loadConversationMessages(conversationId: string) {
  const { data, error } = await createClient().from('messages').select('id, conversation_id, sender_id, content, read_at, created_at').eq('conversation_id', conversationId).order('created_at', { ascending: true }).limit(200);
  throwIfError(error, 'Nachrichtenkontext konnte nicht geladen werden.');
  return (data ?? []) as ModerationConversationMessage[];
}

export async function submitSupportTicket(name: string, email: string, subject: string, message: string) {
  const { data, error } = await createClient().rpc('submit_support_ticket', { p_name: name, p_email: email, p_subject: subject, p_message: message });
  throwIfError(error, 'Support-Anfrage konnte nicht gespeichert werden.');
  return data as string;
}

export async function updateModerationReport(reportId: string, status: ControlCenterReportStatus, note?: string, assignedTo?: string | null) {
  const { error } = await createClient().rpc('moderation_update_report', { p_report_id: reportId, p_status: status, p_note: note ?? null, p_assigned_to: assignedTo ?? null });
  throwIfError(error, 'Meldungsstatus konnte nicht aktualisiert werden.');
}

export async function warnUser(userId: string, reason: string, internalNote?: string, reportId?: string) {
  const { error } = await createClient().rpc('moderation_warn_user', { p_user_id: userId, p_reason: reason, p_internal_note: internalNote ?? null, p_report_id: reportId ?? null });
  throwIfError(error, 'Verwarnung konnte nicht gespeichert werden.');
}

export async function suspendUser(userId: string, endsAt: string, reason: string, reportId?: string) {
  const { error } = await createClient().rpc('moderation_suspend_user', { p_user_id: userId, p_ends_at: endsAt, p_reason: reason, p_report_id: reportId ?? null });
  throwIfError(error, 'Sperre konnte nicht gespeichert werden.');
}

export async function banUser(userId: string, reason: string, reportId?: string) {
  const { error } = await createClient().rpc('moderation_ban_user', { p_user_id: userId, p_reason: reason, p_report_id: reportId ?? null });
  throwIfError(error, 'Dauerhafte Sperre konnte nicht gespeichert werden.');
}

export async function softDeleteUser(userId: string, reason: string) {
  const { error } = await createClient().rpc('admin_soft_delete_user', { p_user_id: userId, p_reason: reason });
  throwIfError(error, 'Account konnte nicht deaktiviert werden.');
}

export async function setProfileRole(userId: string, role: StaffRole) {
  const { error } = await createClient().rpc('admin_set_profile_role', { p_user_id: userId, p_role: role });
  throwIfError(error, 'Rolle konnte nicht geändert werden.');
}

export async function updateListingStatus(listingId: string, status: 'ACTIVE' | 'REJECTED' | 'BLOCKED' | 'DELETED', reason?: string) {
  const { error } = await createClient().rpc('admin_update_listing_status', { p_listing_id: listingId, p_status: status, p_reason: reason ?? null });
  throwIfError(error, 'Inseratsstatus konnte nicht aktualisiert werden.');
}

export async function updateSupportTicket(ticketId: string, status: SupportTicketStatus, assignedTo?: string | null) {
  const { error } = await createClient().from('support_tickets').update({ status, assigned_to: assignedTo ?? null, resolved_at: status === 'RESOLVED' ? new Date().toISOString() : null }).eq('id', ticketId);
  throwIfError(error, 'Support-Anfrage konnte nicht aktualisiert werden.');
}

export async function replyToSupportTicket(ticketId: string, senderId: string, body: string, isInternal = false) {
  const { error } = await createClient().from('support_messages').insert({ ticket_id: ticketId, sender_id: senderId, body: body.trim(), is_internal: isInternal });
  throwIfError(error, 'Antwort konnte nicht gespeichert werden.');
}

export function subscribeToControlCenter(onChange: () => void) {
  const supabase = createClient();
  const channel = supabase
    .channel(`control-center-${Date.now()}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'moderation_reports' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'audit_logs' }, onChange)
    .subscribe();
  return () => { void supabase.removeChannel(channel); };
}
