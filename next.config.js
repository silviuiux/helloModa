/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Wardrobe photos and product images live in Supabase Storage + affiliate
    // catalog CDNs — allow-list gets extended as real sources are wired up (Phase 1+).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
