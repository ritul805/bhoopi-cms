"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  Book,
  Layers,
  LayoutDashboard,
  ListMusic,
  LogOut,
  Palette,
  Tags,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Notifications", href: "/notifications", icon: Bell },
    { name: "Story Cards", href: "/story-cards", icon: Layers },
    { name: "Stories Inside Cards", href: "/stories", icon: Book },
    { name: "Upload Episodes", href: "/episodes", icon: ListMusic },
    { name: "Design System", href: "/design-system", icon: Palette },
    { name: "Categories", href: "/categories", icon: Tags },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-gray-50/40">
      <Link
        href="/"
        className="flex h-14 shrink-0 items-center border-b px-4 font-semibold transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
        aria-label="Open Audiobook CMS dashboard"
      >
        Audiobook CMS
      </Link>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid items-start px-2 text-sm font-medium">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                  isActive ? "bg-gray-100 text-primary" : "text-gray-500"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="border-t p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition-all hover:bg-gray-100 hover:text-primary"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
