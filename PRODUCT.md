# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Primary: a dairy, vegetable, meat or dry-goods vendor, or a small distributor/wholesaler, who supplies restaurants, cafés, cloud kitchens and bakeries. Usually on a phone, often arriving from a link a restaurant shared on WhatsApp. Today they take orders by phone calls and chat messages. Plain English; no jargon.

## Product Purpose
Alayn Suppliers is the supplier side of Alayn (the restaurant operating system at alaynai.com). Suppliers list products and rates once; restaurants on Alayn find them, compare prices and send purchase orders; the supplier packs, dispatches in full or in part, and keeps the restaurant updated from one screen. Success: a supplier signs up, lists products, and receives purchase orders without phone calls.

## Positioning
Restaurants on Alayn already manage inventory inside Alayn; the supplier marketplace sits inside that inventory screen, so a supplier's rate and delivery time appear exactly when an owner searches for "paneer" or "chicken".

## Operating Context
Suppliers run off an order book: purchase orders, packing, dispatch, part deliveries with a date for the rest, delivery addresses and driver contacts. Rates change often; short stock and split deliveries are normal.

## Capabilities and Constraints
- Catalog: product, price per unit, minimum order, delivery time, mark out of stock.
- Purchase-order inbox with statuses: New → Packing → Dispatched / Partly dispatched → Delivered (restaurant confirms received quantities).
- Partial dispatch with a date for the remainder; reject as out of stock with a reason.
- Each order carries outlet, branch, delivery address and contact number.
- Runs in the browser on phone, tablet or computer; nothing to install. Supplier sets their own prices.
- Next.js 16 app in this repo; marketing landing at `/`, app routes `/orders`, `/catalog`, `/profile`, `/login`, `/signup`.

## Brand Commitments
- Alayn brand family: logo navy #1B2A4A and crimson #C41E2A; the TM logo may only be used in its registered colours.
- Logo intro animation shared with alaynai.com.
- Never use the word "challan" (reads as a traffic fine to the founder). Say "order pad", "purchase order" or "delivery slip".

## Evidence on Hand
None yet. Restaurants currently on Alayn are not using the supplier portal, so do not show their logos, counts of suppliers/restaurants/orders, or testimonials. Product demos use sample orders labelled as examples.

## Product Principles
- Show the supplier's real day (orders, packing, short stock), not abstractions.
- The supplier stays in control: their rates, their dispatch dates.
- Phone-first and plain-spoken.
- Never claim traction that doesn't exist.
