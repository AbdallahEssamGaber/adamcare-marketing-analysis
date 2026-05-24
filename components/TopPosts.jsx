import { formatNumber } from "@/lib/formatting";

export default function TopPosts({ posts }) {
  return (
    <div className="top-posts">
      <div className="section-title">Top 5 Posts by Views</div>
      {posts.map((post) => (
        <div className="post-row" key={`${post.platform}-${post.post_id}`}>
          <span className={`platform-pill ${post.platform}`}>
            {post.platform === "tiktok" ? "TikTok" : "Instagram"}
          </span>
          <span className="post-caption">{post.caption}</span>
          <span className="post-views">{formatNumber(post.views)}</span>
          <a
            className="post-link"
            href={post.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            View
          </a>
        </div>
      ))}
    </div>
  );
}
