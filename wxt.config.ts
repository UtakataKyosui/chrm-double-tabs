import { defineConfig } from 'wxt';

export default defineConfig({
  outDir: 'dist',
  manifest: {
    name: 'Split Tabs',
    description: '選んだ2つのタブを同じ画面に左右分割で表示する',
    permissions: ['tabs', 'declarativeNetRequest'],
    host_permissions: ['<all_urls>'],
  },
});
