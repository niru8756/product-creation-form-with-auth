import { ExternalProductIdType } from "@prisma/client";
import { IsNotEmpty, IsString } from "class-validator";

export class ExternalProductIdentifierDto {
  @IsString()
  @IsNotEmpty()
  type!: ExternalProductIdType;

  @IsString()
  @IsNotEmpty()
  value!: string;
}