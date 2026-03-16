import LegalDocumentPage from "./LegalDocumentPage";

const content = `Refund Policy

Effective Date: March 15, 2026
Last Updated: March 15, 2026

1. Overview

At Showtime228, we aim to provide a fair and transparent refund process. This Refund Policy governs all ticket purchases made through our platform and is designed in compliance with Ontario's Ticket Sales Act, 2017, the Consumer Protection Act, 2002 (Ontario), and applicable Canadian federal laws.

By purchasing tickets through Showtime228, you agree to the terms outlined in this Refund Policy.

2. General No-Refund Policy

All ticket sales on Showtime228 are final unless a mandatory refund condition applies (see Section 3).

As a ticket aggregator, we facilitate ticket sales on behalf of event organizers and venues. Due to the nature of live events, we do not offer refunds, exchanges, or cancellations based on:
- Change of mind
- Personal schedule conflicts
- Inability to attend for personal reasons
- Weather conditions (unless the event is officially cancelled)
- Partial use of tickets (e.g., leaving an event early)

3. Mandatory Refunds — Your Rights Under Ontario Law

Under Ontario's Ticket Sales Act, 2017 and the Consumer Protection Act, 2002, Showtime228 is legally required to issue refunds in the following circumstances:

3.1 Event Cancellation
If an event is cancelled by the organizer, venue, or promoter:
- You are entitled to a full refund of the ticket price, service fees, and applicable taxes
- Refunds will be processed automatically where possible or upon request
- You will be notified by email at the address registered to your account
- Refunds will be processed within 15 business days of the cancellation announcement

3.2 Event Postponement or Rescheduling
If an event is postponed or rescheduled:
- Your original tickets remain valid for the new date
- If you cannot attend the rescheduled date, you may request a full refund within 30 days of the rescheduling announcement
- Submit your request to refunds@showtime228.com with your order number

3.3 Ticket Invalidity
If your ticket fails to grant you admission to the event it was issued for (e.g., invalid barcode, duplicate issuance, or access denied at the venue through no fault of your own):
- You are entitled to a full refund
- Supporting documentation (e.g., written confirmation from venue staff) may be required
- Request must be submitted within 7 days of the event date

3.4 Significant Event Changes
If an event undergoes a material change — such as a venue change to a substantially different location, or cancellation of the main act that fundamentally alters the event — you may be eligible for a refund. Requests are reviewed case-by-case. Contact us within 14 days of the announced change.

4. Service Fees

Scenario / Ticket Price / Service Fees
- Event Cancellation: Refunded / Refunded
- Event Postponement (you cannot attend): Refunded / May be non-refundable
- Ticket Invalidity: Refunded / Refunded
- Voluntary / No valid reason: Not refunded / Not refunded

5. How to Request a Refund

1. Email refunds@showtime228.com with the subject: Refund Request – Order #[your order number]
2. Include in your email:
   - Full name and email address used for the purchase
   - Order number (from your confirmation email or account dashboard)
   - Event name, date, and venue
   - Reason for refund request
   - Any relevant supporting documentation
3. Our team will respond within 5 business days
4. Approved refunds are processed within 15 business days of approval

You may also submit requests through your Account Dashboard → Order History → Request Refund.

6. Refund Processing via Stripe

All payments and refunds are processed through Stripe:
- Refunds are issued to the original payment method only (credit or debit card used at checkout)
- We cannot redirect refunds to a different card or payment method
- Once initiated, Stripe typically takes 5–10 business days to return funds to your account, depending on your bank or card issuer
- You will receive an email confirmation once the refund is initiated on our end

Note on Stripe Processing Fees: Stripe charges a non-refundable processing fee per transaction. In mandatory refund scenarios (event cancellations, invalid tickets), Showtime228 absorbs this cost and refunds you the full amount you paid.

7. Chargebacks and Disputes

Please contact us before initiating a chargeback with your bank or card issuer. Unauthorized chargebacks may result in account suspension.

Under the Ontario Consumer Protection Act, 2002, if Showtime228 fails to issue a legally required refund within the prescribed timeframe, you have the right to request a statutory chargeback from your credit card issuer. A written request to your card issuer must be submitted within the timeframe specified by your card agreement.

For dispute resolution, contact: support@showtime228.com

8. Event Organizer Refund Policies

As a ticket aggregator, Showtime228 acts as an intermediary. In some cases, the event organizer or venue may have their own refund policy that applies in addition to ours. We will communicate any such policies when applicable. Our obligations under Ontario law remain in effect regardless of the organizer's policy.

9. Exceptions and Special Circumstances

We may, at our sole discretion, offer store credit or exceptions on a case-by-case basis for documented emergencies (e.g., hospitalization). These are not guaranteed and are not a right under this policy. Submit exceptional circumstances to support@showtime228.com.

10. Modifications to This Policy

We reserve the right to update this Refund Policy at any time. Changes will be posted on our website with an updated "Last Updated" date. Your continued use of our platform constitutes acceptance of any changes.

11. Contact for Refunds

Refund & Support Team — Showtime228
Email: refunds@showtime228.com
General Support: support@showtime228.com
Address: Toronto, Ontario, Canada

Consumer Protection Ontario (External Escalation)
Website: www.ontario.ca/consumers
Phone: 1-800-889-9768`;

export default function RefundPolicy() {
  return <LegalDocumentPage title="Refund Policy" content={content} />;
}
