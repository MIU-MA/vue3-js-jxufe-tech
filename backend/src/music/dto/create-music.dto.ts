import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional, MaxLength } from "class-validator";

export class CreateMusicDto {
  @ApiProperty({ description: "歌名", example: "晴天" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: "歌手", example: "周杰伦" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  artist: string;

  @ApiPropertyOptional({
    description: "封面图 URL",
    example: "/uploads/cover-123.jpg",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  coverUrl?: string;

  @ApiProperty({
    description: "音频文件 URL",
    example: "/uploads/audio-456.mp3",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  audioUrl: string;
}
