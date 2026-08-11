import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, Length } from "class-validator";

/**
 * 聊天请求 DTO —— 只接收"本次用户输入"。
 * 历史消息与 system 提示词由后端组装，客户端无法提交 system 角色，
 * 也无法携带无关字段（全局 ValidationPipe 设 forbidNonWhitelisted）。
 */
export class ChatRequestDto {
  @ApiProperty({ description: "本次用户输入", example: "介绍一下数智技术协会" })
  @IsString()
  @Length(1, 2000)
  message: string;

  @ApiPropertyOptional({ description: "会话令牌" })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  token?: string;
}
