import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { EvaluationWorkbench } from "./components/EvaluationWorkbench";
import { OperationsDashboard } from "./components/OperationsDashboard";
import { DatasetManagerTable } from "./components/DatasetManagerTable";
import { SpeechTraining } from "./components/SpeechTraining";
import { LanguageIdTraining } from "./components/LanguageIdTraining";
import { ModelRetraining } from "./components/ModelRetraining";
import { ModelAnalytics } from "./components/ModelAnalytics";
import { Settings } from "./components/Settings";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: EvaluationWorkbench },
      { path: "operations", Component: OperationsDashboard },
      { path: "datasets", Component: DatasetManagerTable },
      { path: "training", Component: SpeechTraining },
      { path: "language-id", Component: LanguageIdTraining },
      { path: "retraining", Component: ModelRetraining },
      { path: "analytics", Component: ModelAnalytics },
      { path: "settings", Component: Settings },
      { path: "*", Component: () => <div className="p-8 text-center text-slate-400">404 - Not Found</div> },
    ],
  },
]);