export interface LegalSection {
  id: string;
  number: number;
  title: string;
  summary?: string;
  content: string[];
}

export interface LegalDocument {
  title: string;
  documentType: 'TERMS' | 'PRIVACY_POLICY';
  version: string;
  lastUpdated: string;
  effectiveDate: string;
  sections: LegalSection[];
}

export interface ThirdPartyProvider {
  provider: string;
  purpose: string;
  dataShared: string;
  privacyPolicyUrl: string;
}

export const LEGAL_CONSTANTS = {
  COMPANY_NAME: 'Unified Web Options Pvt Ltd',
  APP_NAME: 'UWO Connect',
  REGISTERED_ADDRESS: '3rd Floor, SQ Square Building, Rampur Chowk, Jabalpur, Madhya Pradesh, India',
  CONTACT_EMAIL: 'support@uwo24.com',
  CONTACT_PHONE: '+91 83589 90909',
  GOVERNING_LAW: 'Laws of India',
  JURISDICTION: 'Competent courts of Jabalpur, Madhya Pradesh, India',
  TERMS_VERSION: '1.0',
  PRIVACY_VERSION: '1.0',
  LAST_UPDATED: 'September 14, 2026',
  EFFECTIVE_DATE: 'September 14, 2026',
};

export const THIRD_PARTY_PROVIDERS: ThirdPartyProvider[] = [
  {
    provider: 'Meta Platforms (WhatsApp Cloud API, Facebook, Instagram)',
    purpose: 'Customer messaging, omnichannel communications, business portfolio verification, and incoming message webhooks.',
    dataShared: 'Customer WhatsApp phone numbers, messaging IDs, message text, and customer-transmitted media attachments.',
    privacyPolicyUrl: 'https://www.facebook.com/privacy/policy/',
  },
  {
    provider: 'Google (Google Identity, Google Calendar, Sheets, Docs, Slides, News)',
    purpose: 'Single Sign-On authentication via Google ID tokens, enterprise calendar sync, and business workflow document exports.',
    dataShared: 'Authenticated user email, basic profile name/avatar, and selected workflow document exports authorized by the client.',
    privacyPolicyUrl: 'https://policies.google.com/privacy',
  },
  {
    provider: 'Google Cloud Platform (GCP Cloud Run)',
    purpose: 'Core backend application hosting, microservice routing, and encrypted RESTful API execution.',
    dataShared: 'Application payloads, encrypted session tokens, and business transaction requests.',
    privacyPolicyUrl: 'https://cloud.google.com/terms/cloud-privacy-notice',
  },
  {
    provider: 'Microsoft Azure (App Service)',
    purpose: 'Real-time WebSocket connection handling and webhook ingress event routing.',
    dataShared: 'Encrypted message delivery callbacks and webhook push event notifications.',
    privacyPolicyUrl: 'https://privacy.microsoft.com/privacystatement',
  },
  {
    provider: 'MongoDB Atlas',
    purpose: 'Enterprise cloud database hosting, multi-tenant workspace isolation, and automated secure backups.',
    dataShared: 'Encrypted user accounts, workspace configurations, CRM customer profiles, and communication histories.',
    privacyPolicyUrl: 'https://www.mongodb.com/legal/privacy-policy',
  },
  {
    provider: 'Razorpay Software Pvt. Ltd.',
    purpose: 'Secure electronic payments, subscription billing, and wallet recharge processing.',
    dataShared: 'Order reference IDs, transaction amounts, customer business name, and payment verification signatures. (No raw card data is ever stored on UWO servers).',
    privacyPolicyUrl: 'https://razorpay.com/privacy/',
  },
  {
    provider: 'OpenAI (Whisper & Language Model API)',
    purpose: 'Automated voice note audio transcription to text and client-configured automated support assistance.',
    dataShared: 'Voice audio clips received in customer chats and contextual query drafts configured by the account administrator.',
    privacyPolicyUrl: 'https://openai.com/policies/privacy-policy',
  },
];

export const TERMS_AND_CONDITIONS: LegalDocument = {
  title: 'Terms & Conditions',
  documentType: 'TERMS',
  version: LEGAL_CONSTANTS.TERMS_VERSION,
  lastUpdated: LEGAL_CONSTANTS.LAST_UPDATED,
  effectiveDate: LEGAL_CONSTANTS.EFFECTIVE_DATE,
  sections: [
    {
      id: 'terms-intro',
      number: 1,
      title: 'Introduction & Purpose',
      content: [
        'Welcome to UWO Connect. These Terms & Conditions ("Terms") constitute a legally binding agreement between you ("User", "You", or "Your") and Unified Web Options Pvt Ltd ("UWO Connect", "We", "Us", or "Our").',
        'UWO Connect is an enterprise multi-channel customer relationship management (CRM), omnichannel messaging hub, and business automation platform designed to empower enterprises, organizations, and team members to manage customer conversations, sales pipelines, and workflow automation across WhatsApp, Facebook, Instagram, Email, and related communication channels.',
        'By downloading, installing, accessing, registering an account, or using the UWO Connect mobile application or associated cloud services, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree to these Terms, you must immediately refrain from accessing or using UWO Connect.',
      ],
    },
    {
      id: 'terms-eligibility',
      number: 2,
      title: 'Eligibility & Authority',
      content: [
        'You must be at least 18 years of age (or the legal age of majority in your jurisdiction) to register an account and use UWO Connect.',
        'If you are accessing or using UWO Connect on behalf of a company, partnership, sole proprietorship, or other legal entity, you represent and warrant that you have the full corporate or legal authority to bind that entity to these Terms.',
        'You agree to provide true, accurate, current, and complete registration and profile information at all times, and to promptly update such information upon any change.',
      ],
    },
    {
      id: 'terms-account-registration',
      number: 3,
      title: 'Account Registration & Security',
      content: [
        'To access the platform, you must register an account by providing your verified business email, organization details, Meta Portfolio information, and creating secure authentication credentials.',
        'You are solely responsible for maintaining the confidentiality and security of your account credentials, login passwords, and any two-factor or session tokens generated on your behalf.',
        'You agree not to share your individual user credentials with any third party. Each team member or agent within an organization must hold their own assigned sub-account or team invite.',
        'You must immediately notify UWO Connect via support@uwo24.com upon becoming aware of any unauthorized use, compromise, or breach of your account credentials.',
      ],
    },
    {
      id: 'terms-user-profile',
      number: 4,
      title: 'User Profile & Workspace Administration',
      content: [
        'Users and workspace administrators are solely responsible for the information, designations, employee IDs, and branding materials uploaded to their organization profile.',
        'You must not upload, post, or transmit misleading, fraudulent, abusive, defamatory, obscene, infringing, or illegal materials to your profile or workspace.',
        'UWO Connect reserves the right to review, suspend, or restrict any workspace or profile that violates these Terms or applicable legislation.',
      ],
    },
    {
      id: 'terms-meta-portfolio',
      number: 5,
      title: 'Meta / Portfolio / Connected Account Data',
      content: [
        'UWO Connect enables eligible business users to connect their authorized Meta accounts, Meta Portfolios, WhatsApp Business Accounts (WABA), Facebook Pages, and Instagram Professional accounts.',
        'UWO Connect only accesses Meta-related data for which you or your authorized organization administrators have explicitly granted OAuth permissions and administrative access tokens.',
        'Your connection to Meta platforms is strictly governed by Meta\'s Platform Terms, WhatsApp Business Terms of Service, and Meta Commercial Terms. UWO Connect does not claim ownership of your Meta assets, portfolio properties, phone numbers, or conversation content.',
        'You are solely responsible for complying with all applicable Meta policies, including the 24-Hour Customer Care Window rules, business verification criteria, and opt-in consent mandates.',
        'You retain the right to disconnect or revoke Meta permissions at any time through your Meta Business Manager or platform connector settings.',
      ],
    },
    {
      id: 'terms-crm-functionality',
      number: 6,
      title: 'CRM Functionality & Customer Data Lawfulness',
      content: [
        'UWO Connect provides CRM tools to organize, track, follow up, and manage customer contacts, lead stages, and sales documents.',
        'You represent and warrant that you hold all necessary legal rights, consents, and lawful bases under applicable privacy laws (including the Digital Personal Data Protection Act, GDPR, and consumer protection laws) to store, process, and contact any individual whose details you input into the CRM.',
        'You must never use the CRM functionality to store sensitive biometric, financial, racial, or special category data, nor for unlawful surveillance, spamming, harassment, or unauthorized data harvesting.',
      ],
    },
    {
      id: 'terms-inbox-messaging',
      number: 7,
      title: 'Inbox, Messaging & Telecommunication Compliance',
      content: [
        'UWO Connect provides a unified multi-channel inbox to send and receive real-time messages across WhatsApp, Instagram, Facebook, and connected channels.',
        'You are exclusively responsible for the content, accuracy, legality, and timeliness of all outgoing messages, broadcasts, templates, and replies transmitted by your users or automated bots.',
        'You agree to comply with all applicable telemarketing, anti-spam, and commercial communication regulations, including obtaining recipient opt-in consent before initiating outreach.',
        'UWO Connect acts strictly as a technical intermediary and data processor. UWO Connect does not author, vet, or endorse user-generated messages and disclaims all liability for customer disputes arising from your communications.',
      ],
    },
    {
      id: 'terms-notifications',
      number: 8,
      title: 'Notifications & Service Alerts',
      content: [
        'The mobile application may deliver push notifications, SMS alerts, and email notifications regarding incoming messages, CRM lead assignments, team tasks, and platform status.',
        'You can configure notification preferences through device settings and in-app preferences. You acknowledge that timely receipt of notifications is subject to third-party network operators and mobile operating system background restrictions.',
      ],
    },
    {
      id: 'terms-ai-features',
      number: 9,
      title: 'AI & Automated Assistant Features',
      content: [
        'Where enabled by your workspace administrator, UWO Connect incorporates automated assistant workflows, audio transcription (via Whisper), and auto-reply draft suggestions.',
        'Automated and AI-generated outputs are probabilistic tools provided for assistive purposes only. You must review AI-generated drafts before sending them to customers.',
        'UWO Connect makes no representation that automated outputs are complete, error-free, or legally binding. You remain solely responsible for any decisions or actions taken based on automated suggestions.',
      ],
    },
    {
      id: 'terms-acceptable-use',
      number: 10,
      title: 'Acceptable Use Policy',
      content: [
        'You agree NOT to engage in any of the following prohibited activities:',
        '• Violating any local, state, national, or international laws, regulations, or third-party rights.',
        '• Sending unsolicited commercial messages (spam), phishing attempts, pyramid schemes, or bulk harassment.',
        '• Attempting to circumvent, disable, probe, scan, or breach platform security, rate limits, or authentication gates.',
        '• Reverse engineering, decompiling, disassembling, or deriving the source code of the UWO Connect mobile application or APIs.',
        '• Uploading malware, viruses, worms, spyware, or malicious code designed to interrupt or damage platform infrastructure.',
        '• Scraping, crawling, or automated bulk extraction of data without prior written consent from UWO Connect.',
        '• Impersonating any person, business, brand, or entity, or falsely claiming an affiliation with UWO Connect.',
      ],
    },
    {
      id: 'terms-user-content',
      number: 11,
      title: 'User Content & Proprietary Rights',
      content: [
        'You retain all intellectual property rights and ownership in the messages, text, media, documents, and contact data you transmit through UWO Connect ("User Content").',
        'By using UWO Connect, you grant Us a worldwide, non-exclusive, royalty-free, limited license solely to host, cache, transmit, format, and display your User Content as necessary to deliver the requested services to you and your authorized team members.',
        'UWO Connect reserves the right to remove or block access to any User Content that violates these Terms, infringes third-party intellectual property, or poses a legal liability.',
      ],
    },
    {
      id: 'terms-intellectual-property',
      number: 12,
      title: 'UWO Connect Intellectual Property',
      content: [
        'The UWO Connect name, logos, trade dress, user interface design, source code, database architecture, algorithms, and documentation are the exclusive intellectual property of Unified Web Options Pvt Ltd.',
        'Nothing in these Terms grants you any right, title, or interest in UWO Connect trademarks or proprietary materials, except the limited, revocable, non-transferable right to use the app in accordance with your subscription plan.',
      ],
    },
    {
      id: 'terms-third-party-services',
      number: 13,
      title: 'Third-Party Services & Integrations',
      content: [
        'UWO Connect integrates with trusted third-party services including Meta (WhatsApp, Facebook, Instagram), Google (OAuth, Workspace), Razorpay (Payment Processing), and cloud hosting providers.',
        'These third-party providers operate under their own independent terms of service and privacy policies. UWO Connect is not responsible for outages, policy modifications, account suspensions, or service changes enacted by third-party platforms.',
      ],
    },
    {
      id: 'terms-service-availability',
      number: 14,
      title: 'Service Availability & Maintenance',
      content: [
        'UWO Connect strives to deliver high availability and resilient cloud infrastructure. However, the service is provided on an "AS IS" and "AS AVAILABLE" basis.',
        'Scheduled maintenance, emergency security patches, cloud provider disruptions, or telecommunication outages may occasionally impact availability. We disclaim liability for temporary service interruptions.',
      ],
    },
    {
      id: 'terms-security',
      number: 15,
      title: 'Information Security Practices',
      content: [
        'We implement commercially reasonable administrative, physical, and technical safeguards—including TLS 1.3 encrypted transit, JWT token rotation, MongoDB Atlas enterprise isolation, and role-based access control—to safeguard your data.',
        'However, no system connected to the public internet can be guaranteed as 100% immune from security vulnerabilities or hostile attacks. You acknowledge this inherent risk.',
      ],
    },
    {
      id: 'terms-suspension-termination',
      number: 16,
      title: 'Account Suspension & Termination',
      content: [
        'UWO Connect may suspend or terminate your account immediately, without prior notice, in the event of: (a) material breach of these Terms; (b) fraudulent, abusive, or illegal conduct; (c) failure to pay applicable subscription fees; (d) Meta or telecommunication provider compliance demands; or (e) security threats posed to our infrastructure.',
        'Upon termination, your right to access the platform terminates immediately. You may request data export prior to termination subject to applicable legal requirements.',
      ],
    },
    {
      id: 'terms-account-deletion',
      number: 17,
      title: 'Account Deletion & Offboarding',
      content: [
        'You have the right to request deletion of your individual user account at any time directly through the app via Settings → Legal → Delete Account.',
        'Upon verified confirmation, your personal credentials, sessions, and active device links will be immediately deactivated. Deletion of personal identifiers from active databases is completed within a reasonable timeframe (up to 30 days).',
        'Organization-level business records (such as completed tax invoices, audit logs, and shared CRM records belonging to the business entity) may be retained in anonymized or archive formats where strictly required by statutory, tax, or legal compliance mandates.',
      ],
    },
    {
      id: 'terms-disclaimer',
      number: 18,
      title: 'Disclaimer of Warranties',
      content: [
        'TO THE MAXIMUM EXTENT PERMITTED UNDER APPLICABLE LAW, UWO CONNECT IS PROVIDED WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE.',
        'WE SPECIFICALLY DISCLAIM ALL IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ACCURATE, OR COMPLETELY BUG-FREE.',
      ],
    },
    {
      id: 'terms-limitation-liability',
      number: 19,
      title: 'Limitation of Liability',
      content: [
        'TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL UNIFIED WEB OPTIONS PVT LTD, ITS DIRECTORS, EMPLOYEES, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES (INCLUDING LOSS OF PROFITS, DATA, GOODWILL, OR BUSINESS INTERRUPTION) ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF UWO CONNECT.',
        'OUR TOTAL AGGREGATE LIABILITY FOR ALL CLAIMS ARISING UNDER OR RELATING TO THESE TERMS SHALL BE LIMITED TO THE AMOUNT ACTUALLY PAID BY YOU TO UWO CONNECT IN THE THREE (3) MONTHS PRECEDING THE EVENT GIVING RISE TO LIABILITY.',
      ],
    },
    {
      id: 'terms-indemnification',
      number: 20,
      title: 'Indemnification',
      content: [
        'You agree to defend, indemnify, and hold harmless Unified Web Options Pvt Ltd, its officers, directors, and employees from and against any third-party claims, liabilities, damages, losses, and reasonable legal expenses arising from or relating to: (a) your misuse of the platform; (b) your violation of these Terms; (c) any unlawful User Content or spam messages transmitted by your account; or (d) your infringement of third-party privacy or intellectual property rights.',
      ],
    },
    {
      id: 'terms-changes',
      number: 21,
      title: 'Modifications to Terms',
      content: [
        'We reserve the right to revise these Terms from time to time to reflect technological updates, legislative developments, or service enhancements.',
        'The updated version and Last Updated date will always be visible inside the app. For material modifications, we will provide in-app notification or require renewed consent prior to continuing use.',
      ],
    },
    {
      id: 'terms-governing-law',
      number: 22,
      title: 'Governing Law & Dispute Resolution',
      content: [
        `These Terms and any dispute arising out of or related to your use of UWO Connect shall be governed by and construed in accordance with the ${LEGAL_CONSTANTS.GOVERNING_LAW}, without regard to conflict of law principles.`,
        `You agree that any legal action, suit, or proceeding arising under these Terms shall be instituted exclusively in the ${LEGAL_CONSTANTS.JURISDICTION}, and you irrevocably submit to the personal jurisdiction of such courts.`,
      ],
    },
    {
      id: 'terms-contact',
      number: 23,
      title: 'Legal Contact Information',
      content: [
        'For inquiries, legal notices, or questions regarding these Terms & Conditions, please contact us at:',
        `• Entity: ${LEGAL_CONSTANTS.COMPANY_NAME}`,
        `• Address: ${LEGAL_CONSTANTS.REGISTERED_ADDRESS}`,
        `• Email: ${LEGAL_CONSTANTS.CONTACT_EMAIL}`,
        `• Phone: ${LEGAL_CONSTANTS.CONTACT_PHONE}`,
      ],
    },
  ],
};

export const PRIVACY_POLICY: LegalDocument = {
  title: 'Privacy Policy',
  documentType: 'PRIVACY_POLICY',
  version: LEGAL_CONSTANTS.PRIVACY_VERSION,
  lastUpdated: LEGAL_CONSTANTS.LAST_UPDATED,
  effectiveDate: LEGAL_CONSTANTS.EFFECTIVE_DATE,
  sections: [
    {
      id: 'privacy-intro',
      number: 1,
      title: 'Introduction & Scope',
      content: [
        `Unified Web Options Pvt Ltd ("UWO Connect", "We", "Us", or "Our") is committed to protecting the privacy, confidentiality, and security of your personal data.`,
        'This Privacy Policy explains how we collect, process, store, disclose, and safeguard personal information when you use the UWO Connect mobile application, web application, and associated API services.',
        'This policy applies to workspace account holders, team members, and enterprise administrators who access UWO Connect.',
      ],
    },
    {
      id: 'privacy-data-collected',
      number: 2,
      title: 'Information We Collect',
      content: [
        'We collect information under three clear categories:',
        'A. Information Provided Directly By You:',
        '• Account Credentials: Business email address, user password hash, full name, employee ID, and job title/designation.',
        '• Organization Details: Company/brand name, registered office address, phone number, GSTIN/Tax ID, and branding logo.',
        '• Meta Verification Data: Meta Portfolio name, Business Portfolio ID, and connected WABA phone numbers.',
        '• CRM Customer Information: Customer names, phone numbers, email addresses, pipeline stages, notes, and sales document metadata entered by you into the CRM.',
        '• Customer Communications: Text messages, image links, voice notes, and interaction timestamps processed through connected channels.',
        '',
        'B. Automatically Collected Information:',
        '• Device & Network Telemetry: Device model, operating system version, app version, IP address, and network latency.',
        '• Authentication Sessions: Linked device web sessions, QR auth scan tokens, and last active timestamps.',
        '• Application Logs: Error logs, message delivery status callbacks, and security audit records.',
        '',
        'C. Connected Third-Party Account Information:',
        '• Meta Cloud API: WhatsApp Phone Number ID, WABA ID, Display phone number, and message status receipts.',
        '• Google Identity: Verified email address, user name, and Google profile picture URL (only when opting into Google Sign-In).',
      ],
    },
    {
      id: 'privacy-how-we-use',
      number: 3,
      title: 'How We Use Your Information',
      content: [
        'We process collected information solely for legitimate business purposes, including:',
        '• Authenticating your identity and provisioning your workspace.',
        '• Facilitating two-way customer messaging across WhatsApp, Instagram, and Facebook.',
        '• Operating CRM contact management, pipeline tracking, and sales quotation generation.',
        '• Delivering system notifications, security alerts, and message delivery receipts.',
        '• Diagnosing backend latency, fixing software bugs, and enhancing platform performance.',
        '• Preventing fraud, bot attacks, and unauthorized session tampering.',
        '• Complying with statutory accounting, taxation, and telecommunication mandates.',
      ],
    },
    {
      id: 'privacy-legal-basis',
      number: 4,
      title: 'Legal Bases for Processing',
      content: [
        'Depending on applicable data protection laws, our processing activities are grounded in:',
        '• Performance of a Contract: Providing the core CRM, messaging, and automation services requested by you.',
        '• Explicit Consent: When you accept this Privacy Policy and explicitly authorize third-party channel connections (Meta, Google).',
        '• Legitimate Interests: Ensuring network security, monitoring uptime, and preventing unauthorized account takeover.',
        '• Legal Obligation: Maintaining statutory tax invoices, financial records, and complying with lawful government requests.',
      ],
    },
    {
      id: 'privacy-meta-platform',
      number: 5,
      title: 'Meta Platform Data & Privacy Protections',
      content: [
        'UWO Connect adheres strictly to Meta Platform Terms and Developer Policies:',
        '• We only access WhatsApp Business Accounts, Facebook Pages, and Instagram accounts that you explicitly link using official Meta OAuth and embedded signup flows.',
        '• We store WhatsApp Phone Number IDs and access tokens securely in encrypted database fields.',
        '• We use customer phone numbers strictly to dispatch messages that you initiate or automate. We never sell, monetize, or broker Meta-derived data to third-party data brokers or advertisers.',
        '• You can revoke Meta permissions at any time via Meta Business Settings or the in-app Connectors menu.',
      ],
    },
    {
      id: 'privacy-google-data',
      number: 6,
      title: 'Google User Data & OAuth Scopes',
      content: [
        'If you use Google Sign-In, UWO Connect requests minimal OAuth scopes:',
        '• We only access your basic public profile (name and avatar) and verified email address to authenticate your session or link your account.',
        '• If you choose to enable optional Google Workspace tools (Calendar, Sheets, Docs), we only access the specific documents you select for workflow automation.',
        '• UWO Connect conforms to the Google API Services User Data Policy, including the Limited Use requirements.',
      ],
    },
    {
      id: 'privacy-crm-data',
      number: 7,
      title: 'CRM Customer Data Handling',
      content: [
        'When you store customer contacts in UWO Connect CRM, you act as the Data Controller, and UWO Connect acts as the Data Processor.',
        'You are solely responsible for ensuring you have obtained appropriate consent from your end-customers before adding their contact numbers or communicating with them.',
        'We do not access or use your customer database for our own marketing purposes.',
      ],
    },
    {
      id: 'privacy-inbox-data',
      number: 8,
      title: 'Messages & Communication Data',
      content: [
        'Customer messages, inbound replies, voice notes, and media attachments are processed through encrypted cloud infrastructure to render your unified inbox.',
        'Message text and media attachments are retained in your workspace database to enable conversation history, team collaboration, and follow-up tracking.',
      ],
    },
    {
      id: 'privacy-data-sharing',
      number: 9,
      title: 'Data Sharing & Disclosures',
      content: [
        'We DO NOT sell, rent, or trade your personal data to advertisers or third-party brokers. We disclose information only to:',
        '• Operational Service Providers: Trusted infrastructure and communication partners strictly necessary to run the platform (see Section 10).',
        '• Legal & Regulatory Authorities: When required by applicable law, court order, or governmental regulation.',
        '• Corporate Restructuring: In connection with any merger, acquisition, or sale of company assets, subject to strict confidentiality commitments.',
      ],
    },
    {
      id: 'privacy-third-parties',
      number: 10,
      title: 'Third-Party Service Providers',
      content: [
        'We partner with industry-leading infrastructure, cloud, and telecommunications providers to power UWO Connect. Please refer to the Third-Party Providers table below for details on each partner, purpose, data shared, and their privacy policies.',
      ],
    },
    {
      id: 'privacy-data-storage',
      number: 11,
      title: 'Data Storage & Cloud Regions',
      content: [
        'UWO Connect utilizes enterprise-grade cloud infrastructure with primary server nodes hosted in Google Cloud Platform (GCP) Region asia-south1 (Mumbai, India) and Azure Central India, with MongoDB Atlas enterprise cloud storage.',
        'Data is stored within secure, access-controlled data centers implementing ISO 27001, SOC 2, and PCI-DSS certified controls.',
      ],
    },
    {
      id: 'privacy-data-retention',
      number: 12,
      title: 'Data Retention Policies',
      content: [
        'We retain your personal account data for as long as your account remains active and in good standing.',
        'In the event of account closure or deletion requests, personal identifying information is scrubbed or anonymized within 30 days.',
        'Statutory accounting records, tax invoices, and legal compliance audit trails are retained for the minimum period required by Indian law (typically 7 years for tax and commercial documents).',
      ],
    },
    {
      id: 'privacy-data-security',
      number: 13,
      title: 'Technical & Organizational Security Safeguards',
      content: [
        'We implement multi-layered security controls to protect your data:',
        '• Data in Transit: Encrypted using Transport Layer Security (TLS 1.3 / HTTPS) with strict cipher suites.',
        '• Authentication Security: Passwords hashed using PBKDF2 with SHA-256 salts; session access managed via signed JSON Web Tokens (JWT) with automated expiration.',
        '• Access Controls: Role-based access control (RBAC) preventing unauthorized cross-tenant data access.',
        '• Device Link Protection: Single-use, time-limited QR codes (120s expiry) for web desktop pairing.',
      ],
    },
    {
      id: 'privacy-user-rights',
      number: 14,
      title: 'Your Privacy Rights',
      content: [
        'Under applicable privacy laws, you possess the following rights regarding your personal data:',
        '• Right to Access: View the personal information we hold about you.',
        '• Right to Rectification: Correct inaccurate or incomplete profile information through in-app settings.',
        '• Right to Erasure (Account Deletion): Request permanent deletion of your account and personal data (Settings → Legal → Delete Account).',
        '• Right to Withdraw Consent: Revoke consent for optional integrations (Meta, Google) at any time.',
        '• Right to Redress: File questions or grievances directly with our grievance team at support@uwo24.com.',
      ],
    },
    {
      id: 'privacy-account-deletion',
      number: 15,
      title: 'Account & Data Deletion Workflow',
      content: [
        'You can delete your account directly inside the app: Settings → Legal → Delete Account.',
        'Before completing deletion, you will receive clear notification of the consequences. Deletion requires explicit confirmation ("DELETE").',
        'Upon confirmation, your personal account credentials, sessions, and mobile device tokens are permanently terminated. You will be logged out immediately.',
      ],
    },
    {
      id: 'privacy-cookies-tracking',
      number: 16,
      title: 'Cookies, SDKs & Tracking Technologies',
      content: [
        'The mobile application does NOT use advertising cookies or third-party cross-app behavioral trackers.',
        'We use local device storage (AsyncStorage) solely to store your session token, theme preference, and language selection on your device.',
      ],
    },
    {
      id: 'privacy-children',
      number: 17,
      title: 'Children\'s Privacy',
      content: [
        'UWO Connect is an enterprise business application and is not intended for or marketed to individuals under the age of 18.',
        'We do not knowingly collect or solicit personal information from children. If we discover that a minor has created an account, we will promptly terminate the account and purge the data.',
      ],
    },
    {
      id: 'privacy-international-transfers',
      number: 18,
      title: 'International Data Transfers',
      content: [
        'If you access UWO Connect from outside India, your information will be transferred to and processed in India, where our primary cloud infrastructure and database clusters reside.',
        'By using the app, you consent to the transfer of your information to India and other international regions where our cloud partners (Meta, Google, Azure) operate, subject to standard contractual clauses and rigorous data protection safeguards.',
      ],
    },
    {
      id: 'privacy-policy-changes',
      number: 19,
      title: 'Changes to this Privacy Policy',
      content: [
        'We may update this Privacy Policy from time to time. The latest version will always be published inside the app with its updated version number and Last Updated date.',
        'For significant or material changes affecting your rights, we will provide conspicuous in-app notifications or require you to review and accept the revised policy before continued use.',
      ],
    },
    {
      id: 'privacy-contact-grievance',
      number: 20,
      title: 'Contact & Grievance Officer',
      content: [
        'If you have any questions, concerns, or grievances regarding this Privacy Policy or our data handling practices, please contact our Grievance Officer:',
        `• Grievance Officer: Legal & Privacy Division`,
        `• Entity: ${LEGAL_CONSTANTS.COMPANY_NAME}`,
        `• Address: ${LEGAL_CONSTANTS.REGISTERED_ADDRESS}`,
        `• Email: ${LEGAL_CONSTANTS.CONTACT_EMAIL}`,
        `• Phone: ${LEGAL_CONSTANTS.CONTACT_PHONE}`,
      ],
    },
  ],
};
