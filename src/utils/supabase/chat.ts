import type { ChatAttachment, Conversation, Listing, Message } from '../../types';
import { createClient } from './client';

interface ConversationRow { id: string; listing_id: string; buyer_id: string; seller_id: string; buyer_display_name: string; buyer_avatar_url: string | null; seller_display_name: string; seller_avatar_url: string | null; last_message: string | null; last_message_at: string; created_at: string; updated_at: string; unread_for_buyer?: boolean; unread_for_seller?: boolean; deleted_by_buyer_at?: string | null; deleted_by_seller_at?: string | null; }
interface AttachmentRow { id: string; message_id: string; file_name: string; mime_type: string; file_size: number; storage_path: string; }
interface MessageRow { id: string; conversation_id: string; sender_id: string; content: string; read_at: string | null; created_at: string; message_attachments?: AttachmentRow[]; }

const conversationSelect = 'id, listing_id, buyer_id, seller_id, buyer_display_name, buyer_avatar_url, seller_display_name, seller_avatar_url, last_message, last_message_at, created_at, updated_at, unread_for_buyer, unread_for_seller, deleted_by_buyer_at, deleted_by_seller_at';
const messageSelect = 'id, conversation_id, sender_id, content, read_at, created_at, message_attachments(id, message_id, file_name, mime_type, file_size, storage_path)';
const throwIfError = (error: { message: string } | null, fallback: string) => { if (error) throw new Error(error.message || fallback); };

const mapAttachment = (row: AttachmentRow, url?: string): ChatAttachment => ({ id: row.id, fileName: row.file_name, mimeType: row.mime_type, fileSize: Number(row.file_size), storagePath: row.storage_path, url });
const mapMessage = (row: MessageRow, attachmentUrls = new Map<string, string>()): Message => ({ id: row.id, conversationId: row.conversation_id, senderId: row.sender_id, content: row.content, attachments: (row.message_attachments ?? []).map((attachment) => mapAttachment(attachment, attachmentUrls.get(attachment.storage_path))), readAt: row.read_at ?? undefined, createdAt: row.created_at });
const mapConversation = (row: ConversationRow, userId: string): Conversation => ({
  id: row.id, listingId: row.listing_id, listingTitle: 'Inserat', listingPrice: 0, listingType: 'SELL', listingImage: '', listingStatus: 'ACTIVE',
  buyerId: row.buyer_id, buyerName: row.buyer_display_name || 'Käufer', buyerAvatar: row.buyer_avatar_url ?? undefined,
  sellerId: row.seller_id, sellerName: row.seller_display_name || 'Anbieter', sellerAvatar: row.seller_avatar_url ?? undefined,
  lastMessage: row.last_message ?? undefined, lastMessageAt: row.last_message_at,
  unreadCountForUser: userId === row.buyer_id ? (row.unread_for_buyer ? 1 : 0) : (row.unread_for_seller ? 1 : 0),
  deletedForUser: userId === row.buyer_id ? Boolean(row.deleted_by_buyer_at) : Boolean(row.deleted_by_seller_at),
});

export async function listConversations(userId: string) {
  const supabase = createClient();
  const { data: rows, error } = await supabase.from('conversations').select(conversationSelect).order('last_message_at', { ascending: false });
  throwIfError(error, 'Unterhaltungen konnten nicht geladen werden.');
  const conversations = (rows as ConversationRow[] ?? []).filter((row) => (row.buyer_id === userId || row.seller_id === userId) && !mapConversation(row, userId).deletedForUser).map((row) => mapConversation(row, userId));
  const listingIds = [...new Set(conversations.map((conversation) => conversation.listingId))];
  if (conversations.length === 0) return conversations;

  const { data: unreadRows, error: unreadError } = await supabase
    .from('messages')
    .select('conversation_id')
    .in('conversation_id', conversations.map((conversation) => conversation.id))
    .neq('sender_id', userId)
    .is('read_at', null);
  throwIfError(unreadError, 'Nachrichtenstatus konnte nicht geladen werden.');
  const unreadCounts = new Map<string, number>();
  (unreadRows ?? []).forEach((row) => unreadCounts.set(row.conversation_id as string, (unreadCounts.get(row.conversation_id as string) ?? 0) + 1));
  const conversationsWithCounts = conversations.map((conversation) => ({ ...conversation, unreadCountForUser: unreadCounts.get(conversation.id) ?? 0 }));
  const { data: listings, error: listingError } = await supabase.from('listings').select('id, title, price, type, status, listing_images(url, is_cover, sort_order)').in('id', listingIds);
  throwIfError(listingError, 'Inseratdaten konnten nicht geladen werden.');
  const listingById = new Map<string, { title: string; price: number; type: Conversation['listingType']; status: Conversation['listingStatus']; image: string }>((listings ?? []).map((listing) => {
    const images = (listing.listing_images ?? []) as { url: string; is_cover: boolean; sort_order: number }[];
    const cover = images.find((image) => image.is_cover) ?? images.sort((a, b) => a.sort_order - b.sort_order)[0];
    return [listing.id as string, { title: listing.title as string, price: Number(listing.price ?? 0), type: listing.type as Conversation['listingType'], status: listing.status as Conversation['listingStatus'], image: cover?.url ?? '' }];
  }));
  return conversationsWithCounts.map((conversation) => { const listing = listingById.get(conversation.listingId); return listing ? { ...conversation, listingTitle: listing.title, listingPrice: listing.price, listingType: listing.type, listingStatus: listing.status, listingImage: listing.image } : conversation; });
}

export async function getConversationMessages(conversationId: string) {
  const { data, error } = await createClient().from('messages').select(messageSelect).eq('conversation_id', conversationId).order('created_at', { ascending: true });
  throwIfError(error, 'Nachrichten konnten nicht geladen werden.');
  const rows = data as MessageRow[] ?? [];
  const paths = [...new Set(rows.flatMap((row) => (row.message_attachments ?? []).map((attachment) => attachment.storage_path)))];
  const { data: signed, error: signedError } = paths.length ? await createClient().storage.from('chat-attachments').createSignedUrls(paths, 3600) : { data: [], error: null };
  throwIfError(signedError, 'Anhänge konnten nicht geladen werden.');
  const urls = new Map<string, string>();
  (signed ?? []).forEach((item, index) => { if (item.signedUrl) urls.set(paths[index], item.signedUrl); });
  return rows.map((row) => mapMessage(row, urls));
}

export async function createConversation(listing: Listing, buyerId: string, buyerName: string, buyerAvatar?: string) {
  const supabase = createClient();
  const { data: existing, error: existingError } = await supabase.from('conversations').select(conversationSelect).eq('listing_id', listing.id).eq('buyer_id', buyerId).maybeSingle();
  throwIfError(existingError, 'Unterhaltung konnte nicht geladen werden.');
  if (existing) return mapConversation(existing as ConversationRow, buyerId);
  const { data, error } = await supabase.from('conversations').insert({ listing_id: listing.id, buyer_id: buyerId, seller_id: listing.userId, buyer_display_name: buyerName, buyer_avatar_url: buyerAvatar ?? null, seller_display_name: listing.seller ? `${listing.seller.firstName}` : 'Anbieter', seller_avatar_url: listing.seller?.avatarUrl ?? null }, { onConflict: 'listing_id,buyer_id' }).select(conversationSelect).single();
  throwIfError(error, 'Unterhaltung konnte nicht gestartet werden.');
  return mapConversation(data as ConversationRow, buyerId);
}

export async function sendChatMessage(conversationId: string, senderId: string, content: string) {
  const { data, error } = await createClient().from('messages').insert({ conversation_id: conversationId, sender_id: senderId, content: content.trim() }).select(messageSelect).single();
  throwIfError(error, 'Nachricht konnte nicht gesendet werden.');
  return mapMessage(data as MessageRow);
}

export async function sendChatMessageWithAttachments(conversationId: string, senderId: string, content: string, files: File[]) {
  const supabase = createClient();
  const uploadedPaths: string[] = [];
  try {
    const prepared = files.map((file) => ({ file, path: `${senderId}/${conversationId}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}` }));
    for (const { file, path } of prepared) { const { error } = await supabase.storage.from('chat-attachments').upload(path, file, { contentType: file.type, upsert: false }); throwIfError(error, 'Datei konnte nicht hochgeladen werden.'); uploadedPaths.push(path); }
    const { data: messageData, error: messageError } = await supabase.from('messages').insert({ conversation_id: conversationId, sender_id: senderId, content: content.trim() }).select('id, conversation_id, sender_id, content, read_at, created_at').single();
    throwIfError(messageError, 'Nachricht konnte nicht gesendet werden.');
    const message = messageData as MessageRow;
    const { data: attachments, error: attachmentError } = await supabase.from('message_attachments').insert(prepared.map(({ file, path }) => ({ message_id: message.id, conversation_id: conversationId, sender_id: senderId, file_name: file.name, mime_type: file.type || 'application/octet-stream', file_size: file.size, storage_path: path }))).select('id, message_id, file_name, mime_type, file_size, storage_path');
    throwIfError(attachmentError, 'Dateiinformationen konnten nicht gespeichert werden.');
    message.message_attachments = attachments as AttachmentRow[];
    const { data: signed } = await supabase.storage.from('chat-attachments').createSignedUrls(uploadedPaths, 3600);
    const urls = new Map<string, string>();
    (signed ?? []).forEach((item, index) => { if (item.signedUrl) urls.set(uploadedPaths[index], item.signedUrl); });
    return mapMessage(message, urls);
  } catch (error) { if (uploadedPaths.length > 0) await supabase.storage.from('chat-attachments').remove(uploadedPaths); throw error; }
}

async function getConversationRole(conversationId: string, userId: string) {
  const { data, error } = await createClient().from('conversations').select('buyer_id').eq('id', conversationId).single();
  throwIfError(error, 'Unterhaltung konnte nicht geladen werden.');
  return data?.buyer_id === userId ? 'buyer' : 'seller';
}

export async function markMessagesAsRead(conversationId: string, userId: string) {
  const supabase = createClient();
  const { error } = await supabase.from('messages').update({ read_at: new Date().toISOString() }).eq('conversation_id', conversationId).neq('sender_id', userId).is('read_at', null);
  throwIfError(error, 'Nachrichten konnten nicht als gelesen markiert werden.');
  const field = (await getConversationRole(conversationId, userId)) === 'buyer' ? 'unread_for_buyer' : 'unread_for_seller';
  const { error: conversationError } = await supabase.from('conversations').update({ [field]: false }).eq('id', conversationId);
  throwIfError(conversationError, 'Unterhaltungsstatus konnte nicht aktualisiert werden.');
}

export async function markConversationUnread(conversationId: string, userId: string) {
  const field = (await getConversationRole(conversationId, userId)) === 'buyer' ? 'unread_for_buyer' : 'unread_for_seller';
  const { error } = await createClient().from('conversations').update({ [field]: true }).eq('id', conversationId);
  throwIfError(error, 'Unterhaltung konnte nicht als ungelesen markiert werden.');
}

export async function deleteConversationForUser(conversationId: string, userId: string) {
  const field = (await getConversationRole(conversationId, userId)) === 'buyer' ? 'deleted_by_buyer_at' : 'deleted_by_seller_at';
  const { error } = await createClient().from('conversations').update({ [field]: new Date().toISOString() }).eq('id', conversationId);
  throwIfError(error, 'Unterhaltung konnte nicht gelöscht werden.');
}

export async function blockUser(blockedUserId: string, blockerId: string, reason: string) { const { error } = await createClient().from('user_blocks').upsert({ blocker_id: blockerId, blocked_id: blockedUserId, reason }, { onConflict: 'blocker_id,blocked_id' }); throwIfError(error, 'Nutzer konnte nicht blockiert werden.'); }
export async function reportChatConversation(conversationId: string, reporterId: string, reportedUserId: string, reason: string, description: string) { const { error } = await createClient().from('chat_reports').insert({ conversation_id: conversationId, reporter_id: reporterId, reported_user_id: reportedUserId, reason, description }); throwIfError(error, 'Meldung konnte nicht übermittelt werden.'); }

export async function getUnreadMessageCount(userId: string) { const { count, error } = await createClient().from('messages').select('id', { count: 'exact', head: true }).neq('sender_id', userId).is('read_at', null); throwIfError(error, 'Nachrichtenstatus konnte nicht geladen werden.'); return count ?? 0; }
export function subscribeToChat(onChange: () => void) { const supabase = createClient(); const channel = supabase.channel(`chat-${Date.now()}`).on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, onChange).on('postgres_changes', { event: '*', schema: 'public', table: 'message_attachments' }, onChange).on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, onChange).subscribe(); return () => { void supabase.removeChannel(channel); }; }
