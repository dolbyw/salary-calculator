import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 生成PWA图标的脚本
 * 创建简单的SVG图标并转换为不同尺寸的PNG
 */

// 创建SVG图标内容
const createSVGIcon = () => {
  return `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- 背景渐变 -->
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8B5CF6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#EC4899;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="icon" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#F8FAFC;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- 背景圆角矩形 -->
  <rect width="512" height="512" rx="80" ry="80" fill="url(#bg)" />
  
  <!-- 薪资计算器图标 -->
  <g transform="translate(128, 128)">
    <!-- 计算器主体 -->
    <rect x="0" y="0" width="256" height="320" rx="24" ry="24" fill="url(#icon)" stroke="#E2E8F0" stroke-width="4" />
    
    <!-- 显示屏 -->
    <rect x="24" y="24" width="208" height="80" rx="12" ry="12" fill="#1E293B" />
    
    <!-- 显示文字 -->
    <text x="128" y="75" text-anchor="middle" fill="#10B981" font-family="monospace" font-size="24" font-weight="bold">¥8888</text>
    
    <!-- 按钮网格 -->
    <g fill="#F1F5F9" stroke="#E2E8F0" stroke-width="2">
      <!-- 第一行 -->
      <rect x="24" y="128" width="48" height="40" rx="8" />
      <rect x="88" y="128" width="48" height="40" rx="8" />
      <rect x="152" y="128" width="48" height="40" rx="8" />
      <rect x="216" y="128" width="16" height="40" rx="8" />
      
      <!-- 第二行 -->
      <rect x="24" y="184" width="48" height="40" rx="8" />
      <rect x="88" y="184" width="48" height="40" rx="8" />
      <rect x="152" y="184" width="48" height="40" rx="8" />
      <rect x="216" y="184" width="16" height="40" rx="8" />
      
      <!-- 第三行 -->
      <rect x="24" y="240" width="48" height="40" rx="8" />
      <rect x="88" y="240" width="48" height="40" rx="8" />
      <rect x="152" y="240" width="48" height="40" rx="8" />
      <rect x="216" y="240" width="16" height="56" rx="8" />
    </g>
    
    <!-- 按钮标签 -->
    <g fill="#64748B" font-family="Arial" font-size="14" text-anchor="middle">
      <text x="48" y="152">7</text>
      <text x="112" y="152">8</text>
      <text x="176" y="152">9</text>
      <text x="48" y="208">4</text>
      <text x="112" y="208">5</text>
      <text x="176" y="208">6</text>
      <text x="48" y="264">1</text>
      <text x="112" y="264">2</text>
      <text x="176" y="264">3</text>
      <text x="224" y="264">=</text>
    </g>
  </g>
</svg>`;
};

// 创建简单的favicon SVG
const createFaviconSVG = () => {
  return `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8B5CF6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#EC4899;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="32" height="32" rx="6" ry="6" fill="url(#bg)" />
  <text x="16" y="22" text-anchor="middle" fill="white" font-family="Arial" font-size="16" font-weight="bold">¥</text>
</svg>`;
};

// 创建Apple Touch图标
const createAppleTouchIcon = () => {
  return `<svg width="180" height="180" viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8B5CF6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#EC4899;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="180" height="180" rx="28" ry="28" fill="url(#bg)" />
  <g transform="translate(45, 45)">
    <rect x="0" y="0" width="90" height="112" rx="8" ry="8" fill="white" stroke="#E2E8F0" stroke-width="2" />
    <rect x="8" y="8" width="74" height="28" rx="4" ry="4" fill="#1E293B" />
    <text x="45" y="26" text-anchor="middle" fill="#10B981" font-family="monospace" font-size="8" font-weight="bold">¥8888</text>
    <g fill="#F1F5F9" stroke="#E2E8F0" stroke-width="1">
      <rect x="8" y="45" width="16" height="14" rx="2" />
      <rect x="30" y="45" width="16" height="14" rx="2" />
      <rect x="52" y="45" width="16" height="14" rx="2" />
      <rect x="74" y="45" width="8" height="14" rx="2" />
      <rect x="8" y="65" width="16" height="14" rx="2" />
      <rect x="30" y="65" width="16" height="14" rx="2" />
      <rect x="52" y="65" width="16" height="14" rx="2" />
      <rect x="74" y="65" width="8" height="14" rx="2" />
      <rect x="8" y="85" width="16" height="14" rx="2" />
      <rect x="30" y="85" width="16" height="14" rx="2" />
      <rect x="52" y="85" width="16" height="14" rx="2" />
      <rect x="74" y="85" width="8" height="19" rx="2" />
    </g>
  </g>
</svg>`;
};

// 主函数
function generateIcons() {
  const publicDir = path.join(__dirname, '..', 'public');
  
  // 确保public目录存在
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  try {
    // 生成主图标SVG
    const mainIconSVG = createSVGIcon();
    fs.writeFileSync(path.join(publicDir, 'icon.svg'), mainIconSVG);
    console.log('✓ 生成 icon.svg');

    // 生成favicon
    const faviconSVG = createFaviconSVG();
    fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSVG);
    console.log('✓ 生成 favicon.svg');

    // 生成Apple Touch图标
    const appleTouchSVG = createAppleTouchIcon();
    fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.svg'), appleTouchSVG);
    console.log('✓ 生成 apple-touch-icon.svg');

    // 创建PNG占位符文件说明
    const pngNote = `# PWA图标文件

本目录包含以下PWA图标文件：

## SVG图标（已生成）
- icon.svg - 主应用图标
- favicon.svg - 网站图标
- apple-touch-icon.svg - Apple设备图标

## PNG图标（需要转换）
如需PNG格式图标，请使用以下工具转换SVG：
- 在线工具：https://convertio.co/svg-png/
- 本地工具：Inkscape, GIMP等

需要的PNG尺寸：
- pwa-192x192.png (192x192)
- pwa-512x512.png (512x512)
- apple-touch-icon.png (180x180)
- favicon.ico (32x32)

## 使用说明
1. 将icon.svg转换为pwa-192x192.png和pwa-512x512.png
2. 将apple-touch-icon.svg转换为apple-touch-icon.png
3. 将favicon.svg转换为favicon.ico
4. 将转换后的文件放在public目录下
`;
    
    fs.writeFileSync(path.join(publicDir, 'ICONS_README.md'), pngNote);
    console.log('✓ 生成 ICONS_README.md');

    console.log('\n🎉 图标生成完成！');
    console.log('📝 请查看 public/ICONS_README.md 了解如何转换为PNG格式');
    
  } catch (error) {
    console.error('❌ 生成图标时出错:', error);
    process.exit(1);
  }
}

// 运行脚本
generateIcons();

export { generateIcons };