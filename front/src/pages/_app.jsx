import "@/styles/globals.scss";
import { SwitchTransition, CSSTransition } from "react-transition-group";
import Navbar from "@/components/Navbar/Navbar";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Navbar />
      <SwitchTransition mode="out-in">
        <CSSTransition key={Component} classNames="fade" timeout={400}>
          <Component {...pageProps} />
        </CSSTransition>
      </SwitchTransition>
    </>
  );
}