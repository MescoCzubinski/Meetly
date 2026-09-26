import { IsArray, IsString, Matches, MaxLength } from "class-validator";

export class AnswerDto {
  @IsString()
  @Matches(/\S/, { message: "name must not be blank" })
  @MaxLength(20)
  name!: string;

  @IsArray()
  @IsString({ each: true })
  @MaxLength(20, { each: true })
  interests!: string[];
}
