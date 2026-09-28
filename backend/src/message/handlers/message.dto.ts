import { IsString, Matches, MaxLength } from "class-validator";

export class MessageDto {
  @IsString()
  @Matches(/\S/, { message: "to must not be blank" })
  @MaxLength(20)
  to!: string;

  @IsString()
  @Matches(/\S/, { message: "text must not be blank" })
  @MaxLength(500)
  text!: string;
}
