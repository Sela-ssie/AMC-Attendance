"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { logout } from "@/app/login/actions";

const navLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/attendance", label: "Take Attendance" },
  { href: "/members", label: "Members" },
  { href: "/members/new", label: "Register Member" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-1">
        <Image src="/logo.png" alt="AMC Logo" width={36} height={36} className="rounded-full mr-2" />
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === link.href
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <form action={logout}>
        <button
          type="submit"
          className="text-sm text-gray-500 hover:text-red-600 transition-colors"
        >
          Sign out
        </button>
      </form>
    </nav>
  );
}
