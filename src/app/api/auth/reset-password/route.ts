import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, tempPassword } = await request.json();

    if (!email || !tempPassword) {
      return NextResponse.json({ error: "Email and temporary password are required." }, { status: 400 });
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing Supabase Service Role Key");
      return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Get user by email by generating a dummy link (fastest way to get user ID without exposing auth schema)
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
    });

    if (linkError || !linkData?.user) {
      console.error("Error generating link to find user:", linkError);
      return NextResponse.json({ error: "User not found. Please check the email address." }, { status: 404 });
    }

    // Force update the password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      linkData.user.id,
      { password: tempPassword }
    );

    if (updateError) {
      console.error("Error updating user password:", updateError);
      throw updateError;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Reset Password API Error:", error);
    return NextResponse.json({ error: error.message || "An unexpected error occurred." }, { status: 500 });
  }
}
