---
title: 公告
description: 知芽 EduSprout 最新公告与更新通知。
outline: false
---

<script setup>
import { withBase } from 'vitepress'
import { data as notices } from './index.data'
</script>

# 公告

查看最新公告与更新通知。

<ul v-if="notices.length" class="notice-list">
  <li v-for="notice in notices" :key="notice.url" class="notice-item">
    <div class="notice-meta">
      <span v-if="notice.pinned" class="notice-pinned">置顶</span>
      <span class="notice-level" :class="`notice-level-${notice.level}`">{{ notice.levelLabel }}</span>
      <time v-if="notice.date" :datetime="notice.date">{{ notice.date }}</time>
    </div>
    <a :href="withBase(notice.url)">{{ notice.title }}</a>
  </li>
</ul>
<p v-else>暂无公告。</p>

<style scoped>
.notice-list {
  padding: 0;
  list-style: none;
}
.notice-item {
  padding: 16px 0;
  border-bottom: 1px solid var(--vp-c-divider);
}
.notice-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 6px;
  color: var(--vp-c-text-2);
  font-size: 13px;
}
.notice-level,
.notice-pinned {
  padding: 1px 8px;
  border-radius: 4px;
}
.notice-level-info,
.notice-pinned {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}
.notice-level-warning {
  color: var(--vp-c-warning-1);
  background: var(--vp-c-warning-soft);
}
.notice-level-danger {
  color: var(--vp-c-danger-1);
  background: var(--vp-c-danger-soft);
}
</style>
