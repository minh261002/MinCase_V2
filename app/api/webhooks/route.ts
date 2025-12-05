import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { render } from "@react-email/render";
import OrderReceivedEmail from "@/components/order-received-email";

const resend = new Resend(process.env.RESEND_API_KEY);

// Lấy type session từ stripe v20
type CheckoutSession = Stripe.Checkout.Session;
type CheckoutEvent = Stripe.CheckoutSessionCompletedEvent;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = (await headers()).get("stripe-signature");

    if (!signature) {
      return new Response("Invalid signature", { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === "checkout.session.completed") {
      const checkoutEvent = event as CheckoutEvent;
      const session = checkoutEvent.data.object as CheckoutSession;

      const customer = session.customer_details;
      if (!customer?.email) {
        throw new Error("Missing customer email");
      }

      const userId = session.metadata?.userId;
      const orderId = session.metadata?.orderId;

      if (!userId || !orderId) {
        throw new Error("Invalid metadata: missing userId/orderId");
      }

      const collectedInfo = session.collected_information;
      const shippingDetails = collectedInfo?.shipping_details ?? null;

      const billingAddress = customer.address ?? null;
      const shippingAddress = shippingDetails?.address ?? null;

      const data: Parameters<typeof db.order.update>[0]["data"] = {
        isPaid: true,
      };

      if (shippingAddress) {
        data.shippingAddress = {
          create: {
            name: customer.name ?? "",
            city: shippingAddress.city ?? "",
            country: shippingAddress.country ?? "",
            postalCode: shippingAddress.postal_code ?? "",
            street: shippingAddress.line1 ?? "",
            state: shippingAddress.state ?? null,
          },
        };
      }

      if (billingAddress) {
        data.billingAddress = {
          create: {
            name: customer.name ?? "",
            city: billingAddress.city ?? "",
            country: billingAddress.country ?? "",
            postalCode: billingAddress.postal_code ?? "",
            street: billingAddress.line1 ?? "",
            state: billingAddress.state ?? null,
          },
        };
      }

      const updatedOrder = await db.order.update({
        where: { id: orderId },
        data,
      });

      // Chọn địa chỉ để gửi email: ưu tiên shipping, fallback billing
      const finalAddress = shippingAddress ?? billingAddress ?? undefined;

      const emailHtml = await render(
        OrderReceivedEmail({
          orderId,
          orderDate: updatedOrder.createdAt.toLocaleDateString(),
          shippingAddress: {
            id: updatedOrder.shippingAddressId ?? "",
            name: customer.name ?? "",
            city: finalAddress?.city ?? "",
            country: finalAddress?.country ?? "",
            postalCode: finalAddress?.postal_code ?? "",
            street: finalAddress?.line1 ?? "",
            state: finalAddress?.state ?? null,
            phoneNumber: null,
          },
        })
      );

      console.log("Sending email to:", customer.email);

      const emailResponse = await resend.emails.send({
        from: "MinCase <onboarding@resend.dev>",
        to: [customer.email],
        subject: "Thanks for your order!",
        html: emailHtml,
      });

      console.log("Email sent response:", emailResponse);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json(
      { ok: false, message: "Internal error" },
      { status: 500 }
    );
  }
}
