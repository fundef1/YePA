import { MadeWithDyad } from "@/components/made-with-dyad";
import EpubProcessor from "@/components/EpubProcessor";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <EpubProcessor />
      <MadeWithDyad />
    </div>
  );
};

export default Index;