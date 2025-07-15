import fs from "fs";
import path from "path";

const modelName = process.argv[2];
const taskType = process.argv[3];

if (!modelName || !taskType) {
  console.error(
    `❌ Please provide a ${!modelName ? "model name" : "task type"}.`
  );
  process.exit(1);
}

const now = new Date();
const timestamp = now
  .toISOString()
  .replace(/[-:T.Z]/g, "")
  .slice(0, 14);

const fileName = `${modelName}__${taskType}__${timestamp}.ts`;
const filePath = path.join(__dirname, "../migrations", fileName);

const template = `// Migration for model: ${modelName}
// Created at: ${now.toISOString()}

import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db';

async function migrate() {
  await connectDB();

  try {
    // TODO: Add migration logic here

  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await disconnectDB();
  }
}

migrate();
`;

fs.writeFileSync(filePath, template);
console.log(`✅ Migration created: ${filePath}`);
