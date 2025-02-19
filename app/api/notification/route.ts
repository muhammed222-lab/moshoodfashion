import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";

// Helper function to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
  return array.sort(() => Math.random() - 0.5);
}

export async function POST(request: Request) {
  try {
    // Read request body; type should be "daily" or "weekend"
    const { type } = await request.json();
    const isWeekend = type === "weekend";

    // Fetch all subscriptions and filter for unique emails
    const { data: subscriptions, error: subError } = await supabase
      .from("subscriptions")
      .select("email");

    if (subError) {
      console.error("Error fetching subscriptions:", subError);
      return NextResponse.json(
        { message: "Failed to fetch subscriptions", subError },
        { status: 500 }
      );
    }

    const uniqueEmails = Array.from(
      new Set(subscriptions?.map((sub: { email: string }) => sub.email))
    );
    console.log("Unique Emails:", uniqueEmails);

    // Fetch all products from Supabase
    const { data: products, error: prodError } = await supabase
      .from("products")
      .select("*");
    if (prodError) {
      console.error("Error fetching products:", prodError);
      return NextResponse.json(
        { message: "Failed to fetch products", prodError },
        { status: 500 }
      );
    }

    // Filter products that have images (ensure images array exists) and pick 3 random ones.
    const productsWithImages = (products || []).filter(
      (product: { name: string; price: number; images: string[] }) =>
        Array.isArray(product.images) && product.images.length > 0
    );

    let randomProducts: { name: string; price: number; images: string[] }[] =
      [];
    if (productsWithImages.length > 0) {
      const shuffledProducts = shuffleArray(productsWithImages);
      randomProducts = shuffledProducts.slice(0, 3);
    } else {
      // Fallback sample default product if none found.
      randomProducts = [
        {
          name: "Sample Product",
          price: 9999,
          images: [
            "https://cpridtserwligramvsqs.supabase.co/storage/v1/object/public/products/1739867475591-1-IMG-20250215-WA0007.jpg",
            "https://cpridtserwligramvsqs.supabase.co/storage/v1/object/public/products/1739867477664-2-IMG-20250215-WA0008.jpg",
          ],
        },
      ];
    }

    // Build product cards HTML.
    const productCardsHTML = randomProducts
      .map((product: { name: string; price: number; images: string[] }) => {
        const imagesHTML = product.images
          .map(
            (url: string) =>
              `<img src="${url}" alt="${product.name}" style="width:100%; height:auto; border-radius:6px; margin-bottom:8px;" />`
          )
          .join("");
        return `
          <div style="border:1px solid #e0e0e0; padding:15px; margin-bottom:20px; border-radius:10px; text-align:center; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
            ${imagesHTML}
            <h3 style="font-size:20px; color:#222; margin:10px 0 5px;">${
              product.name
            }</h3>
            <p style="font-size:16px; color:#555; margin-bottom:12px;">Price: NGN ${Number(
              product.price
            ).toLocaleString()}</p>
            <a href="https://moshoodfashion.store/product" style="display:inline-block; padding:12px 20px; background:linear-gradient(135deg, #3b82f6, #60a5fa); color:#fff; text-decoration:none; border-radius:6px; font-size:16px;">
              Check it out
            </a>
          </div>`;
      })
      .join("");

    // Define email subject based on notification type
    const subject = isWeekend
      ? "It's the Weekend! Check Out Our Exclusive Offers"
      : "Daily Fashion Finds: Discover Today's Must-Haves";

    // Build a cool, modern HTML email message with inline CSS
    const today = new Date();
    const htmlMessage = `
      <div style="max-width:600px; margin:20px auto; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; background:#fff; border:1px solid #eaeaea; border-radius:10px; overflow:hidden;">
        <div style="background: linear-gradient(135deg, #60a5fa, #3b82f6); padding:25px; text-align:center;">
          <h1 style="margin:0; color:#fff; font-size:28px;">Moshood Fashion</h1>
        </div>
        <div style="padding:30px;">
          <h2 style="font-size:26px; text-align:center; margin-bottom:20px; color:#333;">
            ${isWeekend ? "Happy Weekend!" : "Good Day!"}
          </h2>
          <p style="font-size:16px; line-height:1.6; text-align:center; margin-bottom:30px;">
            ${
              isWeekend
                ? "Enjoy our special weekend greetings! Discover exclusive offers curated just for the weekend. Grab one or two of your favorites and elevate your style."
                : "Here are some exclusive recommendations for you today. Dive into the latest trends and explore new designs."
            }
          </p>
          <div>
            ${productCardsHTML}
          </div>
          <p style="font-size:14px; text-align:center; color:#777; margin-top:30px;">
            Explore more at our <a href="https://moshoodfashion.store/product" style="color:#3b82f6; text-decoration:none; font-weight:bold;">products page</a>.
          </p>
        </div>
        <div style="background:#f7f7f7; padding:15px; text-align:center; font-size:12px; color:#aaa;">
          © ${today.getFullYear()} Moshood Fashion Store. All rights reserved.
        </div>
      </div>
    `;

    // Create a transporter using your SMTP credentials.
    // Switching to secure true and port 465 to minimize connectivity issues.
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "muhammednetr@gmail.com",
        pass: "gswd ammv nrmr euvg",
      },
      name: "moshoodfashion.store",
    });

    // Send email to each unique subscriber
    const sendEmailPromises = uniqueEmails.map((subscriberEmail) => {
      const mailOptions = {
        from: '"Moshood Fashion Store" <moshoodfashion.store>',
        to: subscriberEmail,
        subject,
        html: htmlMessage,
      };
      return transporter.sendMail(mailOptions);
    });

    const emailsSentInfo = await Promise.all(sendEmailPromises);

    return NextResponse.json(
      {
        message: "Notification emails sent successfully",
        emailsSent: emailsSentInfo.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending notifications:", error);
    return NextResponse.json(
      { message: "Error sending notifications", error },
      { status: 500 }
    );
  }
}
