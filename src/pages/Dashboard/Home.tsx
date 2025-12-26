import PageMeta from "../../components/common/PageMeta";
import ModulesGrid from "../../components/ecommerce/ModulesMenu";

export default function Home() {
  return (
    <>
      <PageMeta
        title="Home | Sistema POS"
        description="This is React.js Ecommerce Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="w-full overflow-hidden">
        <ModulesGrid />
      </div>
    </>
  );
}
