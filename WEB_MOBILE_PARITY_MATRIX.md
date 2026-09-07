# UwoConnect Mobile — Complete Web Feature Parity Matrix

| Web Feature | Mobile Screen | Existing API | Current Status | Missing Functionality | Implementation Status |
|---|---|---|---|---|---|
| **1. Omnichannel Inbox** | `app/(app)/inbox.tsx`, `app/(app)/conversation/[id].tsx` | `/api/conversations/`, `/api/messages/`, `/api/templates/` | 🟡 Partial | Channel tabs (WhatsApp, IG, FB, Email, SMS), WhatsApp Meta Template Selector, Internal Notes tab, Customer Profile Drawer, Media Uploader | 🟢 In Progress |
| **2. CRM & Leads** | `app/(app)/crm.tsx`, `app/(app)/lead/[id].tsx` | `/api/contacts/` | 🟡 Partial | Kanban Board view, Lead Detail Custom Fields & Activity Timeline, CSV Import/Export | 🟢 In Progress |
| **3. Team Hub & Internal Chat** | `app/(app)/team.tsx`, `app/(app)/team-chat.tsx` | `/api/team/members/`, `/api/team/chat/`, `/api/team/invites/` | 🟡 Partial | Internal Team Chat, Per-Member Channel Access Permissions, Task/Project tracking | 🟢 In Progress |
| **4. Broadcasts & Mass Messaging** | `app/(app)/broadcasts.tsx` | `/api/campaigns/`, `/api/broadcasts/entitlement` | 🔴 Missing | Campaign list, Create Broadcast wizard, Segment/Audience selector, Campaign Analytics | 🟢 In Progress |
| **5. AI Knowledge Base** | `app/(app)/knowledge.tsx` | `/api/knowledge/` | 🔴 Missing | Document (PDF/DOCX) Uploader, Website URL Indexing, Text Snippets, Chunks viewer | 🟢 In Progress |
| **6. Work Reports** | `app/(app)/reports.tsx` | `/api/team/reports/`, `/api/team/approvals/` | 🔴 Missing | Staff Daily Work Reports stream, Submit Report form, Manager Approval controls | 🟢 In Progress |
| **7. Support Tickets** | `app/(app)/support.tsx` | `/api/support/messages/` | 🔴 Missing | Ticket list, Category/Priority filter, Create Ticket modal, Status updates & replies | 🟢 In Progress |
| **8. Sales Documents (Invoices, Quotations, Proposals)** | `app/(app)/sales/invoices.tsx`, `quotations.tsx`, `proposals.tsx` | `/api/invoices/`, `/api/quotations/`, `/api/proposals/`, `/api/sales-documents/` | 🟡 Partial | Interactive Quotation & Invoice Builder, Proposal Templates, PDF Preview & Sharing modal | 🟢 In Progress |
| **9. Product Catalog** | `app/(app)/sales/products.tsx` | `/api/products/` | 🟡 Partial | Add/Edit Product Modal, SKU/Pricing/Inventory manager, Image uploader | 🟢 In Progress |
| **10. Wallet & Payments** | `app/(app)/sales/wallet.tsx` | `/api/wallet/dashboard`, `/api/wallet/recharge/create`, `/api/wallet/recharge/verify` | 🟡 Partial | Razorpay Add Money integration, Payment Checkout trigger, Immutable Transaction Ledger | 🟢 In Progress |
| **11. Connectors & Integration Setup** | `app/(app)/connectors.tsx` | `/api/connectors/effective`, `/api/auth/*/connect` | 🟡 Partial | Connector Configuration Modals (WABA Token, Gmail OAuth, YouTube, Google News, Zoho, Maps) | 🟢 In Progress |
| **12. Auto-Replies & Keyword Rules** | `app/(app)/automations.tsx` | `/api/automations/` | 🔴 Missing | Keyword rules builder, Keyword match triggers, Bot responses, Order & Enable/Disable toggles | 🟢 In Progress |
| **13. Workflows & Bot Builder** | `app/(app)/workflows.tsx` | `/api/workflows/` | 🟡 Partial | Native Step/Node Editor (Trigger → Condition → AI → Action), Node configuration, Save & Publish | 🟢 In Progress |
| **14. Push Notifications & Deep Linking** | Native Expo Push Service | Expo FCM/APNs APIs | 🔴 Missing | Push notification handler, token registration, deep linking to Inbox / Lead / Ticket | 🟢 In Progress |

---
*Created automatically for UwoConnect Mobile Feature Parity Tracking.*
