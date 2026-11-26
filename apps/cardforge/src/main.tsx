import { render } from "preact";
import { eloExpected } from "@phantom/kit";

function App() {
  return (
    <main>
      <h1>Card Forge</h1>
      <p>Scaffold. Even odds: {eloExpected(1000, 1000)}</p>
    </main>
  );
}

render(<App />, document.getElementById("app")!);
