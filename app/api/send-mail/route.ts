import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, subject, orderDate, orderItems, total } =
      await request.json();

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

    // Build HTML for order items
    const orderItemsHtml = orderItems
      .map(
        (item: any) =>
          `<li>${item.name} - Qty: ${item.quantity} - Price: NGN ${item.price}</li>`
      )
      .join("");

    const mailOptions = {
      from: '"Moshood Fashion Store" <' + process.env.SMTP_USER + ">",
      to: email,
      subject,
      html: `<h1>Your Order Confirmation</h1>
             <p>Your order placed on ${orderDate} has been successfully processed.</p>
             <h2>Order Details:</h2>
             <ul>${orderItemsHtml}</ul>
             <p><strong>Total:</strong> NGN ${Number(
               total
             ).toLocaleString()}</p>
             <p>Thank you for shopping with us!</p>`,
    };

    const info = await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "Email sent", info }, { status: 200 });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { message: "Error sending email", error },
      { status: 500 }
    );
  }
}
