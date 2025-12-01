import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/app/actions/auth/get-user-info";
import { getTranslations } from "next-intl/server";
import { LucyChatInterface } from "@/features/lucy/components/lucy-chat-interface";

/**
 * Lucy Page - The Creative Companion
 * 
 * This is Lucy's home - an AI-powered creative studio for non-technical users.
 * Lucy helps create personalized songs, videos, and audio content.
 */

// DEV MODE: Set to true to bypass authentication
const DEV_MODE = process.env.LUCY_DEV_MODE === 'true' || process.env.NODE_ENV === 'development';

export async function generateMetadata() {
  const t = await getTranslations("LucyPage");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function LucyPage() {
  // DEV MODE BYPASS
  if (DEV_MODE) {
    return (
      <LucyChatInterface 
        userId="dev-user-001" 
        userCredits={9999}
      />
    );
  }

  // Production: Check authentication
  const user = await getCurrentUserProfile();
  
  if (!user?.id) {
    redirect("/login");
  }

  // TODO: Get user credits from Unibee integration
  const userCredits = 100;

  return (
    <LucyChatInterface 
      userId={user.id} 
      userCredits={userCredits}
    />
  );
}
