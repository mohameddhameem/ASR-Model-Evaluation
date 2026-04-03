import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { LoginPage } from "./components/LoginPage";
import { HomeDashboard } from "./components/HomeDashboard";
import { EvaluationWorkbench } from "./components/EvaluationWorkbench";
import { OperationsDashboard } from "./components/OperationsDashboard";
import { DatasetManagerTable } from "./components/DatasetManagerTable";
import { TrainingPipeline } from "./components/TrainingPipeline";
import { ModelAnalytics } from "./components/ModelAnalytics";
import { Settings } from "./components/Settings";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: EvaluationWorkbench },
      { path: "dashboard", Component: HomeDashboard },
      { path: "operations", Component: OperationsDashboard },
      { path: "datasets", Component: DatasetManagerTable },
      { path: "training", Component: TrainingPipeline },
      { path: "analytics", Component: ModelAnalytics },
      { path: "settings", Component: Settings },
      { path: "*", Component: () => <div className="p-8 text-center text-slate-400">404 - Not Found</div> },
    ],
  },
]);