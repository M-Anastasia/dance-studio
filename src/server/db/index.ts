import { createInMemoryRepository, type Repository } from "./repository";
import { createSeed, mondayOfWeekUtc } from "./seed";

const globalStore = globalThis as typeof globalThis & {
  __danceStudioRepository?: Repository;
};

export const getRepository = (): Repository => {
  globalStore.__danceStudioRepository ??= createInMemoryRepository(
    createSeed(mondayOfWeekUtc(new Date())),
  );
  return globalStore.__danceStudioRepository;
};

/** Для тестов. */
export const setRepository = (repository: Repository): void => {
  globalStore.__danceStudioRepository = repository;
};
