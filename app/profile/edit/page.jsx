// app/profile/edit/page.jsx
import { createServerSupabase } from "@/lib/supabaseServer";
import { updateProfile } from "./actions";
import EditProfileForm from "@/components/profile/EditProfileForm";

export default async function Page({ searchParams }) {
  const params = await searchParams; // Next 15: await
  const onboarding = params?.onboarding === "1";

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="mx-auto max-w-xl p-6">
        <p>Necesitas iniciar sesión.</p>
      </main>
    );
  }

  const { data: initial } = await supabase
    .from("profiles")
    .select("username, full_name, bio, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <EditProfileForm initial={initial} action={updateProfile} onboarding={onboarding} />
  );
}
