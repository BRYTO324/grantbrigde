import { Outlet } from "react-router-dom";
import EntrepreneurNavbar from "../../components/layout/EntrepreneurNavbar";

export default function EntrepreneurLayout() {
  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <EntrepreneurNavbar />
      <Outlet />
    </div>
  );
}
