import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { UploadController } from "./upload.controller";
import { Article } from "../articles/entities/article.entity";
import { Music } from "../music/entities/music.entity";
import {
  detectImageType,
  detectAudioType,
  validateMarkdownContent,
} from "./upload-utils";

describe("UploadController", () => {
  let controller: UploadController;
  const mockArticleRepo = {
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };
  const mockMusicRepo = {
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [
        { provide: getRepositoryToken(Article), useValue: mockArticleRepo },
        { provide: getRepositoryToken(Music), useValue: mockMusicRepo },
      ],
    }).compile();

    controller = module.get<UploadController>(UploadController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("magic bytes 检测", () => {
    it("识别真实 PNG", () => {
      const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
      expect(detectImageType(png)).toBe("png");
    });

    it("拒绝 HTML 伪造的图片", () => {
      const html = Buffer.from(
        "<html><script>alert(1)</script></html>",
        "utf-8",
      );
      expect(detectImageType(html)).toBeNull();
    });

    it("识别 MP3（ID3 头）", () => {
      const mp3 = Buffer.from("ID3\x04\x00\x00\x00\x00\x00\x00", "latin1");
      expect(detectAudioType(mp3)).toBe("mp3");
    });

    it("文本内容不是合法音频", () => {
      const text = Buffer.from("not real audio data at all", "utf-8");
      expect(detectAudioType(text)).toBeNull();
    });

    it("Markdown 文本合法、二进制内容被拒", () => {
      expect(
        validateMarkdownContent(Buffer.from("# 标题\n正文", "utf-8")),
      ).toBe(true);
      expect(
        validateMarkdownContent(
          Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x00, 0xff]),
        ),
      ).toBe(false);
    });
  });
});
