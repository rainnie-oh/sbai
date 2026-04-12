# AI-PTI 人格形象图命名规则

## 文件夹位置
`client/public/illustrations/`

## 命名格式
`{人格代号小写}.png`

## 完整文件列表（16 个）

| 文件名 | 人格名称 | 阵营 |
|---|---|---|
| `poor.png` | 极致白嫖党 | 算力资本家 |
| `rich.png` | 企业吸血鬼 | 算力资本家 |
| `lazy.png` | 复制粘贴侠 | 算力资本家 |
| `solo.png` | 一人公司CEO | 算力资本家 |
| `puaa.png` | PUA大师 | AI调教师 |
| `spec.png` | 人形AI | AI调教师 |
| `luck.png` | 抽卡大师 | AI调教师 |
| `anti.png` | 职业杠精 | AI调教师 |
| `pleas.png` | 礼貌过头侠 | 情感共生体 |
| `love.png` | 心碎小狗 | 情感共生体 |
| `ming.png` | 命理大师 | 情感共生体 |
| `baby.png` | 电子妈宝 | 情感共生体 |
| `prompt.png` | 提示词诗人 | 赛博造物主 |
| `muse.png` | 意识流艺术家 | 赛博造物主 |
| `meme.png` | 乐子人 | 赛博造物主 |
| `dist.png` | 蒸馏大师 | 赛博造物主 |

## 图片要求
- 格式：PNG（透明背景优先）
- 建议尺寸：至少 400×500px（2x 显示）
- 代码中会通过 `personality.type.toLowerCase()` 来映射文件名

## 代码映射方式
当图片上传后，PersonaAvatar 组件会自动切换为 `<img>` 渲染：
```
/illustrations/{type}.png
→ /illustrations/poor.png
→ /illustrations/rich.png
→ ...
```
