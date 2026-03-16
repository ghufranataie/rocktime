import LegalDocumentPage from "./LegalDocumentPage";

const content = `Privacy Policy

Effective Date: March 15, 2026
Last Updated: March 15, 2026

1. Introduction

Welcome to Showtime228 ("we," "us," or "our"). We operate a ticket aggregator platform that allows users to browse, select, and purchase tickets for concerts, theater performances, comedy shows, and other live entertainment events in the Greater Toronto Area and across Canada.

This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information in accordance with Canada's Personal Information Protection and Electronic Documents Act (PIPEDA) and applicable Ontario privacy and consumer protection laws.

By using our website and services, you consent to the practices described in this Privacy Policy.

2. Privacy Officer

We have appointed a Privacy Officer responsible for our compliance with this policy and applicable privacy laws.

Privacy Officer
Email: privacy@showtime228.com
Address: Showtime228, Toronto, Ontario, Canada

3. Personal Information We Collect

3.1 Information You Provide
- Account Information: Full name, email address, password, phone number
- Payment Information: Billing address and payment details (processed securely via Stripe — we do not store full card numbers)
- Ticket Purchase Information: Event selections, seat preferences, order history
- Communications: Customer support messages, feedback, and survey responses

3.2 Information Collected Automatically
- Device & Technical Info: IP address, browser type, operating system
- Usage Data: Pages visited, time on site, links clicked, search queries
- Location: General geographic location based on IP address
- Cookies & Tracking: Session cookies, performance cookies, and functional cookies

3.3 Information from Third Parties
- Stripe: Payment confirmation and fraud prevention data
- Event Organizers / Venues: Event-related attendance and access information
- AWS (Amazon Web Services): Infrastructure and server logs

4. How We Use Your Information

4.1 Primary Purposes
1. Processing ticket purchases and order fulfillment
2. Creating and managing your user account
3. Securely processing payments via Stripe
4. Sending order confirmations, event reminders, and important notices
5. Providing customer support and resolving disputes

4.2 Secondary Purposes (With Consent)
1. Sending marketing emails about upcoming events and offers (opt-out anytime)
2. Improving platform features based on usage analytics
3. Personalizing event recommendations
4. Conducting anonymized market research

4.3 Legal and Safety Purposes
We may use or disclose information without consent when:
- Required by law, court order, or government regulation
- Necessary to prevent fraud, illegal activity, or security breaches
- Required to enforce our Terms and Conditions
- Involved in a corporate transaction (merger, acquisition, asset sale)

5. Consent

We obtain your express or implied consent before collecting or using personal information. You may withdraw consent at any time by:
- Unsubscribing from marketing emails via the link in each message
- Updating preferences in your account dashboard
- Contacting us at privacy@showtime228.com

Withdrawing consent for core service purposes (e.g., payment processing) may prevent us from providing certain services.

6. How We Share Your Information

We do not sell, rent, or trade your personal information. We share it only with:
- Stripe: Payment processing (PCI DSS Level 1 compliant)
- AWS: Cloud hosting and infrastructure
- Event Organizers / Venues: Ticket fulfillment and event entry
- Email Service Providers: Order confirmations and communications
- Law Enforcement / Courts: When required by applicable law

All third-party service providers are contractually bound to protect your information.

7. Data Security

We implement industry-standard safeguards including:
- TLS Encryption for all data transmitted between your device and our servers
- PCI DSS Compliance via Stripe for payment data (we never store complete card numbers)
- Access Controls: Only authorized personnel can access personal data
- Regular Security Audits and vulnerability assessments
- Breach Response Procedures to detect, contain, and notify affected users

No method of data transmission is 100% secure. You are responsible for keeping your account password confidential.

8. Data Retention

Information Type / Retention Period
- Transaction Records: 7 years (tax/accounting requirements)
- Account Information: Duration of account + 1 year
- Marketing Preferences: Until consent is withdrawn
- Customer Support Records: 2 years after resolution
- Website Usage Logs: 12 months

When no longer needed, data is securely deleted or anonymized.

9. Your Privacy Rights (PIPEDA)

Under PIPEDA and Ontario law, you have the right to:
- Access the personal information we hold about you (fulfilled within 30 days)
- Correct inaccurate or incomplete information
- Withdraw Consent for non-essential data uses
- File a Complaint with the Office of the Privacy Commissioner of Canada

Office of the Privacy Commissioner of Canada
30 Victoria Street, Gatineau, Quebec K1A 1H3
Toll-free: 1-800-282-1376
Website: www.priv.gc.ca

To exercise your rights, email privacy@showtime228.com with subject: "Privacy Rights Request."

10. Cookies

Cookie Type / Purpose
- Essential: Shopping cart, login sessions
- Performance: Usage analytics and site optimization
- Functional: Saved preferences and settings
- Advertising: Interest-based content

You can manage cookies in your browser settings. Disabling essential cookies may impair site functionality.

11. Children's Privacy

Our services are not directed to individuals under 18 years of age. We do not knowingly collect personal information from minors. If you believe a child has submitted personal information, contact privacy@showtime228.com and we will delete it promptly.

12. International Data Transfers

Your data may be stored on servers outside Canada (e.g., AWS US East region). We ensure cross-border transfers comply with PIPEDA through contractual data protection agreements. Data stored outside Canada may be subject to lawful access by foreign authorities.

13. Changes to This Policy

We may update this Privacy Policy periodically. We will notify you of material changes by:
- Posting an updated version with a new "Last Updated" date
- Sending email notification to registered users
- Displaying a notice on our website

Continued use of our services after changes take effect constitutes acceptance of the revised policy.

14. Contact Us

Privacy Officer — Showtime228
Email: privacy@showtime228.com
Address: Toronto, Ontario, Canada

We respond to all inquiries within 30 days.

15. Ontario Residents

For unresolved privacy concerns, Ontario residents may also contact:
Consumer Protection Ontario
Website: www.ontario.ca/consumers
Ministry of Public and Business Service Delivery`;

export default function PrivacyPolicy() {
  return <LegalDocumentPage title="Privacy Policy" content={content} />;
}
