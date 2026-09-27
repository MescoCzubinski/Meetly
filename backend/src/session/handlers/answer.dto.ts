import {
  ArrayMinSize,
  IsArray,
  IsString,
  Matches,
  MaxLength,
} from "class-validator";

export class AnswerDto {
  @IsString()
  @Matches(/\S/, { message: "name must not be blank" })
  @MaxLength(20)
  name!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @MaxLength(20, { each: true })
  interests!: string[];
}
