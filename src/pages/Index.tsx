import PitchBend from "@/components/PitchBend";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-4">Vocal Synthesizer Pitch Editor</h1>
        <p className="text-gray-400 mb-8">
          Click to add points on notes. Connect points to create pitch transitions. 
          Click on lines to add control points and drag them to shape the pitch curve.
        </p>
        <div className="bg-gray-800 p-4 rounded-lg">
          <PitchBend />
        </div>
      </div>
    </div>
  );
};

export default Index;