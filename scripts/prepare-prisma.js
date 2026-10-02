const fs = require('fs');
const path = require('path');

// 1. Resolve DATABASE_URL from process.env or .env file
let dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/^\s*DATABASE_URL\s*=\s*["']?([^"'\r\n]+)["']?/m);
    if (match) {
      dbUrl = match[1];
    }
  }
}

// 2. Determine target provider from DATABASE_URL
let targetProvider = 'sqlite';
if (dbUrl) {
  const trimmed = dbUrl.trim();
  if (trimmed.startsWith('postgres://') || trimmed.startsWith('postgresql://')) {
    targetProvider = 'postgresql';
  } else if (trimmed.startsWith('mysql://')) {
    targetProvider = 'mysql';
  } else if (trimmed.startsWith('file:') || trimmed.includes('.db')) {
    targetProvider = 'sqlite';
  }
}

// 3. Update prisma/schema.prisma if needed
const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
if (fs.existsSync(schemaPath)) {
  const schema = fs.readFileSync(schemaPath, 'utf8');

  // Match provider = "..." inside datasource db block
  const updatedSchema = schema.replace(
    /(datasource\s+db\s*\{[\s\S]*?provider\s*=\s*)"(\w+)"/,
    (fullMatch, prefix, currentProvider) => {
      if (currentProvider !== targetProvider) {
        console.log(
          `[prepare-prisma] Auto-switching datasource provider: "${currentProvider}" -> "${targetProvider}"`
        );
      }
      return `${prefix}"${targetProvider}"`;
    }
  );

  if (updatedSchema !== schema) {
    fs.writeFileSync(schemaPath, updatedSchema, 'utf8');
    console.log(`[prepare-prisma] Updated prisma/schema.prisma to use provider = "${targetProvider}".`);
  } else {
    console.log(`[prepare-prisma] Prisma schema datasource already matches provider = "${targetProvider}".`);
  }
}
