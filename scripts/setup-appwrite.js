#!/usr/bin/env node
/**
 * Appwrite Setup Script — creates database + all collections automatically
 * Usage: node scripts/setup-appwrite.js
 * Requires: APPWRITE_API_KEY in .env.local (server-side key, not public)
 */

require('dotenv').config({ path: '.env.local' });
const { Client, Databases, ID } = require('appwrite');

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

// For setup, you need the server SDK with API key
// npm install node-appwrite  — then use that for this script
// This script is a template — adapt to node-appwrite SDK

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'ceylonupdates_db';

const COLLECTIONS = {
  articles: {
    id: process.env.NEXT_PUBLIC_APPWRITE_ARTICLES_COLLECTION_ID || 'articles',
    name: 'Articles',
    attributes: [
      { key: 'title',            type: 'string',  size: 300,    required: true },
      { key: 'slug',             type: 'string',  size: 200,    required: true },
      { key: 'content',          type: 'string',  size: 500000, required: true },
      { key: 'excerpt',          type: 'string',  size: 500,    required: false },
      { key: 'category',         type: 'string',  size: 50,     required: true },
      { key: 'author',           type: 'string',  size: 100,    required: true },
      { key: 'featuredImage',    type: 'string',  size: 500,    required: false },
      { key: 'status',           type: 'string',  size: 20,     required: true },
      { key: 'views',            type: 'integer', required: false, default: 0 },
      { key: 'metaTitle',        type: 'string',  size: 70,     required: false },
      { key: 'metaDescription',  type: 'string',  size: 160,    required: false },
      { key: 'focusKeyword',     type: 'string',  size: 100,    required: false },
      { key: 'tags',             type: 'string',  size: 50,     required: false, array: true },
      { key: 'publishedAt',      type: 'datetime', required: false },
      { key: 'updatedAt',        type: 'datetime', required: false },
      { key: 'isFeatured',       type: 'boolean', required: false, default: false },
      { key: 'allowComments',    type: 'boolean', required: false, default: true },
      { key: 'language',         type: 'string',  size: 5,      required: false, default: 'en' },
    ],
    indexes: [
      { key: 'slug_unique',   type: 'unique', attributes: ['slug'] },
      { key: 'status_idx',    type: 'key',    attributes: ['status'] },
      { key: 'category_idx',  type: 'key',    attributes: ['category'] },
      { key: 'views_idx',     type: 'key',    attributes: ['views'] },
      { key: 'title_ft',      type: 'fulltext', attributes: ['title'] },
      { key: 'tags_ft',       type: 'fulltext', attributes: ['tags'] },
    ],
  },
  subscribers: {
    id: process.env.NEXT_PUBLIC_APPWRITE_SUBSCRIBERS_COLLECTION_ID || 'subscribers',
    name: 'Subscribers',
    attributes: [
      { key: 'email',        type: 'string',  size: 254, required: true },
      { key: 'name',         type: 'string',  size: 100, required: false },
      { key: 'subscribedAt', type: 'string',  size: 30,  required: false },
      { key: 'active',       type: 'boolean', required: false, default: true },
      { key: 'source',       type: 'string',  size: 200, required: false },
    ],
    indexes: [
      { key: 'email_unique', type: 'unique', attributes: ['email'] },
    ],
  },
  comments: {
    id: process.env.NEXT_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID || 'comments',
    name: 'Comments',
    attributes: [
      { key: 'articleId',  type: 'string',  size: 36,   required: true },
      { key: 'name',       type: 'string',  size: 100,  required: true },
      { key: 'email',      type: 'string',  size: 254,  required: true },
      { key: 'content',    type: 'string',  size: 1000, required: true },
      { key: 'website',    type: 'string',  size: 200,  required: false },
      { key: 'approved',   type: 'boolean', required: false, default: false },
      { key: 'createdAt',  type: 'string',  size: 30,   required: false },
    ],
    indexes: [
      { key: 'article_idx',  type: 'key', attributes: ['articleId'] },
      { key: 'approved_idx', type: 'key', attributes: ['approved'] },
    ],
  },
};

console.log('[Schema] Appwrite Collection Schema\n');
console.log('Copy this information into your Appwrite Console:\n');
console.log('=' .repeat(60));

Object.entries(COLLECTIONS).forEach(([name, col]) => {
  console.log(`\n[Collection] ${col.name} (ID: ${col.id})`);
  console.log('   Attributes:');
  col.attributes.forEach((attr) => {
    console.log(`     - ${attr.key}: ${attr.type}${attr.required ? ' (required)' : ' (optional)'}${attr.default !== undefined ? ` [default: ${attr.default}]` : ''}`);
  });
  console.log('   Indexes:');
  col.indexes.forEach((idx) => {
    console.log(`     - ${idx.key}: ${idx.type} on [${idx.attributes.join(', ')}]`);
  });
});

console.log('\n' + '='.repeat(60));
console.log('\n[Done] Use the SETUP.md guide to create these in your Appwrite console.');
console.log('   Or use the Appwrite CLI: https://appwrite.io/docs/tooling/command-line\n');
