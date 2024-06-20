import FaceRecognize from "@/components/FaceRecognize";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <main className="w-full min-h-screen overflow-hidden">
      <Navbar appName="GoFaceDetect" />
      <FaceRecognize />
    </main>
  );
}
