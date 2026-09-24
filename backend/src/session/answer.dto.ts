import { IsArray, IsString, Matches } from "class-validator";

export class AnswerDto {
  @IsString()
  @Matches(/\S/, { message: "name must not be blank" })
  name!: string;

  @IsArray()
  @IsString({ each: true })
  interests!: string[];
}
