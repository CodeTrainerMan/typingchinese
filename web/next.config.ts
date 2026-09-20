import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next 16 默认只放行 localhost，用 127.0.0.1 / 局域网 IP 打开时 /_next/hmr 会被拦，
  // 客户端 bootstrap 拿不到 dev 资源就永不 hydrate，页面会一直停在服务端渲染的 Loading。
  allowedDevOrigins: ["localhost", "127.0.0.1", "[::1]", "169.254.*"],
};

export default nextConfig;
