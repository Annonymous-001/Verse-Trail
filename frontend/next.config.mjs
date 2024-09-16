/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "imgs.search.brave.com",
          pathname: "/**", // Allow all images from this domain
        },
      ],
    },
  };
  
  export default nextConfig;
  