# UwoConnect Mobile Application — Phase 2 Documentation

## 1. Executive Summary

**Phase 2: Unified Inbox + CRM Integration** brings real-time cross-channel messaging and complete CRM deal pipeline capabilities to the native UwoConnect Mobile Application under `apps/mobile/`.

Zero changes were made to the Django backend (`UWO-CONNECT_B`) or database schema, and zero changes were made to the existing web frontend (`UWO-Connect_F`).

---

## 2. Consumed Backend APIs & WebSockets

| Feature | Protocol | Endpoint / URL |
| :--- | :--- | :--- |
| **Conversations List** | GET | `/api/conversations/?limit=20&offset=0&channel=...&search=...` |
| **Messages History** | GET | `/api/messages/?contact_id={id}&limit=50&offset=0` |
| **Send Reply / Note** | POST | `/api/messages/` (`{ to_number, body, channel, message_type }`) |
| **Takeover Convo** | POST | `/api/conversations/{id}/takeover/` |
| **Real-time Inbox WS** | WSS | `/ws/inbox/?token={jwt}` (`new_message`, `typing_status`, `view_conversation`) |
| **CRM Leads List** | GET | `/api/contacts/?limit=100&offset=0&search=...` |
| **Create Lead** | POST | `/api/contacts/` |
| **Update Lead Stage** | PATCH | `/api/contacts/{id}/` (`{ stage: "NEW"|"FOLLOWUP"|"NEGOTIATION"|"WON"|"LOST" }`) |

---

## 3. Architecture & Key Features

### Unified Inbox Module (`app/(app)/inbox.tsx` & `app/(app)/conversation/[id].tsx`)
- **Supported Channels**: WhatsApp, Instagram, Facebook Messenger, YouTube.
- **Channel Filters**: Filter conversations instantly by `ALL`, `WHATSAPP`, `INSTAGRAM`, `FACEBOOK`, `YOUTUBE`.
- **Real-Time WebSocket**: Auto-reconnecting WebSocket client (`inboxWebSocket.ts`) connecting to `/ws/inbox/?token=<JWT>`. Handles:
  - `new_message`: Auto-bumps active conversation to top of list & appends incoming messages in real-time.
  - `typing_status`: Displays and emits typing indicators.
  - `view_conversation`: Broadcasts agent active viewing state.
- **Message Composer**: Supports text replies and internal private team notes (`INTERNAL`).

### CRM Module (`app/(app)/crm.tsx` & `app/(app)/lead/[id].tsx`)
- **View Toggle**: Toggle between **List View** and **Swipeable Pipeline View** (`NEW`, `FOLLOWUP`, `NEGOTIATION`, `WON`, `LOST`).
- **Interactive Stage Update**: Drag/tap to change lead stage instantly updates backend via `PATCH /api/contacts/{id}/`.
- **Add Lead Modal**: Create new customer leads directly from mobile interface.
- **Lead Detail Screen**: Contact details, notes editor, and direct "Open Conversation" shortcut button.

---

## 4. Final Verification Status

- **TypeScript Verification**: PASS (`npx tsc --noEmit` verified with 0 errors)
- **Backend Files Modified**: **0** (Untouched)
- **Web Frontend Files Modified**: **0** (Untouched)
- **CI/CD Build Pipeline**: Standalone Release APK (`app-release.apk`) automatically triggered on GitHub Actions.
