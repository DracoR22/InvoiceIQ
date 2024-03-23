import { BottomSection } from "@/components/bottom-section";
import NavSection, { NavItem, NavSectionItems } from "@/components/nav-section";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { authOptions } from "../api/auth/[...nextauth]/route";

interface DashboardLayoutProps {
    children: React.ReactNode
}

const pipelines: NavSectionItems = {
    label: "Pipelines",
    icon: "layers",
    items: [
      {
        label: "Text Recognition",
        href: "/text-recognition",
        icon: "textSelect",
      },
      {
        label: "Data Extraction",
        href: "/data-extraction",
        icon: "braces",
      },
      {
        label: "Verification",
        href: "/verification",
        icon: "checkCircle",
      },
    ],
  };
  
  const organizedData: NavSectionItems = {
    label: "Oragnized Data",
    icon: "grid",
    items: [
      {
        label: "Receipts",
        href: "/receipts",
        icon: "receipt",
      },
      {
        label: "Invoices",
        href: "/invoices",
        icon: "invoice",
      },
      {
        label: "Card Statements",
        href: "/card-statements",
        icon: "creditCard",
      },
    ],
  };
  
  const bottomItems: NavItem[] = [
    {
      label: "Help",
      href: "/help",
      icon: "help",
    },
    {
      label: "Settings",
      href: "/settings",
      icon: "settings",
    },
  ];

export default async function DashboardLayout({ children }: DashboardLayoutProps) {

    const session = await getServerSession(authOptions)

    return (
    <div className="min-h-screen flex">
       {/* SIDEBAR */}
      <div className="fixed inset-y-0 z-50 flex w-72 flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r-2 border-slate-200 bg-white pl-8 pr-6 pb-4">
          {/* LOGO */}
          <Link href="/dashboard">
            <Image className="flex mt-8 shrink-0" priority src="/logo.png" width={50} height={50} alt=""/>
          </Link>
          {/* NAVIGATION */}
          <nav className="flex flex-1 flex-col">
            <NavSection className="mt-8" section={pipelines} />
            <NavSection className="mt-10" section={organizedData} />
            <div className="flex flex-1 flex-col gap-y-7">
              <BottomSection className="mt-auto" username={session?.user.username ?? "Default"} items={bottomItems}/>
            </div>
          </nav>
        </div>
      </div>
      {/* MAIN */}
      <main className="pl-72 w-full">
        {children}
      </main>
    </div>
    )
}