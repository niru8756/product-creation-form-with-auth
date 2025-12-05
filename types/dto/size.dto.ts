import { Type } from "class-transformer";
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from "class-validator";

export enum Gender {
  MALE = "male",
  FEMALE = "female",
  KIDS = "kids",
}

class KidsFootwearSizeValue {
  @IsNotEmpty()
  @IsString()
  id!: string;

  @IsNotEmpty()
  @IsString()
  displayName!: string;

  @IsNotEmpty()
  @IsString()
  numericUK!: string;

  @IsNotEmpty()
  @IsString()
  numericEU!: string;

  @IsNotEmpty()
  @IsString()
  numericCM!: string;

  @IsNotEmpty()
  @IsString()
  numericUS!: string;

  @IsNotEmpty()
  @IsString()
  width!: string;

  @IsNotEmpty()
  @IsString()
  age!: string;

  @IsNotEmpty()
  @IsString()
  ageTo!: string;
}

class MenFootwearSizeValue {
  @IsNotEmpty()
  @IsString()
  id!: string;

  @IsNotEmpty()
  @IsString()
  displayName!: string;

  @IsNotEmpty()
  @IsString()
  numericUK!: string;

  @IsNotEmpty()
  @IsString()
  numericEU!: string;

  @IsNotEmpty()
  @IsString()
  numericCM!: string;

  @IsNotEmpty()
  @IsString()
  width!: string;
}

class WomenFootwearSizeValue {
  @IsNotEmpty()
  @IsString()
  id!: string;

  @IsNotEmpty()
  @IsString()
  displayName!: string;

  @IsNotEmpty()
  @IsString()
  numericUK!: string;

  @IsNotEmpty()
  @IsString()
  numericEU!: string;

  @IsNotEmpty()
  @IsString()
  numericCM!: string;

  @IsNotEmpty()
  @IsString()
  numericUS!: string;

  @IsNotEmpty()
  @IsString()
  width!: string;
}

class KidsApparelSizeValue {
  @IsNotEmpty()
  @IsString()
  id!: string;

  @IsNotEmpty()
  @IsString()
  displayName!: string;

  @IsNotEmpty()
  @IsString()
  numeric!: string;

  @IsNotEmpty()
  @IsString()
  numericTo!: string;

  @IsNotEmpty()
  @IsString()
  age!: string;

  @IsNotEmpty()
  @IsString()
  ageTo!: string;

  @IsNotEmpty()
  @IsString()
  bodyType!: string;
}

class MenApparelSizeValue {
  @IsNotEmpty()
  @IsString()
  id!: string;

  @IsNotEmpty()
  @IsString()
  displayName!: string;

  @IsNotEmpty()
  @IsString()
  alpha!: string;

  @IsNotEmpty()
  @IsString()
  numeric!: string;

  @IsNotEmpty()
  @IsString()
  numericTo!: string;

  @IsNotEmpty()
  @IsString()
  bodyType!: string;
}

class WomenApparelSizeValue {
  @IsNotEmpty()
  @IsString()
  id!: string;

  @IsNotEmpty()
  @IsString()
  displayName!: string;

  @IsNotEmpty()
  @IsString()
  alpha!: string;

  @IsNotEmpty()
  @IsString()
  numeric!: string;

  @IsNotEmpty()
  @IsString()
  numericTo!: string;

  @IsNotEmpty()
  @IsString()
  bodyType!: string;
}

class KidsBottomsSizeValue {
  @IsNotEmpty()
  @IsString()
  id!: string;

  @IsNotEmpty()
  @IsString()
  displayName!: string;

  @IsNotEmpty()
  @IsString()
  numeric!: string;

  @IsNotEmpty()
  @IsString()
  numericTo!: string;

  @IsNotEmpty()
  @IsString()
  age!: string;

  @IsNotEmpty()
  @IsString()
  ageTo!: string;

  @IsNotEmpty()
  @IsString()
  bodyType!: string;
}

class MenBottomsSizeValue {
  @IsNotEmpty()
  @IsString()
  id!: string;

  @IsNotEmpty()
  @IsString()
  displayName!: string;

  @IsNotEmpty()
  @IsString()
  alpha!: string;

  @IsNotEmpty()
  @IsString()
  numeric!: string;

  @IsNotEmpty()
  @IsString()
  numericTo!: string;

  @IsNotEmpty()
  @IsString()
  bodyType!: string;
}

class WomenBottomsSizeValue {
  @IsNotEmpty()
  @IsString()
  id!: string;

  @IsNotEmpty()
  @IsString()
  displayName!: string;

  @IsNotEmpty()
  @IsString()
  alpha!: string;

  @IsNotEmpty()
  @IsString()
  numeric!: string;

  @IsNotEmpty()
  @IsString()
  numericTo!: string;

  @IsNotEmpty()
  @IsString()
  bodyType!: string;
}

class KidsSkirtSizeValue {
  @IsNotEmpty()
  @IsString()
  id!: string;

  @IsNotEmpty()
  @IsString()
  displayName!: string;

  @IsNotEmpty()
  @IsString()
  numeric!: string;

  @IsNotEmpty()
  @IsString()
  numericTo!: string;

  @IsNotEmpty()
  @IsString()
  age!: string;

  @IsNotEmpty()
  @IsString()
  ageTo!: string;

  @IsNotEmpty()
  @IsString()
  bodyType!: string;
}

class WomenSkirtSizeValue {
  @IsNotEmpty()
  @IsString()
  id!: string;

  @IsNotEmpty()
  @IsString()
  displayName!: string;

  @IsNotEmpty()
  @IsString()
  alpha!: string;

  @IsNotEmpty()
  @IsString()
  numeric!: string;

  @IsNotEmpty()
  @IsString()
  numericTo!: string;

  @IsNotEmpty()
  @IsString()
  bodyType!: string;
}

class KidsShirtSizeValue {
  @IsNotEmpty()
  @IsString()
  id!: string;

  @IsNotEmpty()
  @IsString()
  displayName!: string;

  @IsNotEmpty()
  @IsString()
  numeric!: string;

  @IsNotEmpty()
  @IsString()
  numericTo!: string;

  @IsNotEmpty()
  @IsString()
  age!: string;

  @IsNotEmpty()
  @IsString()
  ageTo!: string;

  @IsNotEmpty()
  @IsString()
  bodyType!: string;
}

class MenShirtSizeValue {
  @IsNotEmpty()
  @IsString()
  id!: string;

  @IsNotEmpty()
  @IsString()
  displayName!: string;

  @IsNotEmpty()
  @IsString()
  alpha!: string;

  @IsNotEmpty()
  @IsString()
  numeric!: string;

  @IsNotEmpty()
  @IsString()
  numericTo!: string;

  @IsNotEmpty()
  @IsString()
  bodyType!: string;
}

class WomenShirtSizeValue {
  @IsNotEmpty()
  @IsString()
  id!: string;

  @IsNotEmpty()
  @IsString()
  displayName!: string;

  @IsNotEmpty()
  @IsString()
  alpha!: string;

  @IsNotEmpty()
  @IsString()
  numeric!: string;

  @IsNotEmpty()
  @IsString()
  numericTo!: string;

  @IsNotEmpty()
  @IsString()
  bodyType!: string;
}

export class GenericSizeValue {
  @IsNotEmpty()
  @IsString()
  displayName!: string;

  @IsNotEmpty()
  @IsString()
  value!: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ValidationClassMap: Record<string, Record<string, any>> = {
  male: {
    apparelSize: MenApparelSizeValue,
    bottomsSize: MenBottomsSizeValue,
    shirtSize: MenShirtSizeValue,
    footwearSize: MenFootwearSizeValue,
  },
  female: {
    apparelSize: WomenApparelSizeValue,
    bottomsSize: WomenBottomsSizeValue,
    shirtSize: WomenShirtSizeValue,
    footwearSize: WomenFootwearSizeValue,
    skirtSize: WomenSkirtSizeValue,
  },
  kids: {
    apparelSize: KidsApparelSizeValue,
    bottomsSize: KidsBottomsSizeValue,
    shirtSize: KidsShirtSizeValue,
    skirtSize: KidsSkirtSizeValue,
    footwearSize: KidsFootwearSizeValue,
  },
};

export class Size {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  displayName!: string;

  @IsOptional()
  @ValidateIf((obj, value) => value !== null) // Allow null explicitly
  @IsEnum(Gender)
  gender!: Gender | null;

  @IsNotEmpty()
  @IsString()
  brand!: string;

  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type((options) => {
    const object = options?.object as Size;

    const gender = object.gender as keyof typeof ValidationClassMap | null;
    const name = object.name as string;

    const validationClass =
      gender && ValidationClassMap[gender]
        ? ValidationClassMap[gender][name]
        : undefined;

    if (!validationClass) {
      return GenericSizeValue;
    }
    return validationClass;
  })
  value!:
    | MenApparelSizeValue
    | WomenApparelSizeValue
    | KidsApparelSizeValue
    | MenFootwearSizeValue
    | WomenFootwearSizeValue
    | KidsFootwearSizeValue
    | MenBottomsSizeValue
    | WomenBottomsSizeValue
    | KidsBottomsSizeValue
    | WomenSkirtSizeValue
    | KidsSkirtSizeValue
    | MenShirtSizeValue
    | WomenShirtSizeValue
    | KidsShirtSizeValue
    | GenericSizeValue;
}
