import { Test, TestingModule } from "@nestjs/testing";
import { MusicController } from "./music.controller";
import { MusicService } from "./music.service";

describe("MusicController", () => {
  let controller: MusicController;
  const mockService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    syncFromDisk: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MusicController],
      providers: [{ provide: MusicService, useValue: mockService }],
    }).compile();

    controller = module.get<MusicController>(MusicController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("getOne 转发数字 id", () => {
    mockService.findOne.mockReturnValue({ id: 7 });
    expect(controller.getOne(7)).toEqual({ id: 7 });
    expect(mockService.findOne).toHaveBeenCalledWith(7);
  });
});
