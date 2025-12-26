import BarChartOne from "../../components/charts/bar/BarChartOne";
import PageMeta from "../../components/common/PageMeta";

export default function BarChart() {
  return (
    <div>
      <PageMeta
        title="Estadísticas de Ventas"
        description="Dashboard con estadísticas de clientes y productos"
      />
      <div className="space-y-6">
        <BarChartOne />
      </div>
    </div>
  );
}
