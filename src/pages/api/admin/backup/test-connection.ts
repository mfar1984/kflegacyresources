import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { location, config } = req.body;

    if (!location || !config) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required parameters' 
      });
    }

    if (location === 'ftp') {
      // Test FTP connection
      const { host, port, username, password, path } = config;

      if (!host || !username || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Missing FTP credentials. Please fill in host, username, and password.' 
        });
      }

      // Dynamic import for FTP client
      const { Client: FTPClient } = await import('basic-ftp');
      const client = new FTPClient();
      client.ftp.verbose = false;

      try {
        await client.access({
          host,
          port: parseInt(port) || 21,
          user: username,
          password,
          secure: false,
        });

        // Try to access the specified path
        if (path) {
          try {
            await client.cd(path);
          } catch (error) {
            // Path doesn't exist, try to create it
            await client.ensureDir(path);
          }
        }

        client.close();

        return res.status(200).json({ 
          success: true, 
          message: `Successfully connected to FTP server at ${host}:${port}${path ? `\nPath: ${path}` : ''}` 
        });
      } catch (error: any) {
        client.close();
        return res.status(200).json({ 
          success: false, 
          message: `FTP connection failed: ${error.message || 'Unknown error'}` 
        });
      }
    } else if (location === 'r2') {
      // Test Cloudflare R2 connection
      const { account_id, access_key_id, secret_access_key, bucket_name } = config;

      if (!account_id || !access_key_id || !secret_access_key || !bucket_name) {
        return res.status(400).json({ 
          success: false, 
          message: 'Missing R2 credentials. Please fill in all fields.' 
        });
      }

      // Dynamic import for AWS SDK
      const { S3Client, HeadBucketCommand } = await import('@aws-sdk/client-s3');
      
      // Cloudflare R2 endpoint format
      const endpoint = `https://${account_id}.r2.cloudflarestorage.com`;

      const s3Client = new S3Client({
        region: 'auto',
        endpoint,
        credentials: {
          accessKeyId: access_key_id,
          secretAccessKey: secret_access_key,
        },
      });

      try {
        // Test bucket access
        await s3Client.send(new HeadBucketCommand({ Bucket: bucket_name }));

        return res.status(200).json({ 
          success: true, 
          message: `Successfully connected to Cloudflare R2\nBucket: ${bucket_name}` 
        });
      } catch (error: any) {
        return res.status(200).json({ 
          success: false, 
          message: `R2 connection failed: ${error.message || 'Unknown error'}\n\nPlease verify:\n- Account ID is correct\n- Access credentials are valid\n- Bucket name exists\n- API token has R2 permissions` 
        });
      }
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid backup location' 
      });
    }
  } catch (error: any) {
    console.error('Test connection error:', error);
    return res.status(500).json({ 
      success: false, 
      message: `Server error: ${error.message || 'Unknown error'}` 
    });
  }
}
