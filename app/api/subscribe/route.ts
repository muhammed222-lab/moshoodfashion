import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Insert subscription into Supabase
    const { error } = await supabase.from("subscriptions").insert([
      {
        email,
        subscription_date: new Date(),
      },
    ]);

    if (error) {
      console.error("Subscription error:", error);
      return NextResponse.json(
        { message: "Subscription failed", error },
        { status: 500 }
      );
    }

    // Create a transporter using SMTP credentials from environment variables
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true", // Convert string to boolean
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      name: process.env.SMTP_NAME,
    });

    // Build the HTML message with cool, professional inline CSS styling
    const htmlMessage = `
      <div style="max-width:600px;margin:0 auto;font-family:Arial, sans-serif;color:#333;">
        <div style="background:#f7f7f7;padding:20px;text-align:center;border-bottom:4px solid #3b82f6;">
          <h1 style="margin:0;color:#3b82f6;">Moshood Fashion</h1>
        </div>
        <div style="padding:30px;background:#fff;">
          <h2 style="font-size:24px;margin-bottom:20px;text-align:center;">Thank You for Subscribing!</h2>
          <p style="font-size:16px;line-height:1.6;text-align:center;">
            We're excited to have you join our community. Get ready for exclusive deals, the latest fashion trends,
            and handpicked updates delivered straight to your inbox.
          </p>
          <div style="margin:30px 0;text-align:center;">
            <a href="https://moshoodfashion.store" style="background:#3b82f6;color:#fff;padding:12px 24px; text-decoration:none;border-radius:4px;font-size:16px;">
              Visit Our Website
            </a>
          </div>
          <p style="font-size:14px;color:#777;text-align:center;">
            Best wishes,<br/>
            Moshood Fashion Store Team
          </p>
        </div>
        <div style="background:#f7f7f7;padding:10px;text-align:center;font-size:12px;color:#aaa;">
          © ${new Date().getFullYear()} Moshood Fashion Store. All rights reserved.
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"Moshood Fashion Store" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Thank You for Subscribing!",
      html: htmlMessage,
    };

    const info = await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: "Subscription successful; email sent", info },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing subscription:", error);
    return NextResponse.json(
      { message: "Error processing subscription", error },
      { status: 500 }
    );
  }
}
