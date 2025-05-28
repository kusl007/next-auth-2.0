import { connect } from "@/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import bcryptjs from 'bcryptjs';
import { sendEmail } from "@/helpers/mailer";


// Make sure to connect to the database
connect();

export async function POST(request: NextRequest) {
  try {
    console.log("Parsing request body...");
    const reqBody = await request.json();
    const { email } = reqBody;


    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    console.log("Received email:", email);

    // Check if the user exists
    const user = await User.findOne({ email });
        const hashedToken = await bcryptjs.hash(email.toString(), 10)

        user.forgotPasswordToken = hashedToken;
        user.forgotPasswordTokenExpiry = Date.now() + 3600000;
        await user.save();
                await sendEmail({email, emailType: "RESET", userId: user._id})
        

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // TODO: Generate reset token, expiry, and send email (logic can be added here)

    return NextResponse.json({
      message: "Password reset link sent to your email.",
      success: true,
    });

  } catch (error: any) {
    console.error("Forgot password route error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
