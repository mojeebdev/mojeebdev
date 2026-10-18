import PawTrail from "@/components/lab/PawTrail";
import "./lab.css";

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return (<><PawTrail />{children}</>);
}
