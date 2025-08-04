import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="p-2 flex gap-2">
      <Link to="/" className="[&.active]:font-bold">
        Home
      </Link>{" "}
      <Link to="/admin" className="[&.active]:font-bold">
        Admin
      </Link>{" "}
      <Link to="/user/level" className="[&.active]:font-bold">
        Choose Level
      </Link>{" "}
      <Link 
        to="/user/lessons" 
        search={{ levelId: 1, levelName: "Beginner", languageName: "English" }}
        className="[&.active]:font-bold"
      >
        Lessons
      </Link>
    </div>
  );
}
