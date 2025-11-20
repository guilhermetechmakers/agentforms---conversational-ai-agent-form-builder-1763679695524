import { supabase } from "@/lib/supabase";
import type {
  LandingPageTracking,
  LandingPageTrackingInsert,
  LandingPageTrackingUpdate,
  LandingPageContent,
} from "@/types/database/landing-page";

// Type assertion helper for Supabase queries
type SupabaseTracking = LandingPageTracking;

/**
 * Track a landing page event
 */
export async function trackLandingPageEvent(
  data: LandingPageTrackingInsert
): Promise<LandingPageTracking | null> {
  try {
    // Check if session already exists
    const { data: existing } = await supabase
      .from("landing_page_tracking")
      .select("*")
      .eq("session_id", data.session_id)
      .single();

    if (existing) {
      // Update existing session
      const updateData: LandingPageTrackingUpdate = {
        page_views: ((existing as SupabaseTracking).page_views || 0) + 1,
        last_visit_at: new Date().toISOString(),
        ...data,
      };

      const { data: updated, error } = await supabase
        .from("landing_page_tracking")
        .update(updateData as unknown as never)
        .eq("session_id", data.session_id)
        .select()
        .single();

      if (error) throw error;
      return (updated as unknown as LandingPageTracking) || null;
    } else {
      // Create new session
      const { data: created, error } = await supabase
        .from("landing_page_tracking")
        .insert(data as unknown as never)
        .select()
        .single();

      if (error) throw error;
      return (created as unknown as LandingPageTracking) || null;
    }
  } catch (error) {
    console.error("Error tracking landing page event:", error);
    return null;
  }
}

/**
 * Track CTA click
 */
export async function trackCTAClick(
  sessionId: string,
  ctaId: string,
  section: string
): Promise<void> {
  try {
    const { data: existing } = await supabase
      .from("landing_page_tracking")
      .select("cta_clicks")
      .eq("session_id", sessionId)
      .single();

    const existingClicks = ((existing as unknown as SupabaseTracking)?.cta_clicks as Array<any>) || [];
    const newClick = {
      cta_id: ctaId,
      clicked_at: new Date().toISOString(),
      section,
    };

    await supabase
      .from("landing_page_tracking")
      .update({
        cta_clicks: [...existingClicks, newClick],
      } as unknown as never)
      .eq("session_id", sessionId);
  } catch (error) {
    console.error("Error tracking CTA click:", error);
  }
}

/**
 * Track conversion status
 */
export async function trackConversion(
  sessionId: string,
  status: LandingPageTracking["conversion_status"]
): Promise<void> {
  try {
    await supabase
      .from("landing_page_tracking")
      .update({
        conversion_status: status,
        converted_at: status === "converted" ? new Date().toISOString() : null,
      } as unknown as never)
      .eq("session_id", sessionId);
  } catch (error) {
    console.error("Error tracking conversion:", error);
  }
}

/**
 * Get landing page content
 */
export async function getLandingPageContent(): Promise<
  Record<string, LandingPageContent>
> {
  try {
    const { data, error } = await supabase
      .from("landing_page_content")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) throw error;

    // Convert array to object keyed by section_key
    const contentMap: Record<string, LandingPageContent> = {};
    data?.forEach((item: any) => {
      contentMap[item.section_key] = item as LandingPageContent;
    });

    return contentMap;
  } catch (error) {
    console.error("Error fetching landing page content:", error);
    return {};
  }
}
