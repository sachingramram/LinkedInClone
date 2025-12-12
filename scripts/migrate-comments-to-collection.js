// scripts/migrate-comments-to-collection.js
const mongoose = require('mongoose');
const Post = require('../models/Post').default;
const Comment = require('../models/Comment').default;

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not set');

  await mongoose.connect(uri);
  console.log('connected');

  const posts = await Post.find({});
  let total = 0;
  for (const post of posts) {
    const nestedComments = post.comments || [];
    if (!nestedComments.length) continue;
    const newIds = [];
    for (const nc of nestedComments) {
      const c = await Comment.create({
        postId: String(post._id),
        authorId: nc.authorId,
        authorName: nc.authorName ?? null,
        content: nc.content,
        createdAt: nc.createdAt ?? new Date(),
        replies: nc.replies ?? [],
      });
      newIds.push(String(c._id));
      total++;
    }
    post.comments = newIds;
    await post.save();
    console.log('Updated', post._id.toString(), '->', newIds.length);
  }
  console.log('Done. Posts updated:', total);
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
