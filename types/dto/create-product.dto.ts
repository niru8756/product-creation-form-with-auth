import 'reflect-metadata'; 
import {
  ChannelType,
  ExternalProductIdType,
  InventoryStrategyType,
  PriceStrategyType,
  ProductStatus,
} from '@prisma/client';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { Size } from './size.dto';

export enum WeightUnit {
  KILLOGRAM = 'kilograms',
  GRAM = 'grams',
  MILLIGRAM = 'milligrams',
  OUNCE = 'ounces',
  POUND = 'pounds',
  TON = 'tons',
}

enum LengthUnit {
  CENTIMETER = 'centimeters',
  METER = 'meters',
  FEET = 'feet',
  INCHE = 'inches',
  MILE = 'miles',
}

export enum VariantType {
  DEFAULT = 'default',
  CUSTOM = 'custom',
}

class Weight {
  @IsNumber()
  @IsNotEmpty()
  value!: number;

  @IsEnum(WeightUnit)
  @IsNotEmpty()
  unit!: WeightUnit;
}

class Length {
  @IsNumber()
  @IsNotEmpty()
  value!: number;

  @IsEnum(LengthUnit)
  @IsNotEmpty()
  unit!: LengthUnit;
}

class Width {
  @IsNumber()
  @IsNotEmpty()
  value!: number;

  @IsEnum(LengthUnit)
  @IsNotEmpty()
  unit!: LengthUnit;
}

class Height {
  @IsNumber()
  @IsNotEmpty()
  value!: number;

  @IsEnum(LengthUnit)
  @IsNotEmpty()
  unit!: LengthUnit;
}

export class ExternalProductIdTypeDto {
  @IsNotEmpty()
  @IsEnum(ExternalProductIdType)
  type!: ExternalProductIdType;

  @IsNotEmpty()
  @IsString()
  value!: string;
}

class ItemWeight {
  @IsNotEmpty()
  @IsString()
  displayName!: string;

  @IsNotEmpty()
  @IsNumber()
  value!: number;

  @IsEnum(WeightUnit)
  @IsNotEmpty()
  unit!: WeightUnit;
}

class Color {
  @IsNotEmpty()
  @IsString()
  displayName!: string;

  @IsNotEmpty()
  @IsString()
  value!: string;

  @IsNotEmpty()
  @IsString()
  hexCode!: string;
}

class NumberOfItem {
  @IsNotEmpty()
  @IsString()
  displayName!: string;

  @IsNotEmpty()
  @IsInt()
  value!: number;
}

class Flavor {
  @IsNotEmpty()
  @IsString()
  displayName!: string;

  @IsNotEmpty()
  @IsString()
  value!: string;
}

class Scent {
  @IsNotEmpty()
  @IsString()
  displayName!: string;

  @IsNotEmpty()
  @IsString()
  value!: string;
}

export class VariantData {
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Color)
  color?: Color;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Size)
  size?: Size;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => NumberOfItem)
  numberOfItems?: NumberOfItem;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ItemWeight)
  itemWeight?: ItemWeight;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Flavor)
  flavor?: Flavor;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Scent)
  scent?: Scent;
}

class VariantOption {
  @IsNotEmpty()
  @IsEnum(VariantType)
  type!: VariantType;

  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => VariantData)
  data!: VariantData;
}

class ChannelData {
  @IsNotEmpty()
  @IsEnum(ChannelType)
  channelType!: ChannelType;

  @IsNumber()
  @Min(0)
  @Transform(({ value }) => value * 100, { toClassOnly: true }) // Convert to paisa
  price?: number;

  @IsNotEmpty()
  @IsInt()
  quantity!: number;

  @IsNumber()
  @Min(0)
  @Transform(({ value }) => value * 100, { toClassOnly: true }) // Convert to paisa
  mrp?: number;
}

class CreateProductVariantDto {
  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ExternalProductIdTypeDto)
  externalProductId?: ExternalProductIdTypeDto;

  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => VariantOption)
  option!: VariantOption;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChannelData)
  channelData!: ChannelData[];

  @IsArray()
  @ValidateIf((o) => o.option?.type === VariantType.CUSTOM)
  @ArrayMinSize(3)
  @ValidateNested({ each: true })
  @Type(() => Asset)
  variantAssets!: Asset[];
}

export class PackageDimension {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Weight)
  weight!: Weight;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Length)
  length!: Length;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Width)
  width!: Width;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Height)
  height!: Height;
}

class PackageDetails {
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => PackageDimension)
  dimensions!: PackageDimension;
}

class ManufacturingInfo {
  @IsNotEmpty()
  @IsString()
  manufacturerOrPackerName!: string;

  @IsNotEmpty()
  @IsString()
  manufacturerOrPackerAddress!: string;

  @IsNotEmpty()
  @IsString()
  monthOfManufactureOrPacking!: string;
}

export class Asset {
  @IsNotEmpty()
  @IsString()
  assetId!: string;

  @IsOptional()
  @IsNumber()
  position!: number;
}

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsNotEmpty()
  @IsString()
  description!: string;

  @IsNotEmpty()
  @IsEnum(InventoryStrategyType)
  inventoryStrategy!: InventoryStrategyType;

  @IsNotEmpty()
  @IsEnum(PriceStrategyType)
  priceStrategy!: PriceStrategyType;

  @IsNotEmpty()
  @IsString()
  hsnCode!: string;

  @IsNotEmpty()
  @IsString()
  subCategoryId!: string;

  @IsNotEmpty()
  @IsString()
  categoryId!: string;

  @IsNotEmpty()
  @IsEnum(ProductStatus)
  status!: ProductStatus;

  @IsArray()
  @IsString({ each: true })
  variantionAttributes?: string[];

  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => PackageDetails)
  packageDetails!: PackageDetails;

  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ManufacturingInfo)
  manufacturingInfo!: ManufacturingInfo;

  @IsNotEmpty()
  @IsString()
  brandName!: string;

  @IsOptional()
  @IsString()
  originCountry?: string;

  @IsOptional()
  @IsObject()
  extraData?: object;

  @IsArray()
  @ArrayMinSize(3)
  @ValidateNested({ each: true })
  @Type(() => Asset)
  productAssets!: Asset[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  variants!: CreateProductVariantDto[];
}
