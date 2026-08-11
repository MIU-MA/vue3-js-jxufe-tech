import { BadRequestException } from '@nestjs/common';
import { extname } from 'path';
import type { FileFilterCallback } from 'multer';

/**
 * 上传安全工具：落盘前校验扩展名、MIME 与 magic bytes，
 * 文件名/扩展名由服务端生成，不沿用用户输入。SVG 一律拒绝。
 */

/** 允许的图片扩展名与对应 magic bytes 探测（不含 SVG）。 */
const IMAGE_EXT_MAGIC: Record<string, string[]> = {
  jpg: ['\xff\xd8\xff'],
  jpeg: ['\xff\xd8\xff'],
  png: ['\x89PNG\r\n\x1a\n'],
  gif: ['GIF87a', 'GIF89a'],
  webp: ['RIFF', 'WEBP'],
  bmp: ['BM'],
};

/** 允许的音频扩展名与对应 magic bytes 探测。 */
const AUDIO_EXT_MAGIC: Record<string, (buf: Buffer) => boolean> = {
  mp3: (buf) =>
    buf.length > 2 &&
    (buf.toString('latin1', 0, 3) === 'ID3' ||
      buf.toString('latin1', 0, 2) === '\xff\xfb' ||
      buf.toString('latin1', 0, 2) === '\xff\xf3' ||
      buf.toString('latin1', 0, 2) === '\xff\xfa'),
  wav: (buf) =>
    buf.length > 12 &&
    buf.toString('latin1', 0, 4) === 'RIFF' &&
    buf.toString('latin1', 8, 12) === 'WAVE',
  ogg: (buf) => buf.toString('latin1', 0, 4) === 'OggS',
  flac: (buf) => buf.toString('latin1', 0, 4) === 'fLaC',
  m4a: (buf) =>
    buf.length > 11 &&
    buf.toString('latin1', 4, 8) === 'ftyp' &&
    (buf.toString('latin1', 8, 12) === 'M4A ' ||
      buf.toString('latin1', 8, 12) === 'isom'),
  aac: (buf) =>
    buf.length > 1 &&
    (buf.toString('latin1', 0, 1) === '\xff' &&
      (buf[1] & 0xf6) === 0xf0),
};

/** 检测 Buffer 是否包含 NUL / 明显的二进制特征（用于 Markdown 文本校验）。 */
function looksBinary(buf: Buffer): boolean {
  // 前 8192 字节内出现 NUL 或高占比的控制字符即视为二进制
  const sample = buf.subarray(0, Math.min(buf.length, 8192));
  if (sample.includes(0)) return true;
  let control = 0;
  for (let i = 0; i < sample.length; i++) {
    const b = sample[i];
    if (b < 32 && b !== 9 && b !== 10 && b !== 13) control++;
  }
  return control / sample.length > 0.3;
}

/** 按 magic bytes 探测真实图片类型，返回服务端扩展名；非法返回 null。 */
export function detectImageType(buffer: Buffer): string | null {
  for (const [ext, magics] of Object.entries(IMAGE_EXT_MAGIC)) {
    for (const magic of magics) {
      if (magic === 'RIFF' || magic === 'WEBP') {
        // WebP：RIFF....WEBPVP8
        if (
          buffer.length > 12 &&
          buffer.toString('latin1', 0, 4) === 'RIFF' &&
          buffer.toString('latin1', 8, 12) === 'WEBP'
        ) {
          return 'webp';
        }
        continue;
      }
      if (buffer.subarray(0, magic.length).equals(Buffer.from(magic, 'latin1'))) {
        return ext;
      }
    }
  }
  return null;
}

/** 按 magic bytes 探测真实音频类型，返回服务端扩展名；非法返回 null。 */
export function detectAudioType(buffer: Buffer): string | null {
  for (const [ext, detect] of Object.entries(AUDIO_EXT_MAGIC)) {
    if (detect(buffer)) return ext;
  }
  return null;
}

/** 校验 Markdown 文本：必须是 UTF-8 可解码文本，拒绝二进制。 */
export function validateMarkdownContent(buffer: Buffer): boolean {
  if (looksBinary(buffer)) return false;
  // 尝试按 UTF-8 解码，替换无效字节后检查文本占比
  const text = buffer.toString('utf-8');
  return text.length > 0;
}

/** 生成服务端文件名：时间戳 + 随机后缀 + 服务端判定的扩展名。 */
export function makeServerFilename(ext: string): string {
  const unique = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  return `${unique}.${ext}`;
}

/**
 * Multer fileFilter：图片上传前拦截。
 * 先校验扩展名 + mimetype，再在 handler 中校验 magic bytes（这里只做粗筛）。
 */
export function imageFileFilter(
  _req: unknown,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) {
  const ext = extname(file.originalname).toLowerCase().replace(/^\./, '');
  if (!IMAGE_EXT_MAGIC[ext]) {
    return cb(new BadRequestException(`不支持的图片类型: ${ext || '无扩展名'}`));
  }
  if (!file.mimetype.startsWith('image/') || file.mimetype.includes('svg')) {
    return cb(new BadRequestException(`非法的图片 MIME: ${file.mimetype}`));
  }
  cb(null, true);
}

/** Multer fileFilter：音乐文件上传前拦截。 */
export function audioFileFilter(
  _req: unknown,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) {
  const ext = extname(file.originalname).toLowerCase().replace(/^\./, '');
  if (!AUDIO_EXT_MAGIC[ext]) {
    return cb(new BadRequestException(`不支持的音频类型: ${ext || '无扩展名'}`));
  }
  if (!file.mimetype.startsWith('audio/')) {
    return cb(new BadRequestException(`非法的音频 MIME: ${file.mimetype}`));
  }
  cb(null, true);
}

/** Multer fileFilter：Markdown 上传前拦截。 */
export function markdownFileFilter(
  _req: unknown,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) {
  const ext = extname(file.originalname).toLowerCase();
  if (ext !== '.md') {
    return cb(new BadRequestException('只支持 .md 文件'));
  }
  if (
    file.mimetype &&
    !['text/markdown', 'text/plain', 'application/octet-stream'].includes(
      file.mimetype,
    )
  ) {
    return cb(new BadRequestException(`非法的 Markdown MIME: ${file.mimetype}`));
  }
  cb(null, true);
}
