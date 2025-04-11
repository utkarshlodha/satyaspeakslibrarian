/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['img.youtube.com', 'i.ytimg.com'],
  },
  experimental: {
    serverActions: {}, // <- Must be an object, not true/false
  },
  async rewrites() {
    return [
      {
        source: "/sign-in",
        destination: "https://smashing-gannet-60.clerk.accounts.dev/sign-in",
      },
      {
        source: "/sign-up",
        destination: "https://smashing-gannet-60.clerk.accounts.dev/sign-up",
      },
    ];
  },
};

module.exports = nextConfig;
