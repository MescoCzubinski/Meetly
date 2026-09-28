import { IsString, Matches, MaxLength } from "class-validator";

export class ParticipantDto {
  @IsString()
  @Matches(/\S/, { message: "name must not be blank" })
  @MaxLength(20)
  name!: string;
}
