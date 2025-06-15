import Menu from "@/components/Menu";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen flex ">
      {/* LEFT  */}
      <div className="bg-[url('/background.png')] bg-cover bg-no-repeat w-[16%] md:w-[8%] lg:w-[16%] xl:w-[14%] p-8">
        <Link href="/" className=" md:block lg:flex gap-2 items-center justify-center align-middle lg:justify-start">
          <Image src='/w-logo.svg' alt='Mondbt Logo' width={60} height={60} className="mb-2 md:mb-2"/>
          <Image src='/m-logo.svg' alt='Mondbt Logo' width={50} height={50}/>
        </Link>
        <Menu />
      </div>
      <div className="w-[84%] md:w-[92%] lg:w-[84%] xl:w-[86%] bg-[#F8F8F8] overflow-scroll">
        <Navbar />
        {children}
      </div>
    </div>
  );
}
