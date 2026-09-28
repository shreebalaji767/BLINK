/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: "/BLINK",
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
