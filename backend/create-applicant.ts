import "dotenv/config";
import { supabaseAdmin } from "./lib/supabaseAdmin";

async function createApplicant() {
  const email = process.argv[2] || "applicant@example.com";
  const password = process.argv[3] || "Applicant123!";
  const fullName = process.argv[4] || "Johnathan Doe";
  const passportNumber = process.argv[5] || "SL-P987654";

  console.log(`👤 Creating Applicant Account for: ${email}...`);

  try {
    // 1. Create or fetch Auth user in Supabase
    let userId: string;

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (authError) {
      if (authError.message.toLowerCase().includes("already registered")) {
        console.log("  • Auth user already exists. Fetching user ID...");
        const { data: usersList } = await supabaseAdmin.auth.admin.listUsers();
        const existing = usersList.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
        if (!existing) throw new Error("Could not locate existing auth user ID");
        userId = existing.id;
        await supabaseAdmin.auth.admin.updateUserById(userId, { password, email_confirm: true });
      } else {
        throw authError;
      }
    } else {
      userId = authData.user.id;
      console.log("  ✓ Created Supabase Auth user (email confirmed)");
    }

    // 2. Insert or update public.users row with role = 'applicant'
    const { error: userError } = await supabaseAdmin.from("users").upsert(
      {
        user_id: userId,
        full_name: fullName,
        email,
        role: "applicant",
        is_active: true,
        phone_verified: true,
      },
      { onConflict: "user_id" }
    );

    if (userError) throw userError;
    console.log("  ✓ Set user role to 'applicant' in public.users");

    // 3. Register a sample passport
    const { error: passportError } = await supabaseAdmin.from("passports").upsert(
      {
        user_id: userId,
        passport_number: passportNumber,
        issuing_country: "Sierra Leone",
        date_of_birth: "1995-06-15",
        sex: "M",
        issue_date: "2023-01-10",
        expiry_date: "2028-01-10",
      },
      { onConflict: "passport_number" }
    );

    if (passportError) {
      console.warn("  - Passport note:", passportError.message);
    } else {
      console.log(`  ✓ Registered passport: ${passportNumber}`);
    }

    console.log("\n========================================================");
    console.log("🎉 APPLICANT ACCOUNT CREATED SUCCESSFULLY!");
    console.log("========================================================");
    console.log(`📧 Email:           ${email}`);
    console.log(`🔑 Password:        ${password}`);
    console.log(`🛂 Passport Number: ${passportNumber}`);
    console.log(`🌐 Login at:        http://localhost:5173/login`);
    console.log("========================================================\n");
    process.exit(0);
  } catch (err: any) {
    console.error("❌ Failed to create applicant account:", err.message || err);
    process.exit(1);
  }
}

createApplicant();
