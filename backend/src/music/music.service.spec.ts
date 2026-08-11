import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { NotFoundException } from "@nestjs/common";
import { MusicService } from "./music.service";
import { Music } from "./entities/music.entity";

describe("MusicService", () => {
  let service: MusicService;
  const mockRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MusicService,
        { provide: getRepositoryToken(Music), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<MusicService>(MusicService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("保存并返回音乐", async () => {
      const data = {
        title: "晴天",
        artist: "周杰伦",
        audioUrl: "/music/a.mp3",
      };
      mockRepo.create.mockImplementation((d) => d);
      mockRepo.save.mockImplementation((m) => m);
      const result = await service.create(data);
      expect(result).toEqual(data);
      expect(mockRepo.save).toHaveBeenCalledWith(data);
    });
  });

  describe("update", () => {
    it("不存在抛 NotFoundException", async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.update(1, { title: "x" })).rejects.toThrow(
        NotFoundException,
      );
    });

    it("更新字段并保存", async () => {
      const music = { id: 1, title: "a", artist: "b" };
      mockRepo.findOne.mockResolvedValue(music);
      mockRepo.save.mockImplementation((m) => m);
      const result = await service.update(1, { title: "晴天" });
      expect(music.title).toBe("晴天");
      expect(result).toBe(music);
    });
  });

  describe("remove", () => {
    it("不存在抛 NotFoundException", async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});
