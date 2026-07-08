import ConfigsClient from "./ConfigsClient";

export const metadata = {
  title: "Configurações - Painel Administrativo CLYON",
  description: "Gerir dados e configurações da empresa",
};

export default function ConfigsPage() {
  return <ConfigsClient />;
}
