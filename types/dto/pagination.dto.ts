import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export enum OrderBy {
  ID = 'id',
  CREATED_AT = 'createdAt',
}

export class PaginationDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;

  // @IsOptional()
  // @IsEnum(OrderBy)
  // orderBy?: OrderBy;

  @IsOptional()
  @IsEnum(SortDirection)
  sort?: SortDirection;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  search?: string;
}
