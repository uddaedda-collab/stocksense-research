/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_PAGES === 'true';
// When deploying to GitHub Pages under https://<user>.github.io/<repo>/,
// set NEXT_PUBLIC_BASE_PATH="/<repo>" in the build environment.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig = {
  output: 'export', // static export for GitHub Pages hosting
  trailingSlash: true,
  images: {
    unoptimized: true, // GitHub Pages has no image optimization server
  },
  basePath: isGithubPages ? basePath : '',
  assetPrefix: isGithubPages ? basePath : '',
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  reactStrictMode: true,
};

module.exports = nextConfig;
