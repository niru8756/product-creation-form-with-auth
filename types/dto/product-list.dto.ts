import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto, OrderBy } from './pagination.dto';

enum ExtendedOrderBy {
  ID = OrderBy.ID,
  CREATED_AT = OrderBy.CREATED_AT,
  TITLE = 'title',
  STATUS = 'status',
}

enum ProductStatus {
  ACTIVE = 'ACTIVE',
  DRAFT = 'DRAFT',
}

export class ProductListDto extends PaginationDto {
  @IsOptional()
  @IsEnum(ExtendedOrderBy)
  orderBy?: ExtendedOrderBy;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  subCategoryId?: string;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;
}
