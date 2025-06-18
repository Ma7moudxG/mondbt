import withFlowbiteReact from "flowbite-react/plugin/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
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
      {
        protocol: 'https',
        hostname: 'almanahj.com',
        port: '',
        pathname: '/**', // This allows any path on the hostname
      },
      {
        protocol: 'https',
        hostname: 'igedrwglaksviasmylvv.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**', // This covers your public bucket path
      },
    ],
  },
  
};

export default withFlowbiteReact(nextConfig);