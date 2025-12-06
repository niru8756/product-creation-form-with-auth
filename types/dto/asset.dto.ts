import { AssetType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  ValidateNested,
} from 'class-validator';

class Asset {
  @IsNotEmpty()
  @IsString()
  fileName!: string;

  @IsNotEmpty()
  @IsEnum(AssetType)
  fileType!: AssetType;

  @IsNotEmpty()
  @IsString()
  mimeType!: string;

  @IsNotEmpty()
  @IsNumber()
  @Max(2000000) // 2MB in bytes
  fileSize!: number;

  @IsNotEmpty()
  @IsNumber()
  position!: number;
}

export class CreateAssetDto {
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => Asset)
  assets!: Asset[];
}

class UpdateAsset {
  @IsNotEmpty()
  @IsString()
  assetId!: string;

  @IsOptional()
  @IsNumber()
  position!: number;
}
class ProductAsset {
  @IsNotEmpty()
  @IsString()
  productId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateAsset)
  assets!: UpdateAsset[];
}

class VariantAsset {
  @IsNotEmpty()
  @IsString()
  variantId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateAsset)
  assets!: UpdateAsset[];
}

export class UpdateAssetDto {
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProductAsset)
  productAssets!: ProductAsset;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantAsset)
  variantAssets!: VariantAsset[];
}

export class DeleteAssetDto {
  @IsArray()
  @IsString({ each: true })
  assetIds!: string[];
}

export class GetAssetsDto {
  @IsArray()
  @IsString({ each: true })
  assetIds!: string[];
}
