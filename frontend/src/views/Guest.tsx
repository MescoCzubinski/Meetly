import { isValidCode } from "@/lib/api";
import Container from "@/components/Container";
import Profile from "@/components/Profile";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Guest({
  code,
  onDone,
  onHome,
}: {
  code: string;
  onDone: (name: string) => void;
  onHome: () => void;
}) {
  return (
    <Container>
      {isValidCode(code) ? (
        <Profile code={code} onDone={onDone} />
      ) : (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>
              <h1 className="text-2xl">Invalid code...</h1>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please check the code and try again.</p>
          </CardContent>
          <CardFooter>
            <Button size="lg" className="w-full text-lg" onClick={onHome}>
              Go to main page
            </Button>
          </CardFooter>
        </Card>
      )}
    </Container>
  );
}
