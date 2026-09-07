# 📱 UwoConnect Mobile — WhatsApp Web Parity & Audit Document

## Executive Summary
This document provides a comprehensive audit and implementation mapping comparing the `UWO-Connect_F` Web App WhatsApp/Inbox module with the `apps/mobile` React Native implementation.

---

## 1. Web vs Mobile WhatsApp Feature Matrix

| Web Feature | Web API / Service | Mobile Screen / Component | Mobile Status | Real-time WS |
|---|---|---|---|---|
| Conversation List | `GET /api/inbox/conversations/` | `app/(app)/inbox.tsx`, `ConversationList.tsx` | ✅ Fully Implemented | `new_message` |
| Channel Filtering | `GET /api/inbox/conversations/?channel=...` | `ChannelFilterBar.tsx` | ✅ Fully Implemented | N/A |
| Search (Name/Phone/Text) | `GET /api/inbox/conversations/?search=...` | `SearchBar.tsx` | ✅ Fully Implemented | N/A |
| Chat Message History | `GET /api/inbox/conversations/{id}/messages/` | `app/(app)/conversation/[id].tsx` | ✅ Fully Implemented | `new_message` |
| Text Message Send | `POST /api/inbox/send/` | `MessageComposer.tsx` | ✅ Fully Implemented | `new_message` |
| Public Reply vs Private Note | `POST /api/inbox/send/` (`message_type`) | `app/(app)/conversation/[id].tsx` (Tabs) | ✅ Fully Implemented | `new_message` |
| WhatsApp Approved Templates | `GET /api/whatsapp/templates/`, `POST /api/whatsapp/send-template/` | `WhatsAppTemplateModal.tsx` | ✅ Fully Implemented | N/A |
| Bot Takeover / Resume | `POST /api/inbox/conversations/{id}/takeover/` | `Header.tsx` / `UserCheck` icon | ✅ Fully Implemented | `bot_status` |
| Customer Profile & CRM Info | `GET /api/crm/contacts/{id}/` | `CustomerProfileModal.tsx` | ✅ Fully Implemented | N/A |
| Typing Indicators | WebSocket `typing_status` | `app/(app)/conversation/[id].tsx` | ✅ Fully Implemented | `typing_status` |
| Real-time Updates | WebSocket Connection | `src/services/inboxWebSocket.ts` | ✅ Fully Implemented | Connected |

---

## 2. API Endpoints & Payload Structure

### 2.1 Fetch Conversations
- **Endpoint**: `GET /api/inbox/conversations/?channel={CHANNEL}&search={QUERY}&limit=30&offset=0`
- **Response**:
```json
{
  "conversations": [
    {
      "id": "919876543210",
      "name": "Abha",
      "rawAddress": "919876543210",
      "lastMessage": "Hy",
      "time": "2026-09-05T13:20:00Z",
      "unread": 1,
      "channel": "WHATSAPP",
      "status": "OPEN"
    }
  ]
}
```

### 2.2 Send Message (Text / Private Note)
- **Endpoint**: `POST /api/inbox/send/`
- **Payload**:
```json
{
  "to_number": "919876543210",
  "body": "Hello! How can I help you?",
  "channel": "WHATSAPP",
  "message_type": "OUTGOING" // or "INTERNAL" for private note
}
```

### 2.3 Send Meta Approved Template
- **Endpoint**: `POST /api/whatsapp/send-template/`
- **Payload**:
```json
{
  "contact_id": "919876543210",
  "phone_number": "919876543210",
  "template_name": "order_update",
  "variables": {
    "1": "Abha",
    "2": "ORD-9876"
  }
}
```

---

## 3. Real-Time WebSocket Events
- **Socket URL**: `wss://{API_HOST}/ws/inbox/`
- **Handled Events**:
  - `new_message`: Automatically bumps existing conversation or creates a new row on top of list. Appends message to chat thread.
  - `typing_status`: Displays "Customer is typing..." indicator.
  - `view_conversation`: Notifies server that agent is viewing specific chat.

---

## 4. UI Customizations Applied
1. **Badge Background Removal**: The `ChannelBadge` tag under the customer name in the conversation detail header renders clean text without a tinted background pill as requested.
2. **Doc Icon Removal**: The top right header document icon (`FileText`) was removed from `ConversationDetailScreen` header to keep the top bar clean and unobstructed.

---

## 5. Verification & Testing
- **TypeScript**: `npx tsc --noEmit` passed with 0 errors.
- **Expo Server**: Active on `0.0.0.0:8082`.
- **Backend**: Django REST running on `0.0.0.0:8000`.
