export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '2.0.0',
    appwrite: !!process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
  });
}
