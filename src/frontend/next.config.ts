import type { NextConfig } from "next";

// 本番は Cloudflare Workers Assets で静的書き出し（out/）を配信し、/api/* は同じ Worker が処理する（同一オリジン）。
const nextConfig: NextConfig = {
  output: 'export',
};

// next dev のときだけ、/api/* をローカルの wrangler dev（既定 http://127.0.0.1:8787）へ転送する。
// 静的書き出しには rewrites を含めない（output: 'export' では使えないため）。
if (process.env.NODE_ENV === 'development') {
  const apiOrigin = process.env.API_ORIGIN ?? 'http://127.0.0.1:8787';
  nextConfig.rewrites = async () => ({
    beforeFiles: [
      {
        source: '/api/:path*',
        destination: `${apiOrigin}/api/:path*`,
      },
    ],
    afterFiles: [],
    fallback: [],
  });
}

export default nextConfig;
