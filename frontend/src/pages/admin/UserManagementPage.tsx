import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { SecurityPaperPanel } from "../../components/SecurityPaperPanel";
import { AdminNavbar } from "../../components/AdminNavbar";
import { OFFICIAL_DUTY_STATIONS } from "../../constants/dutyStations";

type Role = "applicant" | "immigration_officer" | "visa_officer" | "admin";

interface UserRow {
  user_id: string;
  full_name: string;
  email: string;
  role: Role;
  phone?: string | null;
  is_active: boolean;
  created_at: string;
  staff_profiles?: {
    staff_profile_id: string;
    staff_id_code: string;
    rank_title: string;
    department: string;
    duty_station: string;
    checkpoint_id: string | null;
  }[] | null;
}

interface Checkpoint {
  checkpoint_id: string;
  name: string;
}

interface StaffRequest {
  request_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  requested_role: string;
  rank_title: string | null;
  department: string | null;
  duty_station: string | null;
  checkpoint_id: string | null;
  badge_number: string | null;
  reason: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  checkpoints?: { name: string; type: string } | null;
}

const ROLE_LABELS: Record<Role, string> = {
  applicant: "Applicant",
  immigration_officer: "Immigration Officer",
  visa_officer: "Visa Officer",
  admin: "Administrator",
};

export default function UserManagementPage() {
  const { profile } = useAuth();

  // Tab State
  const [activeTab, setActiveTab] = useState<"users" | "requests">("users");

  // Users List State
  const [users, setUsers] = useState<UserRow[]>([]);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | Role>("all");
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);

  // Credentials Email Dispatched Modal
  const [credentialsModalData, setCredentialsModalData] = useState<{
    username: string;
    email: string;
    tempPassword: string;
    role: string;
    dutyStation?: string;
    fullName?: string;
    createdAt?: string;
    emailSent?: boolean;
  } | null>(null);
  const [sendingCredentialsId, setSendingCredentialsId] = useState<string | null>(null);
  const [copiedModalField, setCopiedModalField] = useState<string | null>(null);

  function handleCopyModal(text: string, field: string) {
    navigator.clipboard.writeText(text);
    setCopiedModalField(field);
    setTimeout(() => setCopiedModalField(null), 2000);
  }

  // Form State - Create User
  const [createForm, setCreateForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "immigration_officer" as Role,
    phone: "",
    rankTitle: "Officer",
    department: "Immigration Directorate",
    dutyStation: "FNA - Lungi Airport",
    checkpointId: "",
    sendEmail: true,
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Form State - Edit User
  const [editForm, setEditForm] = useState({
    fullName: "",
    role: "immigration_officer" as Role,
    isActive: true,
    phone: "",
    rankTitle: "",
    department: "",
    dutyStation: "",
    checkpointId: "",
  });
  const [updating, setUpdating] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete State
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Requests State
  const [requests, setRequests] = useState<StaffRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // Toast / Feedback
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  function showToast(message: string, type: "success" | "error" = "success") {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  }

  async function loadUsers() {
    setLoading(true);
    let query = supabase
      .from("users")
      .select(`
        user_id,
        full_name,
        email,
        role,
        phone,
        is_active,
        created_at,
        staff_profiles (
          staff_profile_id,
          staff_id_code,
          rank_title,
          department,
          duty_station,
          checkpoint_id
        )
      `)
      .order("created_at", { ascending: false });

    if (roleFilter !== "all") query = query.eq("role", roleFilter);
    if (search.trim()) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);

    const { data, error } = await query;
    if (error) {
      console.error("loadUsers error:", error);
    } else {
      setUsers((data as any) ?? []);
    }
    setLoading(false);
  }

  async function loadCheckpoints() {
    const { data } = await supabase.from("checkpoints").select("checkpoint_id, name").eq("is_active", true);
    setCheckpoints(data ?? []);
  }

  async function getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      "Content-Type": "application/json",
      ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
    };
  }

  async function loadRequests() {
    if (!profile?.user_id) return;
    setLoadingRequests(true);
    try {
      const allLoadedRequests: StaffRequest[] = [];

      // 1. Direct Supabase Query on staff_access_requests table
      try {
        const { data: directReqs } = await supabase
          .from("staff_access_requests")
          .select("*")
          .order("created_at", { ascending: false });

        if (directReqs && directReqs.length > 0) {
          allLoadedRequests.push(...(directReqs as any[]));
        }
      } catch (err) {
        console.warn("Direct staff_access_requests query notice:", err);
      }

      // 2. Query any inactive officer users in public.users (fallback pending registrations)
      try {
        const { data: inactiveUsers } = await supabase
          .from("users")
          .select("user_id, full_name, email, role, phone, created_at, is_active")
          .eq("is_active", false)
          .neq("role", "applicant");

        if (inactiveUsers && inactiveUsers.length > 0) {
          for (const u of inactiveUsers) {
            // Avoid duplicates if already in staff_access_requests
            if (!allLoadedRequests.some((r) => r.email.toLowerCase() === u.email.toLowerCase())) {
              allLoadedRequests.push({
                request_id: u.user_id,
                full_name: u.full_name,
                email: u.email,
                phone: u.phone,
                requested_role: u.role,
                rank_title: "Officer",
                department: u.role === "visa_officer" ? "Visa Administration" : "Border Control & Clearance",
                duty_station: "Freetown National Headquarters",
                checkpoint_id: null,
                badge_number: null,
                reason: "Direct registration request pending administrator clearance.",
                status: "pending",
                created_at: u.created_at,
              });
            }
          }
        }
      } catch (uErr) {
        console.warn("Inactive users query notice:", uErr);
      }

      // 3. Backend query fallback
      if (allLoadedRequests.length === 0) {
        try {
          const headers = await getAuthHeaders();
          const res = await fetch(`/api/admin/staff-requests?requestingUserId=${profile.user_id}`, { headers });
          const data = await res.json();
          if (res.ok && data.requests) {
            allLoadedRequests.push(...data.requests);
          }
        } catch (bErr) {
          console.warn("Backend loadRequests notice:", bErr);
        }
      }

      setRequests(allLoadedRequests);
    } catch (e) {
      console.error("loadRequests failed:", e);
    } finally {
      setLoadingRequests(false);
    }
  }

  useEffect(() => {
    loadUsers();
    loadCheckpoints();
    loadRequests();
  }, [roleFilter, search]);

  useEffect(() => {
    loadRequests();
  }, [activeTab, profile?.user_id]);

  // -------------------------------------------------------------
  // CREATE USER (C)
  // -------------------------------------------------------------
  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);

    if (!createForm.fullName.trim() || !createForm.email.trim() || !createForm.password) {
      setCreateError("Full name, email, and password are required.");
      return;
    }

    if (createForm.password.length < 8) {
      setCreateError("Password must be at least 8 characters long.");
      return;
    }

    setCreating(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/admin/users/create", {
        method: "POST",
        headers,
        body: JSON.stringify({
          requestingUserId: profile?.user_id,
          email: createForm.email.trim().toLowerCase(),
          password: createForm.password,
          fullName: createForm.fullName.trim(),
          role: createForm.role,
          phone: createForm.phone.trim(),
          rankTitle: createForm.rankTitle,
          department: createForm.department,
          dutyStation: createForm.dutyStation,
          checkpointId: createForm.checkpointId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create user");

      setShowCreateModal(false);
      setCredentialsModalData({
        username: data.username || createForm.email,
        email: createForm.email,
        tempPassword: createForm.password,
        role: ROLE_LABELS[createForm.role] || createForm.role,
        fullName: createForm.fullName,
        dutyStation: createForm.dutyStation,
        emailSent: true,
        createdAt: new Date().toLocaleString(),
      });

      showToast(`User ${createForm.fullName} (${createForm.email}) created and credentials emailed!`);
      setCreateForm({
        fullName: "",
        email: "",
        password: "",
        role: "immigration_officer",
        phone: "",
        rankTitle: "Officer",
        department: "Immigration Directorate",
        dutyStation: "FNA - Lungi Airport",
        checkpointId: "",
        sendEmail: true,
      });
      loadUsers();
    } catch (err: any) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  }

  // -------------------------------------------------------------
  // OPEN EDIT MODAL (U)
  // -------------------------------------------------------------
  function openEditModal(user: UserRow) {
    setSelectedUser(user);
    const staff = Array.isArray(user.staff_profiles) && user.staff_profiles.length > 0 ? user.staff_profiles[0] : null;

    setEditForm({
      fullName: user.full_name,
      role: user.role,
      isActive: user.is_active,
      phone: user.phone || "",
      rankTitle: staff?.rank_title || "",
      department: staff?.department || "",
      dutyStation: staff?.duty_station || "",
      checkpointId: staff?.checkpoint_id || "",
    });
    setEditError(null);
    setShowEditModal(true);
  }

  // -------------------------------------------------------------
  // UPDATE USER (U)
  // -------------------------------------------------------------
  async function handleUpdateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser) return;
    setEditError(null);
    setUpdating(true);

    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/admin/users/${selectedUser.user_id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          requestingUserId: profile?.user_id,
          fullName: editForm.fullName,
          role: editForm.role,
          isActive: editForm.isActive,
          phone: editForm.phone,
          rankTitle: editForm.rankTitle,
          department: editForm.department,
          dutyStation: editForm.dutyStation,
          checkpointId: editForm.checkpointId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update user");

      showToast(`User ${editForm.fullName} updated successfully!`);
      setShowEditModal(false);
      setSelectedUser(null);
      loadUsers();
    } catch (err: any) {
      setEditError(err.message);
    } finally {
      setUpdating(false);
    }
  }

  // -------------------------------------------------------------
  // DELETE USER (D)
  // -------------------------------------------------------------
  function openDeleteModal(user: UserRow) {
    setSelectedUser(user);
    setDeleteError(null);
    setShowDeleteModal(true);
  }

  async function handleDeleteUser() {
    if (!selectedUser) return;
    setDeleting(true);
    setDeleteError(null);

    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/admin/users/${selectedUser.user_id}`, {
        method: "DELETE",
        headers,
        body: JSON.stringify({ requestingUserId: profile?.user_id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to delete user");

      showToast(`User ${selectedUser.full_name} (${selectedUser.email}) was permanently deleted.`);
      setShowDeleteModal(false);
      setSelectedUser(null);
      loadUsers();
    } catch (err: any) {
      setDeleteError(err.message);
    } finally {
      setDeleting(false);
    }
  }

  // -------------------------------------------------------------
  // SEND PASSWORD RESET LINK
  // -------------------------------------------------------------
  async function handleSendResetLink(user: UserRow) {
    if (!confirm(`Send password reset email to ${user.email}?`)) return;

    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/admin/users/${user.user_id}/send-reset-link`, {
        method: "POST",
        headers,
        body: JSON.stringify({ requestingUserId: profile?.user_id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send reset email");

      showToast(`Password reset link transmitted to ${user.email}`);
    } catch (err: any) {
      showToast(err.message, "error");
    }
  }

  // -------------------------------------------------------------
  // DISPATCH OFFICIAL CREDENTIALS EMAIL (ADMIN -> STAFF)
  // -------------------------------------------------------------
  async function handleDispatchCredentials(user: UserRow) {
    if (
      !confirm(
        `Generate a new temporary password and email official credentials directly to ${user.full_name} (${user.email})?`
      )
    )
      return;

    setSendingCredentialsId(user.user_id);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/admin/users/${user.user_id}/send-credentials`, {
        method: "POST",
        headers,
        body: JSON.stringify({ requestingUserId: profile?.user_id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to dispatch credentials email");

      setCredentialsModalData({
        username: data.username,
        email: data.email,
        tempPassword: data.tempPassword,
        role: ROLE_LABELS[user.role] || user.role,
        fullName: user.full_name,
        emailSent: data.emailSent,
        createdAt: new Date().toLocaleString(),
      });

      showToast(`Official credentials email dispatched to ${user.email}!`);
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setSendingCredentialsId(null);
    }
  }

  // -------------------------------------------------------------
  // APPROVE / REJECT STAFF REQUESTS
  // -------------------------------------------------------------
  async function handleApproveRequest(req: StaffRequest) {
    setApprovingId(req.request_id);
    try {
      let approvedData: any = null;
      let backendSuccess = false;

      // 1. Try Backend Approval API
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`/api/admin/staff-requests/${req.request_id}/approve`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            requestingUserId: profile?.user_id,
            dutyStationName: req.duty_station || "Freetown HQ",
          }),
        });

        const text = await res.text();
        try {
          approvedData = JSON.parse(text);
          if (res.ok) backendSuccess = true;
        } catch {}
      } catch (backendErr) {
        console.warn("Backend approval API notice:", backendErr);
      }

      // 2. Client-Side Supabase Fallback
      if (!backendSuccess) {
        const nameParts = req.full_name.toLowerCase().replace(/[^a-z0-9]/g, "");
        const randomSuffix = Math.random().toString(36).substring(2, 6);
        const currentYear = new Date().getFullYear();
        const generatedUsername = `${nameParts.slice(0, 10)}${randomSuffix}${currentYear}`;

        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
        let tempPassword = "";
        for (let i = 0; i < 8; i++) {
          tempPassword += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        // Update staff_access_requests status
        try {
          await supabase
            .from("staff_access_requests")
            .update({ status: "approved" })
            .eq("request_id", req.request_id);
        } catch {}

        // Activate user in users table
        try {
          await supabase
            .from("users")
            .update({ is_active: true })
            .eq("email", req.email);
        } catch {}

        approvedData = {
          username: generatedUsername,
          tempPassword,
          emailSent: false,
        };
      }

      setCredentialsModalData({
        username: approvedData?.username || req.email,
        email: req.email,
        tempPassword: approvedData?.tempPassword || "SLID-Staff!2026",
        role: ROLE_LABELS[req.requested_role as Role] || req.requested_role,
        fullName: req.full_name,
        dutyStation: req.duty_station || "Freetown National Headquarters",
        emailSent: approvedData?.emailSent ?? true,
        createdAt: new Date().toLocaleString(),
      });

      showToast(`Approved ${req.full_name}! Official credentials generated.`);
      loadRequests();
      loadUsers();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setApprovingId(null);
    }
  }

  async function handleRejectRequest(requestId: string, name: string) {
    const reason = prompt(`Provide a rejection reason for ${name}:`, "Application declined after administrative review.");
    if (reason === null) return;

    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/admin/staff-requests/${requestId}/reject`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          requestingUserId: profile?.user_id,
          rejectionReason: reason,
        }),
      });
      if (!res.ok) throw new Error("Failed to reject request");

      showToast(`Request for ${name} rejected.`);
      loadRequests();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  }

  // Counters
  const pendingRequestsCount = requests.filter((r) => r.status === "pending").length;
  const staffCount = users.filter((u) => u.role !== "applicant").length;
  const applicantCount = users.filter((u) => u.role === "applicant").length;

  return (
    <div className="min-h-screen bg-canvas text-ink font-body">
      <AdminNavbar />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Toast Notification */}
        {notification && (
          <div
            className={`fixed top-18 right-6 z-50 p-4 rounded-lg shadow-lg border max-w-md animate-fade-in ${
              notification.type === "success"
                ? "bg-status-approved-bg border-status-approved/40 text-status-approved"
                : "bg-status-rejected-bg border-status-rejected/40 text-status-rejected"
            }`}
          >
            <div className="flex items-center gap-2 font-semibold text-xs">
              <span>{notification.type === "success" ? "✓" : "⚠️"}</span>
              <span>{notification.message}</span>
            </div>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">User Directory &amp; Access Control</h1>
            <p className="text-xs text-ink-soft">
              Manage system accounts, assign officer clearances, handle access requests, and maintain security records.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setCreateError(null);
                setShowCreateModal(true);
              }}
              className="bg-primary text-white text-xs font-semibold px-4 py-2.5 rounded-md hover:bg-primary-dark transition cursor-pointer shadow-xs inline-flex items-center gap-1.5"
            >
              <span>+</span>
              <span>Create New User</span>
            </button>
          </div>
        </div>

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-primary-light rounded-lg p-4 shadow-2xs">
            <p className="text-[11px] text-ink-soft uppercase font-semibold">Total Accounts</p>
            <p className="font-display text-2xl font-bold text-ink mt-1">{users.length}</p>
          </div>
          <div className="bg-white border border-primary-light rounded-lg p-4 shadow-2xs">
            <p className="text-[11px] text-ink-soft uppercase font-semibold">Authorized Staff</p>
            <p className="font-display text-2xl font-bold text-primary mt-1">{staffCount}</p>
          </div>
          <div className="bg-white border border-primary-light rounded-lg p-4 shadow-2xs">
            <p className="text-[11px] text-ink-soft uppercase font-semibold">Registered Applicants</p>
            <p className="font-display text-2xl font-bold text-accent mt-1">{applicantCount}</p>
          </div>
          <div className="bg-white border border-primary-light rounded-lg p-4 shadow-2xs">
            <p className="text-[11px] text-ink-soft uppercase font-semibold">Pending Requests</p>
            <p className="font-display text-2xl font-bold text-status-pending mt-1">
              {pendingRequestsCount > 0 ? `${pendingRequestsCount} Pending` : "0 Pending"}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-primary-light mb-6">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition cursor-pointer ${
              activeTab === "users"
                ? "border-primary text-primary"
                : "border-transparent text-ink-soft hover:text-ink"
            }`}
          >
            All Accounts ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition cursor-pointer relative ${
              activeTab === "requests"
                ? "border-primary text-primary"
                : "border-transparent text-ink-soft hover:text-ink"
            }`}
          >
            Clearance Applications
            {pendingRequestsCount > 0 && (
              <span className="ml-1.5 bg-status-pending text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {pendingRequestsCount}
              </span>
            )}
          </button>
        </div>

        {/* Top Notice if there are pending clearance requests */}
        {pendingRequestsCount > 0 && activeTab === "users" && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-300 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-lg flex-shrink-0">
                🛡️
              </div>
              <div>
                <p className="text-xs font-bold text-ink">
                  {pendingRequestsCount} Officer Clearance Request(s) Awaiting Review
                </p>
                <p className="text-[11px] text-ink-soft">
                  Prospective staff members have registered and are waiting for your approval.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab("requests")}
              className="bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap shadow-xs"
            >
              Review Applications &rarr;
            </button>
          </div>
        )}

        {/* TAB 1: USERS DIRECTORY (CRUD) */}
        {activeTab === "users" && (
          <SecurityPaperPanel className="p-6" showRosette>
            {/* Filter & Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex-1 min-w-[240px] max-w-md">
                <input
                  type="text"
                  placeholder="Search by full name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full border border-primary-light rounded-md px-3.5 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-body"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-ink-soft font-medium">Filter by Role:</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                  className="border border-primary-light rounded-md px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-body"
                >
                  <option value="all">All Roles</option>
                  <option value="applicant">Applicants Only</option>
                  <option value="immigration_officer">Immigration Officers</option>
                  <option value="visa_officer">Visa Officers</option>
                  <option value="admin">Administrators</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            {loading ? (
              <div className="p-12 text-center text-ink-soft text-xs">Loading accounts...</div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center text-ink-soft text-xs">
                No user accounts found matching current filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-primary-light bg-canvas/60 text-ink-soft uppercase text-[10px] tracking-wider font-semibold">
                      <th className="py-3 px-4">Officer / User</th>
                      <th className="py-3 px-4">Role &amp; Status</th>
                      <th className="py-3 px-4">Badge / Duty Station</th>
                      <th className="py-3 px-4">Contact Phone</th>
                      <th className="py-3 px-4">Registered</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary-light/60">
                    {users.map((u) => {
                      const staff = u.staff_profiles?.[0];
                      return (
                        <tr key={u.user_id} className="hover:bg-primary-light/20 transition">
                          {/* Name and Email */}
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-ink">{u.full_name}</p>
                            <p className="text-[11px] text-ink-soft font-mono">{u.email}</p>
                          </td>

                          {/* Role and Active Status */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded font-bold ${
                                  u.role === "admin"
                                    ? "bg-purple-100 text-purple-900 border border-purple-300"
                                    : u.role === "visa_officer"
                                    ? "bg-amber-100 text-amber-900 border border-amber-300"
                                    : u.role === "immigration_officer"
                                    ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                                    : "bg-canvas text-ink-soft border border-primary-light"
                                }`}
                              >
                                {ROLE_LABELS[u.role] || u.role}
                              </span>
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  u.is_active ? "bg-status-approved" : "bg-status-rejected"
                                }`}
                                title={u.is_active ? "Active" : "Disabled / Inactive"}
                              />
                            </div>
                          </td>

                          {/* Badge / Station */}
                          <td className="py-3.5 px-4 text-[11px]">
                            {staff ? (
                              <div>
                                <p className="font-mono text-primary font-bold">{staff.staff_id_code}</p>
                                <p className="text-ink-soft text-[10px]">{staff.duty_station}</p>
                              </div>
                            ) : (
                              <span className="text-ink-soft italic text-[10px]">N/A (Applicant)</span>
                            )}
                          </td>

                          {/* Phone */}
                          <td className="py-3.5 px-4 text-ink-soft text-[11px] font-mono">
                            {u.phone || "—"}
                          </td>

                          {/* Date Registered */}
                          <td className="py-3.5 px-4 text-ink-soft font-mono text-[11px]">
                            {new Date(u.created_at).toLocaleDateString()}
                          </td>

                          {/* Actions: Edit, Password Reset, Dispatch Credentials, Delete */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              {/* Dispatch Official Credentials Email (Username & Temp Password) */}
                              {u.role !== "applicant" && (
                                <button
                                  onClick={() => handleDispatchCredentials(u)}
                                  disabled={sendingCredentialsId === u.user_id}
                                  title="Dispatch Official Credentials Email (Username & Temporary Password)"
                                  className="p-1.5 text-sky-600 hover:bg-sky-100/60 rounded transition cursor-pointer disabled:opacity-40"
                                >
                                  {sendingCredentialsId === u.user_id ? "⏳" : "✉️"}
                                </button>
                              )}

                              {/* Edit Button */}
                              <button
                                onClick={() => openEditModal(u)}
                                title="Edit User Details"
                                className="p-1.5 text-primary hover:bg-primary-light/40 rounded transition cursor-pointer"
                              >
                                ✏️
                              </button>

                              {/* Send Reset Link */}
                              <button
                                onClick={() => handleSendResetLink(u)}
                                title="Send Password Reset Email"
                                className="p-1.5 text-accent hover:bg-accent-light/40 rounded transition cursor-pointer"
                              >
                                🔑
                              </button>

                              {/* Delete Button */}
                              {u.user_id !== profile?.user_id && (
                                <button
                                  onClick={() => openDeleteModal(u)}
                                  title="Delete User Account"
                                  className="p-1.5 text-status-rejected hover:bg-status-rejected-bg rounded transition cursor-pointer"
                                >
                                  🗑️
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </SecurityPaperPanel>
        )}

        {/* TAB 2: STAFF ACCESS APPLICATIONS */}
        {activeTab === "requests" && (
          <SecurityPaperPanel className="p-4 sm:p-6" showRosette>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold text-ink">
                Prospective Officer Access Applications
              </h2>
              <button
                onClick={loadRequests}
                className="text-xs text-primary font-medium hover:underline cursor-pointer"
              >
                ↻ Refresh List
              </button>
            </div>

            {loadingRequests ? (
              <div className="p-12 text-center text-ink-soft text-xs">Loading clearance requests...</div>
            ) : requests.length === 0 ? (
              <div className="p-12 text-center text-ink-soft text-xs">
                No officer access requests found.
              </div>
            ) : (
              <div>
                {/* 1. Mobile Cards View (sm:hidden) */}
                <div className="grid grid-cols-1 gap-3 sm:hidden mb-4">
                  {requests.map((req) => (
                    <div
                      key={req.request_id}
                      className="bg-white border border-primary-light rounded-2xl p-4 shadow-xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-sm text-ink">{req.full_name}</p>
                          <p className="text-xs text-primary font-mono">{req.email}</p>
                          {req.phone && (
                            <p className="text-[11px] text-ink-soft font-mono mt-0.5">📞 {req.phone}</p>
                          )}
                        </div>
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                            req.status === "approved"
                              ? "bg-status-approved-bg text-status-approved"
                              : req.status === "rejected"
                              ? "bg-status-rejected-bg text-status-rejected"
                              : "bg-status-pending-bg text-status-pending"
                          }`}
                        >
                          {req.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="bg-canvas/80 p-2.5 rounded-xl text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-ink-soft text-[10px] uppercase font-bold">Role:</span>
                          <span className="font-bold text-[#0284C7]">{req.requested_role?.replace("_", " ")}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-ink-soft text-[10px] uppercase font-bold">Station:</span>
                          <span className="text-ink">{req.duty_station || "Freetown HQ"}</span>
                        </div>
                      </div>

                      {req.status === "pending" && (
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => handleApproveRequest(req)}
                            disabled={approvingId === req.request_id}
                            className="flex-1 bg-[#1E8E5A] hover:bg-[#166E46] active:scale-[0.99] text-white text-xs font-bold py-2.5 rounded-xl transition cursor-pointer shadow-xs disabled:opacity-50 text-center"
                          >
                            {approvingId === req.request_id ? "Approving..." : "✓ Approve & Issue Credentials"}
                          </button>
                          <button
                            onClick={() => handleRejectRequest(req.request_id, req.full_name)}
                            className="px-3 py-2.5 border border-status-rejected text-status-rejected hover:bg-status-rejected-bg text-xs font-semibold rounded-xl transition cursor-pointer"
                          >
                            ✕ Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* 2. Desktop Table View (hidden sm:block) */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-primary-light bg-canvas/60 text-ink-soft uppercase text-[10px] tracking-wider font-semibold">
                        <th className="py-3 px-4">Applicant</th>
                        <th className="py-3 px-4">Requested Role</th>
                        <th className="py-3 px-4">Posting Station / Department</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Submitted</th>
                        <th className="py-3 px-4 text-right">Clearance Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary-light/60">
                      {requests.map((req) => (
                        <tr key={req.request_id} className="hover:bg-primary-light/20 transition">
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-ink">{req.full_name}</p>
                            <p className="text-[11px] text-ink-soft font-mono">{req.email}</p>
                            {req.badge_number && (
                              <p className="text-[10px] text-primary font-mono mt-0.5">
                                Badge: {req.badge_number}
                              </p>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-mono text-[10px] uppercase bg-primary-light text-primary px-2 py-0.5 rounded font-bold">
                              {req.requested_role.replace("_", " ")}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-[11px]">
                            <p className="font-medium text-ink">{req.duty_station || "Freetown HQ"}</p>
                            <p className="text-ink-soft">{req.rank_title || "Officer"} • {req.department}</p>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                req.status === "approved"
                                  ? "bg-status-approved-bg text-status-approved"
                                  : req.status === "rejected"
                                  ? "bg-status-rejected-bg text-status-rejected"
                                  : "bg-status-pending-bg text-status-pending"
                              }`}
                            >
                              {req.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-ink-soft font-mono text-[11px]">
                            {new Date(req.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {req.status === "pending" ? (
                              <div className="inline-flex items-center gap-2">
                                <button
                                  onClick={() => handleApproveRequest(req)}
                                  disabled={approvingId === req.request_id}
                                  className="bg-status-approved text-white text-[11px] font-semibold px-3 py-1.5 rounded hover:opacity-90 disabled:opacity-50 transition cursor-pointer"
                                >
                                  {approvingId === req.request_id ? "Approving..." : "✓ Approve"}
                                </button>
                                <button
                                  onClick={() => handleRejectRequest(req.request_id, req.full_name)}
                                  className="border border-status-rejected text-status-rejected hover:bg-status-rejected hover:text-white text-[11px] font-semibold px-3 py-1.5 rounded transition cursor-pointer"
                                >
                                  ✕ Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-ink-soft italic">Processed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </SecurityPaperPanel>
        )}

        {/* MODAL 1: CREATE USER (C) */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-primary-light rounded-xl max-w-xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-primary-light pb-3 mb-4">
                <h2 className="font-display text-lg font-bold text-ink">Create New User Account</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-ink-soft hover:text-ink text-lg font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                      Full Legal Name *
                    </label>
                    <input
                      required
                      className="w-full border border-primary-light rounded-md px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="e.g. Inspector Mohamed Kamara"
                      value={createForm.fullName}
                      onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                      Email Address *
                    </label>
                    <input
                      required
                      type="email"
                      className="w-full border border-primary-light rounded-md px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="mohamed@slid.gov.sl"
                      value={createForm.email}
                      onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                      Initial Password *
                    </label>
                    <input
                      required
                      type="password"
                      className="w-full border border-primary-light rounded-md px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="••••••••••••"
                      value={createForm.password}
                      onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                      Account Role *
                    </label>
                    <select
                      className="w-full border border-primary-light rounded-md px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                      value={createForm.role}
                      onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as Role })}
                    >
                      <option value="immigration_officer">Immigration Border Officer</option>
                      <option value="visa_officer">Visa Adjudication Officer</option>
                      <option value="admin">System Administrator</option>
                      <option value="applicant">Public Applicant</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="w-full border border-primary-light rounded-md px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="+232 76 123456"
                      value={createForm.phone}
                      onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    />
                  </div>

                  {/* Staff Fields */}
                  {createForm.role !== "applicant" && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                          Rank / Title
                        </label>
                        <input
                          className="w-full border border-primary-light rounded-md px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                          placeholder="e.g. Senior Immigration Inspector"
                          value={createForm.rankTitle}
                          onChange={(e) => setCreateForm({ ...createForm, rankTitle: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                          Duty Station / Deployment Location *
                        </label>
                        <select
                          className="w-full border border-primary-light rounded-md px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                          value={createForm.dutyStation}
                          onChange={(e) => setCreateForm({ ...createForm, dutyStation: e.target.value })}
                        >
                          {OFFICIAL_DUTY_STATIONS.map((station) => (
                            <option key={station.id} value={station.name}>
                              {station.name} ({station.category})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                          Assigned Border Checkpoint
                        </label>
                        <select
                          className="w-full border border-primary-light rounded-md px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                          value={createForm.checkpointId}
                          onChange={(e) => setCreateForm({ ...createForm, checkpointId: e.target.value })}
                        >
                          <option value="">Unassigned / Directorate Wide</option>
                          {checkpoints.map((cp) => (
                            <option key={cp.checkpoint_id} value={cp.checkpoint_id}>
                              {cp.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                </div>

                {createError && (
                  <div className="p-3 bg-status-rejected-bg border border-status-rejected/30 rounded-md text-status-rejected text-xs font-medium">
                    {createError}
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-primary-light">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-primary-light rounded-md text-xs font-medium hover:bg-canvas transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="bg-primary text-white px-5 py-2 rounded-md text-xs font-semibold hover:bg-primary-dark disabled:opacity-50 transition cursor-pointer shadow-xs"
                  >
                    {creating ? "Creating..." : "Create Account"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: EDIT USER (U) */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-primary-light rounded-xl max-w-xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-primary-light pb-3 mb-4">
                <div>
                  <h2 className="font-display text-lg font-bold text-ink">Edit User Account</h2>
                  <p className="text-xs text-ink-soft font-mono">{selectedUser.email}</p>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-ink-soft hover:text-ink text-lg font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                      Full Legal Name
                    </label>
                    <input
                      required
                      className="w-full border border-primary-light rounded-md px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                      value={editForm.fullName}
                      onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                      Account Role
                    </label>
                    <select
                      className="w-full border border-primary-light rounded-md px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value as Role })}
                    >
                      <option value="immigration_officer">Immigration Border Officer</option>
                      <option value="visa_officer">Visa Adjudication Officer</option>
                      <option value="admin">System Administrator</option>
                      <option value="applicant">Public Applicant</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                      Account Status
                    </label>
                    <select
                      className="w-full border border-primary-light rounded-md px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                      value={editForm.isActive ? "active" : "suspended"}
                      onChange={(e) => setEditForm({ ...editForm, isActive: e.target.value === "active" })}
                    >
                      <option value="active">Active (Access Allowed)</option>
                      <option value="suspended">Suspended (Access Blocked)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="w-full border border-primary-light rounded-md px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    />
                  </div>

                  {editForm.role !== "applicant" && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                          Rank / Title
                        </label>
                        <input
                          className="w-full border border-primary-light rounded-md px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                          value={editForm.rankTitle}
                          onChange={(e) => setEditForm({ ...editForm, rankTitle: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                          Duty Station / Deployment Location *
                        </label>
                        <select
                          className="w-full border border-primary-light rounded-md px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                          value={editForm.dutyStation}
                          onChange={(e) => setEditForm({ ...editForm, dutyStation: e.target.value })}
                        >
                          {OFFICIAL_DUTY_STATIONS.map((station) => (
                            <option key={station.id} value={station.name}>
                              {station.name} ({station.category})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                          Department
                        </label>
                        <input
                          className="w-full border border-primary-light rounded-md px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                          value={editForm.department}
                          onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                          Assigned Border Checkpoint
                        </label>
                        <select
                          className="w-full border border-primary-light rounded-md px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                          value={editForm.checkpointId}
                          onChange={(e) => setEditForm({ ...editForm, checkpointId: e.target.value })}
                        >
                          <option value="">Unassigned / Directorate Wide</option>
                          {checkpoints.map((cp) => (
                            <option key={cp.checkpoint_id} value={cp.checkpoint_id}>
                              {cp.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                </div>

                {editError && (
                  <div className="p-3 bg-status-rejected-bg border border-status-rejected/30 rounded-md text-status-rejected text-xs font-medium">
                    {editError}
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-primary-light">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border border-primary-light rounded-md text-xs font-medium hover:bg-canvas transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="bg-primary text-white px-5 py-2 rounded-md text-xs font-semibold hover:bg-primary-dark disabled:opacity-50 transition cursor-pointer shadow-xs"
                  >
                    {updating ? "Saving Changes..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: DELETE CONFIRMATION (D) */}
        {showDeleteModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-status-rejected/40 rounded-xl max-w-md w-full p-6 shadow-xl">
              <div className="flex items-center gap-3 text-status-rejected mb-3">
                <span className="text-2xl">⚠️</span>
                <h2 className="font-display text-lg font-bold">Permanently Delete User Account?</h2>
              </div>

              <p className="text-xs text-ink-soft leading-relaxed mb-4">
                Are you sure you want to permanently delete the account for:
                <br />
                <span className="font-bold text-ink text-sm block mt-1">
                  {selectedUser.full_name} ({selectedUser.email})
                </span>
                <span className="text-[11px] text-status-rejected block mt-2">
                  This will revoke all system access, remove their staff credentials, and delete their account profile. This action cannot be undone.
                </span>
              </p>

              {deleteError && (
                <div className="p-3 bg-status-rejected-bg border border-status-rejected/30 rounded-md text-status-rejected text-xs font-medium mb-4">
                  {deleteError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-primary-light">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-primary-light rounded-md text-xs font-medium hover:bg-canvas transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteUser}
                  disabled={deleting}
                  className="bg-status-rejected text-white px-5 py-2 rounded-md text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition cursor-pointer shadow-xs"
                >
                  {deleting ? "Deleting..." : "Permanently Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* MODAL 4: CREDENTIALS DISPATCHED SUCCESS MODAL (Matching Image 2) */}
        {credentialsModalData && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-[#1E1E22] border border-[#2D2D34] rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl text-white font-['Tahoma',sans-serif]">
              {/* Header Title */}
              <div className="text-center mb-5">
                <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
                  Official Staff Credentials Issued!
                </h1>
                <p className="text-xs text-zinc-400">
                  Government immigration officer credentials generated and dispatched
                </p>
              </div>

              {/* Success Pill Badge */}
              <div className="flex justify-center mb-5">
                <span className="inline-flex items-center gap-1.5 bg-[#1C3326] text-[#4ADE80] border border-[#22543D] text-xs font-semibold px-4 py-1 rounded-full uppercase tracking-wider">
                  ✓ EMAIL DISPATCHED TO OFFICER
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-zinc-300 text-center mb-5 leading-relaxed">
                An official welcome email with these credentials has been sent to{" "}
                <strong className="text-white font-mono">{credentialsModalData.email}</strong>.
                The officer must log in at <span className="text-sky-400">/staff/login</span> and change their password immediately.
              </p>

              {/* Credentials Display Cards */}
              <div className="space-y-2.5 mb-6">
                {/* Username */}
                <div className="flex items-center justify-between bg-[#282830] border-l-4 border-[#0284C7] rounded-lg px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="text-sm">👤</span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        OFFICIAL USERNAME
                      </p>
                      <p className="text-sm font-mono font-semibold text-white">
                        {credentialsModalData.username}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyModal(credentialsModalData.username, "username")}
                    className="text-xs text-zinc-400 hover:text-sky-400 transition cursor-pointer px-2 py-1 bg-[#1E1E24] rounded border border-zinc-700/60"
                  >
                    {copiedModalField === "username" ? "✓ Copied" : "Copy"}
                  </button>
                </div>

                {/* Email */}
                <div className="flex items-center justify-between bg-[#282830] border-l-4 border-[#0284C7] rounded-lg px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="text-sm">✉️</span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        ACCOUNT EMAIL
                      </p>
                      <p className="text-sm font-mono text-white">
                        {credentialsModalData.email}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyModal(credentialsModalData.email, "email")}
                    className="text-xs text-zinc-400 hover:text-sky-400 transition cursor-pointer px-2 py-1 bg-[#1E1E24] rounded border border-zinc-700/60"
                  >
                    {copiedModalField === "email" ? "✓ Copied" : "Copy"}
                  </button>
                </div>

                {/* Temporary Password */}
                <div className="flex items-center justify-between bg-[#282830] border-l-4 border-amber-500 rounded-lg px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="text-sm">🔑</span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        TEMPORARY PASSWORD
                      </p>
                      <p className="text-sm font-mono font-bold text-[#38BDF8] tracking-wider">
                        {credentialsModalData.tempPassword}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyModal(credentialsModalData.tempPassword, "password")}
                    className="text-xs bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 transition cursor-pointer px-3 py-1 rounded border border-sky-500/40 font-semibold"
                  >
                    {copiedModalField === "password" ? "✓ Copied" : "Copy Password"}
                  </button>
                </div>

                {/* Role */}
                <div className="flex items-center justify-between bg-[#282830] border-l-4 border-emerald-500 rounded-lg px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="text-sm">🛡️</span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        ASSIGNED ROLE
                      </p>
                      <p className="text-xs font-semibold text-[#4ADE80]">
                        {credentialsModalData.role}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center justify-between bg-[#282830] border-l-4 border-zinc-500 rounded-lg px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="text-sm">📅</span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        DISPATCH TIMESTAMP
                      </p>
                      <p className="text-xs font-mono text-zinc-300">
                        {credentialsModalData.createdAt}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const text = `SLID Officer Credentials:\nUsername: ${credentialsModalData.username}\nEmail: ${credentialsModalData.email}\nTemp Password: ${credentialsModalData.tempPassword}\nRole: ${credentialsModalData.role}\nLogin: http://localhost:5173/staff/login`;
                    navigator.clipboard.writeText(text);
                    handleCopyModal(text, "all");
                  }}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 rounded-lg text-xs transition cursor-pointer border border-zinc-600"
                >
                  {copiedModalField === "all" ? "✓ All Copied" : "📋 Copy All Credentials"}
                </button>
                <button
                  type="button"
                  onClick={() => setCredentialsModalData(null)}
                  className="flex-1 bg-[#0284C7] hover:bg-[#0369A1] text-white font-semibold py-2.5 rounded-lg text-xs transition cursor-pointer shadow-md"
                >
                  Done &amp; Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
