import withFlowbiteReact from "flowbite-react/plugin/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  experimental: {
    serverActions: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'files.catbox.moe',
        port: '',
        pathname: '/**', // This allows any path on the hostname
      },
      {
        protocol: 'https',
        hostname: 'imgv2-1-f.scribdassets.com',
        port: '',
        pathname: '/**', // This allows any path on the hostname
      },
      {
        protocol: 'https',
        hostname: 'makkahnewspaper.com',
        port: '',
        pathname: '/**', // This allows any path on the hostname
      },
      // Add other remote image hostnames here if you have them
    ],
  },
  
};

export default withFlowbiteReact(nextConfig);