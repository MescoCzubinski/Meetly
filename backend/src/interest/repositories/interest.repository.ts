import { Injectable } from "@nestjs/common";

export interface Answer {
  name: string;
  interests: string[];
}

@Injectable()
export class InterestRepository {
  private readonly answers = new Map<string, Answer[]>();

  createSession(code: string): void {
    this.answers.set(code, []);
  }

  hasSession(code: string): boolean {
    return this.answers.has(code);
  }

  findAll(code: string): Answer[] {
    return this.answers.get(code) ?? [];
  }

  save(code: string, answer: Answer): void {
    const answers = this.answers.get(code);
    if (!answers) return;
    const index = answers.findIndex((a) => a.name === answer.name);
    if (index === -1) answers.push(answer);
    else answers[index] = answer;
  }

  delete(code: string, name: string): void {
    const answers = this.answers.get(code);
    const index = answers?.findIndex((a) => a.name === name) ?? -1;
    if (index !== -1) answers?.splice(index, 1);
  }

  deleteSession(code: string): void {
    this.answers.delete(code);
  }
}
