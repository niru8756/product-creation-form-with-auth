import { IsEnum, IsInt, IsNotEmpty, IsString } from "class-validator";
import { ChannelType } from "@prisma/client";

export class CreateOfferDto {
  @IsString()
  @IsNotEmpty()
  variantId!: string;

  @IsInt()
  @IsNotEmpty()
  quantity!: number;

  @IsEnum(ChannelType)
  @IsNotEmpty()
  channelType!: ChannelType;

  @IsInt()
  @IsNotEmpty()
  mrp!: number;

  @IsInt()
  @IsNotEmpty()
  price!: number;
}
