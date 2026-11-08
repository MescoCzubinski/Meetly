import { Suspense } from "react";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { Container } from "@/components/Container";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const RouteBoundary = ({
  onHome,
  children,
}: {
  onHome: () => void;
  children: React.ReactNode;
}) => (
  <QueryErrorResetBoundary>
    {({ reset }) => (
      <ErrorBoundary
        onReset={reset}
        fallbackRender={({ resetErrorBoundary }) => (
          <Container>
            <Card className="w-full">
              <CardHeader>
                <CardTitle>
                  <h1 className="text-2xl">Something went wrong</h1>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Check your connection and try again.</p>
              </CardContent>
              <CardFooter className="gap-4">
                <Button
                  variant="neutral"
                  className="flex-1"
                  onClick={() => {
                    resetErrorBoundary();
                    onHome();
                  }}
                >
                  Main page
                </Button>
                <Button className="flex-1" onClick={resetErrorBoundary}>
                  Try again
                </Button>
              </CardFooter>
            </Card>
          </Container>
        )}
      >
        <Suspense fallback={null}>{children}</Suspense>
      </ErrorBoundary>
    )}
  </QueryErrorResetBoundary>
);
