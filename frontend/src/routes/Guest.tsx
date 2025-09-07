import QRCode from "../components/QRCode";
import Container from "../components/Container";
export default function Guest() {
  return (
    <Container>
      <QRCode url="https://meetly.com/guest" />
    </Container>
  );
}
