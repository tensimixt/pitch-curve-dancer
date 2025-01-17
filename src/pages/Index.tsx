import PitchBend from "@/components/PitchBend";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Pitch Bend Controller</h1>
        <div className="bg-gray-800 p-4 rounded-lg">
          <PitchBend />
        </div>
        <p className="text-gray-400 mt-4 text-center">
          Click anywhere to add points. Drag points to adjust the curve.
        </p>
      </div>
    </div>
  );
};

export default Index;