import { Injectable, Logger } from "@nestjs/common";
import { EventBus } from "../../common/events/event-bus";
import {
  type Answer,
  InterestRepository,
} from "../repositories/interest.repository";
import { EmbeddingService } from "./embedding.service";

const INACTIVE_TTL = 5 * 60 * 1000; // 5 minutes
const SIMILARITY_THRESHOLD = 0.6;

@Injectable()
export class InterestService {
  private readonly logger = new Logger(InterestService.name);
  private readonly removals = new Map<string, Map<string, NodeJS.Timeout>>();

  constructor(
    private readonly interestRepository: InterestRepository,
    private readonly embeddingService: EmbeddingService,
    eventBus: EventBus,
  ) {
    eventBus.on("session.created", (code) => {
      interestRepository.createSession(code);
      this.removals.set(code, new Map());
    });
    eventBus.on("session.ended", (code) => {
      this.removals.get(code)?.forEach(clearTimeout);
      this.removals.delete(code);
      interestRepository.deleteSession(code);
      embeddingService.deleteSession(code);
    });
  }

  isActive(code: string): boolean {
    return this.interestRepository.hasSession(code);
  }

  getAnswers(code: string): (Answer & { active: boolean })[] {
    const removals = this.removals.get(code);
    return this.interestRepository.findAll(code).map((a) => ({
      ...a,
      active: !removals?.has(a.name),
    }));
  }

  getLinks(code: string): [string, string, number][] {
    const answers = this.getAnswers(code);
    const links: [string, string, number][] = [];
    answers.forEach((a, i) =>
      answers.slice(i + 1).forEach((b) => {
        const strength =
          (this.match(code, a.interests, b.interests) +
            this.match(code, b.interests, a.interests)) /
          2;
        if (strength > 0) links.push([a.name, b.name, strength]);
      }),
    );
    return links;
  }

  async addAnswer(code: string, answer: Answer): Promise<void> {
    this.interestRepository.save(code, answer);
    this.logger.log(
      `Session ${code}: ${answer.name} answered with ${answer.interests.length} interests`,
    );
    await this.embeddingService.embed(code, answer.interests);
  }

  join(code: string, name: string): boolean {
    const removals = this.removals.get(code);
    const timer = removals?.get(name);
    if (!removals || !timer) return false;
    clearTimeout(timer);
    removals.delete(name);
    this.logger.log(`Session ${code}: ${name} rejoined, answer kept`);
    return true;
  }

  leave(code: string, name: string, onRemoved: () => void): boolean {
    const removals = this.removals.get(code);
    if (!removals || removals.has(name)) return false;
    if (!this.interestRepository.findAll(code).some((a) => a.name === name))
      return false;

    const timer = setTimeout(() => {
      removals.delete(name);
      this.interestRepository.delete(code, name);
      this.logger.log(`Session ${code}: removed inactive answer of ${name}`);
      onRemoved();
    }, INACTIVE_TTL);
    removals.set(name, timer);
    return true;
  }

  private match(code: string, from: string[], to: string[]): number {
    return from.reduce((sum, x) => {
      const best = Math.max(
        0,
        ...to.map((y) => this.embeddingService.similarity(code, x, y)),
      );
      return (
        sum +
        Math.max(0, (best - SIMILARITY_THRESHOLD) / (1 - SIMILARITY_THRESHOLD))
      );
    }, 0);
  }
}
