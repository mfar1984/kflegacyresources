import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Externalize packages that should not be bundled
  serverExternalPackages: ['pdf-lib', 'mysql2'],
  
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Mark these packages as external (don't bundle them)
      // They will be loaded from node_modules at runtime
      config.externals = config.externals || [];
      
      // Ensure pdf-lib and mysql2 are properly externalized
      if (Array.isArray(config.externals)) {
        config.externals.push('pdf-lib');
        config.externals.push('mysql2');
      }
    }
    
    return config;
  },
};

export default nextConfig;
