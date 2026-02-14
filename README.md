# qiuyuan-blog

Content instance repo for `QiuYuan Blog`, based on `blog-template`.

## Site config

Edit `site.config.ts`:

```ts
const siteConfig = {
  domain: 'https://qiuyuan.kkuk.dev',
  title: 'QiuYuan Blog',
  description: 'QiuYuan notes, essays, and daily writing.',
}
```

## Content

- `blog/home/*.md`: post content
- `blog/daily/*.md`: daily notes
- `blog/about.md`: about page

This repo includes one seeded daily entry at `blog/daily/2026-02-14.md`.

## Development

```bash
npm install
npm run dev
npm run lint
npm run build
```

## Template sync workflow (git subtree)

1. Add template remote once:

```bash
git remote add template git@github.com:Feng6611/blog-template.git
```

2. Sync latest template changes:

```bash
./scripts/template-sync.sh
```

Equivalent manual command:

```bash
git fetch template main
git subtree pull --prefix=. template main
```

3. Resolve conflicts (if any), then verify:

```bash
npm run lint
npm run build
```
