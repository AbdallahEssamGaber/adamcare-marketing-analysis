import Head from "next/head";
import Dashboard from "@/components/Dashboard";
import GateScreen from "@/components/GateScreen";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { authenticated, checking, login } = useAuth();

  return (
    <>
      <Head>
        <title>foradam.care Analytics</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      {checking ? (
        <div className="state-message">Loading...</div>
      ) : authenticated ? (
        <Dashboard />
      ) : (
        <GateScreen onLogin={login} />
      )}
    </>
  );
}
