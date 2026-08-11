import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { existsSync, readdirSync, statSync, unlinkSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from '../articles/entities/article.entity';
import { Music } from '../music/entities/music.entity';
import { safeResolveUploadPath, PUBLIC_DIR } from '../common/path-guard';
import {
  detectAudioType,
  detectImageType,
  makeServerFilename,
  validateMarkdownContent,
  imageFileFilter,
  audioFileFilter,
  markdownFileFilter,
} from './upload-utils';

/** 扫描目录返回文件列表 */
function scanDir(subDir: string): { name: string; size: number; url: string }[] {
  const dir = join(PUBLIC_DIR, subDir);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => !f.startsWith('.'))
    .map((name) => {
      const stat = statSync(join(dir, name));
      return { name, size: stat.size, url: `/${subDir}/${name}` };
    })
    .sort((a, b) => b.size - a.size);
}

/** 确保目录存在并写入文件 */
function writeUpload(subDir: string, filename: string, buffer: Buffer): void {
  const dir = join(PUBLIC_DIR, subDir);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, filename), buffer);
}

/** 原文件名转为 UTF-8 标题（Windows 上 multer originalname 可能是 latin1） */
function originalTitle(file: Express.Multer.File, dropExt: boolean): string {
  const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
  return dropExt ? originalName.replace(/\.[^.]+$/, '') : originalName;
}

@ApiTags('文件上传')
@Controller('api/upload')
export class UploadController {
  constructor(
    @InjectRepository(Article)
    private articleRepo: Repository<Article>,
    @InjectRepository(Music)
    private musicRepo: Repository<Music>,
  ) {}

  // ══════════════════════════════════════
  // 文件浏览（无需登录）
  // ══════════════════════════════════════

  @Get('images')
  @ApiOperation({ summary: '列出所有已上传的图片' })
  listImages() {
    const exts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'];
    return { code: 200, data: scanDir('uploads').filter((f) => exts.some((e) => f.name.toLowerCase().endsWith(e))) };
  }

  @Get('musics')
  @ApiOperation({ summary: '列出所有已上传的音乐文件' })
  listMusic() {
    return { code: 200, data: scanDir('music') };
  }

  @Get('markdowns')
  @ApiOperation({ summary: '列出所有已上传的 Markdown 文件' })
  listMarkdowns() {
    const all = scanDir('uploads');
    return { code: 200, data: all.filter((f) => f.name.endsWith('.md')) };
  }

  // ══════════════════════════════════════
  // 上传（memoryStorage + magic bytes 校验，落盘前验证）
  // ══════════════════════════════════════

  @UseGuards(JwtAuthGuard)
  @Post('image')
  @ApiBearerAuth()
  @ApiOperation({ summary: '上传图片（需登录）' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary', description: '图片文件（jpg/png/webp/gif/bmp，拒绝 SVG）' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: imageFileFilter,
    }),
  )
  uploadImage(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('请选择图片文件');

    const ext = detectImageType(file.buffer);
    if (!ext) {
      throw new BadRequestException('文件内容与图片格式不符');
    }

    const filename = makeServerFilename(ext);
    writeUpload('uploads', filename, file.buffer);
    return { code: 200, url: `/uploads/${filename}` };
  }

  @UseGuards(JwtAuthGuard)
  @Post('music')
  @ApiBearerAuth()
  @ApiOperation({ summary: '上传音乐文件（需登录）' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        music: { type: 'string', format: 'binary', description: '音乐文件（mp3/wav/ogg/flac/m4a/aac）' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('music', {
      storage: memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024 },
      fileFilter: audioFileFilter,
    }),
  )
  async uploadMusic(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('请选择音乐文件');

    const ext = detectAudioType(file.buffer);
    if (!ext) {
      throw new BadRequestException('文件内容与音频格式不符');
    }

    const filename = makeServerFilename(ext);
    writeUpload('music', filename, file.buffer);

    const title = originalTitle(file, true);
    try {
      const music = this.musicRepo.create({
        title,
        artist: '未知',
        audioUrl: `/music/${filename}`,
      });
      await this.musicRepo.save(music);
    } catch (err) {
      // 数据库写入失败时删除已保存的文件，避免孤立文件
      unlinkSync(join(PUBLIC_DIR, 'music', filename));
      throw err;
    }

    return { code: 200, url: `/music/${filename}`, title };
  }

  @UseGuards(JwtAuthGuard)
  @Post('markdown')
  @ApiBearerAuth()
  @ApiOperation({ summary: '上传 Markdown 文件，自动创建文章（需登录）' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'Markdown 文件（.md）' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: markdownFileFilter,
    }),
  )
  async uploadMarkdown(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('请选择 .md 文件');

    if (!validateMarkdownContent(file.buffer)) {
      throw new BadRequestException('Markdown 文件内容不合法（应为 UTF-8 文本）');
    }

    const originalName = originalTitle(file, false);
    const filename = makeServerFilename('md');
    const content = file.buffer.toString('utf-8');
    const title = originalName.replace(/\.md$/i, '');

    // 先写文件，再建文章；数据库写失败则回滚删除文件
    writeUpload('uploads', filename, file.buffer);
    try {
      const article = this.articleRepo.create({
        title,
        content,
        publishedAt: new Date(),
      });
      const saved = await this.articleRepo.save(article);
      return { code: 200, article: saved, message: `文章「${title}」已创建` };
    } catch (err) {
      try {
        unlinkSync(join(PUBLIC_DIR, 'uploads', filename));
      } catch {
        /* 忽略回滚失败 */
      }
      throw err;
    }
  }

  // ══════════════════════════════════════
  // 删除（文件与数据库记录同步处理）
  // ══════════════════════════════════════

  @UseGuards(JwtAuthGuard)
  @Delete('image/:filename')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除图片（需登录）' })
  deleteImage(@Param('filename') filename: string) {
    const filePath = safeResolveUploadPath('uploads', filename, [
      '.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp',
    ]);
    unlinkSync(filePath);
    return { code: 200, message: '已删除' };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('music/:filename')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除音乐文件（需登录，同时删除数据库记录）' })
  async deleteMusic(@Param('filename') filename: string) {
    const filePath = safeResolveUploadPath('music', filename, [
      '.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac',
    ]);
    unlinkSync(filePath);

    // 同步删除数据库记录，避免"有文件无记录 / 有记录无文件"
    const url = `/music/${filename}`;
    await this.musicRepo.delete({ audioUrl: url });

    return { code: 200, message: '已删除' };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('markdown/:filename')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除 Markdown 文件（需登录）' })
  deleteMarkdown(@Param('filename') filename: string) {
    const filePath = safeResolveUploadPath('uploads', filename, ['.md']);
    unlinkSync(filePath);
    return { code: 200, message: '已删除' };
  }
}
