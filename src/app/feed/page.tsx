import { VideoFeed } from "@/components/video-feed";
import { NavBar } from "@/components/nav-bar";
import { AuthProvider } from "@/components/session-provider";

export default function FeedPage() {
  return (
    <AuthProvider>
      {/* Portrait centering: on desktop shows phone-sized feed */}
      <div className="flex h-[100dvh] justify-center bg-zinc-950">
        <div className="relative h-full w-full max-w-[430px]">
          <VideoFeed />
          <NavBar />
        </div>
      </div>
    </AuthProvider>
  );
}
