import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "../lib/supabaseClient";

type Role = "applicant" | "immigration_officer" | "visa_officer" | "admin";

interface Profile {
  user_id: string;
  full_name: string;
  role: Role;
  email: string;
  avatar_url?: string | null;
}

interface AuthContextValue {
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  updateAvatar: (avatarUrl: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const metadata = session.user.user_metadata ?? {};
      const oauthAvatar = metadata.avatar_url || metadata.picture || null;
      const oauthFullName =
        metadata.full_name || metadata.name || session.user.email?.split("@")[0] || "New User";

      // profiles table is RLS-protected: users can only read their own row
      const { data } = await supabase
        .from("users")
        .select("user_id, full_name, role, email")
        .eq("user_id", session.user.id)
        .single();

      if (data) {
        setProfile({
          ...data,
          avatar_url: oauthAvatar,
        });
        setLoading(false);
        return;
      }

      // No matching public.users row yet. This is the normal path for a
      // first-time Google/Microsoft/Phone sign-in — OAuth has no separate
      // "register" step, so signing in for the first time IS registration.
      const { data: created, error: insertError } = await supabase
        .from("users")
        .insert({
          user_id: session.user.id,
          full_name: oauthFullName,
          email: session.user.email ?? (session.user.phone ? `${session.user.phone}@phone.slid.gov.sl` : ""),
          phone: session.user.phone ?? null,
          phone_verified: !!session.user.phone,
          role: "applicant",
        })
        .select("user_id, full_name, role, email")
        .single();

      if (insertError) {
        const { data: retry } = await supabase
          .from("users")
          .select("user_id, full_name, role, email")
          .eq("user_id", session.user.id)
          .single();
        setProfile(retry ? { ...retry, avatar_url: oauthAvatar } : null);
      } else {
        setProfile(created ? { ...created, avatar_url: oauthAvatar } : null);
      }
      setLoading(false);
    }

    // Auto-detect password recovery links landing from email
    const hash = window.location.hash || "";
    const search = window.location.search || "";
    if (
      (hash.includes("type=recovery") || search.includes("type=recovery") || hash.includes("type=invite")) &&
      window.location.pathname !== "/reset-password"
    ) {
      window.location.href = `/reset-password${hash}`;
      return;
    }

    loadProfile();

    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        if (window.location.pathname !== "/reset-password") {
          window.location.href = "/reset-password";
          return;
        }
      }
      loadProfile();
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  async function updateAvatar(avatarUrl: string) {
    if (!profile) return;
    setProfile((prev) => (prev ? { ...prev, avatar_url: avatarUrl } : null));

    try {
      // 1. Update auth user metadata
      await supabase.auth.updateUser({
        data: { avatar_url: avatarUrl },
      });

      // 2. Best-effort update to public.users table if column exists
      try {
        await supabase
          .from("users")
          .update({ avatar_url: avatarUrl })
          .eq("user_id", profile.user_id);
      } catch (dbErr) {
        console.warn("Could not update users table avatar:", dbErr);
      }
    } catch (err) {
      console.error("Error updating avatar in Supabase:", err);
    }
  }

  async function refreshProfile() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setProfile(null);
      return;
    }
    const metadata = session.user.user_metadata ?? {};
    const oauthAvatar = metadata.avatar_url || metadata.picture || null;
    const { data } = await supabase
      .from("users")
      .select("user_id, full_name, role, email")
      .eq("user_id", session.user.id)
      .single();

    if (data) {
      setProfile({
        ...data,
        avatar_url: oauthAvatar,
      });
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setProfile(null);
  }

  return (
    <AuthContext.Provider value={{ profile, loading, signOut, updateAvatar, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
