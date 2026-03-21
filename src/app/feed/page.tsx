import { VideoFeed } from "@/components/video-feed";
import { NavBar } from "@/components/nav-bar";
import { AuthProvider } from "@/components/session-provider";

export default function FeedPage() {
  return (
    <AuthProvider>
      <div className="feed-shell">
        <div className="feed-phone flex flex-col">
          <div className="flex-1 min-h-0">
            <VideoFeed />
          </div>
          <NavBar />
        </div>
      </div>
    </AuthProvider>
  );
}
