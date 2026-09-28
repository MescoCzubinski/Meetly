import { ArrayMinSize, IsArray, IsString, MaxLength } from "class-validator";

export class InterestDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @MaxLength(20, { each: true })
  interests!: string[];
}
