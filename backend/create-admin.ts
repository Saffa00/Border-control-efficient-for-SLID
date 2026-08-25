import "dotenv/config";
import { supabaseAdmin } from "./lib/supabaseAdmin";

async function createAdmin() {
  const email = process.argv[2] || "admin@slid.gov.sl";
  const password = process.argv[3] || "Admin12345!";
  const fullName = process.argv[4] || "System Administrator";

  console.log(`🔐 Creating Admin Account for: ${email}...`);

  try {
    // 1. Create or fetch Auth user in Supabase
    let userId: string;

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // auto-confirm email so no verification email is required
      user_metadata: { full_name: fullName },
    });

    if (authError) {
      if (authError.message.toLowerCase().includes("already registered")) {
        console.log("  • Auth user already exists. Fetching existing user ID...");
        const { data: usersList } = await supabaseAdmin.auth.admin.listUsers();
        const existing = usersList.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
        if (!existing) throw new Error("Could not locate existing auth user ID");
        userId = existing.id;
        
        // Update password if specified
        await supabaseAdmin.auth.admin.updateUserById(userId, { password, email_confirm: true });
      } else {
        throw authError;
      }
    } else {
      userId = authData.user.id;
      console.log("  ✓ Created Supabase Auth user (email auto-confirmed)");
    }

    // 2. Insert or update public.users row with role = 'admin'
    const { error: userError } = await supabaseAdmin.from("users").upsert(
      {
        user_id: userId,
        full_name: fullName,
        email,
        role: "admin",
        is_active: true,
        phone_verified: true,
      },
      { onConflict: "user_id" }
    );

    if (userError) throw userError;
    console.log("  ✓ Set user role to 'admin' in public.users");

    // 3. Insert or update staff_profiles row
    const { error: staffError } = await supabaseAdmin.from("staff_profiles").upsert(
      {
        user_id: userId,
        staff_id_code: "SLID-ADM-001",
        rank_title: "Chief Immigration Administrator",
        department: "Administration & Operations",
        duty_station: "Freetown Headquarters",
        issue_date: new Date().toISOString().slice(0, 10),
        expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 5))
          .toISOString()
          .slice(0, 10),
        status: "Active",
      },
      { onConflict: "user_id" }
    );

    if (staffError) throw staffError;
    console.log("  ✓ Created staff profile for Admin");

    console.log("\n========================================================");
    console.log("🎉 ADMIN ACCOUNT CREATED / UPDATED SUCCESSFULLY!");
    console.log("========================================================");
    console.log(`📧 Email:    ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`🌐 Login at: http://localhost:5173/login`);
    console.log("========================================================\n");
    process.exit(0);
  } catch (err: any) {
    console.error("❌ Failed to create admin account:", err.message || err);
    process.exit(1);
  }
}

createAdmin();
