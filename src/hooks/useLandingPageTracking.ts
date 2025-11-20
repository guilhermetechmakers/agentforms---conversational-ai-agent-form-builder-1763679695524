import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { generateSessionId } from "@/lib/supabase";
import {
  trackLandingPageEvent,
  trackCTAClick,
  trackConversion,
  getLandingPageContent,
} from "@/api/landing-page";
import type { LandingPageTrackingInsert } from "@/types/database/landing-page";

/**
 * Hook for tracking landing page interactions
 */
export function useLandingPageTracking() {
  const sessionIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const scrollDepthRef = useRef<number>(0);

  useEffect(() => {
    // Initialize session
    sessionIdRef.current = generateSessionId();

    // Track initial page view
    const trackInitialView = async () => {
      if (!sessionIdRef.current) return;

      const trackingData: LandingPageTrackingInsert = {
        session_id: sessionIdRef.current,
        referral_source: document.referrer || "direct",
        user_agent: navigator.userAgent,
        page_views: 1,
        first_visit_at: new Date().toISOString(),
        last_visit_at: new Date().toISOString(),
      };

      // Extract UTM parameters
      const urlParams = new URLSearchParams(window.location.search);
      trackingData.utm_source = urlParams.get("utm_source") || null;
      trackingData.utm_medium = urlParams.get("utm_medium") || null;
      trackingData.utm_campaign = urlParams.get("utm_campaign") || null;

      await trackLandingPageEvent(trackingData);
    };

    trackInitialView();

    // Track scroll depth
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollPercent = Math.round(
        ((scrollTop + windowHeight) / documentHeight) * 100
      );

      if (scrollPercent > scrollDepthRef.current) {
        scrollDepthRef.current = scrollPercent;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Track time on page before unload
    const handleBeforeUnload = () => {
      if (sessionIdRef.current) {
        const timeOnPage = Math.round((Date.now() - startTimeRef.current) / 1000);
        trackLandingPageEvent({
          session_id: sessionIdRef.current,
          time_on_page: timeOnPage,
          scroll_depth: scrollDepthRef.current,
        });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      handleBeforeUnload(); // Track on cleanup too
    };
  }, []);

  const trackCTA = async (ctaId: string, section: string) => {
    if (!sessionIdRef.current) return;
    await trackCTAClick(sessionIdRef.current, ctaId, section);
  };

  const trackConversionStatus = async (
    status: "signup_clicked" | "demo_started" | "converted"
  ) => {
    if (!sessionIdRef.current) return;
    await trackConversion(sessionIdRef.current, status);
  };

  return {
    sessionId: sessionIdRef.current,
    trackCTA,
    trackConversionStatus,
  };
}

/**
 * Hook for fetching landing page content
 */
export function useLandingPageContent() {
  return useQuery({
    queryKey: ["landing-page-content"],
    queryFn: getLandingPageContent,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
