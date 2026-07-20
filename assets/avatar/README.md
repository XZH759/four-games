# 人物资源目录

正式透明立绘画布统一 **1600×2400**，中心对齐，脚底锚点约 `y=2240`，勿自动紧裁。

```text
assets/avatar/
  effects/soft-highlights.webp
  female|male/
    base/<bodyType>/body-<skin>.webp
    base/<bodyType>/legs-<skin>.webp
    base/face-<face>-<skin>.webp
    hair/<style>/<color>-back.webp
    hair/<style>/<color>-front.webp
    outfits/<outfitId>/<bodyType>-main.webp
    outfits/<outfitId>/<bodyType>-shoes.webp
    faces/eyes/<eye>.webp
    accessories/<id>/head.webp
```

路径由 `js/nuannuan/avatar-manifest.js` 解析。生成脚本：`node scripts/generate-create-assets.mjs`。
校验：`node 奇迹暖暖素材/design-kit/scripts/validate-avatar-assets.mjs assets/avatar`。

UI 九宫格：`assets/ui/nine-slice/`，路径唯一来源 `js/nuannuan/ui-manifest.js`。
