import { queryOptions } from "@tanstack/react-query";
import { sessionExists } from "@/lib/api";

export const sessionQuery = (code: string) =>
  queryOptions({
    queryKey: ["sessions", code],
    queryFn: () => sessionExists(code),
  });
