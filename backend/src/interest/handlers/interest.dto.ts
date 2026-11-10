import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsString,
  Matches,
  MaxLength,
} from "class-validator";

export class InterestDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique((interest: unknown) => String(interest).toLowerCase())
  @IsString({ each: true })
  @Matches(/\S/, { each: true, message: "interests must not be blank" })
  @MaxLength(20, { each: true })
  interests!: string[];
}
