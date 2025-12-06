import { IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";

export class CreateOptionDto {
  @IsString()
  @IsNotEmpty()
  subCategory!: string;

  @IsString()
  @IsNotEmpty()
  attributeName!: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsNotEmpty()
  @IsObject()
  value!: object;
}
