import Nav from "@/components/Nav";
import RegisterForm from "./RegisterForm";

export default function NewMemberPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <main className="max-w-xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Register New Member</h1>
        <RegisterForm />
      </main>
    </div>
  );
}
