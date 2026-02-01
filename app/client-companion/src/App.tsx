import ConsentGateModal from "./features/logForm/components/ConsentGateModal";
import MoodDiaryForm from "./features/logForm/components/MoodDiaryForm";
import "./App.css";

function App() {
  return (
    <div className="app-shell">
      <ConsentGateModal />
      <div className="content">
        <h1>Mood Diary</h1>
        <MoodDiaryForm />
      </div>
    </div>
  );
}

export default App
